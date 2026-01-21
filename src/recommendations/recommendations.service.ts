import { Injectable } from '@nestjs/common';
import { SoilTexture } from '../common/enums';
import { SoilParameters } from '../soil/schemas/soil-parameters.schema';
import { CropRecommendation } from './interfaces/crop-recommendation.interface';

/**
 * Service de recommandation de cultures
 * Basé sur l'analyse des paramètres du sol
 */
@Injectable()
export class RecommendationsService {
  /**
   * Génère des recommandations de cultures basées sur les paramètres du sol
   */
  generateRecommendations(soil: SoilParameters): CropRecommendation[] {
    const recommendations: CropRecommendation[] = [];

    // Recommandations pour le riz
    if (this.isGoodForRice(soil)) {
      recommendations.push({
        crop: 'Riz',
        suitability: this.getRiceSuitability(soil),
        reason: this.getRiceReason(soil),
        confidence: this.calculateRiceConfidence(soil),
      });
    }

    // Recommandations pour le maïs
    if (this.isGoodForMaize(soil)) {
      recommendations.push({
        crop: 'Maïs',
        suitability: this.getMaizeSuitability(soil),
        reason: this.getMaizeReason(soil),
        confidence: this.calculateMaizeConfidence(soil),
      });
    }

    // Recommandations pour l'arachide
    if (this.isGoodForPeanut(soil)) {
      recommendations.push({
        crop: 'Arachide',
        suitability: this.getPeanutSuitability(soil),
        reason: this.getPeanutReason(soil),
        confidence: this.calculatePeanutConfidence(soil),
      });
    }

    // Recommandations pour le maraîchage
    if (this.isGoodForVegetables(soil)) {
      recommendations.push({
        crop: 'Maraîchage (Tomates, Oignons, Choux)',
        suitability: this.getVegetableSuitability(soil),
        reason: this.getVegetableReason(soil),
        confidence: this.calculateVegetableConfidence(soil),
      });
    }

    // Recommandations pour le mil/sorgho
    if (this.isGoodForMillet(soil)) {
      recommendations.push({
        crop: 'Mil / Sorgho',
        suitability: this.getMilletSuitability(soil),
        reason: this.getMilletReason(soil),
        confidence: this.calculateMilletConfidence(soil),
      });
    }

    // Recommandations pour le niébé
    if (this.isGoodForCowpea(soil)) {
      recommendations.push({
        crop: 'Niébé',
        suitability: this.getCowpeaSuitability(soil),
        reason: this.getCowpeaReason(soil),
        confidence: this.calculateCowpeaConfidence(soil),
      });
    }

    // Trier par confiance décroissante
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // === RIZ ===
  private isGoodForRice(soil: SoilParameters): boolean {
    return soil.ph >= 5.5 && soil.ph <= 6.5 && soil.soilTexture === SoilTexture.CLAY;
  }

  private getRiceSuitability(soil: SoilParameters): 'Excellente' | 'Bonne' | 'Moyenne' {
    if (soil.ph >= 5.8 && soil.ph <= 6.2 && soil.nitrogen >= 40) return 'Excellente';
    if (soil.ph >= 5.5 && soil.ph <= 6.5) return 'Bonne';
    return 'Moyenne';
  }

  private getRiceReason(soil: SoilParameters): string {
    return `Sol argileux avec pH ${soil.ph.toFixed(1)}, idéal pour la rétention d'eau nécessaire au riz`;
  }

  private calculateRiceConfidence(soil: SoilParameters): number {
    let confidence = 60;
    if (soil.ph >= 5.8 && soil.ph <= 6.2) confidence += 20;
    if (soil.soilTexture === SoilTexture.CLAY) confidence += 15;
    if (soil.nitrogen >= 40) confidence += 5;
    return Math.min(confidence, 95);
  }

  // === MAÏS ===
  private isGoodForMaize(soil: SoilParameters): boolean {
    return soil.ph >= 6.0 && soil.ph <= 7.0 && soil.soilTexture === SoilTexture.LOAM;
  }

  private getMaizeSuitability(soil: SoilParameters): 'Excellente' | 'Bonne' | 'Moyenne' {
    if (soil.ph >= 6.2 && soil.ph <= 6.8 && soil.nitrogen >= 50 && soil.phosphorus >= 25) {
      return 'Excellente';
    }
    if (soil.ph >= 6.0 && soil.ph <= 7.0) return 'Bonne';
    return 'Moyenne';
  }

  private getMaizeReason(soil: SoilParameters): string {
    return `Sol limoneux avec pH ${soil.ph.toFixed(1)}, bon équilibre pour le maïs`;
  }

  private calculateMaizeConfidence(soil: SoilParameters): number {
    let confidence = 65;
    if (soil.ph >= 6.2 && soil.ph <= 6.8) confidence += 15;
    if (soil.soilTexture === SoilTexture.LOAM) confidence += 15;
    if (soil.nitrogen >= 50) confidence += 5;
    return Math.min(confidence, 95);
  }

  // === ARACHIDE ===
  private isGoodForPeanut(soil: SoilParameters): boolean {
    return soil.ph >= 5.0 && soil.ph <= 6.5 && soil.soilTexture === SoilTexture.SANDY;
  }

  private getPeanutSuitability(soil: SoilParameters): 'Excellente' | 'Bonne' | 'Moyenne' {
    if (soil.ph >= 5.5 && soil.ph <= 6.0 && soil.soilTexture === SoilTexture.SANDY) {
      return 'Excellente';
    }
    return 'Bonne';
  }

  private getPeanutReason(soil: SoilParameters): string {
    return `Sol sableux avec pH ${soil.ph.toFixed(1)}, excellent drainage pour l'arachide`;
  }

  private calculatePeanutConfidence(soil: SoilParameters): number {
    let confidence = 70;
    if (soil.ph >= 5.5 && soil.ph <= 6.0) confidence += 15;
    if (soil.soilTexture === SoilTexture.SANDY) confidence += 10;
    if (soil.potassium >= 100) confidence += 5;
    return Math.min(confidence, 95);
  }

  // === MARAÎCHAGE ===
  private isGoodForVegetables(soil: SoilParameters): boolean {
    const hasGoodNPK = soil.nitrogen >= 60 && soil.phosphorus >= 30 && soil.potassium >= 150;
    return soil.ph >= 6.0 && soil.ph <= 7.0 && hasGoodNPK;
  }

  private getVegetableSuitability(soil: SoilParameters): 'Excellente' | 'Bonne' | 'Moyenne' {
    const npkSum = soil.nitrogen + soil.phosphorus + soil.potassium;
    if (npkSum >= 300 && soil.ph >= 6.3 && soil.ph <= 6.8) return 'Excellente';
    if (npkSum >= 240) return 'Bonne';
    return 'Moyenne';
  }

  private getVegetableReason(soil: SoilParameters): string {
    return `NPK élevé (N:${soil.nitrogen}, P:${soil.phosphorus}, K:${soil.potassium}) et pH ${soil.ph.toFixed(1)}, parfait pour cultures intensives`;
  }

  private calculateVegetableConfidence(soil: SoilParameters): number {
    let confidence = 60;
    const npkSum = soil.nitrogen + soil.phosphorus + soil.potassium;
    if (npkSum >= 300) confidence += 20;
    if (soil.ph >= 6.3 && soil.ph <= 6.8) confidence += 10;
    if (soil.soilTexture === SoilTexture.LOAM) confidence += 5;
    return Math.min(confidence, 95);
  }

  // === MIL/SORGHO ===
  private isGoodForMillet(soil: SoilParameters): boolean {
    return soil.ph >= 5.5 && soil.ph <= 7.5 && soil.soilTexture === SoilTexture.SANDY;
  }

  private getMilletSuitability(soil: SoilParameters): 'Excellente' | 'Bonne' | 'Moyenne' {
    if (soil.soilTexture === SoilTexture.SANDY && soil.ph >= 6.0 && soil.ph <= 7.0) {
      return 'Excellente';
    }
    return 'Bonne';
  }

  private getMilletReason(soil: SoilParameters): string {
    return `Sol sableux bien drainé, résistant à la sécheresse, adapté au mil/sorgho`;
  }

  private calculateMilletConfidence(soil: SoilParameters): number {
    let confidence = 75;
    if (soil.soilTexture === SoilTexture.SANDY) confidence += 10;
    if (soil.ph >= 6.0 && soil.ph <= 7.0) confidence += 10;
    return Math.min(confidence, 90);
  }

  // === NIÉBÉ ===
  private isGoodForCowpea(soil: SoilParameters): boolean {
    return soil.ph >= 5.5 && soil.ph <= 7.0;
  }

  private getCowpeaSuitability(soil: SoilParameters): 'Excellente' | 'Bonne' | 'Moyenne' {
    if (soil.ph >= 6.0 && soil.ph <= 6.5 && soil.phosphorus >= 20) return 'Excellente';
    return 'Bonne';
  }

  private getCowpeaReason(soil: SoilParameters): string {
    return `pH ${soil.ph.toFixed(1)} adapté au niébé, légumineuse fixatrice d'azote`;
  }

  private calculateCowpeaConfidence(soil: SoilParameters): number {
    let confidence = 70;
    if (soil.ph >= 6.0 && soil.ph <= 6.5) confidence += 15;
    if (soil.phosphorus >= 20) confidence += 10;
    return Math.min(confidence, 90);
  }
}
