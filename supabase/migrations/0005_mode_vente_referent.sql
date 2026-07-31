-- ============================================================================
-- SkyTrack — deux logiques de vente + attribution agent.
--
-- • mode          : « sur_place » (client présent, l'agent encaisse en ligne,
--                    remise immédiate, pas d'adresse) ou « livraison » (à
--                    distance, expédition, frais de livraison). Défaut
--                    « livraison » → les commandes existantes restent valides.
-- • frais_livraison : montant des frais inclus dans `montant` (0 en sur_place).
--                    Stocké à part pour la ventilation comptable / le CRM.
-- • code_referent : identifie l'agent de terrain qui a réalisé la vente. Pas de
--                    CRM encore → simple texte libre, indexé pour les futurs
--                    rapports par agent.
--
-- Le sur_place n'ayant pas d'adresse de livraison, `clients.ville`/`adresse`
-- passent en NULLABLE (le NOT NULL d'origine interdisait ce mode).
-- ============================================================================

do $$ begin
  create type mode_vente as enum ('sur_place', 'livraison');
exception when duplicate_object then null; end $$;

alter table public.commandes
  add column if not exists mode            mode_vente not null default 'livraison',
  add column if not exists frais_livraison int not null default 0 check (frais_livraison >= 0),
  add column if not exists code_referent   text;

create index if not exists commandes_code_referent_idx
  on public.commandes (code_referent) where code_referent is not null;

alter table public.clients alter column ville   drop not null;
alter table public.clients alter column adresse drop not null;
