import React from "react";
import { MapPin, Mail, Phone, Facebook, Instagram, MessageCircle, Youtube } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact — SkyTrack",
  description: "Contactez l'équipe SkyTrack : WhatsApp, email ou formulaire. Questions produit, commande, activation et livraison au Cameroun.",
};

// Coordonnées (mêmes valeurs que la page Support). Icône ronde + titre + lignes.
const INFO = [
  { icon: MapPin, title: "Où nous sommes", lines: [{ text: "Douala · Cameroun" }, { text: "Livraison dans tout le pays" }] },
  { icon: Mail, title: "Écrivez-nous", lines: [{ text: "hello@skytrack.cm", href: "mailto:hello@skytrack.cm" }, { text: "Réponse sous 24 h" }] },
  { icon: Phone, title: "Appelez / WhatsApp", lines: [{ text: "+237 640 759 203", href: "https://wa.me/237640759203" }, { text: "Lun–Sam, 8h–19h" }] },
] as const;

// Réseaux sociaux (placeholders — à remplacer par les vraies URL des comptes SkyTrack).
const SOCIAL = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/237640759203" },
  { icon: Youtube, label: "YouTube", href: "#" },
] as const;

export default function ContactPage() {
  return (
    <div className="contact-page z">
      {/* Bandeau (nav flottante par-dessus) */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>Contactez-nous</h1>
          <p>SkyTrack est là pour vous aider à ne plus rien perdre. Une question, une commande, la livraison ? Écrivez-nous.</p>
        </div>
      </section>

      {/* Carte chevauchante : coordonnées | formulaire */}
      <div className="wrap contact-shell">
        <div className="contact-card">
          <div className="contact-card-left">
            <h2>Entrons en contact</h2>
            <p>Notre équipe répond aux questions sur l&apos;achat, l&apos;activation et le suivi de vos commandes.</p>

            <div className="contact-info">
              {INFO.map((it) => (
                <div key={it.title} className="contact-info-item">
                  <span className="contact-info-ic"><it.icon size={21} /></span>
                  <div>
                    <div className="contact-info-title">{it.title}</div>
                    {it.lines.map((l, i) =>
                      "href" in l && l.href ? (
                        <a key={i} className="contact-info-line" href={l.href} {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{l.text}</a>
                      ) : (
                        <span key={i} className="contact-info-line">{l.text}</span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-follow">Suivez-nous</div>
            <div className="contact-social">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  {...(s.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="contact-card-right">
            <h2>Envoyez-nous un message</h2>
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Carte Google Maps (Yaoundé, Cameroun) */}
      <section className="contact-map" aria-label="Carte — Yaoundé, Cameroun">
        <iframe
          title="Carte — Yaoundé, Cameroun"
          src="https://maps.google.com/maps?q=Yaound%C3%A9%2C%20Cameroun&z=12&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
}
