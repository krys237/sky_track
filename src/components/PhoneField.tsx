"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

/* Indicatifs pays — Cameroun en tête (marché principal), puis voisins
   d'Afrique centrale/de l'Ouest et destinations courantes de la diaspora. */
export type Country = { code: string; name: string; dial: string; flag: string };

export const COUNTRIES: Country[] = [
  { code: "CM", name: "Cameroun", dial: "+237", flag: "🇨🇲" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", dial: "+221", flag: "🇸🇳" },
  { code: "GA", name: "Gabon", dial: "+241", flag: "🇬🇦" },
  { code: "CG", name: "Congo", dial: "+242", flag: "🇨🇬" },
  { code: "CD", name: "RD Congo", dial: "+243", flag: "🇨🇩" },
  { code: "TD", name: "Tchad", dial: "+235", flag: "🇹🇩" },
  { code: "CF", name: "Centrafrique", dial: "+236", flag: "🇨🇫" },
  { code: "GQ", name: "Guinée équatoriale", dial: "+240", flag: "🇬🇶" },
  { code: "BJ", name: "Bénin", dial: "+229", flag: "🇧🇯" },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬" },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫" },
  { code: "ML", name: "Mali", dial: "+223", flag: "🇲🇱" },
  { code: "NE", name: "Niger", dial: "+227", flag: "🇳🇪" },
  { code: "GN", name: "Guinée", dial: "+224", flag: "🇬🇳" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭" },
  { code: "MA", name: "Maroc", dial: "+212", flag: "🇲🇦" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", dial: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", dial: "+41", flag: "🇨🇭" },
  { code: "DE", name: "Allemagne", dial: "+49", flag: "🇩🇪" },
  { code: "GB", name: "Royaume-Uni", dial: "+44", flag: "🇬🇧" },
  { code: "US", name: "États-Unis", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
];

const DEFAULT = COUNTRIES[0];
const norm = (s: string) => (s || "").replace(/\s+/g, "");

/* Détecte l'indicatif d'une valeur déjà saisie (ex. profil pré-rempli). */
function detect(value: string): Country | undefined {
  const v = norm(value);
  // Le plus long indicatif correspondant gagne (+237 avant +2…).
  return [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => v.startsWith(norm(c.dial)));
}

/* Retire l'indicatif en tête pour ne garder que le numéro local. */
function stripDial(value: string, dial: string): string {
  const v = value.replace(/^\s+/, "");
  if (v.startsWith(dial)) return v.slice(dial.length).replace(/^\s+/, "");
  const nd = norm(dial);
  if (norm(v).startsWith(nd)) {
    let removed = 0, i = 0;
    while (removed < nd.length && i < v.length) {
      if (!/\s/.test(v[i])) removed++;
      i++;
    }
    return v.slice(i).replace(/^\s+/, "");
  }
  return v;
}

export function PhoneField({
  value,
  onChange,
  placeholder,
  inputMode = "tel",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "tel" | "numeric";
  id?: string;
}) {
  const [dial, setDial] = useState<string>(() => detect(value)?.dial ?? DEFAULT.dial);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Resynchronise l'indicatif si la valeur est modifiée de l'extérieur
  // (ex. pré-remplissage depuis le profil) avec un autre indicatif connu.
  useEffect(() => {
    const d = detect(value);
    if (d && d.dial !== dial) setDial(d.dial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Ferme le menu au clic extérieur.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = COUNTRIES.find((c) => c.dial === dial) ?? DEFAULT;
  const local = stripDial(value, dial);

  const emit = (nextDial: string, nextLocal: string) => {
    const l = nextLocal.replace(/^\s+/, "");
    onChange(l ? `${nextDial} ${l}` : nextDial);
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(s) || c.dial.includes(s) || c.code.toLowerCase() === s,
    );
  }, [q]);

  const pick = (c: Country) => {
    setDial(c.dial);
    setOpen(false);
    setQ("");
    emit(c.dial, local);
  };

  return (
    <div className="phone-field" ref={wrapRef}>
      <button
        type="button"
        className="phone-field-btn"
        aria-label={`Indicatif pays — ${current.name} (${current.dial})`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="phone-field-flag">{current.flag}</span>
        <span>{current.dial}</span>
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      <input
        id={id}
        value={local}
        onChange={(e) => emit(dial, e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete="tel-national"
      />

      {open && (
        <div className="phone-cc-menu" role="listbox">
          <div className="phone-cc-search">
            <Search size={15} style={{ color: "var(--muted)", flex: "0 0 auto" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un pays…"
              autoFocus
            />
          </div>
          {filtered.length === 0 ? (
            <div className="phone-cc-empty">Aucun pays trouvé</div>
          ) : (
            filtered.map((c) => (
              <button
                type="button"
                key={c.code}
                role="option"
                aria-selected={c.dial === dial}
                className={`phone-cc-opt ${c.dial === dial ? "on" : ""}`}
                onClick={() => pick(c)}
              >
                <span className="phone-field-flag">{c.flag}</span>
                <span>{c.name}</span>
                <span className="phone-cc-dial">{c.dial}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
