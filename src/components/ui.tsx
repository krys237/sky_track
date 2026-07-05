"use client";

import React from "react";
import { Signal, Smartphone, MapPin, Search, Wifi, Battery, Check } from "lucide-react";

/* ------------------------------- Logo ------------------------------- */
export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button className="reset" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <span style={{ position: "relative", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: 10, background: "linear-gradient(135deg,rgba(59,130,246,.28),rgba(16,185,129,.18))", border: "1px solid var(--line)" }} />
        <Signal size={18} style={{ color: "var(--signal)", position: "relative" }} />
      </span>
      <span className="font-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>
        Sky<span className="sig">Track</span>
      </span>
    </button>
  );
}

/* ------------------------------- Btn -------------------------------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "sig" | "ghost";
};
export function Btn({ children, variant = "primary", className = "", ...p }: BtnProps) {
  const v = variant === "primary" ? "btn-primary" : variant === "sig" ? "btn-sig" : "btn-ghost";
  return <button className={`btn ${v} ${className}`} {...p}>{children}</button>;
}

/* ---------------------------- SectionHead --------------------------- */
export function SectionHead({
  eyebrow, title, sub, center,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div style={{ maxWidth: 640, margin: center ? "0 auto" : 0, textAlign: center ? "center" : "left", marginBottom: 40 }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>}
      <h2 className="font-display" style={{ fontSize: "clamp(26px,4.5vw,40px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-.02em", margin: 0 }}>{title}</h2>
      {sub && <p className="muted" style={{ fontSize: 17, lineHeight: 1.6, marginTop: 16 }}>{sub}</p>}
    </div>
  );
}

/* ------------------------- Transparent Image ------------------------ */
export function TransparentImage({
  src,
  alt,
  style,
  className,
}: {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [processedSrc, setProcessedSrc] = React.useState(src);

  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Convert white pixels to transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // alpha = 0
        }
      }
      ctx.putImageData(imgData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
  }, [src]);

  return <img src={processedSrc} alt={alt} style={style} className={className} />;
}

/* ------------------------------ Radar ------------------------------- */
export function Radar() {
  return (
    <div className="hero-scene">
      {/* Ambient map background */}
      <div className="hero-scene-bg" />
      {/* Fade overlay */}
      <div className="hero-scene-overlay" />

      {/* PHONE MOCKUP (Left) */}
      <div className="hero-phone-container">
        <div className="hero-phone">
          {/* Notch / Speaker */}
          <div className="hero-phone-notch">
            <span className="notch-speaker" />
            <span className="notch-camera" />
          </div>

          <div className="hero-phone-screen">
            {/* Status Bar */}
            <div className="phone-status-bar">
              <span className="phone-time">09:41</span>
              <div className="phone-status-icons">
                <Wifi size={10} style={{ opacity: 0.8 }} />
                <Signal size={10} style={{ opacity: 0.8 }} />
                <Battery size={11} style={{ opacity: 0.8 }} />
              </div>
            </div>

            {/* App Bar / Header */}
            <div className="phone-app-header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span className="phone-app-title">Find Hub</span>
                <span className="phone-app-plus">+</span>
              </div>
              <div className="phone-search-box">
                <Search size={9} className="phone-search-icon" />
                <span className="phone-search-placeholder">Rechercher un appareil...</span>
              </div>
            </div>

            {/* Map Preview Area */}
            <div className="phone-map-area">
              <img src="/map-bg.jpg" alt="Map View" className="phone-map-img" />
              {/* Dynamic pin marker on phone screen */}
              <div className="phone-map-pin">
                <div className="phone-pin-dot" />
                <div className="phone-pin-pulse" />
              </div>
            </div>

            {/* Device List */}
            <div className="phone-device-list">
              <span className="device-list-title">Appareils</span>
              
              <div className="device-item active">
                <div className="device-status-dot pulse" />
                <div className="device-details">
                  <span className="device-name">Mon Portefeuille (Tag Carte)</span>
                  <span className="device-status">À proximité · À l&apos;instant</span>
                </div>
                <Check size={12} className="device-check" />
              </div>

              <div className="device-item">
                <div className="device-status-dot" />
                <div className="device-details">
                  <span className="device-name">Mes Clés (Tag Rond)</span>
                  <span className="device-status">Maison · Il y a 10 min</span>
                </div>
              </div>

              <div className="device-item">
                <div className="device-status-dot" />
                <div className="device-details">
                  <span className="device-name">Sac à dos (Tag Carte)</span>
                  <span className="device-status">Bureau · Il y a 1 h</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="phone-action-container">
              <button className="phone-action-btn">Trouver</button>
            </div>
          </div>
        </div>
      </div>

      {/* TRACKERS & RADAR (Right) */}
      <div className="hero-radar-container">
        {/* Tilted Radar Waves */}
        <div className="perspective-waves">
          <div className="wave wave-1" />
          <div className="wave wave-2" />
          <div className="wave wave-3" />
        </div>

        {/* Location Pin */}
        <div className="maps-pin-container">
          <svg className="maps-pin" width="38" height="50" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="url(#pinGradient)" />
            <circle cx="12" cy="12" r="4.5" fill="#FFFFFF" />
            <defs>
              <linearGradient id="pinGradient" x1="12" y1="0" x2="12" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EA4335" />
                <stop offset="70%" stopColor="#C5221F" />
                <stop offset="100%" stopColor="#A01614" />
              </linearGradient>
            </defs>
          </svg>
          <div className="maps-pin-shadow" />
        </div>

        {/* Floating Tracker 1: Card */}
        <div className="floating-tracker card-tracker">
          <TransparentImage src="/tag-carte.jpeg" alt="SkyTrack Card" className="tracker-img" />
          <div className="tracker-glow" />
        </div>

        {/* Floating Tracker 2: Round Tag */}
        <div className="floating-tracker tag-tracker">
          <TransparentImage src="/tag-rond.png" alt="SkyTrack Tag" className="tracker-img" />
          <div className="tracker-glow" />
        </div>
      </div>
    </div>
  );
}
