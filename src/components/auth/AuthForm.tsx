"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader, ShieldCheck } from "lucide-react";
import { Btn } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isSignup = mode === "signup";
  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length >= 6 && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      const supabase = createClient();
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return setErr(error.message);
        if (data.session) {
          router.push("/compte");
          router.refresh();
        } else {
          setInfo("Compte créé. Vérifiez votre e-mail pour confirmer, puis connectez-vous.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setErr("E-mail ou mot de passe incorrect.");
        router.push("/compte");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="z wrap" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 460 }}>
      <div className="fade">
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          {isSignup ? "Créer un compte" : "Connexion"}
        </h1>
        <p className="muted" style={{ marginBottom: 26 }}>
          {isSignup
            ? "Suivez vos commandes et l'activation de vos cartes."
            : "Accédez à vos commandes et à vos cartes."}
        </p>

        <form onSubmit={submit} className="card" style={{ padding: 24, display: "grid", gap: 16 }}>
          <div>
            <label className="fld">E-mail</label>
            <input
              type="email" value={email} autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <label className="fld">Mot de passe</label>
            <input
              type="password" value={password}
              autoComplete={isSignup ? "new-password" : "current-password"}
              onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum"
            />
          </div>

          {err && (
            <div className="card" style={{ padding: "10px 12px", background: "rgba(255,90,90,.08)", borderColor: "rgba(255,90,90,.35)", fontSize: 13, color: "#ffb3b3" }}>
              {err}
            </div>
          )}
          {info && (
            <div className="card" style={{ padding: "10px 12px", background: "rgba(47,230,196,.08)", borderColor: "rgba(47,230,196,.35)", fontSize: 13, color: "var(--signal)" }}>
              {info}
            </div>
          )}

          <Btn variant="primary" type="submit" disabled={!canSubmit}>
            {busy ? <Loader size={18} className="spin" /> : <>{isSignup ? "Créer mon compte" : "Se connecter"} <ArrowRight size={18} /></>}
          </Btn>

          <p className="muted2" style={{ fontSize: 12, display: "flex", gap: 8, alignItems: "center", margin: 0 }}>
            <ShieldCheck size={13} /> Vous pouvez commander sans compte — il n’est jamais obligatoire.
          </p>
        </form>

        <p className="muted" style={{ fontSize: 14, marginTop: 20, textAlign: "center" }}>
          {isSignup ? (
            <>Déjà un compte ? <Link href="/connexion" className="sig">Se connecter</Link></>
          ) : (
            <>Pas encore de compte ? <Link href="/inscription" className="sig">Créer un compte</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
