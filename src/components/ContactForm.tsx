"use client";

import React, { useState } from "react";
import { Send, Check } from "lucide-react";
import { Btn } from "@/components/ui";

// Adresse de contact (même valeur que la page Support, pour rester cohérent).
const CONTACT_EMAIL = "hello@skytrack.cm";

const textareaStyle: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--line-strong)",
  borderRadius: 11, padding: "13px 14px", color: "var(--text)", fontSize: 15,
  fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none",
  resize: "vertical", minHeight: 140, lineHeight: 1.5,
};

/**
 * Formulaire de contact sans backend : à l'envoi, on compose un e-mail pré-rempli
 * dans le client de messagerie de l'utilisateur (mailto). L'utilisateur relit et
 * envoie lui-même — rien n'est expédié à son insu.
 */
export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", whatsapp: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const valid =
    f.name.trim().length > 1 &&
    /^\S+@\S+\.\S+$/.test(f.email) &&
    f.message.trim().length > 4;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const subject = encodeURIComponent(f.subject.trim() || `Contact — ${f.name.trim()}`);
    const wa = f.whatsapp.trim() ? `\nWhatsApp : ${f.whatsapp.trim()}` : "";
    const body = encodeURIComponent(`${f.message.trim()}\n\n— ${f.name.trim()}\n${f.email.trim()}${wa}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <form className="contact-form-grid" onSubmit={submit} noValidate>
      <div className="contact-form-row">
        <div>
          <label className="fld" htmlFor="cf-name">Nom complet</label>
          <input id="cf-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Germann Pessidjo" autoComplete="name" />
        </div>
        <div>
          <label className="fld" htmlFor="cf-email">Adresse email</label>
          <input id="cf-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="vous@exemple.com" autoComplete="email" inputMode="email" />
        </div>
      </div>

      <div className="contact-form-row">
        <div>
          <label className="fld" htmlFor="cf-wa">Numéro WhatsApp <span className="muted2" style={{ fontWeight: 400 }}>(facultatif)</span></label>
          <input id="cf-wa" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} placeholder="+237 6 XX XX XX XX" autoComplete="tel" inputMode="tel" />
        </div>
        <div>
          <label className="fld" htmlFor="cf-subject">Sujet <span className="muted2" style={{ fontWeight: 400 }}>(facultatif)</span></label>
          <input id="cf-subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Ex : suivi de ma commande" />
        </div>
      </div>

      <div>
        <label className="fld" htmlFor="cf-message">Votre message</label>
        <textarea id="cf-message" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Dites-nous comment on peut vous aider…" style={textareaStyle} />
      </div>

      {sent && (
        <div className="fade" style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(5,150,105,.08)", border: "1px solid rgba(5,150,105,.3)", borderRadius: 12, padding: "12px 14px" }}>
          <Check size={17} strokeWidth={3} style={{ color: "var(--signal)", flex: "0 0 auto", marginTop: 1 }} />
          <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--text)" }}>
            Votre messagerie s&apos;est ouverte avec le message pré-rempli. Vérifiez et envoyez — sinon, écrivez-nous à <b>{CONTACT_EMAIL}</b>.
          </span>
        </div>
      )}

      <div>
        <Btn variant="primary" disabled={!valid} className="contact-submit">
          Envoyer le message <Send size={16} />
        </Btn>
        <p className="muted2" style={{ fontSize: 12, marginTop: 12 }}>
          En envoyant, votre client mail s&apos;ouvre avec le message pré-rempli. Vous gardez la main sur l&apos;envoi.
        </p>
      </div>
    </form>
  );
}
