import React from "react";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { SectionHead } from "@/components/ui";

export const metadata = {
  title: "Support — SkyTrack",
  description: "Contactez l'équipe SkyTrack par WhatsApp ou email pour l'achat, l'activation ou le suivi de votre commande.",
};

export default function SupportPage() {
  return (
    <div className="z wrap" style={{ paddingTop: 52, paddingBottom: 60, maxWidth: 780 }}>
      <SectionHead eyebrow="Support" title="Une question ? On vous répond." sub="L'équipe SkyTrack est joignable pour l'achat, l'activation ou le suivi de votre commande." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        <a className="reset card" href="https://wa.me/237600000000" target="_blank" rel="noreferrer" style={{ padding: 24, cursor: "pointer", display: "block" }}>
          <MessageCircle size={24} style={{ color: "var(--signal)", marginBottom: 14 }} />
          <h3 className="font-display" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 6px" }}>WhatsApp</h3>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>+237 6 00 00 00 00 — réponse rapide, 7j/7.</p>
        </a>
        <a className="reset card" href="mailto:hello@skytrack.cm" style={{ padding: 24, cursor: "pointer", display: "block" }}>
          <Mail size={24} style={{ color: "var(--signal)", marginBottom: 14 }} />
          <h3 className="font-display" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 6px" }}>Email</h3>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>hello@skytrack.cm</p>
        </a>
        <div className="card" style={{ padding: 24 }}>
          <Phone size={24} style={{ color: "var(--signal)", marginBottom: 14 }} />
          <h3 className="font-display" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 6px" }}>Horaires</h3>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>Lun–Sam, 8h–19h (heure du Cameroun).</p>
        </div>
      </div>
    </div>
  );
}
