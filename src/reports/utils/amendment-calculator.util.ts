import { SoilParameters } from '../../soil/schemas/soil-parameters.schema';
import { SoilTexture } from '../../common/enums';
import { AmendmentRecommendation } from '../interfaces/report-data.interface';

/**
 * Calculateur d'amendements et corrections du sol
 * Calcule les produits, quantites et couts en FCFA
 */
export class AmendmentCalculator {
  /**
   * Calcule les amendements necessaires en fonction des parametres du sol
   */
  static calculateAmendments(
    soil: SoilParameters,
    surfaceHectares: number,
  ): AmendmentRecommendation[] {
    const amendments: AmendmentRecommendation[] = [];

    // Correction du pH
    this.checkPhAmendment(soil, surfaceHectares, amendments);

    // Correction de l'azote
    this.checkNitrogenAmendment(soil, surfaceHectares, amendments);

    // Correction du phosphore
    this.checkPhosphorusAmendment(soil, surfaceHectares, amendments);

    // Correction du potassium
    this.checkPotassiumAmendment(soil, surfaceHectares, amendments);

    // Correction de la matiere organique
    this.checkOrganicMatterAmendment(soil, surfaceHectares, amendments);

    // Correction de la salinite
    this.checkSalinityAmendment(soil, surfaceHectares, amendments);

    // Tri par priorite
    const priorityOrder = { haute: 0, moyenne: 1, basse: 2 };
    amendments.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return amendments;
  }

  private static checkPhAmendment(
    soil: SoilParameters,
    surface: number,
    amendments: AmendmentRecommendation[],
  ): void {
    if (soil.ph < 5.5) {
      // Sol acide - chaulage
      const deficit = 6.5 - soil.ph;
      const factor = soil.texture === SoilTexture.CLAY ? 1200 : soil.texture === SoilTexture.LOAMY ? 800 : 500;
      const qtyPerHa = Math.round(deficit * factor);
      const costPerKg = 150;
      const costPerHa = qtyPerHa * costPerKg;

      amendments.push({
        type: 'Chaulage',
        product: 'Chaux agricole (CaCO3)',
        reason: `pH actuel de ${soil.ph} trop acide. Objectif : remonter le pH a 6.5 pour optimiser la disponibilite des nutriments.`,
        quantityPerHectare: `${this.formatNumber(qtyPerHa)} kg/ha`,
        totalQuantity: `${this.formatNumber(Math.round(qtyPerHa * surface))} kg`,
        estimatedCostPerHectare: costPerHa,
        totalEstimatedCost: Math.round(costPerHa * surface),
        priority: soil.ph < 4.5 ? 'haute' : 'moyenne',
      });
    } else if (soil.ph > 8.0) {
      // Sol alcalin - soufre
      const excess = soil.ph - 7.0;
      const qtyPerHa = Math.round(excess * 200);
      const costPerKg = 300;
      const costPerHa = qtyPerHa * costPerKg;

      amendments.push({
        type: 'Acidification',
        product: 'Soufre elementaire',
        reason: `pH actuel de ${soil.ph} trop alcalin. Risque de blocage du fer, du zinc et du phosphore.`,
        quantityPerHectare: `${this.formatNumber(qtyPerHa)} kg/ha`,
        totalQuantity: `${this.formatNumber(Math.round(qtyPerHa * surface))} kg`,
        estimatedCostPerHectare: costPerHa,
        totalEstimatedCost: Math.round(costPerHa * surface),
        priority: soil.ph > 8.5 ? 'haute' : 'moyenne',
      });
    }
  }

  private static checkNitrogenAmendment(
    soil: SoilParameters,
    surface: number,
    amendments: AmendmentRecommendation[],
  ): void {
    if (soil.npk.nitrogen < 40) {
      const deficit = 40 - soil.npk.nitrogen;
      const qtyPerHa = Math.round(deficit * 2.2); // kg d'uree par ha
      const costPerKg = 400;
      const costPerHa = qtyPerHa * costPerKg;
      const priority = soil.npk.nitrogen < 10 ? 'haute' : soil.npk.nitrogen < 20 ? 'haute' : 'moyenne';

      amendments.push({
        type: 'Fertilisation azotee',
        product: 'Uree (46% N)',
        reason: `Teneur en azote de ${soil.npk.nitrogen} mg/kg insuffisante. L'azote est essentiel pour la croissance vegetative et le rendement.`,
        quantityPerHectare: `${this.formatNumber(qtyPerHa)} kg/ha`,
        totalQuantity: `${this.formatNumber(Math.round(qtyPerHa * surface))} kg`,
        estimatedCostPerHectare: costPerHa,
        totalEstimatedCost: Math.round(costPerHa * surface),
        priority,
      });

      // Alternative biologique
      amendments.push({
        type: 'Alternative biologique (Azote)',
        product: 'Rotation avec legumineuses (niebe, arachide)',
        reason: 'Les legumineuses fixent l\'azote atmospherique et enrichissent naturellement le sol. Complement ideal a la fertilisation minerale.',
        quantityPerHectare: 'Rotation sur 1/3 de la surface',
        totalQuantity: `${(surface / 3).toFixed(1)} ha en legumineuses`,
        estimatedCostPerHectare: 15000,
        totalEstimatedCost: Math.round(15000 * surface / 3),
        priority: 'basse',
      });
    }
  }

  private static checkPhosphorusAmendment(
    soil: SoilParameters,
    surface: number,
    amendments: AmendmentRecommendation[],
  ): void {
    if (soil.npk.phosphorus < 30) {
      const deficit = 30 - soil.npk.phosphorus;
      const qtyPerHa = Math.round(deficit * 3);
      const costPerKg = 350;
      const costPerHa = qtyPerHa * costPerKg;
      const priority = soil.npk.phosphorus < 10 ? 'haute' : 'moyenne';

      amendments.push({
        type: 'Fertilisation phosphatee',
        product: 'Triple superphosphate (TSP, 46% P2O5)',
        reason: `Teneur en phosphore de ${soil.npk.phosphorus} mg/kg insuffisante. Le phosphore favorise l'enracinement, la floraison et la fructification.`,
        quantityPerHectare: `${this.formatNumber(qtyPerHa)} kg/ha`,
        totalQuantity: `${this.formatNumber(Math.round(qtyPerHa * surface))} kg`,
        estimatedCostPerHectare: costPerHa,
        totalEstimatedCost: Math.round(costPerHa * surface),
        priority,
      });
    }
  }

  private static checkPotassiumAmendment(
    soil: SoilParameters,
    surface: number,
    amendments: AmendmentRecommendation[],
  ): void {
    if (soil.npk.potassium < 80) {
      const deficit = 80 - soil.npk.potassium;
      const qtyPerHa = Math.round(deficit * 2);
      const costPerKg = 300;
      const costPerHa = qtyPerHa * costPerKg;
      const priority = soil.npk.potassium < 20 ? 'haute' : soil.npk.potassium < 40 ? 'moyenne' : 'basse';

      amendments.push({
        type: 'Fertilisation potassique',
        product: 'Chlorure de potassium (KCl, 60% K2O)',
        reason: `Teneur en potassium de ${soil.npk.potassium} mg/kg insuffisante. Le potassium renforce la resistance aux maladies et ameliore la qualite des recoltes.`,
        quantityPerHectare: `${this.formatNumber(qtyPerHa)} kg/ha`,
        totalQuantity: `${this.formatNumber(Math.round(qtyPerHa * surface))} kg`,
        estimatedCostPerHectare: costPerHa,
        totalEstimatedCost: Math.round(costPerHa * surface),
        priority,
      });

      // Alternative locale
      if (soil.npk.potassium < 40) {
        amendments.push({
          type: 'Alternative locale (Potassium)',
          product: 'Cendre de bois',
          reason: 'La cendre de bois est une source gratuite et locale de potassium (5-10% K2O). Egalement apporte du calcium.',
          quantityPerHectare: '500 kg/ha',
          totalQuantity: `${this.formatNumber(Math.round(500 * surface))} kg`,
          estimatedCostPerHectare: 5000,
          totalEstimatedCost: Math.round(5000 * surface),
          priority: 'basse',
        });
      }
    }
  }

  private static checkOrganicMatterAmendment(
    soil: SoilParameters,
    surface: number,
    amendments: AmendmentRecommendation[],
  ): void {
    if (soil.organicMatter !== undefined && soil.organicMatter !== null && soil.organicMatter < 2.5) {
      const qtyPerHa = soil.organicMatter < 1 ? 15000 : soil.organicMatter < 2 ? 10000 : 5000;
      const costPerKg = 50;
      const costPerHa = qtyPerHa * costPerKg;
      const priority = soil.organicMatter < 1 ? 'haute' : 'moyenne';

      amendments.push({
        type: 'Amendement organique',
        product: 'Compost bien decompose',
        reason: `Matiere organique a ${soil.organicMatter}%. La matiere organique ameliore la structure du sol, la retention en eau, l'activite biologique et la fertilite globale.`,
        quantityPerHectare: `${this.formatNumber(qtyPerHa)} kg/ha (${qtyPerHa / 1000} t/ha)`,
        totalQuantity: `${this.formatNumber(Math.round(qtyPerHa * surface))} kg (${((qtyPerHa * surface) / 1000).toFixed(1)} t)`,
        estimatedCostPerHectare: costPerHa,
        totalEstimatedCost: Math.round(costPerHa * surface),
        priority,
      });

      // Paillage
      amendments.push({
        type: 'Paillage',
        product: 'Paille, residus de culture, feuilles',
        reason: 'Le paillage protege le sol, reduit l\'evaporation, limite les mauvaises herbes et enrichit progressivement le sol en matiere organique.',
        quantityPerHectare: '3 000 a 5 000 kg/ha',
        totalQuantity: `${this.formatNumber(Math.round(4000 * surface))} kg`,
        estimatedCostPerHectare: 20000,
        totalEstimatedCost: Math.round(20000 * surface),
        priority: 'basse',
      });
    }
  }

  private static checkSalinityAmendment(
    soil: SoilParameters,
    surface: number,
    amendments: AmendmentRecommendation[],
  ): void {
    if (soil.salinity !== undefined && soil.salinity !== null && soil.salinity > 2) {
      const qtyPerHa = Math.round(soil.salinity * 500);
      const costPerKg = 100;
      const costPerHa = qtyPerHa * costPerKg;

      amendments.push({
        type: 'Correction salinite',
        product: 'Gypse (sulfate de calcium)',
        reason: `Salinite de ${soil.salinity} dS/m trop elevee. Le gypse aide a deplacer les sels et ameliore la structure du sol.`,
        quantityPerHectare: `${this.formatNumber(qtyPerHa)} kg/ha`,
        totalQuantity: `${this.formatNumber(Math.round(qtyPerHa * surface))} kg`,
        estimatedCostPerHectare: costPerHa,
        totalEstimatedCost: Math.round(costPerHa * surface),
        priority: 'haute',
      });
    }
  }

  /**
   * Formate un nombre avec separateur de milliers
   */
  static formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /**
   * Formate un montant en FCFA
   */
  static formatFCFA(amount: number): string {
    return `${this.formatNumber(amount)} FCFA`;
  }
}
