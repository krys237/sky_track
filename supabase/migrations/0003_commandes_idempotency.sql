-- ============================================================================
-- SkyTrack — idempotence des commandes.
--
-- Contexte : le tunnel s'exécute sur des connexions lentes (connect TCP mesuré
-- à ~9 s pour un timeout undici de 10 s). Quand la requête expire, le
-- navigateur ignore si la commande a été créée ou non ; il réessayait alors en
-- repartant de zéro, ce qui produisait :
--   • des fiches `clients` orphelines (client inséré, commande jamais créée) ;
--   • des commandes en double (la première tentative avait en fait abouti).
--
-- La clé d'idempotence est générée par le navigateur, une fois par « tentative
-- de commande », et renvoyée telle quelle à chaque réessai. Le serveur peut
-- ainsi retrouver la commande déjà créée au lieu d'en fabriquer une seconde.
--
-- Index UNIQUE partiel : les commandes historiques (clé NULL) ne se gênent pas
-- entre elles — sans le `where`, une seule ligne NULL serait tolérée.
-- ============================================================================

alter table public.commandes
  add column if not exists idempotency_key text;

create unique index if not exists commandes_idempotency_key_uidx
  on public.commandes (idempotency_key)
  where idempotency_key is not null;
