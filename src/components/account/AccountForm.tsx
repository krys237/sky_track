"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, MessageCircle, Check, Loader, PackageSearch, LogOut, ArrowRight,
} from "lucide-react";
import { Btn } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { profileToMetadata, type Profile } from "@/lib/profile";

export function AccountForm({ email, initial }: { email: string; initial: Profile }) {
  const router = useRouter();
  const [p, setP] = useState<Profile>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upd = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setP((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  const save = async () => {
    setBusy(true);
    setErr(null);
    setSaved(false);
    try {
      const { error } = await createClient().auth.updateUser({ data: profileToMetadata(p) });
      if (error) setErr("Enregistrement impossible. Réessayez.");
      else {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="z wrap" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 620 }}>
      <div className="fade">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700 }}>Mon compte</h1>
          <button className="reset navlink" onClick={signOut} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 26 }}>{email}</p>

        {/* Raccourci commandes */}
        <Link href="/mes-commandes" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: 18, marginBottom: 22, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(47,230,196,.10)", border: "1px solid rgba(47,230,196,.3)", flex: "0 0 auto" }}>
              <PackageSearch size={20} style={{ color: "var(--signal)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Mes commandes</div>
              <div className="muted" style={{ fontSize: 13 }}>Suivi et historique de vos commandes</div>
            </div>
            <ArrowRight size={18} className="muted" />
          </div>
        </Link>

        {/* Coordonnées éditables */}
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Mes coordonnées</div>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 0, marginBottom: 18 }}>
            Elles pré-rempliront automatiquement vos prochaines commandes.
          </p>

          <div style={{ marginBottom: 18 }}>
            <label className="fld">Contact préféré</label>
            <div className="seg">
              <button className={p.contactType === "email" ? "on" : ""} onClick={() => upd("contactType", "email")}><Mail size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />Email</button>
              <button className={p.contactType === "whatsapp" ? "on" : ""} onClick={() => upd("contactType", "whatsapp")}><MessageCircle size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />WhatsApp</button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label className="fld">Nom complet</label>
              <input value={p.name} onChange={(e) => upd("name", e.target.value)} placeholder="Ex : Germann Pessidjo" />
            </div>
            <div>
              <label className="fld">{p.contactType === "email" ? "Adresse email" : "Numéro WhatsApp"}</label>
              <input value={p.contact} onChange={(e) => upd("contact", e.target.value)} placeholder={p.contactType === "email" ? "vous@exemple.com" : "+237 6 XX XX XX XX"} inputMode={p.contactType === "email" ? "email" : "tel"} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="fld">Ville</label>
                <input value={p.city} onChange={(e) => upd("city", e.target.value)} placeholder="Yaoundé" />
              </div>
              <div>
                <label className="fld">Quartier / adresse</label>
                <input value={p.address} onChange={(e) => upd("address", e.target.value)} placeholder="Bastos, rue…" />
              </div>
            </div>
          </div>

          {err && <div style={{ color: "var(--amber)", fontSize: 13, marginTop: 14 }}>{err}</div>}

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
            <Btn variant="primary" onClick={save} disabled={busy}>
              {busy ? <Loader size={18} className="spin" /> : "Enregistrer"}
            </Btn>
            {saved && (
              <span className="sig" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                <Check size={16} /> Enregistré
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
