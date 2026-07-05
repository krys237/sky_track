"use client";

import React, { useState, useEffect } from "react";
import {
  Signal, Battery, Wallet, Check, MapPin, Plus,
} from "lucide-react";
import type { OS } from "@/lib/types";

function PhoneShell({ screen, title }: { screen: React.ReactNode; title: string }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="ph-status"><span>9:41</span><span style={{ display: "flex", gap: 5, alignItems: "center" }}><Signal size={11} /><Battery size={13} /></span></div>
        {screen}
      </div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>{title}</div>
    </div>
  );
}

function PhoneAndroid({ i }: { i: number }) {
  const screens = [
    (<div className="ph-body" key="a0" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div className="thecard" style={{ transform: "scale(1.1)", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><Signal size={12} style={{ color: "var(--signal)" }} /><span className="pulse-dot" /></div>
        <div className="font-mono" style={{ fontSize: 8, color: "var(--muted)" }}>SKYTRACK · CARD</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>Appuyez sur le bouton</div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>de la carte pour l&apos;activer</div>
    </div>),
    (<div className="ph-body" key="a1" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ height: 120, borderRadius: 12, background: "rgba(140,183,214,.06)", marginBottom: "auto" }} />
      <div className="ph-pop">
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(16,185,129,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><Signal size={16} style={{ color: "var(--signal)" }} /></div>
          <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>SkyTrack Card</div><div className="muted" style={{ fontSize: 10.5 }}>Appareil à proximité</div></div>
        </div>
        <div style={{ background: "linear-gradient(96deg,var(--signal),var(--signal-dim))", color: "#fff", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12.5, fontWeight: 700 }}>Connecter</div>
      </div>
    </div>),
    (<div className="ph-body" key="a2" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>Lier à votre compte Google</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 11px", borderRadius: 9, border: "1px solid var(--line)", marginBottom: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(140,183,214,.15)" }} /><span style={{ fontSize: 11.5 }} className="muted">compte@gmail.com</span>
      </div>
      <div className="muted" style={{ fontSize: 10.5, lineHeight: 1.5, marginBottom: "auto" }}>Utilisez la carte de façon responsable, sûre et légale.</div>
      <div style={{ background: "var(--bg-alt)", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12, fontWeight: 600 }}>J&apos;accepte</div>
    </div>),
    (<div className="ph-body" key="a3" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>Find Hub</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px", borderRadius: 10, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)", marginBottom: 10 }}>
        <Wallet size={18} style={{ color: "var(--signal)" }} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>Mon portefeuille</div><div className="sig" style={{ fontSize: 10.5 }}>À proximité · maintenant</div></div>
        <Check size={16} style={{ color: "var(--signal)" }} />
      </div>
      <div style={{ height: 90, borderRadius: 10, background: "linear-gradient(160deg,rgba(16,185,129,.06),transparent)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "auto" }}>
        <MapPin size={22} style={{ color: "var(--signal)" }} />
      </div>
    </div>),
  ];
  return <PhoneShell screen={screens[i]} title={["Activer", "Fast Pair", "Compte Google", "Find Hub"][i]} />;
}

function PhoneIOS({ i }: { i: number }) {
  const screens = [
    (<div className="ph-body" key="i0">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Localiser</div>
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--line)", paddingBottom: 10, marginBottom: 14 }}>
        <span className="muted" style={{ fontSize: 12 }}>Personnes</span>
        <span className="muted" style={{ fontSize: 12 }}>Appareils</span>
        <span className="sig" style={{ fontSize: 12, fontWeight: 700 }}>Objets</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 11px", borderRadius: 10, background: "rgba(16,185,129,.08)", border: "1px dashed rgba(16,185,129,.4)" }}>
        <Plus size={16} style={{ color: "var(--signal)" }} /><span className="sig" style={{ fontSize: 12.5, fontWeight: 600 }}>Ajouter un objet</span>
      </div>
    </div>),
    (<div className="ph-body" key="i1" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ height: 110, borderRadius: 12, background: "rgba(140,183,214,.05)", marginBottom: "auto" }} />
      <div className="ph-pop">
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>Ajouter un autre objet</div>
        <div className="muted" style={{ fontSize: 10.5, marginBottom: 12 }}>Appuyez sur le bouton de votre carte.</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div className="thecard" style={{ transform: "scale(.85)" }}><div className="font-mono" style={{ fontSize: 8, color: "var(--muted)" }}>SKYTRACK</div><span className="pulse-dot" /></div>
        </div>
      </div>
    </div>),
    (<div className="ph-body" key="i2" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "10px 0 14px" }}>
        <Wallet size={26} style={{ color: "var(--signal)" }} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600 }}>Carte détectée</div>
      <div className="muted" style={{ fontSize: 10.5, marginBottom: "auto", marginTop: 4 }}>Nommez votre objet</div>
      <div style={{ width: "100%", padding: "9px", borderRadius: 9, border: "1px solid var(--line)", fontSize: 11.5, marginBottom: 10 }} className="muted">Mon portefeuille 💳</div>
      <div style={{ width: "100%", background: "linear-gradient(96deg,var(--signal),var(--signal-dim))", color: "#fff", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>Continuer</div>
    </div>),
    (<div className="ph-body" key="i3" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Check size={30} style={{ color: "var(--signal)" }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>C&apos;est prêt !</div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>Votre carte apparaît dans Localiser → Objets.</div>
    </div>),
  ];
  return <PhoneShell screen={screens[i]} title={["Objets", "Ajouter", "Nommer", "Terminé"][i]} />;
}

export function SetupPhonePreview({ os }: { os: OS }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % 4), 2200);
    return () => clearInterval(t);
  }, [os]);
  return (
    <div style={{ textAlign: "center" }}>
      {os === "ios" ? <PhoneIOS i={i} /> : <PhoneAndroid i={i} />}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
        {[0, 1, 2, 3].map((d) => (
          <button key={d} className="reset" onClick={() => setI(d)} style={{ width: 7, height: 7, borderRadius: "50%", cursor: "pointer", background: d === i ? "var(--signal)" : "var(--line)" }} />
        ))}
      </div>
    </div>
  );
}
