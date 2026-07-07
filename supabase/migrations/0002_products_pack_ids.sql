-- ============================================================================
-- SkyTrack — migration des identifiants de produit.
-- La gamme passe des 3 anciens packs (solo / famille / business) aux 2 produits
-- réels vendus sur le site : « carte » (14 900 F) et « rond » (9 900 F).
-- On AJOUTE les nouvelles valeurs à l'enum `pack_id` ; les anciennes restent en
-- place pour ne pas casser d'éventuelles commandes historiques.
-- ============================================================================

alter type pack_id add value if not exists 'carte';
alter type pack_id add value if not exists 'rond';
