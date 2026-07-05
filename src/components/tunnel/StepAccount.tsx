"use client";

import React, { useEffect, useState } from "react";
import { Mail, MessageCircle, Lock, ChevronLeft, ArrowRight } from "lucide-react";
import { Btn } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { profileFromMetadata, profileToMetadata, profileHasData } from "@/lib/profile";
import type { StepProps } from "./shared";
import type { Flow } from "@/lib/types";

export function StepAccount({ flow, setFlow, next, back }: StepProps) {
  const [err, setErr] = useState<Partial<Record<keyof Flow, string>>>({});
  const set = (k: keyof Flow) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFlow((f) => ({ ...f, [k]: e.target.value }));

  // Pré-remplissage depuis le profil (utilisateur connecté), sans écraser
  // ce qui a déjà été saisi.
  useEffect(() => {
    let active = true;
    createClient().auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      const prof = profileFromMetadata(data.user.user_metadata);
      if (!profileHasData(prof)) return;
      setFlow((f) => ({
        ...f,
        name: f.name || prof.name,
        contact: f.contact || prof.contact,
        contactType: f.contact ? f.contactType : prof.contactType,
        city: f.city || prof.city,
        address: f.address || prof.address,
      }));
    });
    return () => { active = false; };
  }, [setFlow]);

  // Enregistre les coordonnées dans le profil si l'utilisateur est connecté,
  // puis avance. (Sans session : simple passage à l'étape suivante.)
  const saveAndNext = async () => {
    if (!validate()) return;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.auth.updateUser({
          data: profileToMetadata({
            name: flow.name, contactType: flow.contactType, contact: flow.contact,
            city: flow.city, address: flow.address,
          }),
        });
      }
    } catch {
      // La sauvegarde du profil ne doit pas bloquer la commande.
    }
    next();
  };

  const validate = () => {
    const er: Partial<Record<keyof Flow, string>> = {};
    if (!flow.name.trim()) er.name = "Indiquez votre nom.";
    if (flow.contactType === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(flow.contact)) er.contact = "Adresse email invalide.";
    } else {
      if (!/^\+?[0-9\s]{8,}$/.test(flow.contact)) er.contact = "Numéro WhatsApp invalide.";
    }
    if (!flow.city.trim()) er.city = "Indiquez votre ville.";
    if (!flow.address.trim()) er.address = "Indiquez un quartier / une adresse.";
    setErr(er);
    return Object.keys(er).length === 0;
  };

  return (
    <div className="fade" style={{ maxWidth: 560 }}>
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Vos informations</h2>
      <p className="muted" style={{ marginBottom: 24 }}>Pour vous confirmer la commande et organiser la livraison.</p>

      <div style={{ marginBottom: 20 }}>
        <label className="fld">Comment souhaitez-vous être contacté ?</label>
        <div className="seg">
          <button className={flow.contactType === "email" ? "on" : ""} onClick={() => setFlow((f) => ({ ...f, contactType: "email", contact: "" }))}><Mail size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />Email</button>
          <button className={flow.contactType === "whatsapp" ? "on" : ""} onClick={() => setFlow((f) => ({ ...f, contactType: "whatsapp", contact: "" }))}><MessageCircle size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />WhatsApp</button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label className="fld">Nom complet</label>
          <input value={flow.name} onChange={set("name")} placeholder="Ex : Germann Pessidjo" />
          {err.name && <div style={{ color: "var(--amber)", fontSize: 12.5, marginTop: 6 }}>{err.name}</div>}
        </div>
        <div>
          <label className="fld">{flow.contactType === "email" ? "Adresse email" : "Numéro WhatsApp"}</label>
          <input value={flow.contact} onChange={set("contact")} placeholder={flow.contactType === "email" ? "vous@exemple.com" : "+237 6 XX XX XX XX"} inputMode={flow.contactType === "email" ? "email" : "tel"} />
          {err.contact && <div style={{ color: "var(--amber)", fontSize: 12.5, marginTop: 6 }}>{err.contact}</div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label className="fld">Ville</label>
            <input value={flow.city} onChange={set("city")} placeholder="Yaoundé" />
            {err.city && <div style={{ color: "var(--amber)", fontSize: 12.5, marginTop: 6 }}>{err.city}</div>}
          </div>
          <div>
            <label className="fld">Quartier / adresse</label>
            <input value={flow.address} onChange={set("address")} placeholder="Bastos, rue…" />
            {err.address && <div style={{ color: "var(--amber)", fontSize: 12.5, marginTop: 6 }}>{err.address}</div>}
          </div>
        </div>
      </div>

      <p className="muted2" style={{ fontSize: 12.5, marginTop: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Lock size={13} style={{ flex: "0 0 auto", marginTop: 2 }} /> Nous utilisons ce contact uniquement pour la confirmation et le suivi de votre commande.
      </p>

      <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <Btn variant="ghost" onClick={back}><ChevronLeft size={16} /> Retour</Btn>
        <Btn variant="primary" onClick={saveAndNext}>Continuer vers le paiement <ArrowRight size={16} /></Btn>
      </div>
    </div>
  );
}
