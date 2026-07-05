-- ============================================================================
-- SkyTrack — Lot 3 : base de données (clients, commandes, paiements, cartes)
-- Modèle relationnel issu du §8 du cahier des charges.
-- Modèle de comptes : « invité + compte optionnel ».
--   • Commande invité : insérée côté serveur via la clé service_role
--     (contourne la RLS). `clients.user_id` reste NULL.
--   • Client connecté : `clients.user_id = auth.uid()`, la RLS lui donne
--     accès en lecture à ses propres données.
-- ============================================================================

-- Types énumérés ------------------------------------------------------------
do $$ begin
  create type contact_type as enum ('email', 'whatsapp');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pack_id as enum ('solo', 'famille', 'business');
exception when duplicate_object then null; end $$;

do $$ begin
  create type moyen_paiement as enum ('momo', 'om', 'visa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type statut_commande as enum ('initiee', 'payee', 'echouee', 'expediee', 'livree');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reseau_carte as enum ('findhub', 'localiser');
exception when duplicate_object then null; end $$;

-- Table : clients -----------------------------------------------------------
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete set null,
  nom           text not null,
  contact_type  contact_type not null,
  contact_value text not null,
  ville         text not null,
  adresse       text not null,
  created_at    timestamptz not null default now()
);
create index if not exists clients_user_id_idx on public.clients (user_id);

-- Table : commandes ---------------------------------------------------------
create table if not exists public.commandes (
  id              uuid primary key default gen_random_uuid(),
  ref             text not null unique,
  client_id       uuid not null references public.clients (id) on delete cascade,
  pack            pack_id not null,
  quantite        int not null check (quantite > 0),
  montant         int not null check (montant >= 0),   -- en FCFA (entier, XAF)
  devise          text not null default 'XAF',
  statut          statut_commande not null default 'initiee',
  moyen_paiement  moyen_paiement,
  created_at      timestamptz not null default now()
);
create index if not exists commandes_client_id_idx on public.commandes (client_id);

-- Table : paiements ---------------------------------------------------------
create table if not exists public.paiements (
  id               uuid primary key default gen_random_uuid(),
  commande_id      uuid not null references public.commandes (id) on delete cascade,
  agregateur       text,
  transaction_id   text,
  statut           text,
  montant_verifie  int,
  webhook_payload  jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists paiements_commande_id_idx on public.paiements (commande_id);

-- Table : cartes ------------------------------------------------------------
create table if not exists public.cartes (
  id                uuid primary key default gen_random_uuid(),
  numero_serie      text not null unique,
  commande_id       uuid references public.commandes (id) on delete set null,
  statut_activation text not null default 'inactive',
  reseau            reseau_carte,
  created_at        timestamptz not null default now()
);
create index if not exists cartes_commande_id_idx on public.cartes (commande_id);

-- ============================================================================
-- Row Level Security
-- Par défaut : aucun accès. Les écritures privilégiées passent par la clé
-- service_role (qui ignore la RLS). Les clients connectés lisent leurs données.
-- ============================================================================

alter table public.clients   enable row level security;
alter table public.commandes enable row level security;
alter table public.paiements enable row level security;
alter table public.cartes    enable row level security;

-- clients : un utilisateur connecté voit / modifie sa propre fiche ----------
drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own" on public.clients
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own" on public.clients
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own" on public.clients
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- commandes : lecture des commandes rattachées à ses fiches client ----------
drop policy if exists "commandes_select_own" on public.commandes;
create policy "commandes_select_own" on public.commandes
  for select to authenticated
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- paiements : lecture via la commande possédée ------------------------------
drop policy if exists "paiements_select_own" on public.paiements;
create policy "paiements_select_own" on public.paiements
  for select to authenticated
  using (
    commande_id in (
      select c.id from public.commandes c
      join public.clients cl on cl.id = c.client_id
      where cl.user_id = auth.uid()
    )
  );

-- cartes : lecture via la commande possédée ---------------------------------
drop policy if exists "cartes_select_own" on public.cartes;
create policy "cartes_select_own" on public.cartes
  for select to authenticated
  using (
    commande_id in (
      select c.id from public.commandes c
      join public.clients cl on cl.id = c.client_id
      where cl.user_id = auth.uid()
    )
  );
