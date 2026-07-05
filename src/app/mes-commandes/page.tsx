import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageSearch, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PACKS, fcfa } from "@/lib/content";
import type { PackId, PayMethod } from "@/lib/types";
import type { StatutCommande } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Mes commandes — SkyTrack" };

interface CommandeListItem {
  id: string;
  ref: string;
  pack: PackId;
  quantite: number;
  montant: number;
  statut: StatutCommande;
  moyen_paiement: PayMethod | null;
  created_at: string;
}

const STATUT: Record<StatutCommande, { label: string; color: string; bg: string }> = {
  initiee: { label: "En attente de paiement", color: "#ffd27a", bg: "rgba(255,176,32,.12)" },
  payee: { label: "Payée", color: "var(--signal)", bg: "rgba(47,230,196,.12)" },
  echouee: { label: "Paiement échoué", color: "#ffb3b3", bg: "rgba(255,90,90,.10)" },
  expediee: { label: "Expédiée", color: "#9ec5ff", bg: "rgba(96,165,250,.12)" },
  livree: { label: "Livrée", color: "var(--signal)", bg: "rgba(47,230,196,.12)" },
};

const PAY_LABEL: Record<PayMethod, string> = {
  momo: "MTN MoMo", om: "Orange Money", visa: "Carte",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function MesCommandesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // Lecture protégée par la RLS : l'utilisateur ne voit que ses commandes.
  const { data } = await supabase
    .from("commandes")
    .select("id, ref, pack, quantite, montant, statut, moyen_paiement, created_at")
    .order("created_at", { ascending: false });

  const commandes = (data ?? []) as CommandeListItem[];

  return (
    <div className="z wrap" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 760 }}>
      <div className="fade">
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Mes commandes</h1>
        <p className="muted" style={{ marginBottom: 28 }}>{user.email}</p>

        {commandes.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.04)", border: "1px solid var(--line)" }}>
              <PackageSearch size={30} className="muted" />
            </div>
            <h2 className="font-display" style={{ fontSize: 19, marginBottom: 8 }}>Aucune commande pour le moment</h2>
            <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>Vos commandes apparaîtront ici une fois passées.</p>
            <Link href="/produits"><span className="sig" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Découvrir les packs <ArrowRight size={15} /></span></Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {commandes.map((c) => {
              const pack = PACKS.find((p) => p.id === c.pack);
              const s = STATUT[c.statut];
              return (
                <div key={c.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div className="font-mono sig" style={{ fontSize: 15, fontWeight: 600 }}>{c.ref}</div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{formatDate(c.created_at)}</div>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.color}33`, padding: "5px 11px", borderRadius: 999 }}>{s.label}</span>
                  </div>
                  <div style={{ borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                    <span className="muted" style={{ fontSize: 14 }}>
                      {pack?.name ?? c.pack} · {c.quantite} carte{c.quantite > 1 ? "s" : ""}
                      {c.moyen_paiement ? ` · ${PAY_LABEL[c.moyen_paiement]}` : ""}
                    </span>
                    <span className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>{fcfa(c.montant)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
