import React, { useState, useEffect } from "react";
import {
  MapPin, Wallet, Plane, Briefcase, Users, Bell, Shield, Radio, Smartphone,
  CreditCard, Check, ChevronRight, ChevronLeft, ArrowRight, Menu, X, Phone,
  Mail, MessageCircle, Zap, Battery, Volume2, Share2, Lock, Signal, Nfc,
  ScanLine, PackageCheck, Truck, Star, PlayCircle, Plus, Loader, FileText
} from "lucide-react";

/* ============================== DESIGN SYSTEM ============================== */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

    :root{
      --night:#081524; --night2:#0C1F33; --slate:#132C44; --slate2:#173650;
      --line:rgba(140,183,214,.14);
      --signal:#2FE6C4; --signal-dim:#1EA98E; --amber:#FFB020; --amber-2:#FF8A3D;
      --text:#EAF3FA; --muted:#8AA6BF; --muted2:#5E7C96;
      --mtn:#FFC403; --orange:#FF7900;
    }
    *{box-sizing:border-box}
    .sky-root{background:var(--night); color:var(--text);
      font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased;
      overflow-x:hidden; min-height:100vh; position:relative;}
    .sky-root::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
      background:
        radial-gradient(900px 500px at 78% -8%, rgba(47,230,196,.10), transparent 60%),
        radial-gradient(700px 500px at 10% 8%, rgba(255,176,32,.06), transparent 60%),
        radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.35), transparent),
        radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,.22), transparent),
        radial-gradient(1px 1px at 85% 20%, rgba(255,255,255,.28), transparent),
        radial-gradient(1px 1px at 40% 85%, rgba(255,255,255,.2), transparent);}
    .z{position:relative;z-index:1}
    .font-display{font-family:'Space Grotesk',sans-serif}
    .font-mono{font-family:'Space Mono',monospace}
    .muted{color:var(--muted)} .muted2{color:var(--muted2)}
    .sig{color:var(--signal)} .amber{color:var(--amber)}
    .wrap{max-width:1120px;margin:0 auto;padding:0 20px}
    .eyebrow{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.16em;
      text-transform:uppercase;color:var(--signal)}
    .gradtext{background:linear-gradient(96deg,var(--signal),#7DF3DD 55%,var(--amber));
      -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}

    .card{background:linear-gradient(180deg,rgba(23,54,80,.55),rgba(12,31,51,.55));
      border:1px solid var(--line);border-radius:18px;backdrop-filter:blur(6px)}
    .chip{display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;
      border:1px solid var(--line);background:rgba(19,44,68,.6);font-size:13px;color:var(--muted)}

    .btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;
      border:0;border-radius:12px;font-weight:600;font-size:15px;padding:13px 22px;
      transition:transform .12s ease,box-shadow .2s ease,background .2s ease;font-family:'Inter',sans-serif;
      min-height:46px}
    .btn:active{transform:translateY(1px)}
    .btn-primary{background:linear-gradient(96deg,var(--amber),var(--amber-2));color:#1a0f00;
      box-shadow:0 10px 26px -12px rgba(255,138,61,.7)}
    .btn-primary:hover{box-shadow:0 14px 34px -12px rgba(255,138,61,.85)}
    .btn-sig{background:linear-gradient(96deg,var(--signal),var(--signal-dim));color:#04211b;
      box-shadow:0 10px 26px -12px rgba(47,230,196,.7)}
    .btn-ghost{background:rgba(19,44,68,.5);color:var(--text);border:1px solid var(--line)}
    .btn-ghost:hover{background:rgba(24,54,80,.85)}
    .btn:disabled{opacity:.5;cursor:not-allowed}
    .link{color:var(--signal);cursor:pointer;font-weight:500}
    .link:hover{text-decoration:underline}

    input,select{width:100%;background:rgba(8,21,36,.7);border:1px solid var(--line);
      border-radius:11px;padding:13px 14px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;
      outline:none;transition:border .15s ease,box-shadow .15s ease}
    input:focus,select:focus{border-color:var(--signal);box-shadow:0 0 0 3px rgba(47,230,196,.14)}
    input::placeholder{color:var(--muted2)}
    label.fld{display:block;font-size:13px;color:var(--muted);margin-bottom:7px;font-weight:500}

    a.reset,button.reset{all:unset}
    :focus-visible{outline:2px solid var(--signal);outline-offset:2px;border-radius:8px}

    /* radar signature */
    .radar{position:relative;width:340px;height:340px;max-width:86vw;max-height:86vw;margin:0 auto}
    .ring{position:absolute;inset:0;border:1.5px solid var(--signal);border-radius:50%;
      opacity:0;animation:ping-ring 3.4s ease-out infinite}
    @keyframes ping-ring{0%{transform:scale(.18);opacity:.85}80%{opacity:.06}100%{transform:scale(1);opacity:0}}
    .radar-core{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
    .sweep{position:absolute;inset:0;border-radius:50%;
      background:conic-gradient(from 0deg, rgba(47,230,196,.32), rgba(47,230,196,0) 42%);
      animation:spin 5.5s linear infinite;mask:radial-gradient(circle,transparent 26%,#000 27%)}
    @keyframes spin{to{transform:rotate(360deg)}}
    .grid-ring{position:absolute;inset:0;border:1px solid rgba(140,183,214,.16);border-radius:50%}
    .netdot{position:absolute;width:34px;height:34px;border-radius:9px;display:flex;align-items:center;
      justify-content:center;background:rgba(12,31,51,.92);border:1px solid var(--line);color:var(--muted);
      animation:floaty 4s ease-in-out infinite}
    @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    .thecard{width:118px;height:74px;border-radius:12px;position:relative;z-index:3;
      background:linear-gradient(135deg,#0F2A42,#0A1B2C);border:1px solid rgba(47,230,196,.4);
      box-shadow:0 18px 40px -16px rgba(0,0,0,.8),0 0 0 6px rgba(47,230,196,.06);
      display:flex;flex-direction:column;justify-content:space-between;padding:11px}
    .pulse-dot{width:9px;height:9px;border-radius:50%;background:var(--signal);
      box-shadow:0 0 0 0 rgba(47,230,196,.6);animation:pd 2s infinite}
    @keyframes pd{0%{box-shadow:0 0 0 0 rgba(47,230,196,.5)}70%{box-shadow:0 0 0 12px rgba(47,230,196,0)}100%{box-shadow:0 0 0 0 rgba(47,230,196,0)}}

    /* phone mockup */
    .phone{width:230px;max-width:74vw;border-radius:30px;padding:11px;background:linear-gradient(160deg,#16324c,#0a1b2c);
      border:1px solid var(--line);box-shadow:0 30px 60px -30px rgba(0,0,0,.8)}
    .phone-screen{background:var(--night);border-radius:22px;overflow:hidden;min-height:390px;
      border:1px solid rgba(140,183,214,.1);display:flex;flex-direction:column}
    .ph-status{display:flex;justify-content:space-between;align-items:center;padding:9px 16px 5px;
      font-size:11px;color:var(--muted)}
    .ph-body{padding:14px 16px;flex:1}
    .ph-pop{margin-top:auto;background:var(--slate);border-top:1px solid var(--line);
      border-radius:18px 18px 22px 22px;padding:16px}

    .stepline{display:flex;align-items:center;gap:0;overflow-x:auto;padding-bottom:4px}
    .stepnode{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:66px;flex:1}
    .stepbadge{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-family:'Space Mono',monospace;font-size:13px;border:1px solid var(--line);background:rgba(12,31,51,.9);color:var(--muted)}
    .stepbadge.on{background:linear-gradient(96deg,var(--signal),var(--signal-dim));color:#04211b;border-color:transparent;font-weight:700}
    .stepbadge.done{background:rgba(47,230,196,.16);color:var(--signal);border-color:rgba(47,230,196,.4)}
    .stepbar{height:2px;flex:1;background:var(--line);min-width:14px}
    .stepbar.done{background:var(--signal-dim)}
    .steptxt{font-size:11px;color:var(--muted);text-align:center;white-space:nowrap}
    .steptxt.on{color:var(--text);font-weight:600}

    .rowsel{display:flex;gap:10px;align-items:center;padding:14px;border-radius:13px;border:1px solid var(--line);
      background:rgba(12,31,51,.5);cursor:pointer;transition:border .15s,background .15s}
    .rowsel:hover{border-color:rgba(47,230,196,.4)}
    .rowsel.sel{border-color:var(--signal);background:rgba(47,230,196,.07);box-shadow:0 0 0 3px rgba(47,230,196,.1)}
    .radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--muted2);flex:0 0 auto;display:flex;align-items:center;justify-content:center}
    .radio.sel{border-color:var(--signal)}
    .radio.sel::after{content:'';width:10px;height:10px;border-radius:50%;background:var(--signal)}

    .seg{display:inline-flex;background:rgba(8,21,36,.7);border:1px solid var(--line);border-radius:12px;padding:4px}
    .seg button{all:unset;cursor:pointer;padding:9px 16px;border-radius:9px;font-size:14px;color:var(--muted);font-weight:600}
    .seg button.on{background:var(--slate);color:var(--text)}

    .spin{animation:spin 1s linear infinite}
    .fade{animation:fadeUp .5s ease both}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

    .navlink{cursor:pointer;color:var(--muted);font-size:15px;font-weight:500;padding:8px 2px}
    .navlink:hover,.navlink.active{color:var(--text)}

    @media (max-width:760px){ .hide-sm{display:none!important} .stack-sm{flex-direction:column!important;align-items:stretch!important} }
    @media (prefers-reduced-motion: reduce){ .ring,.sweep,.netdot,.pulse-dot,.spin{animation:none!important} }
  `}</style>
);

/* ============================== DATA ============================== */
const PACKS = [
  { id: "solo", name: "Solo", cards: 1, price: 19900, tag: "Le plus populaire",
    desc: "Pour ne plus jamais perdre votre portefeuille et vos papiers.", best: true },
  { id: "famille", name: "Famille", cards: 3, price: 49900, tag: "Économisez 9 700 F",
    desc: "Protégez portefeuille, sac et bagage de tout le foyer.", best: false },
  { id: "business", name: "Business", cards: 5, price: 79900, tag: "Meilleur prix / carte",
    desc: "Sacoches, matériel, sac de caisse — gardez tout à l'œil.", best: false },
];
const fcfa = (n) => n.toLocaleString("fr-FR").replace(/\u202f/g, " ") + " FCFA";

const BENEFITS = [
  { icon: Wallet, t: "Portefeuille & CNI", d: "Glissez la carte entre vos cartes bancaires. Retrouvez votre portefeuille en un instant." },
  { icon: FileText, t: "Passeport & documents", d: "Dans la pochette de voyage, elle veille sur vos papiers les plus précieux." },
  { icon: Briefcase, t: "Sac, sacoche & bagage", d: "À l'aéroport, en taxi, au bureau — sachez toujours où est votre sac." },
  { icon: Users, t: "Partage en famille", d: "Partagez la localisation d'un objet avec vos proches, révocable à tout moment." },
];

const STEPS_FUNC = [
  { n: "01", icon: Radio, t: "La carte émet un signal", d: "Un signal Bluetooth basse consommation, discret et économe en batterie, se diffuse en continu autour de la carte." },
  { n: "02", icon: Signal, t: "Le réseau la détecte", d: "Les téléphones Android à proximité (réseau Find Hub de Google) captent ce signal de façon anonyme et chiffrée." },
  { n: "03", icon: MapPin, t: "La position remonte vers vous", d: "Vous voyez la dernière position de l'objet sur une carte, dans l'application — même s'il est hors de votre portée." },
  { n: "04", icon: Volume2, t: "À proximité, on vous guide", d: "Un indicateur « plus chaud / plus froid » et une sonnerie forte vous mènent jusqu'à l'objet." },
  { n: "05", icon: Share2, t: "Perte & partage", d: "Marquez l'objet comme perdu, affichez un message au trouveur, ou partagez sa position avec un proche." },
];

const TRUTHS = [
  { icon: Signal, t: "Meilleure couverture en zone fréquentée", d: "Plus il y a de téléphones autour, meilleure est la localisation. Par défaut, le réseau attend plusieurs appareils avant de remonter une position, pour protéger la vie privée." },
  { icon: Lock, t: "Localisation chiffrée de bout en bout", d: "Vos données de position sont chiffrées. Ni Google ni SkyTrack n'y ont accès — vous seul, et les personnes que vous choisissez." },
  { icon: Shield, t: "Protection anti-pistage", d: "Une norme commune Google/Apple alerte toute personne qui aurait une carte inconnue près d'elle. Impossible de suivre quelqu'un à son insu." },
  { icon: Nfc, t: "Un réseau à la fois", d: "Une carte se connecte soit à Find Hub (Android), soit à Localiser (iPhone). Vous choisissez au moment de l'activation." },
];

const FAQS = [
  { q: "La carte fonctionne-t-elle bien au Cameroun ?", a: "Oui. Le réseau s'appuie sur les téléphones Android autour de la carte, et Android est très répandu au Cameroun. La localisation est d'autant plus précise dans les zones fréquentées (marchés, quartiers, axes passants)." },
  { q: "Quelle est la précision de la localisation ?", a: "Vous obtenez la dernière position connue de l'objet dès qu'un téléphone du réseau passe à proximité. Tout près, l'indicateur de distance et la sonnerie vous guident jusqu'à l'objet exact." },
  { q: "Quelle autonomie ? Faut-il recharger ?", a: "La carte est conçue pour une longue autonomie. Selon le modèle, elle est rechargeable — un voyant vous prévient quand il faut la recharger." },
  { q: "Avec quels téléphones est-elle compatible ?", a: "Android 9 ou plus récent (via l'application Find Hub de Google) et iPhone (via l'app Localiser, déjà installée). Une carte se relie à un seul de ces réseaux à la fois." },
  { q: "Mes données sont-elles privées ?", a: "Oui. La localisation est chiffrée de bout en bout. Personne d'autre que vous — et les proches avec qui vous partagez — ne peut voir où se trouve votre objet." },
  { q: "Quelle différence entre l'app SkyTrack et Find Hub / Localiser ?", a: "Le suivi se fait dans Find Hub (Android) ou Localiser (iPhone). L'app SkyTrack est une app compagnon : elle sert à l'installation et ajoute des fonctions bonus (faire sonner votre téléphone, changer la sonnerie de la carte, etc.)." },
  { q: "Peut-on l'utiliser pour suivre une personne ?", a: "Non. Le système alerte automatiquement toute personne près de qui se trouverait une carte inconnue. SkyTrack sert à retrouver vos objets, pas à pister quelqu'un." },
  { q: "Comment se passe la livraison ?", a: "Après votre commande, nous préparons votre carte et vous contactons (WhatsApp ou email) pour la livraison. Le délai indicatif vous est communiqué à la confirmation." },
];

/* ============================== SHARED ============================== */
function Logo({ onClick }) {
  return (
    <button className="reset" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <span style={{ position: "relative", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: 10, background: "linear-gradient(135deg,rgba(47,230,196,.25),rgba(255,176,32,.18))", border: "1px solid var(--line)" }} />
        <Signal size={18} style={{ color: "var(--signal)", position: "relative" }} />
      </span>
      <span className="font-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>
        Sky<span className="sig">Track</span>
      </span>
    </button>
  );
}

function Btn({ children, variant = "primary", className = "", ...p }) {
  const v = variant === "primary" ? "btn-primary" : variant === "sig" ? "btn-sig" : "btn-ghost";
  return <button className={`btn ${v} ${className}`} {...p}>{children}</button>;
}

function SectionHead({ eyebrow, title, sub, center }) {
  return (
    <div style={{ maxWidth: 640, margin: center ? "0 auto" : 0, textAlign: center ? "center" : "left", marginBottom: 40 }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>}
      <h2 className="font-display" style={{ fontSize: "clamp(26px,4.5vw,40px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-.02em", margin: 0 }}>{title}</h2>
      {sub && <p className="muted" style={{ fontSize: 17, lineHeight: 1.6, marginTop: 16 }}>{sub}</p>}
    </div>
  );
}

/* ============================== RADAR HERO ============================== */
function Radar() {
  const dots = [
    { icon: Smartphone, x: "6%", y: "18%", d: "0s" },
    { icon: Smartphone, x: "84%", y: "10%", d: ".6s" },
    { icon: Smartphone, x: "90%", y: "62%", d: "1.1s" },
    { icon: Smartphone, x: "2%", y: "66%", d: "1.6s" },
    { icon: Smartphone, x: "44%", y: "-4%", d: ".3s" },
  ];
  return (
    <div className="radar">
      <div className="grid-ring" style={{ transform: "scale(.36)" }} />
      <div className="grid-ring" style={{ transform: "scale(.62)" }} />
      <div className="grid-ring" style={{ transform: "scale(.88)" }} />
      <div className="ring" />
      <div className="ring" style={{ animationDelay: "1.1s" }} />
      <div className="ring" style={{ animationDelay: "2.2s" }} />
      <div className="sweep" />
      {dots.map((D, i) => (
        <span key={i} className="netdot" style={{ left: D.x, top: D.y, animationDelay: D.d }}>
          <D.icon size={16} />
        </span>
      ))}
      <div className="radar-core">
        <div className="thecard">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Signal size={13} style={{ color: "var(--signal)" }} />
            <span className="pulse-dot" />
          </div>
          <div>
            <div className="font-mono" style={{ fontSize: 8.5, color: "var(--muted)", letterSpacing: ".08em" }}>SKYTRACK · CARD</div>
            <div className="font-mono" style={{ fontSize: 9.5, color: "var(--signal)", marginTop: 2 }}>3.8480°N 11.5021°E</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== NAV ============================== */
function Nav({ page, go, order }) {
  const [open, setOpen] = useState(false);
  const items = [
    ["home", "Accueil"], ["how", "Comment ça marche"], ["products", "Produits"], ["faq", "FAQ"], ["support", "Support"],
  ];
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,21,36,.72)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
        <Logo onClick={() => go("home")} />
        <div className="hide-sm" style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {items.map(([k, l]) => (
            <span key={k} className={`navlink ${page === k ? "active" : ""}`} onClick={() => go(k)}>{l}</span>
          ))}
          <Btn variant="primary" onClick={() => order()} style={{ padding: "10px 18px", minHeight: 40 }}>Commander <ArrowRight size={16} /></Btn>
        </div>
        <button className="reset menu-btn" onClick={() => setOpen(!open)} aria-label="Menu"
          style={{ cursor: "pointer", color: "var(--text)", padding: 4 }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="only-sm" style={{ borderTop: "1px solid var(--line)", padding: "10px 20px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map(([k, l]) => (
            <span key={k} className="navlink" style={{ padding: "12px 2px", fontSize: 16 }} onClick={() => { go(k); setOpen(false); }}>{l}</span>
          ))}
          <Btn variant="primary" onClick={() => { order(); setOpen(false); }} style={{ marginTop: 8 }}>Commander ma carte <ArrowRight size={16} /></Btn>
        </div>
      )}
      <style>{`
        .only-sm{display:none}
        .menu-btn{display:none}
        @media (max-width:760px){ .only-sm{display:block} .menu-btn{display:inline-flex} }
      `}</style>
    </div>
  );
}

/* ============================== HOME ============================== */
function Home({ go, order }) {
  return (
    <div className="z">
      {/* HERO */}
      <div className="wrap" style={{ paddingTop: 46, paddingBottom: 40 }}>
        <div className="stack-sm" style={{ display: "flex", gap: 40, alignItems: "center" }}>
          <div style={{ flex: "1 1 480px" }} className="fade">
            <div className="chip" style={{ marginBottom: 22 }}>
              <span className="pulse-dot" /> Réseau Find Hub de Google · +1 milliard d'appareils
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(34px,6.4vw,60px)", fontWeight: 700, lineHeight: 1.03, letterSpacing: "-.03em", margin: 0 }}>
              Ne perdez plus jamais<br /><span className="gradtext">ce qui compte.</span>
            </h1>
            <p className="muted" style={{ fontSize: 19, lineHeight: 1.6, marginTop: 22, maxWidth: 480 }}>
              La carte <b style={{ color: "var(--text)" }}>SkyTrack</b> se glisse dans votre portefeuille et le retrouve depuis votre téléphone — même à l'autre bout de la ville.
            </p>
            <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 30 }}>
              <Btn variant="primary" onClick={() => order()}>Commander ma carte <ArrowRight size={18} /></Btn>
              <Btn variant="ghost" onClick={() => go("how")}><PlayCircle size={18} /> Comment ça marche</Btn>
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 30, flexWrap: "wrap" }}>
              {[["Chiffré", "de bout en bout"], ["Android", "& iPhone"], ["Paiement", "MoMo · OM · Visa"]].map(([a, b], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={16} style={{ color: "var(--signal)" }} />
                  <span style={{ fontSize: 13 }}><b>{a}</b> <span className="muted">{b}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: "1 1 340px", display: "flex", justifyContent: "center" }} className="fade">
            <Radar />
          </div>
        </div>
      </div>

      {/* TRUST STRIP */}
      <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "rgba(12,31,51,.4)" }}>
        <div className="wrap" style={{ display: "flex", gap: 30, flexWrap: "wrap", justifyContent: "space-between", padding: "18px 20px" }}>
          {[[Signal, "+1 milliard d'appareils dans le réseau"], [Lock, "Localisation chiffrée de bout en bout"], [Smartphone, "Compatible Android & iPhone"], [Truck, "Livraison au Cameroun"]].map(([Ic, t], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Ic size={18} style={{ color: "var(--signal)" }} />
              <span className="muted" style={{ fontSize: 14 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <div className="wrap" style={{ paddingTop: 66, paddingBottom: 20 }}>
        <SectionHead eyebrow="À quoi ça sert" title="Une carte, tout ce qui compte" sub="Fine comme une carte bancaire, elle veille sur vos objets de valeur au quotidien." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 }}>
          {BENEFITS.map((b, i) => (
            <div key={i} className="card" style={{ padding: 22 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(47,230,196,.1)", border: "1px solid rgba(47,230,196,.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <b.icon size={21} style={{ color: "var(--signal)" }} />
              </div>
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>{b.t}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{b.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW TEASER */}
      <div className="wrap" style={{ paddingTop: 66, paddingBottom: 20 }}>
        <SectionHead center eyebrow="Le principe" title="Comment votre objet se fait retrouver" sub="Trois temps, et une multitude de téléphones qui travaillent pour vous." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {STEPS_FUNC.slice(0, 3).map((s, i) => (
            <div key={i} className="card" style={{ padding: 24, position: "relative" }}>
              <span className="font-mono sig" style={{ position: "absolute", top: 18, right: 20, fontSize: 13, opacity: .7 }}>{s.n}</span>
              <s.icon size={26} style={{ color: "var(--signal)", marginBottom: 16 }} />
              <h3 className="font-display" style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>{s.t}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Btn variant="ghost" onClick={() => go("how")}>Voir le fonctionnement complet <ChevronRight size={16} /></Btn>
        </div>
      </div>

      {/* PRODUCTS TEASER */}
      <div className="wrap" style={{ paddingTop: 66, paddingBottom: 20 }}>
        <SectionHead center eyebrow="Nos packs" title="Choisissez votre protection" />
        <PackGrid onChoose={(p) => order(p)} />
      </div>

      {/* CTA BAND */}
      <div className="wrap" style={{ padding: "70px 20px" }}>
        <div className="card" style={{ padding: "44px 28px", textAlign: "center", background: "linear-gradient(120deg,rgba(47,230,196,.12),rgba(255,176,32,.08))", border: "1px solid rgba(47,230,196,.25)" }}>
          <h2 className="font-display" style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-.02em" }}>Prêt à ne plus rien perdre ?</h2>
          <p className="muted" style={{ fontSize: 17, margin: "0 auto 26px", maxWidth: 460 }}>Commandez, payez par Mobile Money ou carte, et activez votre carte en quelques minutes.</p>
          <Btn variant="primary" onClick={() => order()}>Commander maintenant <ArrowRight size={18} /></Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================== HOW IT WORKS ============================== */
function How({ order }) {
  return (
    <div className="z wrap" style={{ paddingTop: 52, paddingBottom: 60 }}>
      <SectionHead eyebrow="Fonctionnement" title="Comment fonctionne la carte SkyTrack" sub="De l'émission du signal jusqu'à ce que vous mettiez la main sur votre objet — voici chaque étape." />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {STEPS_FUNC.map((s, i) => (
          <div key={i} className="card" style={{ padding: 22, display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 auto", width: 52, height: 52, borderRadius: 14, background: "rgba(47,230,196,.1)", border: "1px solid rgba(47,230,196,.25)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <s.icon size={24} style={{ color: "var(--signal)" }} />
              <span className="font-mono" style={{ position: "absolute", top: -9, left: -9, fontSize: 11, color: "var(--amber)", background: "var(--night)", padding: "2px 5px", borderRadius: 6, border: "1px solid var(--line)" }}>{s.n}</span>
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: 19, fontWeight: 600, margin: "2px 0 6px" }}>{s.t}</h3>
              <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 50 }}>
        <SectionHead eyebrow="Bon à savoir" title="Ce qu'il faut retenir" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {TRUTHS.map((t, i) => (
            <div key={i} className="card" style={{ padding: 22 }}>
              <t.icon size={22} style={{ color: "var(--signal)", marginBottom: 14 }} />
              <h3 className="font-display" style={{ fontSize: 16.5, fontWeight: 600, margin: "0 0 8px" }}>{t.t}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{t.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 46 }}>
        <Btn variant="primary" onClick={() => order()}>Commander ma carte <ArrowRight size={18} /></Btn>
      </div>
    </div>
  );
}

/* ============================== PACKS ============================== */
function PackGrid({ onChoose, selected }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
      {PACKS.map((p) => {
        const active = selected === p.id;
        return (
          <div key={p.id} className="card" style={{ padding: 26, position: "relative", border: p.best || active ? "1px solid rgba(47,230,196,.5)" : "1px solid var(--line)", boxShadow: p.best ? "0 20px 50px -30px rgba(47,230,196,.5)" : "none" }}>
            {p.best && <span className="chip" style={{ position: "absolute", top: -13, left: 22, background: "linear-gradient(96deg,var(--amber),var(--amber-2))", color: "#1a0f00", border: 0, fontWeight: 700, fontSize: 12 }}><Star size={12} /> {p.tag}</span>}
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, margin: "6px 0 4px" }}>{p.name}</h3>
            <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{p.cards} carte{p.cards > 1 ? "s" : ""} SkyTrack</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span className="font-display" style={{ fontSize: 30, fontWeight: 700 }}>{p.price.toLocaleString("fr-FR").replace(/\u202f/g, " ")}</span>
              <span className="muted" style={{ fontSize: 14 }}>FCFA</span>
            </div>
            {!p.best && <div className="sig" style={{ fontSize: 12, marginBottom: 12, minHeight: 16 }}>{p.tag}</div>}
            {p.best && <div style={{ minHeight: 16, marginBottom: 12 }} />}
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 20px", minHeight: 42 }}>{p.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
              {[[Battery, "Longue autonomie, rechargeable"], [Volume2, "Sonnerie forte intégrée"], [Smartphone, "Android (Find Hub) & iPhone (Localiser)"]].map(([Ic, t], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Ic size={15} style={{ color: "var(--signal)", flex: "0 0 auto" }} />
                  <span className="muted" style={{ fontSize: 13 }}>{t}</span>
                </div>
              ))}
            </div>
            <Btn variant={p.best ? "primary" : "sig"} className="" onClick={() => onChoose(p)} style={{ width: "100%" }}>
              Choisir ce pack <ChevronRight size={16} />
            </Btn>
          </div>
        );
      })}
    </div>
  );
}

function Products({ order }) {
  return (
    <div className="z wrap" style={{ paddingTop: 52, paddingBottom: 60 }}>
      <SectionHead center eyebrow="Produits & tarifs" title="Choisissez votre pack SkyTrack" sub="Toutes les cartes fonctionnent avec le réseau Find Hub de Google et le réseau Localiser d'Apple." />
      <PackGrid onChoose={(p) => order(p)} />
      <p className="muted2" style={{ textAlign: "center", fontSize: 12.5, marginTop: 26 }}>Prix indicatifs · livraison au Cameroun · paiement MoMo, Orange Money ou carte Visa/Mastercard.</p>
    </div>
  );
}

/* ============================== FAQ ============================== */
function Faq({ order }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="z wrap" style={{ paddingTop: 52, paddingBottom: 60, maxWidth: 800 }}>
      <SectionHead eyebrow="Questions fréquentes" title="Tout ce que vous vous demandez" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FAQS.map((f, i) => (
          <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <button className="reset" onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", cursor: "pointer", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <span className="font-display" style={{ fontSize: 16, fontWeight: 600, textAlign: "left" }}>{f.q}</span>
              <ChevronRight size={18} style={{ color: "var(--signal)", flex: "0 0 auto", transform: open === i ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
            </button>
            {open === i && <div className="muted fade" style={{ padding: "0 20px 20px", fontSize: 14.5, lineHeight: 1.65 }}>{f.a}</div>}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Btn variant="primary" onClick={() => order()}>Commander ma carte <ArrowRight size={18} /></Btn>
      </div>
    </div>
  );
}

/* ============================== SUPPORT ============================== */
function Support() {
  return (
    <div className="z wrap" style={{ paddingTop: 52, paddingBottom: 60, maxWidth: 780 }}>
      <SectionHead eyebrow="Support" title="Une question ? On vous répond." sub="L'équipe SkyTrack est joignable pour l'achat, l'activation ou le suivi de votre commande." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        <a className="reset card" href="https://wa.me/237640759203" target="_blank" rel="noreferrer" style={{ padding: 24, cursor: "pointer", display: "block" }}>
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

/* ============================== ONBOARDING WIZARD ============================== */
const OB_STEPS = ["Pack", "Compte", "Paiement", "Confirmation", "Configuration", "Application"];

function Stepper({ step }) {
  return (
    <div className="stepline" style={{ marginBottom: 34 }}>
      {OB_STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="stepnode">
            <div className={`stepbadge ${i === step ? "on" : i < step ? "done" : ""}`}>
              {i < step ? <Check size={15} /> : i + 1}
            </div>
            <div className={`steptxt ${i === step ? "on" : ""}`}>{label}</div>
          </div>
          {i < OB_STEPS.length - 1 && <div className={`stepbar ${i < step ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Summary({ flow }) {
  const pack = PACKS.find((p) => p.id === flow.pack);
  if (!pack) return null;
  return (
    <div className="card" style={{ padding: 20, height: "fit-content" }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>Votre commande</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span>Pack {pack.name}</span><span className="muted">{pack.cards} carte{pack.cards > 1 ? "s" : ""}</span>
      </div>
      <div style={{ borderTop: "1px solid var(--line)", margin: "14px 0", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="muted" style={{ fontSize: 14 }}>Total</span>
        <span className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>{fcfa(pack.price)}</span>
      </div>
      {flow.contact && <div className="muted2" style={{ fontSize: 12, marginTop: 6 }}>Contact : {flow.contact}</div>}
    </div>
  );
}

/* --- Step 1: choose pack --- */
function StepPack({ flow, setFlow, next }) {
  return (
    <div className="fade">
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Choisissez votre pack</h2>
      <p className="muted" style={{ marginBottom: 26 }}>Vous pourrez ajuster à l'étape suivante.</p>
      <PackGrid selected={flow.pack} onChoose={(p) => { setFlow((f) => ({ ...f, pack: p.id })); next(); }} />
    </div>
  );
}

/* --- Step 2: registration --- */
function StepAccount({ flow, setFlow, next, back }) {
  const [err, setErr] = useState({});
  const set = (k) => (e) => setFlow((f) => ({ ...f, [k]: e.target.value }));
  const validate = () => {
    const er = {};
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
        <Btn variant="primary" onClick={() => validate() && next()}>Continuer vers le paiement <ArrowRight size={16} /></Btn>
      </div>
    </div>
  );
}

/* --- Step 3: payment --- */
function StepPay({ flow, setFlow, next, back }) {
  const pack = PACKS.find((p) => p.id === flow.pack);
  const [method, setMethod] = useState(flow.pay || "momo");
  const [phase, setPhase] = useState("form"); // form | pending | error
  const [demoResult, setDemoResult] = useState("success");
  const [momoNum, setMomoNum] = useState("");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", name: "" });

  const methods = [
    { id: "momo", label: "MTN MoMo", sub: "Mobile Money", color: "var(--mtn)" },
    { id: "om", label: "Orange Money", sub: "Mobile Money", color: "var(--orange)" },
    { id: "visa", label: "Carte Visa / Mastercard", sub: "Paiement par carte", color: "var(--signal)" },
  ];

  const canPay = () => {
    if (method === "visa") return card.num.replace(/\s/g, "").length >= 15 && card.exp.length >= 4 && card.cvv.length >= 3 && card.name.trim();
    return /^\+?[0-9\s]{8,}$/.test(momoNum);
  };

  const pay = () => {
    setFlow((f) => ({ ...f, pay: method }));
    setPhase("pending");
    setTimeout(() => {
      if (demoResult === "success") next();
      else setPhase("error");
    }, 2600);
  };

  const fmtCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v) => v.replace(/\D/g, "").slice(0, 4).replace(/(.{2})(.+)/, "$1/$2");

  return (
    <div className="fade">
      <div className="stack-sm" style={{ display: "flex", gap: 26 }}>
        <div style={{ flex: "1 1 480px" }}>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Paiement</h2>
          <p className="muted" style={{ marginBottom: 22 }}>Choisissez votre moyen de paiement préféré.</p>

          {/* demo banner */}
          <div className="card" style={{ padding: "12px 14px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "rgba(255,176,32,.06)", borderColor: "rgba(255,176,32,.25)" }}>
            <span style={{ fontSize: 12.5, color: "var(--amber)" }}><b>Démo</b> — aucun paiement réel. Testez le résultat :</span>
            <div className="seg" style={{ padding: 3 }}>
              <button className={demoResult === "success" ? "on" : ""} style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setDemoResult("success")}>Succès</button>
              <button className={demoResult === "error" ? "on" : ""} style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setDemoResult("error")}>Échec</button>
            </div>
          </div>

          {phase === "pending" ? (
            <div className="card" style={{ padding: 30, textAlign: "center" }}>
              <Loader size={30} className="spin" style={{ color: "var(--signal)", marginBottom: 16 }} />
              {method === "visa" ? (
                <>
                  <h3 className="font-display" style={{ fontSize: 18, margin: "0 0 8px" }}>Vérification 3-D Secure…</h3>
                  <p className="muted" style={{ fontSize: 14, margin: 0 }}>Confirmation de votre carte en cours.</p>
                </>
              ) : (
                <>
                  <h3 className="font-display" style={{ fontSize: 18, margin: "0 0 8px" }}>Confirmez sur votre téléphone</h3>
                  <p className="muted" style={{ fontSize: 14, margin: 0 }}>Une demande de paiement a été envoyée au {momoNum || "numéro indiqué"}. Composez votre code {method === "momo" ? "MoMo" : "Orange Money"} pour valider.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                {methods.map((m) => (
                  <div key={m.id} className={`rowsel ${method === m.id ? "sel" : ""}`} onClick={() => { setMethod(m.id); setPhase("form"); }}>
                    <div className={`radio ${method === m.id ? "sel" : ""}`} />
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: m.color, flex: "0 0 auto" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{m.label}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{m.sub}</div>
                    </div>
                    {m.id === "visa" ? <CreditCard size={18} className="muted" /> : <Smartphone size={18} className="muted" />}
                  </div>
                ))}
              </div>

              {/* method form */}
              <div className="card" style={{ padding: 20, marginBottom: 8 }}>
                {method === "visa" ? (
                  <div style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label className="fld">Numéro de carte</label>
                      <input value={card.num} onChange={(e) => setCard({ ...card, num: fmtCard(e.target.value) })} placeholder="4242 4242 4242 4242" inputMode="numeric" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div><label className="fld">Expiration</label><input value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })} placeholder="MM/AA" inputMode="numeric" /></div>
                      <div><label className="fld">CVV</label><input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="123" inputMode="numeric" /></div>
                    </div>
                    <div><label className="fld">Titulaire</label><input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Nom sur la carte" /></div>
                  </div>
                ) : (
                  <div>
                    <label className="fld">Numéro {method === "momo" ? "MTN MoMo" : "Orange Money"}</label>
                    <input value={momoNum} onChange={(e) => setMomoNum(e.target.value)} placeholder={method === "momo" ? "+237 6 7X XX XX XX" : "+237 6 9X XX XX XX"} inputMode="tel" />
                    <p className="muted2" style={{ fontSize: 12.5, marginTop: 10 }}>Vous recevrez une demande de paiement à valider sur votre téléphone.</p>
                  </div>
                )}
              </div>

              {phase === "error" && (
                <div className="card fade" style={{ padding: "14px 16px", marginBottom: 8, background: "rgba(255,90,90,.08)", borderColor: "rgba(255,90,90,.35)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <X size={18} style={{ color: "#ff8a8a", flex: "0 0 auto", marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14.5, color: "#ffb3b3" }}>Paiement non abouti</div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>La transaction a été annulée ou le solde est insuffisant. Réessayez, ou changez de moyen de paiement.</div>
                    </div>
                  </div>
                </div>
              )}

              <p className="muted2" style={{ fontSize: 12, marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <Shield size={13} /> Vos informations de paiement ne transitent pas par nos serveurs.
              </p>

              <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <Btn variant="ghost" onClick={back}><ChevronLeft size={16} /> Retour</Btn>
                <Btn variant="primary" onClick={pay} disabled={!canPay()}>
                  {phase === "error" ? "Réessayer" : `Payer ${fcfa(pack.price)}`} <ArrowRight size={16} />
                </Btn>
              </div>
            </>
          )}
        </div>
        <div style={{ flex: "0 0 280px" }}><Summary flow={flow} /></div>
      </div>
    </div>
  );
}

/* --- Step 4: confirmation --- */
function StepConfirm({ flow, next }) {
  const pack = PACKS.find((p) => p.id === flow.pack);
  return (
    <div className="fade" style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(47,230,196,.12)", border: "1px solid rgba(47,230,196,.4)" }}>
        <PackageCheck size={36} style={{ color: "var(--signal)" }} />
      </div>
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 10px" }}>Commande confirmée</h2>
      <p className="muted" style={{ fontSize: 16, margin: "0 0 24px" }}>Merci ! Votre carte est en préparation.</p>

      <div className="card" style={{ padding: 22, textAlign: "left", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span className="muted">N° de commande</span><span className="font-mono sig">{flow.orderRef}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span className="muted">Pack</span><span>{pack.name} · {pack.cards} carte{pack.cards > 1 ? "s" : ""}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span className="muted">Montant</span><span style={{ fontWeight: 600 }}>{fcfa(pack.price)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
          <span className="muted">Contact</span><span>{flow.contact}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span className="muted">Livraison</span><span>{flow.address}, {flow.city}</span>
        </div>
      </div>

      <div className="chip" style={{ marginBottom: 26 }}><Truck size={14} /> Livraison estimée : 2 à 4 jours ouvrés</div>
      <div><Btn variant="primary" onClick={next}>Configurer ma carte <ArrowRight size={18} /></Btn></div>
    </div>
  );
}

/* --- phone mockups for setup --- */
function PhoneAndroid({ i }) {
  const screens = [
    (<div className="ph-body" key="a0" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div className="thecard" style={{ transform: "scale(1.1)", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><Signal size={12} style={{ color: "var(--signal)" }} /><span className="pulse-dot" /></div>
        <div className="font-mono" style={{ fontSize: 8, color: "var(--muted)" }}>SKYTRACK · CARD</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>Appuyez sur le bouton</div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>de la carte pour l'activer</div>
    </div>),
    (<div className="ph-body" key="a1" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ height: 120, borderRadius: 12, background: "rgba(140,183,214,.06)", marginBottom: "auto" }} />
      <div className="ph-pop">
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(47,230,196,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><Signal size={16} style={{ color: "var(--signal)" }} /></div>
          <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>SkyTrack Card</div><div className="muted" style={{ fontSize: 10.5 }}>Appareil à proximité</div></div>
        </div>
        <div style={{ background: "linear-gradient(96deg,var(--signal),var(--signal-dim))", color: "#04211b", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12.5, fontWeight: 700 }}>Connecter</div>
      </div>
    </div>),
    (<div className="ph-body" key="a2" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 12 }}>Lier à votre compte Google</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 11px", borderRadius: 9, border: "1px solid var(--line)", marginBottom: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(140,183,214,.15)" }} /><span style={{ fontSize: 11.5 }} className="muted">compte@gmail.com</span>
      </div>
      <div className="muted" style={{ fontSize: 10.5, lineHeight: 1.5, marginBottom: "auto" }}>Utilisez la carte de façon responsable, sûre et légale.</div>
      <div style={{ background: "var(--slate)", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12, fontWeight: 600 }}>J'accepte</div>
    </div>),
    (<div className="ph-body" key="a3" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>Find Hub</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px", borderRadius: 10, background: "rgba(47,230,196,.08)", border: "1px solid rgba(47,230,196,.25)", marginBottom: 10 }}>
        <Wallet size={18} style={{ color: "var(--signal)" }} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>Mon portefeuille</div><div className="sig" style={{ fontSize: 10.5 }}>À proximité · maintenant</div></div>
        <Check size={16} style={{ color: "var(--signal)" }} />
      </div>
      <div style={{ height: 90, borderRadius: 10, background: "linear-gradient(160deg,rgba(47,230,196,.06),transparent)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "auto" }}>
        <MapPin size={22} style={{ color: "var(--signal)" }} />
      </div>
    </div>),
  ];
  return <PhoneShell screen={screens[i]} title={["Activer", "Fast Pair", "Compte Google", "Find Hub"][i]} />;
}

function PhoneIOS({ i }) {
  const screens = [
    (<div className="ph-body" key="i0">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Localiser</div>
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--line)", paddingBottom: 10, marginBottom: 14 }}>
        <span className="muted" style={{ fontSize: 12 }}>Personnes</span>
        <span className="muted" style={{ fontSize: 12 }}>Appareils</span>
        <span className="sig" style={{ fontSize: 12, fontWeight: 700 }}>Objets</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 11px", borderRadius: 10, background: "rgba(47,230,196,.08)", border: "1px dashed rgba(47,230,196,.4)" }}>
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
      <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(47,230,196,.12)", border: "1px solid rgba(47,230,196,.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "10px 0 14px" }}>
        <Wallet size={26} style={{ color: "var(--signal)" }} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600 }}>Carte détectée</div>
      <div className="muted" style={{ fontSize: 10.5, marginBottom: "auto", marginTop: 4 }}>Nommez votre objet</div>
      <div style={{ width: "100%", padding: "9px", borderRadius: 9, border: "1px solid var(--line)", fontSize: 11.5, marginBottom: 10 }} className="muted">Mon portefeuille 💳</div>
      <div style={{ width: "100%", background: "linear-gradient(96deg,var(--signal),var(--signal-dim))", color: "#04211b", textAlign: "center", padding: "9px", borderRadius: 9, fontSize: 12, fontWeight: 700 }}>Continuer</div>
    </div>),
    (<div className="ph-body" key="i3" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(47,230,196,.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Check size={30} style={{ color: "var(--signal)" }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>C'est prêt !</div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>Votre carte apparaît dans Localiser → Objets.</div>
    </div>),
  ];
  return <PhoneShell screen={screens[i]} title={["Objets", "Ajouter", "Nommer", "Terminé"][i]} />;
}

function PhoneShell({ screen, title }) {
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

/* --- Step 5: setup --- */
function StepSetup({ flow, setFlow, next, back, detectedOS }) {
  const os = flow.os || detectedOS || "android";
  const setOS = (v) => setFlow((f) => ({ ...f, os: v }));
  useEffect(() => { if (!flow.os) setFlow((f) => ({ ...f, os: detectedOS || "android" })); }, []);
  const stepsA = [
    "Chargez puis appuyez sur le bouton de la carte pour l'activer.",
    "Le pop-up Fast Pair apparaît sur votre téléphone : touchez « Connecter ».",
    "Liez la carte à votre compte Google et acceptez l'usage responsable.",
    "La carte apparaît dans Find Hub. Installez l'app SkyTrack pour les fonctions bonus.",
  ];
  const stepsI = [
    "Ouvrez l'app Localiser, puis l'onglet « Objets ».",
    "Touchez « + » → « Ajouter un autre objet », appuyez sur le bouton de la carte.",
    "La carte est détectée : touchez « Connecter », nommez-la et choisissez un emoji.",
    "Confirmez avec votre identifiant Apple, puis « Terminer ». C'est prêt.",
  ];
  const steps = os === "ios" ? stepsI : stepsA;

  return (
    <div className="fade">
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Connectez votre carte</h2>
      <p className="muted" style={{ marginBottom: 20 }}>On a détecté votre téléphone — vous pouvez aussi choisir manuellement.</p>

      <div className="seg" style={{ marginBottom: 26 }}>
        <button className={os === "android" ? "on" : ""} onClick={() => setOS("android")}><Smartphone size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />Android</button>
        <button className={os === "ios" ? "on" : ""} onClick={() => setOS("ios")}><Smartphone size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />iPhone</button>
      </div>

      <div className="stack-sm" style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 380px" }}>
          <div className="chip" style={{ marginBottom: 20 }}>
            {os === "ios" ? "Réseau Localiser (Apple)" : "Réseau Find Hub (Google)"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div className="font-mono" style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: 8, background: "rgba(47,230,196,.12)", border: "1px solid rgba(47,230,196,.3)", color: "var(--signal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: "3px 0 0" }}>{s}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: "12px 14px", marginTop: 20, display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(255,176,32,.06)", borderColor: "rgba(255,176,32,.22)" }}>
            <Nfc size={16} style={{ color: "var(--amber)", flex: "0 0 auto", marginTop: 2 }} />
            <span className="muted" style={{ fontSize: 12.5 }}>Une carte se connecte à <b style={{ color: "var(--text)" }}>un seul réseau à la fois</b>. Pour changer, réinitialisez la carte puis reconnectez-la sur l'autre téléphone.</span>
          </div>
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center", width: "100%", maxWidth: 260, margin: "0 auto" }}>
          <SetupPhonePreview os={os} />
        </div>
      </div>

      <div className="stack-sm" style={{ display: "flex", gap: 12, marginTop: 30 }}>
        <Btn variant="ghost" onClick={back}><ChevronLeft size={16} /> Retour</Btn>
        <Btn variant="primary" onClick={next}>Télécharger l'application <ArrowRight size={16} /></Btn>
      </div>
    </div>
  );
}

function SetupPhonePreview({ os }) {
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

/* --- Step 6: download --- */
function StoreBadge({ store, primary, os }) {
  const isPlay = store === "play";
  return (
    <a className="reset" href={isPlay ? "https://play.google.com/store" : "https://apps.apple.com/"} target="_blank" rel="noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 13, cursor: "pointer",
        border: primary ? "0" : "1px solid var(--line)",
        background: primary ? "linear-gradient(96deg,var(--amber),var(--amber-2))" : "rgba(19,44,68,.5)",
        color: primary ? "#1a0f00" : "var(--text)", minWidth: 200,
      }}>
      {isPlay ? <PlayCircle size={26} /> : <Smartphone size={26} />}
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 10.5, opacity: .8 }}>{isPlay ? "DISPONIBLE SUR" : "TÉLÉCHARGER DANS"}</div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.1 }}>{isPlay ? "Google Play" : "l'App Store"}</div>
      </div>
    </a>
  );
}

function StepDownload({ flow, go }) {
  const os = flow.os || "android";
  return (
    <div className="fade" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
      <div style={{ width: 76, height: 76, borderRadius: 20, margin: "0 auto 22px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(47,230,196,.2),rgba(255,176,32,.15))", border: "1px solid var(--line)" }}>
        <Signal size={34} style={{ color: "var(--signal)" }} />
      </div>
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 10px" }}>Téléchargez SkyTrack</h2>
      <p className="muted" style={{ fontSize: 16, margin: "0 auto 30px", maxWidth: 480 }}>
        {os === "ios"
          ? "Sur iPhone, le suivi se fait dans l'app Localiser (déjà installée). Ajoutez l'app compagnon SkyTrack pour les fonctions bonus."
          : "Sur Android, installez SkyTrack pour l'activation et les fonctions bonus. Le suivi se fait dans l'app Find Hub de Google."}
      </p>

      <div className="stack-sm" style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 18 }}>
        {os === "ios" ? (
          <>
            <StoreBadge store="apple" primary os={os} />
            <StoreBadge store="play" os={os} />
          </>
        ) : (
          <>
            <StoreBadge store="play" primary os={os} />
            <StoreBadge store="apple" os={os} />
          </>
        )}
      </div>

      <div className="card" style={{ padding: 18, textAlign: "left", margin: "26px auto 0", maxWidth: 520 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <ScanLine size={18} style={{ color: "var(--signal)", flex: "0 0 auto", marginTop: 2 }} />
          <span className="muted" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
            <b style={{ color: "var(--text)" }}>Rappel :</b> le suivi de vos objets se fait dans {os === "ios" ? "Localiser" : "Find Hub"}. L'app SkyTrack ajoute les réglages et fonctions bonus (faire sonner votre téléphone, changer la sonnerie de la carte…).
          </span>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Btn variant="ghost" onClick={() => go("home")}>Retour à l'accueil</Btn>
      </div>
    </div>
  );
}

/* --- Onboarding container --- */
function Onboarding({ flow, setFlow, step, setStep, go, detectedOS }) {
  const next = () => {
    if (step === 2) setFlow((f) => ({ ...f, orderRef: "SKY-" + Math.random().toString(36).slice(2, 7).toUpperCase() }));
    setStep((s) => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => { setStep((s) => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="z wrap" style={{ paddingTop: 40, paddingBottom: 70, maxWidth: 960 }}>
      <Stepper step={step} />
      {step === 0 && <StepPack flow={flow} setFlow={setFlow} next={next} />}
      {step === 1 && <StepAccount flow={flow} setFlow={setFlow} next={next} back={back} />}
      {step === 2 && <StepPay flow={flow} setFlow={setFlow} next={next} back={back} />}
      {step === 3 && <StepConfirm flow={flow} next={next} />}
      {step === 4 && <StepSetup flow={flow} setFlow={setFlow} next={next} back={back} detectedOS={detectedOS} />}
      {step === 5 && <StepDownload flow={flow} go={go} />}
    </div>
  );
}

/* ============================== FOOTER ============================== */
function Footer({ go, order }) {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "rgba(8,21,36,.6)", marginTop: 20 }} className="z">
      <div className="wrap" style={{ padding: "44px 20px 28px" }}>
        <div className="stack-sm" style={{ display: "flex", gap: 30, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ maxWidth: 300 }}>
            <Logo onClick={() => go("home")} />
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 14 }}>La carte qui retrouve vos objets de valeur, propulsée par le réseau Find Hub de Google et Localiser d'Apple.</p>
          </div>
          <div style={{ display: "flex", gap: 50, flexWrap: "wrap" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Produit</div>
              {[["how", "Comment ça marche"], ["products", "Produits & tarifs"], ["faq", "FAQ"]].map(([k, l]) => (
                <div key={k} className="navlink" style={{ padding: "6px 0", fontSize: 14 }} onClick={() => go(k)}>{l}</div>
              ))}
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Aide</div>
              {[["support", "Support"], ["faq", "Livraison"]].map(([k, l], i) => (
                <div key={i} className="navlink" style={{ padding: "6px 0", fontSize: 14 }} onClick={() => go(k)}>{l}</div>
              ))}
              <div className="navlink" style={{ padding: "6px 0", fontSize: 14 }} onClick={() => order()}>Commander</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--line)", marginTop: 30, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span className="muted2" style={{ fontSize: 12.5 }}>© {new Date().getFullYear()} SkyTrack · Cameroun</span>
          <span className="muted2" style={{ fontSize: 12.5 }}>Paiement : MoMo · Orange Money · Visa</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================== APP ============================== */
export default function App() {
  const [page, setPage] = useState("home");
  const [step, setStep] = useState(0);
  const [detectedOS, setDetectedOS] = useState(null);
  const [flow, setFlow] = useState({
    pack: "solo", contactType: "email", contact: "", name: "", city: "", address: "",
    pay: null, os: null, orderRef: null,
  });

  useEffect(() => {
    const ua = (navigator.userAgent || "").toLowerCase();
    if (/android/.test(ua)) setDetectedOS("android");
    else if (/iphone|ipad|ipod/.test(ua)) setDetectedOS("ios");
  }, []);

  const go = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const order = (pack) => {
    if (pack) { setFlow((f) => ({ ...f, pack: pack.id })); setStep(1); }
    else setStep(0);
    setPage("onboarding");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sky-root">
      <Styles />
      <Nav page={page} go={go} order={() => order()} />
      {page === "home" && <Home go={go} order={order} />}
      {page === "how" && <How order={() => order()} />}
      {page === "products" && <Products order={order} />}
      {page === "faq" && <Faq order={() => order()} />}
      {page === "support" && <Support />}
      {page === "onboarding" && <Onboarding flow={flow} setFlow={setFlow} step={step} setStep={setStep} go={go} detectedOS={detectedOS} />}
      {page !== "onboarding" && <Footer go={go} order={() => order()} />}
    </div>
  );
}
