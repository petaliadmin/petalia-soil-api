import { Injectable, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { LandsService } from '../lands/lands.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { SoilInterpreter } from './utils/soil-interpreter.util';
import { AmendmentCalculator } from './utils/amendment-calculator.util';
import { FertilizationPlanner } from './utils/fertilization-planner.util';
import { PlantingCalendar } from './utils/planting-calendar.util';
import { RegionalContext } from './utils/regional-context.util';
import { SoilAnalysisReportData } from './interfaces/report-data.interface';
import { SoilParameters } from '../soil/schemas/soil-parameters.schema';

/**
 * Service d'orchestration pour la generation de rapports d'analyse de sol
 */
@Injectable()
export class ReportsService {
  constructor(
    private readonly landsService: LandsService,
    private readonly recommendationsService: RecommendationsService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  /**
   * Construit les donnees du rapport et genere le PDF
   */
  async generateSoilReport(landId: string, res: Response): Promise<void> {
    // 1. Recuperer la terre avec le proprietaire
    const land = await this.landsService.findOne(landId);

    // 2. Verifier les parametres du sol
    if (!land.soilParameters) {
      throw new BadRequestException(
        'Cette terre ne possede pas de parametres de sol. Veuillez d\'abord effectuer une analyse de sol.',
      );
    }

    const soil = land.soilParameters as SoilParameters;

    // 3. Generer les recommandations de cultures
    const recommendations = this.recommendationsService.generateRecommendations(soil);

    // 4. Interpreter les parametres du sol
    const soilAnalysis = SoilInterpreter.interpretSoil(soil);

    // 5. Diagnostic global
    const soilHealthDiagnosis = SoilInterpreter.diagnoseHealth(soil);

    // 6. Calculer les amendements
    const amendmentRecommendations = AmendmentCalculator.calculateAmendments(soil, land.surfaceHectares);

    // 7. Plan de fertilisation
    const fertilizationPlan = FertilizationPlanner.createPlan(recommendations, soil);

    // 8. Calendrier cultural
    const plantingCalendar = PlantingCalendar.generateCalendar(
      recommendations,
      land.address?.region,
    );

    // 9. Contexte regional
    const regionalContext = RegionalContext.getRegionalContext(land.address?.region);

    // 10. Conseils de conservation
    const conservationTips = this.generateConservationTips(soil, soilHealthDiagnosis);

    // 11. Assembler les donnees du rapport
    const reportData: SoilAnalysisReportData = {
      header: {
        landTitle: land.title,
        landId: (land as any)._id.toString(),
        ownerName: (land.owner as any)?.fullName || 'Non renseigne',
        ownerPhone: (land.owner as any)?.phone || '',
        region: land.address?.region || 'Non renseignee',
        commune: land.address?.commune || '',
        village: land.address?.village,
        surfaceHectares: land.surfaceHectares,
        generatedAt: new Date(),
        coordinates: {
          longitude: land.location?.coordinates?.[0] || 0,
          latitude: land.location?.coordinates?.[1] || 0,
        },
      },
      soilAnalysis,
      soilHealthDiagnosis,
      cropRecommendations: recommendations.map((rec, index) => ({
        rank: index + 1,
        name: rec.name,
        suitability: rec.suitability,
        score: rec.score,
        season: rec.season,
        expectedYield: rec.expectedYield,
        reasons: rec.reasons,
      })),
      amendmentRecommendations,
      fertilizationPlan,
      plantingCalendar,
      conservationTips,
      regionalContext,
    };

    // 12. Generer et streamer le PDF
    this.pdfGeneratorService.generatePdf(reportData, res);
  }

  /**
   * Genere les conseils de conservation basees sur l'etat du sol
   */
  private generateConservationTips(
    soil: SoilParameters,
    diagnosis: { weaknesses: string[] },
  ): string[] {
    const tips: string[] = [];

    // Conseils specifiques aux faiblesses
    if (soil.texture === 'sandy') {
      tips.push(
        'Pratiquer le paillage (mulch) pour reduire l\'evaporation, proteger le sol contre l\'erosion eolienne et ameliorer progressivement la teneur en matiere organique.',
      );
      tips.push(
        'Planter des haies brise-vent (Anacardium occidentale, Prosopis juliflora) perpendiculairement aux vents dominants pour limiter l\'ensablement et proteger les cultures.',
      );
    }

    if (soil.texture === 'clay') {
      tips.push(
        'Eviter de travailler le sol en conditions trop humides pour prevenir la compaction. Privilegier le labour en debut de saison seche quand le sol est legerement humide.',
      );
    }

    if (soil.organicMatter !== undefined && soil.organicMatter < 2) {
      tips.push(
        'Incorporer du compost ou du fumier bien decompose a raison de 5 a 10 tonnes par hectare et par an. Recycler systematiquement les residus de culture en les enfouissant.',
      );
      tips.push(
        'Pratiquer l\'engrais vert en semant des legumineuses de couverture (Crotalaria juncea, Mucuna pruriens) entre deux cycles de culture pour enrichir le sol en azote et en matiere organique.',
      );
    }

    if (soil.drainage === 'poor') {
      tips.push(
        'Amenager des billons ou des planches sureleves pour les cultures sensibles a l\'exces d\'eau. Creuser des fosses de drainage entre les parcelles.',
      );
    }

    if (soil.ph < 5.5 || soil.ph > 8.0) {
      tips.push(
        'Surveiller regulierement le pH du sol (au moins une fois par an) et ajuster les apports d\'amendements calcaires ou soufres en consequence.',
      );
    }

    // Conseils generaux
    tips.push(
      'Pratiquer la rotation des cultures sur 3 a 4 ans en alternant cereales, legumineuses et cultures maraicheres. La rotation brise les cycles de maladies et equilibre les besoins en nutriments.',
    );

    tips.push(
      'Ne jamais bruler les residus de recolte. Les enfouir ou les utiliser comme paillage permet de restituer au sol les elements nutritifs preleves par les cultures.',
    );

    tips.push(
      'Amenager des cordons pierreux ou des diguettes anti-erosives le long des courbes de niveau pour ralentir le ruissellement et favoriser l\'infiltration de l\'eau de pluie.',
    );

    tips.push(
      'Pratiquer l\'agroforesterie en associant des arbres utiles (Faidherbia albida, Moringa oleifera, Leucaena) aux cultures. Les arbres apportent de l\'ombre, de l\'azote, de la matiere organique et protegent contre l\'erosion.',
    );

    tips.push(
      'Fractionner les apports d\'engrais mineraux en 2 a 3 applications pour limiter les pertes par lessivage et optimiser l\'absorption par les plantes.',
    );

    return tips;
  }
}
