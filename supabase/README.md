# Supabase — Lot 3 (base de données & comptes)

Backend : **Supabase** (Postgres + Auth + RLS).
Modèle de comptes retenu par défaut : **invité + compte optionnel**.

## 1. Créer le projet

1. Sur [supabase.com](https://supabase.com), crée un projet (note le **project ref**,
   ex : `abcdefgh`, visible dans l'URL du dashboard).
2. Project Settings → API : récupère **Project URL**, **anon public key**,
   **service_role key**.
3. À la racine du repo : copie `.env.local.example` en `.env.local` et remplis
   les trois valeurs.

## 2. Appliquer le schéma

Le schéma vit dans `supabase/migrations/0001_init.sql` (4 tables + RLS).

**Option A — Dashboard (le plus simple)**
SQL Editor → colle le contenu de `0001_init.sql` → Run.

**Option B — Supabase CLI**
```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

**Option C — MCP (je le fais à ta place)**
Ajoute le serveur MCP à Claude Code, puis je crée/applique le schéma et j'itère :
```bash
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest \
  --project-ref=<ref> --access-token=<personal-access-token>
```
(Le token se génère dans Supabase → Account → Access Tokens. Un projet de dev
dédié est recommandé pour limiter la portée du token.)

## 3. (Optionnel) Régénérer les types TypeScript

```bash
npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
```
En attendant, les types sont maintenus à la main dans `src/lib/supabase/types.ts`.

## Architecture des accès

| Client | Fichier | Usage |
|---|---|---|
| Navigateur (anon) | `src/lib/supabase/client.ts` | Composants « use client », protégé par RLS |
| Serveur (anon + cookies) | `src/lib/supabase/server.ts` | Server Components / Actions, session utilisateur |
| Admin (service_role) | `src/lib/supabase/admin.ts` | **Serveur uniquement** — commande invité, webhooks paiement, back-office (contourne la RLS) |

## Reste à faire (en attente de tes choix / des clés)

- [ ] Pages d'authentification (inscription / connexion) — selon le modèle de comptes.
- [ ] Server Action : persister `client` + `commande` à l'étape Confirmation du tunnel
      (remplace le n° de commande factice).
- [ ] Middleware de rafraîchissement de session (`@supabase/ssr`).
- [ ] Espace « Mes commandes » pour les clients connectés.
- [ ] Branchement webhook paiement (Lot 2) écrivant dans `paiements`.
