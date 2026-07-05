export type BinType = "yellow" | "green" | "gray" | "special" | "compost";
export type WasteCategory =
    | "Plastique"
    | "Verre"
    | "Papier & Carton"
    | "Métal"
    | "Biodéchets"
    | "Ordures ménagères"
    | "Point de collecte";

export interface WasteItem {
    id: string;
    name: string;
    icon: string;
    keywords: string[];
    bin: BinType;
    binLabel: string;
    category: WasteCategory;
    advice: string;
}

export const BIN_CONFIG: Record<BinType, { label: string; color: string; bg: string; border: string; dot: string }> = {
    yellow: { label: "Bac Jaune", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-400", dot: "bg-amber-400" },
    green: { label: "Bac Vert (Verre)", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-500", dot: "bg-emerald-500" },
    gray: { label: "Ordures Ménagères", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-400", dot: "bg-slate-500" },
    special: { label: "Point de Collecte ♻️", color: "text-indigo-700", bg: "bg-indigo-100", border: "border-indigo-400", dot: "bg-indigo-500" },
    compost: { label: "Composteur 🌱", color: "text-lime-700", bg: "bg-lime-100", border: "border-lime-400", dot: "bg-lime-500" },
};

export const WASTE_DATABASE: WasteItem[] = [
    // ── PLASTIQUE (bac jaune) ────────────────────────────────────────────────
    { id: "bouteille-plastique", name: "Bouteille en plastique", icon: "🧴", keywords: ["bouteille", "plastique", "eau", "soda", "pet", "boisson"], bin: "yellow", binLabel: "Bac Jaune", category: "Plastique", advice: "Vider et écraser avant de jeter. Le bouchon peut rester vissé." },
    { id: "bidon-plastique", name: "Bidon en plastique", icon: "🪣", keywords: ["bidon", "plastique", "lessive", "produit", "menager"], bin: "yellow", binLabel: "Bac Jaune", category: "Plastique", advice: "Vider sans rincer. Laisser le bouchon. Accepté dans la plupart des villes." },
    { id: "barquette", name: "Barquette alimentaire", icon: "🍱", keywords: ["barquette", "plastique", "alimentaire", "plateau", "viande"], bin: "yellow", binLabel: "Bac Jaune", category: "Plastique", advice: "Vider les restes mais pas besoin de laver. Les barquettes noires sont souvent non recyclables." },
    { id: "sachet-plastique", name: "Sachet en plastique", icon: "🛍️", keywords: ["sachet", "sac", "plastique", "film", "pochette"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "La plupart des sacs et films plastiques ne sont PAS recyclables sauf en point de collecte dédié en supermarché." },
    { id: "pot-yaourt", name: "Pot de yaourt", icon: "🥛", keywords: ["pot", "yaourt", "plastique", "dessert", "creme"], bin: "yellow", binLabel: "Bac Jaune", category: "Plastique", advice: "Depuis 2022 en France, les pots de yaourt passent dans le bac jaune. Vider sans laver." },
    { id: "flacon-shampoing", name: "Flacon de shampoing", icon: "🚿", keywords: ["flacon", "shampoing", "gel douche", "salle de bain", "plastique"], bin: "yellow", binLabel: "Bac Jaune", category: "Plastique", advice: "Vider complètement et écraser légèrement. Même vide et nettoyé c'est recyclable." },
    { id: "barquette-polystyrene", name: "Barquette en polystyrène", icon: "📦", keywords: ["polystyrene", "barquette", "emballage", "blanc", "mousse"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Le polystyrène expansé (mousse blanche) n'est PAS recyclable dans les bacs ménagers. Certaines déchetteries l'acceptent." },
    { id: "tube-dentifrice", name: "Tube de dentifrice", icon: "🪥", keywords: ["tube", "dentifrice", "plastique", "aluminium"], bin: "yellow", binLabel: "Bac Jaune", category: "Plastique", advice: "Recyclable dans le bac jaune depuis 2022 — écraser le tube." },
    { id: "jouet-plastique", name: "Jouet en plastique cassé", icon: "🪀", keywords: ["jouet", "plastique", "casse", "enfant"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Les jouets et objets plastiques complexes (mixte) vont aux ordures ou en déchetterie." },

    // ── VERRE (bac vert) ────────────────────────────────────────────────────
    { id: "bouteille-verre", name: "Bouteille en verre", icon: "🍾", keywords: ["bouteille", "verre", "vin", "biere", "alcool"], bin: "green", binLabel: "Bac Vert", category: "Verre", advice: "Retirer le bouchon ou la capsule avant de jeter. Ne pas jeter dans le verre cassé." },
    { id: "bocal-verre", name: "Bocal / Pot en verre", icon: "🫙", keywords: ["bocal", "pot", "verre", "confiture", "conserve"], bin: "green", binLabel: "Bac Vert", category: "Verre", advice: "Retirer le couvercle (métal → bac jaune). Pas besoin de laver à fond." },
    { id: "verre-cassé", name: "Verre cassé / brisé", icon: "🔪", keywords: ["verre", "casse", "brise", "dangereux", "tesson"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "⚠️ NE PAS mettre dans le bac verre ! Emballer dans du papier ou du carton avant de jeter aux ordures." },
    { id: "vitre", name: "Vitre / Carreau", icon: "🪟", keywords: ["vitre", "fenetre", "carreau", "verre plat", "miroir"], bin: "special", binLabel: "Déchetterie", category: "Point de collecte", advice: "Les vitres et miroirs ne vont PAS dans le bac verre (composition différente). Portez-les en déchetterie." },
    { id: "verre-lunettes", name: "Lunettes cassées", icon: "👓", keywords: ["lunettes", "verre", "optique", "casse"], bin: "special", binLabel: "Point de collecte", category: "Point de collecte", advice: "De nombreuses associations (Opticiens Sans Frontières) collectent les lunettes usagées en opticiens." },
    { id: "ampoule-classique", name: "Ampoule classique (halogène)", icon: "💡", keywords: ["ampoule", "halogene", "verre", "lumiere"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Les ampoules halogènes classiques vont aux ordures. Emballer pour éviter la casse." },

    // ── PAPIER & CARTON (bac jaune) ─────────────────────────────────────────
    { id: "journal", name: "Journal / Magazine", icon: "📰", keywords: ["journal", "magazine", "presse", "papier", "revue"], bin: "yellow", binLabel: "Bac Jaune", category: "Papier & Carton", advice: "Directement dans le bac ou en liasse. Enlever les agrafes si possible." },
    { id: "carton", name: "Carton d'emballage", icon: "📦", keywords: ["carton", "boite", "emballage", "amazon", "colis"], bin: "yellow", binLabel: "Bac Jaune", category: "Papier & Carton", advice: "Plier et aplatir les cartons. Retirer le papier bulle ou scotch si possible." },
    { id: "boite-pizza", name: "Boîte à pizza", icon: "🍕", keywords: ["pizza", "boite", "carton", "gras", "alimentaire"], bin: "yellow", binLabel: "Bac Jaune", category: "Papier & Carton", advice: "Recyclable même légèrement grasse ! Couper la partie trop souillée et la jeter aux ordures." },
    { id: "enveloppe", name: "Enveloppe / Courrier", icon: "✉️", keywords: ["enveloppe", "courrier", "lettre", "papier"], bin: "yellow", binLabel: "Bac Jaune", category: "Papier & Carton", advice: "Recyclable avec ou sans fenêtre plastique (la fenêtre est éliminée lors du traitement)." },
    { id: "papier-essuie-tout", name: "Papier essuie-tout", icon: "🧻", keywords: ["essuie-tout", "sopalin", "papier", "chiffon"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Non recyclable, car souillé. Même chose pour les serviettes en papier et mouchoirs utilisés." },
    { id: "papier-emballage", name: "Papier cadeau / d'emballage", icon: "🎁", keywords: ["papier", "cadeau", "emballage", "noel", "brillant"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Le papier cadeau brillant/doré n'est souvent pas recyclable. Le papier kraft uni, oui." },
    { id: "tetra-pak", name: "Brique alimentaire (Tetra Pak)", icon: "🥛", keywords: ["brique", "tetra", "pak", "lait", "jus", "soupe"], bin: "yellow", binLabel: "Bac Jaune", category: "Papier & Carton", advice: "Aplatir et laisser le bouchon. Les briques alimentaires se recyclent dans le bac jaune." },
    { id: "cahier", name: "Cahier / Classeur papier", icon: "📓", keywords: ["cahier", "classeur", "bloc", "papier", "ecole"], bin: "yellow", binLabel: "Bac Jaune", category: "Papier & Carton", advice: "Retirer la spirale métallique si possible. Le papier se recycle dans le bac jaune." },

    // ── MÉTAL (bac jaune) ───────────────────────────────────────────────────
    { id: "canette", name: "Canette (aluminium / acier)", icon: "🥤", keywords: ["canette", "aluminium", "metal", "boisson", "biere", "soda"], bin: "yellow", binLabel: "Bac Jaune", category: "Métal", advice: "Vider et écraser. L'aluminium est l'un des matériaux les plus valorisés du recyclage." },
    { id: "conserve", name: "Boîte de conserve", icon: "🥫", keywords: ["conserve", "boite", "metal", "soja", "sardine", "thon"], bin: "yellow", binLabel: "Bac Jaune", category: "Métal", advice: "Vider sans rincer. Le couvercle peut rester dedans ou être jeté séparément dans le bac jaune." },
    { id: "aérosol", name: "Bombe aérosol (vide)", icon: "💨", keywords: ["aérosol", "bombe", "laque", "bombe", "deodorant"], bin: "yellow", binLabel: "Bac Jaune", category: "Métal", advice: "Vider complètement (appuyer jusqu'à plus de gaz). Ne jamais percer. Recyclable dans le bac jaune." },
    { id: "capsule-cafe", name: "Capsule café aluminium", icon: "☕", keywords: ["capsule", "cafe", "aluminium", "nespresso", "pod"], bin: "special", binLabel: "Point de collecte", category: "Point de collecte", advice: "Rapporter les capsules Nespresso en magasin ou en point de collecte dédié. Certaines villes les acceptent en bac jaune (vérifier)." },
    { id: "papier-alu", name: "Papier aluminium / barquette", icon: "🫘", keywords: ["papier", "aluminium", "alu", "barquette", "cuisson"], bin: "yellow", binLabel: "Bac Jaune", category: "Métal", advice: "Chiffonner le papier alu en boule pour qu'il ne se perde pas dans les machines de tri. Barquette alu = bac jaune." },
    { id: "couvercle-metal", name: "Couvercle métallique", icon: "🔩", keywords: ["couvercle", "metal", "capsule", "bocal", "bouchon"], bin: "yellow", binLabel: "Bac Jaune", category: "Métal", advice: "Les couvercles et capsules métalliques (bocaux, bouteilles) vont dans le bac jaune." },

    // ── BIODÉCHETS ────────────────────────────────────────────────────────────
    { id: "epluchures", name: "Épluchures / restes légumes", icon: "🥕", keywords: ["epluchures", "legumes", "reste", "cuisine", "biodechet"], bin: "compost", binLabel: "Composteur", category: "Biodéchets", advice: "Idéal pour le composteur ! Si pas de composteur, dans le bac gris (ordures). Certaines villes ont un bac brun." },
    { id: "marc-cafe", name: "Marc de café / filtre", icon: "☕", keywords: ["marc", "cafe", "filtre", "papier", "biodechet"], bin: "compost", binLabel: "Composteur", category: "Biodéchets", advice: "Excellent activateur de compost ! Le filtre papier peut aussi être composté." },
    { id: "restes-repas", name: "Restes de repas cuits", icon: "🍽️", keywords: ["restes", "repas", "nourriture", "cuisine", "cuit"], bin: "compost", binLabel: "Composteur", category: "Biodéchets", advice: "Compostable sauf viandes et poissons qui attirent les nuisibles. En bac gris sinon." },
    { id: "coquilles-oeuf", name: "Coquilles d'œufs", icon: "🥚", keywords: ["coquille", "oeuf", "biodechet", "cuisine"], bin: "compost", binLabel: "Composteur", category: "Biodéchets", advice: "Excellentes pour le compost car elles apportent du calcium. Écraser avant d'apporter." },
    { id: "feuilles-mortes", name: "Feuilles mortes / déchets verts", icon: "🍂", keywords: ["feuilles", "jardin", "vert", "tonte", "biodechet"], bin: "compost", binLabel: "Composteur / Déchetterie", category: "Biodéchets", advice: "Idéal pour le compost (carbone). Les grandes quantités vont en déchetterie (espace déchets verts)." },
    { id: "pain-rassis", name: "Pain rassis", icon: "🍞", keywords: ["pain", "rassis", "nourriture", "biodechet"], bin: "compost", binLabel: "Composteur", category: "Biodéchets", advice: "Compostable. En petites quantités, pas de problème. Éviter le pain avec charcuterie." },

    // ── ORDURES MÉNAGÈRES ──────────────────────────────────────────────────
    { id: "mouchoir", name: "Mouchoir en papier (usagé)", icon: "🤧", keywords: ["mouchoir", "kleenex", "papier", "hygiene"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Non recyclable une fois utilisé. Va dans les ordures ménagères." },
    { id: "couche", name: "Couche / protection hygiénique", icon: "👶", keywords: ["couche", "bebe", "hygiene", "protection", "serviette"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Non recyclable. Directement aux ordures. Certaines déchetteries acceptent les couches en sac séparé." },
    { id: "megot", name: "Mégot de cigarette", icon: "🚬", keywords: ["megot", "cigarette", "tabac", "filtre"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "⚠️ Ne jamais jeter par terre ! Très polluant. Des collecteurs à mégots existent dans certaines villes." },
    { id: "chewing-gum", name: "Chewing-gum", icon: "🫧", keywords: ["chewing", "gum", "gomme", "macher"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Aux ordures, jamais par terre. Difficile à nettoyer sur les sols publics." },
    { id: "coton-tige", name: "Coton-tige", icon: "🩺", keywords: ["coton", "tige", "hygiène", "oreille"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Aux ordures ménagères. Ne jamais jeter dans les toilettes (bouche les canalisations)." },
    { id: "stylo", name: "Stylo / crayon", icon: "✏️", keywords: ["stylo", "crayon", "bic", "feutre", "plastique"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "La marque BIC propose des programmes de collecte pour stylos usagés. Sinon, aux ordures." },
    { id: "lingette", name: "Lingette (bébé, nettoyage)", icon: "🧼", keywords: ["lingette", "bebe", "nettoyage", "humide"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "⚠️ Jamais dans les toilettes ! Non recyclable, directement aux ordures ménagères." },

    // ── POINT DE COLLECTE SPÉCIFIQUE ──────────────────────────────────────
    { id: "pile", name: "Pile / Batterie portable", icon: "🔋", keywords: ["pile", "batterie", "aa", "aaa", "alcaline", "rechargeable"], bin: "special", binLabel: "Point de Collecte", category: "Point de collecte", advice: "⚠️ Déchets dangereux ! Déposer dans les boîtes à piles en supermarché, en magasin de bricolage ou en déchetterie. Jamais aux ordures." },
    { id: "medicament", name: "Médicament / Comprimés", icon: "💊", keywords: ["medicament", "comprime", "pilule", "pharmacie", "boite"], bin: "special", binLabel: "Pharmacie (Cyclamed)", category: "Point de collecte", advice: "Rapporter à la pharmacie ! Le programme Cyclamed récupère tous les médicaments non utilisés pour les valoriser." },
    { id: "telephone", name: "Téléphone / Smartphone", icon: "📱", keywords: ["telephone", "smartphone", "portable", "iphone", "android", "samsung"], bin: "special", binLabel: "Point de Collecte / Déchetterie", category: "Point de collecte", advice: "DEEE (Déchet Électronique). Déposer en magasin (reprise 1 pour 1), en déchetterie ou en point Re-cycle." },
    { id: "ordinateur", name: "Ordinateur / PC", icon: "💻", keywords: ["ordinateur", "pc", "laptop", "informatique", "ecran"], bin: "special", binLabel: "Déchetterie / Reprise magasin", category: "Point de collecte", advice: "DEEE. Déposer en déchetterie (espace DEEE) ou en magasin électronique pour reprise. Effacer les données avant !" },
    { id: "ampoule-led", name: "Ampoule LED / Fluo-compacte", icon: "💡", keywords: ["ampoule", "led", "fluo", "economie", "lumiere"], bin: "special", binLabel: "Point de Collecte", category: "Point de collecte", advice: "Les ampoules LED et fluocompactes contiennent des métaux rares. Déposer en magasin ou déchetterie." },
    { id: "vetements", name: "Vêtements / Chaussures", icon: "👕", keywords: ["vetements", "chaussures", "habit", "textile", "don"], bin: "special", binLabel: "Borne Textile", category: "Point de collecte", advice: "Déposer en borne textile (Emmaüs, Le Relais...) ou donner à des associations. Même abîmés, ils sont valorisés." },
    { id: "huile-cuisson", name: "Huile de cuisson usagée", icon: "🫒", keywords: ["huile", "cuisson", "friture", "usagee"], bin: "special", binLabel: "Déchetterie / Collecte", category: "Point de collecte", advice: "⚠️ Jamais dans l'évier ! Déposer en déchetterie ou dans certaines bornes de collecte en supermarché." },
    { id: "batterie-voiture", name: "Batterie de voiture", icon: "🚗", keywords: ["batterie", "voiture", "auto", "plomb", "vehicule"], bin: "special", binLabel: "Déchetterie / Garagiste", category: "Point de collecte", advice: "Déchets dangereux (acide, plomb). Rapporter chez un garagiste ou en déchetterie. Reprise obligatoire en magasin auto." },
    { id: "peinture", name: "Peinture / Solvant", icon: "🎨", keywords: ["peinture", "solvant", "pot", "white-spirit", "vernis"], bin: "special", binLabel: "Déchetterie", category: "Point de collecte", advice: "Déchets dangereux ! Jamais dans les ordures ni dans l'évier. Apporter en déchetterie (espace DMS)." },
    { id: "cartouche-encre", name: "Cartouche d'encre", icon: "🖨️", keywords: ["cartouche", "encre", "imprimante", "toner"], bin: "special", binLabel: "Magasin / Point de Collecte", category: "Point de collecte", advice: "Beaucoup de magasins (Bureau Vallée, Fnac...) reprennent les cartouches vides. Des programmes de rechargement existent." },
    { id: "thermometre", name: "Thermomètre à mercure", icon: "🌡️", keywords: ["thermometre", "mercure", "temperature", "danger"], bin: "special", binLabel: "Pharmacie / Déchetterie", category: "Point de collecte", advice: "⚠️ TRÈS DANGEREUX ! Le mercure est un métal lourd. Apporter à la pharmacie ou en déchetterie avec précaution." },

    // ── AUTRES ────────────────────────────────────────────────────────────
    { id: "masque-chirurgical", name: "Masque chirurgical", icon: "😷", keywords: ["masque", "chirurgical", "covid", "protection"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Aux ordures ménagères. Ne pas jeter dans la nature. Pas recyclable dans les bacs de tri." },
    { id: "cigarette-electronique", name: "Cigarette électronique / Puff", icon: "💨", keywords: ["cigarette", "electronique", "puff", "vape", "e-cigarette"], bin: "special", binLabel: "Point de Collecte / Déchetterie", category: "Point de collecte", advice: "DEEE + batterie. Contient une pile lithium. Rapporter en déchetterie ou en magasin de vape. Jamais aux ordures." },
    { id: "livre", name: "Livre / Roman", icon: "📚", keywords: ["livre", "roman", "bouquin", "papier", "recup"], bin: "special", binLabel: "Don / Recyclerie", category: "Point de collecte", advice: "Donner à une médiathèque, Emmaüs ou borne à livres. Si vraiment abîmé, dans le bac jaune (papier)." },
    { id: "pizza-carton-gras", name: "Carton très gras ou mouillé", icon: "💧", keywords: ["carton", "gras", "mouille", "souille", "papier"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Les cartons très souillés ne se recyclent plus. Couper et jeter la partie propre dans le bac jaune." },
    { id: "capsule-nespresso", name: "Dosette café plastique", icon: "☕", keywords: ["dosette", "cafe", "senseo", "plastique", "pod"], bin: "gray", binLabel: "Ordures Ménagères", category: "Ordures ménagères", advice: "Les dosettes plastique (Senseo, Tassimo) vont aux ordures. Les aluminium ont un point de collecte." },
];

export const ALL_CATEGORIES: WasteCategory[] = [
    "Plastique",
    "Verre",
    "Papier & Carton",
    "Métal",
    "Biodéchets",
    "Ordures ménagères",
    "Point de collecte",
];
