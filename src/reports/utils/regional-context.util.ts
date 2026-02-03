import { RegionalContextSection } from '../interfaces/report-data.interface';

/**
 * Contexte regional agronomique pour les 14 regions du Senegal
 * Fournit des conseils specifiques par zone agro-ecologique
 */
export class RegionalContext {
  private static readonly regions: Record<string, RegionalContextSection> = {
    dakar: {
      region: 'Dakar',
      climateSummary: 'Climat sub-canarien, temperatures moderees (24-28°C), pluviometrie faible (400-500 mm/an). Influence oceanique avec vents frais (alizes).',
      soilCharacteristics: 'Sols sableux a sablo-limoneux dans la zone des Niayes. Nappe phreatique peu profonde dans les depressions inter-dunaires. Sols riches en matiere organique dans les bas-fonds.',
      mainChallenges: [
        'Pression fonciere et urbanisation croissante',
        'Salinisation des nappes phreatiques',
        'Ensablement des parcelles',
        'Pollution des sols par les dechets urbains',
      ],
      specificAdvice: [
        'Exploiter la zone des Niayes pour le maraichage irrigue (nappe accessible)',
        'Proteger les parcelles contre l\'ensablement par des haies brise-vent',
        'Utiliser l\'irrigation goutte-a-goutte pour economiser l\'eau',
        'Privilegier les cultures a haute valeur ajoutee (tomate, oignon, carotte, poivron)',
        'Surveiller la qualite de l\'eau d\'irrigation (salinite)',
      ],
      waterResources: 'Nappe phreatique des Niayes, forages, eau potable urbaine. Irrigation par puits traditionnels et forages motorises.',
    },
    thies: {
      region: 'Thies',
      climateSummary: 'Climat soudano-sahelien, temperatures 25-35°C, pluviometrie 400-700 mm/an. Zone de transition entre le littoral et l\'interieur.',
      soilCharacteristics: 'Sols varies : sableux sur le plateau de Thies, limoneux dans les Niayes, lateritiques dans les zones interieures. Presence de cuirasse lateritique par endroits.',
      mainChallenges: [
        'Degradation des sols par erosion eolienne et hydrique',
        'Baisse de la fertilite dans le bassin arachidier',
        'Acces irregulier a l\'eau',
        'Pression parasitaire sur les cultures maraicheres',
      ],
      specificAdvice: [
        'Zone des Niayes (Kayar, Mboro) : specialisation maraichere, gestion durable des nappes',
        'Plateau de Thies : arboriculture fruitiere (mangue, agrumes) sur sols profonds',
        'Pratiquer la rotation arachide-cereale-legumineuse pour restaurer la fertilite',
        'Installer des cordons pierreux anti-erosion sur les pentes',
        'Developper le compostage a partir des residus agricoles et du fumier',
      ],
      waterResources: 'Nappe des Niayes, forages, retenues collinaires. Potentiel d\'irrigation par goutte-a-goutte et aspersion.',
    },
    diourbel: {
      region: 'Diourbel',
      climateSummary: 'Climat sahelien a soudano-sahelien, temperatures 26-38°C, pluviometrie 400-600 mm/an. Saison des pluies courte (3-4 mois).',
      soilCharacteristics: 'Sols ferrugineux tropicaux lessives, dominance sableuse. Sols appauvris par des decennies de monoculture d\'arachide. Faible teneur en matiere organique.',
      mainChallenges: [
        'Epuisement des sols par la monoculture d\'arachide',
        'Tres faible teneur en matiere organique (<1%)',
        'Deficit hydrique chronique',
        'Erosion eolienne en saison seche',
      ],
      specificAdvice: [
        'Rompre la monoculture d\'arachide par une rotation mil-arachide-niebe',
        'Apporter massivement du compost (15-20 t/ha) pour restaurer la matiere organique',
        'Pratiquer le zaï ou demi-lune pour concentrer l\'eau et la matiere organique',
        'Planter des haies vives (Euphorbia, Prosopis) contre l\'erosion eolienne',
        'Adopter des varietes a cycle court adaptees a la pluviometrie',
      ],
      waterResources: 'Forages profonds, puits traditionnels. Pluviometrie limitee et aleatoire. Potentiel de micro-irrigation en saison seche.',
    },
    fatick: {
      region: 'Fatick',
      climateSummary: 'Climat soudano-sahelien, temperatures 25-37°C, pluviometrie 500-700 mm/an. Influence des bolongs et des tannes saumatres.',
      soilCharacteristics: 'Sols varies : sols halomorphes (tannes) pres des bolongs, sols ferrugineux a l\'interieur. Presence de sols sulfates acides dans les zones basses.',
      mainChallenges: [
        'Salinisation des sols dans les zones cotieres et les bas-fonds',
        'Sols sulfates acides dans les mangroves degradees',
        'Erosion cotiere et avancee de la langue salee',
        'Faible fertilite des sols de plateau',
      ],
      specificAdvice: [
        'Eviter les zones de tannes pour les cultures sensibles au sel',
        'Amenager des digues anti-sel pour proteger les perimetres rizicoles',
        'Pratiquer la riziculture pluviale dans les bas-fonds amenages',
        'Sur les sols de plateau : rotation arachide-mil classique avec compost',
        'Restaurer les mangroves pour lutter contre la salinisation',
      ],
      waterResources: 'Bolongs (bras de mer), nappe superficielle souvent salee. Forages profonds pour eau douce. Bassin de retention possible.',
    },
    kaolack: {
      region: 'Kaolack',
      climateSummary: 'Climat soudanien, temperatures 26-39°C, pluviometrie 600-800 mm/an. Coeur du bassin arachidier senegalais.',
      soilCharacteristics: 'Sols ferrugineux tropicaux a dominante sableuse a sablo-limoneuse. Sols appauvris par la culture intensive de l\'arachide mais encore productifs avec amendements.',
      mainChallenges: [
        'Fatigue des sols apres des decennies de culture d\'arachide',
        'Erosion hydrique lors des fortes pluies',
        'Salinisation le long du fleuve Saloum',
        'Baisse des rendements sans apport d\'intrants',
      ],
      specificAdvice: [
        'Diversifier au-dela de l\'arachide : mais, sesame, niebe, pastèque',
        'Restaurer la fertilite par le compostage et l\'enfouissement de Crotalaria',
        'Pratiquer la jachère amelioree (1 an sur 3) avec legumineuses de couverture',
        'Utiliser le phosphate naturel de Taiba pour corriger les carences en P',
        'Developper le maraichage de contre-saison autour des forages',
      ],
      waterResources: 'Fleuve Saloum (eau saumatre), forages, puits. Potentiel pour petite irrigation de complement en hivernage.',
    },
    kaffrine: {
      region: 'Kaffrine',
      climateSummary: 'Climat soudanien, temperatures 26-38°C, pluviometrie 600-900 mm/an. Zone de transition entre le bassin arachidier et le Senegal oriental.',
      soilCharacteristics: 'Sols ferrugineux tropicaux plus profonds qu\'a l\'ouest. Presence de sols bruns eutrophes en zones basses. Meilleur potentiel que Diourbel.',
      mainChallenges: [
        'Deforestation et perte de la vegetation naturelle',
        'Feux de brousse detruisant la matiere organique',
        'Divagation du betail sur les parcelles cultivees',
        'Acces difficile aux marches (enclavement)',
      ],
      specificAdvice: [
        'Exploiter le potentiel de diversification : mais, sesame, niebe, pasteque',
        'Pratiquer l\'agroforesterie avec Faidherbia albida (fertilisant naturel)',
        'Interdire les feux de brousse et enfouir les residus de culture',
        'Developper l\'embouche bovine avec les sous-produits agricoles',
        'Organiser le stockage et la commercialisation groupee des recoltes',
      ],
      waterResources: 'Forages, mares temporaires, puits traditionnels. Potentiel pour micro-barrages et retenues collinaires.',
    },
    louga: {
      region: 'Louga',
      climateSummary: 'Climat sahelien, temperatures 25-40°C, pluviometrie 250-400 mm/an. Zone semi-aride avec forte variabilite pluviometrique.',
      soilCharacteristics: 'Sols sableux dunaires tres filtrants. Faible capacite de retention en eau et en nutriments. Sensibilite extreme a l\'erosion eolienne.',
      mainChallenges: [
        'Secheresse chronique et pluviometrie tres aleatoire',
        'Ensablement et desertification',
        'Sols tres pauvres en matiere organique (<0.5%)',
        'Pression pastorale sur les ressources naturelles',
      ],
      specificAdvice: [
        'Privilegier les cultures a cycle tres court (60-75 jours) : mil Souna, niebe',
        'Pratiquer le zaï et les demi-lunes pour capter l\'eau de pluie',
        'Planter des brise-vent (Prosopis, Eucalyptus) pour freiner l\'ensablement',
        'Developper le maraichage autour des forages (oignon, patate douce)',
        'Combiner agriculture et elevage pour le fumier organique',
      ],
      waterResources: 'Forages profonds, Lac de Guiers (nord). Eau rare et precieuse, gestion economique indispensable.',
    },
    'saint-louis': {
      region: 'Saint-Louis',
      climateSummary: 'Climat sahelien a sub-canarien, temperatures 22-38°C, pluviometrie 200-400 mm/an. Presence du fleuve Senegal et de son delta.',
      soilCharacteristics: 'Sols alluviaux fertiles dans la vallee du fleuve. Sols sableux dans la zone sylvo-pastorale. Sols hydromorphes dans le delta (riziculture).',
      mainChallenges: [
        'Salinisation des perimetres irrigues dans le delta',
        'Gestion de l\'eau d\'irrigation (repartition, drainage)',
        'Adventices aquatiques (Typha, Salvinia) dans les canaux',
        'Avancee de la langue salee en aval du barrage de Diama',
      ],
      specificAdvice: [
        'Exploiter les perimetres irrigues pour la double culture de riz',
        'Pratiquer la contre-saison chaude (tomate, oignon) dans les perimetres amenages',
        'Assurer un drainage efficace pour eviter la salinisation secondaire',
        'Diversifier avec la canne a sucre (CSS/Compagnie Sucriere Senegalaise)',
        'Utiliser des varietes de riz a haut rendement (Sahel 108, Sahel 201)',
      ],
      waterResources: 'Fleuve Senegal (barrage de Diama), lac de Guiers, canaux d\'irrigation SAED. Potentiel irrigue considerable.',
    },
    matam: {
      region: 'Matam',
      climateSummary: 'Climat sahelien, temperatures 28-42°C (une des regions les plus chaudes). Pluviometrie 300-500 mm/an.',
      soilCharacteristics: 'Sols alluviaux dans la vallee du fleuve (Walo). Sols ferrugineux sur le plateau (Diéri). Fertilite naturelle variable.',
      mainChallenges: [
        'Temperatures extremes limitant certaines cultures',
        'Crues du fleuve parfois destructrices',
        'Ensablement des perimetres irrigues',
        'Exode rural et manque de main d\'oeuvre agricole',
      ],
      specificAdvice: [
        'Zone Walo (vallee) : riz irrigue, sorgho de decrue, maraichage',
        'Zone Dieri (plateau) : mil, niebe, elevage pastoral',
        'Amenager des petits perimetres irrigues villageois',
        'Pratiquer la culture de decrue (sorgho, niebe) dans les cuvettes',
        'Choisir des varietes tolerantes a la chaleur',
      ],
      waterResources: 'Fleuve Senegal, mares temporaires, forages. Potentiel d\'irrigation a developper le long du fleuve.',
    },
    tambacounda: {
      region: 'Tambacounda',
      climateSummary: 'Climat soudanien, temperatures 25-40°C, pluviometrie 700-1000 mm/an. Zone a bon potentiel pluviometrique.',
      soilCharacteristics: 'Sols ferrugineux tropicaux profonds et relativement fertiles. Presence de sols bruns et de cuirasses lateritiques. Bon potentiel agricole.',
      mainChallenges: [
        'Deforestation pour l\'agriculture extensive',
        'Feux de brousse recurrents',
        'Enclavement et acces aux marches',
        'Divagation du betail et conflits agriculteurs-eleveurs',
      ],
      specificAdvice: [
        'Region a fort potentiel : diversifier (coton, mais, sesame, manguier)',
        'Pratiquer l\'agroforesterie pour maintenir la fertilite',
        'Developper la culture du coton dans les zones les mieux arrosees',
        'Investir dans le stockage et la conservation des recoltes',
        'Organiser des pare-feux et proteger les parcelles des feux de brousse',
      ],
      waterResources: 'Fleuve Gambie et ses affluents, mares permanentes, forages. Potentiel irrigue le long de la Gambie.',
    },
    kedougou: {
      region: 'Kedougou',
      climateSummary: 'Climat soudano-guineen, temperatures 24-38°C, pluviometrie 1000-1400 mm/an. Region la plus arrosee du Senegal.',
      soilCharacteristics: 'Sols ferrugineux profonds et bien structures. Sols bruns eutrophes en zones basses. Richesse en matiere organique superieure aux autres regions. Presence de sols sur roches basiques (fertiles).',
      mainChallenges: [
        'Erosion hydrique forte sur les pentes et collines',
        'Orpaillage artisanal degradant les sols et cours d\'eau',
        'Deforestation pour les activites minieres',
        'Enclavement et difficulte d\'acces',
      ],
      specificAdvice: [
        'Region a tres fort potentiel agricole : arboriculture fruitiere (mangue, agrumes, anacarde)',
        'Amenager les pentes en terrasses pour lutter contre l\'erosion',
        'Developper l\'agriculture biologique (bon potentiel en matiere organique)',
        'Proteger les sols et cours d\'eau de la pollution miniere',
        'Cultiver les tubercules (manioc, patate douce) sur les plateaux',
      ],
      waterResources: 'Fleuve Gambie et Faleme, nombreux affluents, forages. Region bien arrosee avec potential irrigue important.',
    },
    kolda: {
      region: 'Kolda',
      climateSummary: 'Climat soudanien a soudano-guineen, temperatures 24-37°C, pluviometrie 800-1200 mm/an. Region bien arrosee de la Haute Casamance.',
      soilCharacteristics: 'Sols ferrugineux tropicaux et sols ferralitiques. Bonne profondeur et fertilite moderee. Matiere organique plus elevee que dans le nord.',
      mainChallenges: [
        'Deforestation acceleree pour le charbon de bois',
        'Feux de brousse tardifs destructeurs',
        'Erosion hydrique dans les zones defrichees',
        'Insecurite dans certaines zones (proximite frontiere)',
      ],
      specificAdvice: [
        'Developper l\'arboriculture : anacarde, manguier, agrumes',
        'Pratiquer la riziculture pluviale dans les bas-fonds',
        'Diversifier avec mais, coton et cultures maraicheres',
        'Proteger et restaurer les forets par l\'agroforesterie',
        'Valoriser les produits forestiers non ligneux (miel, karite)',
      ],
      waterResources: 'Cours d\'eau permanents (Casamance, Kayanga), mares, forages. Bon potentiel d\'irrigation.',
    },
    sedhiou: {
      region: 'Sedhiou',
      climateSummary: 'Climat soudano-guineen, temperatures 24-36°C, pluviometrie 900-1300 mm/an. Region humide de la Moyenne Casamance.',
      soilCharacteristics: 'Sols hydromorphes dans les bas-fonds rizicoles. Sols ferrugineux sur les plateaux. Sols sulfates acides pres des bolongs. Fertilite naturelle correcte.',
      mainChallenges: [
        'Salinisation des bas-fonds rizicoles (remontee de la langue salee)',
        'Acidification des sols de mangrove',
        'Perte de superficie rizicole par la salinisation',
        'Deforestation et degradation des mangroves',
      ],
      specificAdvice: [
        'Amenager des digues et barrages anti-sel pour les perimetres rizicoles',
        'Pratiquer le riz pluvial sur les plateaux en alternative au riz de bas-fond',
        'Developper l\'anacarde (noix de cajou) sur les sols de plateau',
        'Restaurer les mangroves pour proteger contre la salinisation',
        'Produire du compost a partir des coques d\'anacarde et residus',
      ],
      waterResources: 'Fleuve Casamance, bolongs, mares, forages. Eau douce disponible mais menacee par la salinisation.',
    },
    ziguinchor: {
      region: 'Ziguinchor',
      climateSummary: 'Climat soudano-guineen, temperatures 23-34°C, pluviometrie 1000-1500 mm/an. Region la plus humide apres Kedougou. Forte influence oceanique.',
      soilCharacteristics: 'Sols riches et diversifies : sols ferralitiques sur plateaux, sols hydromorphes dans les bas-fonds, sols de mangrove. Teneur en matiere organique elevee (3-5%).',
      mainChallenges: [
        'Salinisation des rizières par la remontee de la langue salee',
        'Acidite des sols sulfates dans les zones de mangrove',
        'Erosion cotiere et fluviale',
        'Instabilite securitaire dans certaines zones',
      ],
      specificAdvice: [
        'Exploiter le potentiel arboricole exceptionnel : mangue, agrumes, banane, anacarde',
        'Pratiquer la riziculture irriguee et pluviale (traditions casamancaises)',
        'Developper le maraichage de contre-saison (tomate, aubergine, piment)',
        'Produire du compost avec les abondants residus vegetaux',
        'Pratiquer l\'agroforesterie intensive (cultures sous couvert arboricole)',
      ],
      waterResources: 'Fleuve Casamance, bolongs, nappe superficielle, forages. Abondance d\'eau mais salinisation en cours.',
    },
  };

  /**
   * Retourne le contexte agronomique regional
   */
  static getRegionalContext(region?: string): RegionalContextSection {
    if (!region) {
      return this.getDefaultContext();
    }

    const regionKey = this.normalizeRegion(region);
    return this.regions[regionKey] || this.getDefaultContext();
  }

  private static normalizeRegion(region: string): string {
    const normalized = region.toLowerCase().trim();

    // Gestion des correspondances
    const mappings: Record<string, string> = {
      'dakar': 'dakar',
      'thies': 'thies',
      'thiès': 'thies',
      'diourbel': 'diourbel',
      'fatick': 'fatick',
      'kaolack': 'kaolack',
      'kaffrine': 'kaffrine',
      'louga': 'louga',
      'saint-louis': 'saint-louis',
      'saint louis': 'saint-louis',
      'matam': 'matam',
      'tambacounda': 'tambacounda',
      'kedougou': 'kedougou',
      'kédougou': 'kedougou',
      'kolda': 'kolda',
      'sedhiou': 'sedhiou',
      'sédhiou': 'sedhiou',
      'ziguinchor': 'ziguinchor',
    };

    return mappings[normalized] || normalized;
  }

  private static getDefaultContext(): RegionalContextSection {
    return {
      region: 'Senegal',
      climateSummary: 'Le Senegal presente un gradient climatique nord-sud : sahelien au nord (250 mm de pluie) a soudano-guineen au sud (1500 mm). Deux saisons principales : saison seche (novembre-mai) et hivernage (juin-octobre).',
      soilCharacteristics: 'Grande diversite de sols : sols sableux au nord et centre, sols ferrugineux dans le bassin arachidier, sols ferralitiques au sud, sols alluviaux le long des fleuves.',
      mainChallenges: [
        'Baisse de la fertilite des sols par surexploitation',
        'Erosion eolienne au nord et hydrique au sud',
        'Variabilite pluviometrique liee au changement climatique',
        'Acces limite aux intrants agricoles de qualite',
      ],
      specificAdvice: [
        'Adapter les cultures a la zone agro-ecologique',
        'Pratiquer la rotation culturale et l\'agroforesterie',
        'Restaurer la matiere organique par le compostage',
        'Utiliser des varietes ameliorees et certifiees (ISRA)',
        'Diversifier les sources de revenus agricoles',
      ],
      waterResources: 'Fleuves Senegal, Gambie et Casamance. Nappes phreatiques variables selon les regions. Potentiel irrigue sous-exploite.',
    };
  }
}
