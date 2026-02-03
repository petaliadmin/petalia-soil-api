import { SoilParameters } from '../../soil/schemas/soil-parameters.schema';
import { CropRecommendationResult } from '../../recommendations/recommendations.service';
import { FertilizationPlanEntry } from '../interfaces/report-data.interface';

/**
 * Planificateur de fertilisation adapte au contexte senegalais
 * Genere un plan de fertilisation par periode culturale
 */
export class FertilizationPlanner {
  /**
   * Cree un plan de fertilisation basé sur les cultures recommandees et l'etat du sol
   */
  static createPlan(
    recommendations: CropRecommendationResult[],
    soil: SoilParameters,
  ): FertilizationPlanEntry[] {
    const plan: FertilizationPlanEntry[] = [];
    const topCrops = recommendations.slice(0, 5).map((r) => r.name);

    // 1. Preparation du sol (Avril - Mai)
    plan.push({
      period: 'Preparation du sol (Avril - Mai)',
      action: 'Fumure de fond organique',
      product: 'Compost ou fumier bien decompose',
      quantity: soil.organicMatter && soil.organicMatter < 2
        ? '10-15 t/ha'
        : '5-8 t/ha',
      targetCrops: topCrops,
    });

    if (soil.ph < 5.5) {
      plan.push({
        period: 'Preparation du sol (Avril - Mai)',
        action: 'Chaulage (2-3 mois avant semis)',
        product: 'Chaux agricole ou dolomie',
        quantity: `${Math.round((6.5 - soil.ph) * 600)} kg/ha`,
        targetCrops: topCrops,
      });
    }

    // 2. Semis hivernage (Juin - Juillet)
    const needsNPK = soil.npk.nitrogen < 40 || soil.npk.phosphorus < 30 || soil.npk.potassium < 80;

    if (needsNPK) {
      plan.push({
        period: 'Semis (Juin - Juillet)',
        action: 'Fumure de fond minerale au semis',
        product: 'Engrais NPK 15-15-15 ou 10-20-10',
        quantity: this.calculateNPKDose(soil),
        targetCrops: topCrops.filter((c) => this.isHivernageCrop(c)),
      });
    }

    if (soil.npk.phosphorus < 30) {
      plan.push({
        period: 'Semis (Juin - Juillet)',
        action: 'Apport phosphate localise au poquet',
        product: 'DAP (18-46-0) ou TSP',
        quantity: '50-80 kg/ha',
        targetCrops: ['Arachide', 'Mil', 'Mais', 'Sorgho'].filter((c) => topCrops.includes(c)),
      });
    }

    // 3. Premier sarclage (Juillet - Aout)
    if (soil.npk.nitrogen < 60) {
      plan.push({
        period: '1er sarclage (Juillet - Aout)',
        action: '1ere application azotee de couverture',
        product: 'Uree (46% N)',
        quantity: this.calculateUreaDose(soil, 1),
        targetCrops: ['Mais', 'Riz', 'Sorgho', 'Mil', 'Canne a Sucre'].filter((c) => topCrops.includes(c)),
      });
    }

    // 4. Deuxieme sarclage (Aout - Septembre)
    if (soil.npk.nitrogen < 40) {
      plan.push({
        period: '2eme sarclage (Aout - Septembre)',
        action: '2eme application azotee de couverture',
        product: 'Uree (46% N)',
        quantity: this.calculateUreaDose(soil, 2),
        targetCrops: ['Mais', 'Riz', 'Canne a Sucre'].filter((c) => topCrops.includes(c)),
      });
    }

    // 5. Contre-saison / Maraichage (Novembre - Mars)
    const maraichageCrops = topCrops.filter((c) => this.isMaraichageCrop(c));
    if (maraichageCrops.length > 0) {
      plan.push({
        period: 'Contre-saison (Novembre - Mars)',
        action: 'Fumure de fond maraichage',
        product: 'Compost + NPK 10-10-20',
        quantity: 'Compost: 20 t/ha + NPK: 300 kg/ha',
        targetCrops: maraichageCrops,
      });

      plan.push({
        period: 'Contre-saison (Novembre - Mars)',
        action: 'Fertilisation de couverture (tous les 15 jours)',
        product: 'Uree (46% N) en solution ou granules',
        quantity: '25-50 kg/ha par application',
        targetCrops: maraichageCrops,
      });
    }

    // 6. Arboriculture (si fruits recommandes)
    const fruitCrops = topCrops.filter((c) => this.isFruitCrop(c));
    if (fruitCrops.length > 0) {
      plan.push({
        period: 'Debut saison des pluies (Juin)',
        action: 'Fumure annuelle arbres fruitiers',
        product: 'NPK 10-10-20 + compost en couronne',
        quantity: '2-5 kg NPK/arbre + 20 kg compost/arbre',
        targetCrops: fruitCrops,
      });
    }

    // 7. Entretien annuel
    plan.push({
      period: 'Toute l\'annee',
      action: 'Entretien de la fertilite',
      product: 'Enfouissement des residus de culture, paillage',
      quantity: 'Tous les residus disponibles',
      targetCrops: topCrops,
    });

    return plan;
  }

  private static calculateNPKDose(soil: SoilParameters): string {
    if (soil.npk.nitrogen < 20 && soil.npk.phosphorus < 20 && soil.npk.potassium < 40) {
      return '250-300 kg/ha';
    }
    if (soil.npk.nitrogen < 40 || soil.npk.phosphorus < 30 || soil.npk.potassium < 80) {
      return '150-200 kg/ha';
    }
    return '100-150 kg/ha';
  }

  private static calculateUreaDose(soil: SoilParameters, application: number): string {
    if (application === 1) {
      return soil.npk.nitrogen < 20 ? '75-100 kg/ha' : '50-75 kg/ha';
    }
    return soil.npk.nitrogen < 20 ? '50-75 kg/ha' : '25-50 kg/ha';
  }

  private static isHivernageCrop(crop: string): boolean {
    const hivernageCrops = [
      'Mil', 'Sorgho', 'Mais', 'Riz', 'Fonio',
      'Arachide', 'Niebe', 'Soja',
      'Coton', 'Sesame', 'Bissap',
      'Pasteque', 'Melon',
    ];
    return hivernageCrops.some((c) => crop.toLowerCase().includes(c.toLowerCase()));
  }

  private static isMaraichageCrop(crop: string): boolean {
    const maraichageCrops = [
      'Tomate', 'Oignon', 'Chou', 'Carotte', 'Haricot Vert',
      'Gombo', 'Aubergine', 'Piment', 'Poivron', 'Laitue', 'Courge',
    ];
    return maraichageCrops.some((c) => crop.toLowerCase().includes(c.toLowerCase()));
  }

  private static isFruitCrop(crop: string): boolean {
    const fruitCrops = [
      'Mangue', 'Banane', 'Papaye', 'Anacarde', 'Agrumes',
    ];
    return fruitCrops.some((c) => crop.toLowerCase().includes(c.toLowerCase()));
  }
}
