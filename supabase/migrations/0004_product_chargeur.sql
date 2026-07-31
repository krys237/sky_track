-- ============================================================================
-- SkyTrack — ajout du 3e produit : le chargeur (recharge sans fil de la Carte).
-- Vendu 4 500 F. On étend l'enum `pack_id` comme en 0002 (les valeurs existantes
-- restent en place). `add value` ne peut pas tourner dans une transaction avec
-- d'autres usages de l'enum ⇒ migration isolée, comme le fait déjà 0002.
-- ============================================================================

alter type pack_id add value if not exists 'chargeur';
