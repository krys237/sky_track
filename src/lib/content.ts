import {
  WalletCards, ScrollText, Luggage, HeartHandshake, Radio, Signal, MapPin, Volume2, Share2,
  Lock, Shield, Nfc, Battery, Droplets, Ruler, Smartphone, CreditCard,
} from "lucide-react";
import type { Pack, IconItem, Step, FaqItem, TagProduct } from "./types";

export const fcfa = (n: number): string =>
  n.toLocaleString("fr-FR").replace(/ /g, " ") + " FCFA";

export const BENEFITS: IconItem[] = [
  { icon: WalletCards, t: "Portefeuille & CNI", d: "Glissez la carte entre vos cartes bancaires. Retrouvez votre portefeuille en un instant." },
  { icon: ScrollText, t: "Passeport & documents", d: "Dans la pochette de voyage, elle veille sur vos papiers les plus précieux." },
  { icon: Luggage, t: "Sac, sacoche & bagage", d: "À l'aéroport, en taxi, au bureau — sachez toujours où est votre sac." },
  { icon: HeartHandshake, t: "Partage en famille", d: "Partagez la localisation d'un objet avec vos proches, révocable à tout moment." },
];

// Fiches produit ouvertes dans la modale depuis la section « À quoi ça sert ».
// Tag rond : specs réelles (fiche fabricant TDTOD). Carte : specs techniques
// chiffrées encore à confirmer — on n'affiche que des faits établis.
export const TAG_PRODUCTS: TagProduct[] = [
  {
    id: "rond",
    name: "Tag rond",
    tagline: "Le porte-clés connecté pour clés, sac et bagage.",
    image: "/tag-rond.png",
    usage: "Clés, sac à dos, valise, sacoche",
    highlights: [
      "S'ajoute au réseau Find Hub (Android) ou Localiser (iPhone), sans application tierce",
      "Sonnerie intégrée pour le retrouver une fois à proximité",
      "Pile remplaçable soi-même en quelques secondes",
    ],
    specs: [
      { icon: Signal, label: "Réseau", value: "Google Find Hub ou Localiser (Apple)" },
      { icon: Nfc, label: "Connectivité", value: "Bluetooth" },
      { icon: Battery, label: "Autonomie", value: "≈ 12 mois · pile CR2032 remplaçable" },
      { icon: Droplets, label: "Résistance", value: "IP66 · eau & poussière" },
      { icon: Radio, label: "Portée Bluetooth", value: "jusqu'à ~100 m en champ libre" },
      { icon: Volume2, label: "Sonnerie", value: "Haut-parleur intégré" },
      { icon: Smartphone, label: "Compatibilité", value: "Android 9+ · iPhone iOS 16+" },
      { icon: Ruler, label: "Format", value: "Rond & plat · trou pour porte-clés" },
    ],
  },
  {
    id: "carte",
    name: "Carte",
    tagline: "Fine comme une carte bancaire, elle veille sur votre portefeuille.",
    image: "/tag-carte.jpeg",
    usage: "Portefeuille, CNI, passeport, bagages",
    highlights: [
      "Ultra-fine (1,8 mm) : se glisse dans le portefeuille sans le faire gonfler",
      "Rechargeable sans fil : 3 à 6 mois d'autonomie, plus de pile à changer",
      "Partage familial : suivi simultané par 2 téléphones",
    ],
    specs: [
      { icon: Signal, label: "Réseau", value: "Google Find Hub ou Localiser (Apple)" },
      { icon: Nfc, label: "Connectivité", value: "Bluetooth" },
      { icon: Battery, label: "Autonomie", value: "3 à 6 mois · recharge sans fil (Qi)" },
      { icon: Droplets, label: "Résistance", value: "IP68 · étanche & anti-poussière" },
      { icon: Radio, label: "Portée Bluetooth", value: "jusqu'à ~50 m en champ libre" },
      { icon: Volume2, label: "Sonnerie", value: "Bip jusqu'à 90 dB" },
      { icon: Smartphone, label: "Compatibilité", value: "Android 9+ · iPhone iOS 16+" },
      { icon: CreditCard, label: "Épaisseur", value: "1,8 mm · format carte bancaire" },
    ],
  },
];

// Options d'achat de la page d'accueil = 1 par produit (Carte / Tag rond).
// PRIX confirmés : Carte (rectangle) 14 900 F · Tag rond 9 900 F. Le modèle de
// commande (PackId) et la BD restent inchangés : « Commander » entre dans le
// tunnel existant. Voir JOURNAL.md.
export const PACK_OPTIONS: { productId: TagProduct["id"]; price: number; best?: boolean }[] = [
  { productId: "carte", price: 14900, best: true },
  { productId: "rond", price: 9900 },
];

// Le tunnel de commande vend exactement les mêmes 2 produits que la page
// d'accueil. PACKS en est dérivé (PACK_OPTIONS + TAG_PRODUCTS) : une seule
// source de vérité pour le prix et le libellé. `order(id)` pré-sélectionne le
// produit choisi et le tunnel démarre alors à l'étape « Compte ».
export const PACKS: Pack[] = PACK_OPTIONS.map((opt) => {
  const p = TAG_PRODUCTS.find((t) => t.id === opt.productId)!;
  return {
    id: opt.productId,
    name: p.name,
    cards: 1,
    price: opt.price,
    tag: opt.best ? "Le plus populaire" : p.usage,
    desc: p.tagline,
    best: !!opt.best,
  };
});

export const STEPS_FUNC: Step[] = [
  { n: "01", icon: Radio, t: "La carte émet un signal", d: "Un signal Bluetooth basse consommation, discret et économe en batterie, se diffuse en continu autour de la carte." },
  { n: "02", icon: Signal, t: "Le réseau la détecte", d: "Les téléphones qui passent à proximité captent ce signal de façon anonyme et chiffrée — les Android via le réseau Find Hub de Google, les iPhone via le réseau Localiser d'Apple." },
  { n: "03", icon: MapPin, t: "La position remonte vers vous", d: "Vous voyez la dernière position de l'objet sur une carte, dans l'application — même s'il est hors de votre portée." },
  { n: "04", icon: Volume2, t: "À proximité, on vous guide", d: "Un indicateur « plus chaud / plus froid » et une sonnerie forte vous mènent jusqu'à l'objet." },
  { n: "05", icon: Share2, t: "Perte & partage", d: "Marquez l'objet comme perdu, affichez un message au trouveur, ou partagez sa position avec un proche." },
];

export const TRUTHS: IconItem[] = [
  { icon: Signal, t: "Meilleure couverture en zone fréquentée", d: "Plus il y a de téléphones autour, meilleure est la localisation. Par défaut, le réseau attend plusieurs appareils avant de remonter une position, pour protéger la vie privée." },
  { icon: Lock, t: "Localisation chiffrée de bout en bout", d: "Vos données de position sont chiffrées. Ni Google, ni Apple, ni SkyTrack n'y ont accès — vous seul, et les personnes que vous choisissez." },
  { icon: Shield, t: "Protection anti-pistage", d: "Une norme anti-pistage commune à l'industrie alerte toute personne qui aurait une carte inconnue près d'elle. Impossible de suivre quelqu'un à son insu." },
  { icon: Smartphone, t: "Android et iPhone", d: "La carte se connecte au réseau Google Find Hub (Android 9 ou plus récent) ou au réseau Localiser d'Apple (iOS 16 ou plus récent) — à l'un des deux à la fois, celui que vous choisissez à l'installation. Non compatible Huawei (HarmonyOS)." },
];

export const FAQS: FaqItem[] = [
  { q: "La carte fonctionne-t-elle bien au Cameroun ?", a: "Oui. Le réseau s'appuie sur les téléphones qui passent autour de la carte, Android comme iPhone. Android étant très répandu au Cameroun, la couverture du réseau Find Hub y est particulièrement dense. La localisation est d'autant plus précise dans les zones fréquentées (marchés, quartiers, axes passants)." },
  { q: "Quelle est la précision de la localisation ?", a: "Vous obtenez la dernière position connue de l'objet dès qu'un téléphone du réseau passe à proximité. Tout près, l'indicateur de distance et la sonnerie vous guident jusqu'à l'objet exact." },
  { q: "Quelle autonomie ? Faut-il recharger ?", a: "La carte est conçue pour une longue autonomie. Selon le modèle, elle est rechargeable — un voyant vous prévient quand il faut la recharger." },
  { q: "Avec quels téléphones est-elle compatible ?", a: "Android 9 ou plus récent, via l'application Google Find Hub (« Localiser mon appareil ») ; ou iPhone sous iOS 16 ou plus récent, via l'application Localiser. Une carte se rattache à un seul réseau à la fois : vous choisissez lequel à l'installation, et vous pouvez en changer en la réinitialisant. Elle ne fonctionne pas avec Huawei (HarmonyOS)." },
  { q: "Mes données sont-elles privées ?", a: "Oui. La localisation est chiffrée de bout en bout. Personne d'autre que vous — et les proches avec qui vous partagez — ne peut voir où se trouve votre objet." },
  { q: "Quelle différence entre l'app SkyTrack et l'app de suivi de mon téléphone ?", a: "Le suivi se fait dans l'application native de votre téléphone : Google Find Hub (« Localiser mon appareil ») sur Android, Localiser sur iPhone. L'app SkyTrack est une app compagnon : elle sert à l'installation et ajoute des fonctions bonus (faire sonner votre téléphone, changer la sonnerie de la carte, etc.)." },
  { q: "Peut-on l'utiliser pour suivre une personne ?", a: "Non. Le système alerte automatiquement toute personne près de qui se trouverait une carte inconnue. SkyTrack sert à retrouver vos objets, pas à pister quelqu'un." },
  { q: "Comment se passe la livraison ?", a: "Après votre commande, nous préparons votre carte et vous contactons (WhatsApp ou email) pour la livraison. Le délai indicatif vous est communiqué à la confirmation." },
];
