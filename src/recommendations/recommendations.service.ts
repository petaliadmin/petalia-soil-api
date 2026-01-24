import { Injectable } from '@nestjs/common';
import { SoilParameters } from '../soil/schemas/soil-parameters.schema';
import { CROPS_DATABASE, CropData } from './data/crops.data';

export interface CropRecommendationResult {
  name: string;
  suitability: 'excellent' | 'good' | 'moderate';
  icon: string;
  season: string;
  expectedYield: string;
  score: number;
  reasons: string[];
}

/**
 * Service de recommandation de cultures
 * Basé sur l'analyse des paramètres du sol
 */
@Injectable()
export class RecommendationsService {
  /**
   * Génère des recommandations de cultures basées sur les paramètres du sol
   */
  generateRecommendations(soil: SoilParameters): CropRecommendationResult[] {
    const recommendations: CropRecommendationResult[] = [];

    for (const crop of CROPS_DATABASE) {
      const score = this.calculateCropScore(soil, crop);

      if (score >= 40) {
        const suitability = this.getSuitability(score);
        const reasons = this.getReasons(soil, crop);

        recommendations.push({
          name: crop.name,
          suitability,
          icon: crop.icon,
          season: crop.season,
          expectedYield: crop.expectedYield,
          score,
          reasons,
        });
      }
    }

    // Trier par score décroissant et limiter aux 10 meilleures recommandations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Calcule le score de compatibilité entre le sol et une culture
   */
  private calculateCropScore(soil: SoilParameters, crop: CropData): number {
    let score = 0;
    let factors = 0;

    // Score pH (0-25 points)
    const phScore = this.calculateRangeScore(
      soil.ph,
      crop.phRange.min,
      crop.phRange.max,
    );
    score += phScore * 25;
    factors += 25;

    // Score Azote (0-15 points)
    const nitrogenScore = this.calculateRangeScore(
      soil.npk.nitrogen,
      crop.nitrogenRange.min,
      crop.nitrogenRange.max,
    );
    score += nitrogenScore * 15;
    factors += 15;

    // Score Phosphore (0-15 points)
    const phosphorusScore = this.calculateRangeScore(
      soil.npk.phosphorus,
      crop.phosphorusRange.min,
      crop.phosphorusRange.max,
    );
    score += phosphorusScore * 15;
    factors += 15;

    // Score Potassium (0-15 points)
    const potassiumScore = this.calculateRangeScore(
      soil.npk.potassium,
      crop.potassiumRange.min,
      crop.potassiumRange.max,
    );
    score += potassiumScore * 15;
    factors += 15;

    // Score Humidité (0-15 points)
    const moistureScore = this.calculateRangeScore(
      soil.moisture,
      crop.moistureRange.min,
      crop.moistureRange.max,
    );
    score += moistureScore * 15;
    factors += 15;

    // Score Texture (0-10 points)
    if (crop.preferredTextures.includes(soil.texture)) {
      score += 10;
    }
    factors += 10;

    // Score Drainage (0-5 points)
    if (crop.preferredDrainage.includes(soil.drainage)) {
      score += 5;
    }
    factors += 5;

    // Normaliser le score sur 100
    return Math.round((score / factors) * 100);
  }

  /**
   * Calcule le score pour une valeur dans une plage donnée
   */
  private calculateRangeScore(
    value: number,
    min: number,
    max: number,
  ): number {
    if (value >= min && value <= max) {
      // Valeur optimale - score maximal
      const midpoint = (min + max) / 2;
      const range = (max - min) / 2;
      const distance = Math.abs(value - midpoint);
      return 1 - (distance / range) * 0.3; // Score entre 0.7 et 1
    }

    // Valeur hors plage - score réduit
    const tolerance = (max - min) * 0.3;
    if (value < min) {
      const distance = min - value;
      return Math.max(0, 1 - distance / tolerance) * 0.5;
    } else {
      const distance = value - max;
      return Math.max(0, 1 - distance / tolerance) * 0.5;
    }
  }

  /**
   * Détermine le niveau de compatibilité basé sur le score
   */
  private getSuitability(score: number): 'excellent' | 'good' | 'moderate' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'moderate';
  }

  /**
   * Génère les raisons de la recommandation
   */
  private getReasons(soil: SoilParameters, crop: CropData): string[] {
    const reasons: string[] = [];

    // pH
    if (soil.ph >= crop.phRange.min && soil.ph <= crop.phRange.max) {
      reasons.push(`pH optimal (${soil.ph.toFixed(1)})`);
    }

    // NPK
    if (
      soil.npk.nitrogen >= crop.nitrogenRange.min &&
      soil.npk.nitrogen <= crop.nitrogenRange.max
    ) {
      reasons.push(`Azote adéquat (${soil.npk.nitrogen} mg/kg)`);
    }

    if (
      soil.npk.phosphorus >= crop.phosphorusRange.min &&
      soil.npk.phosphorus <= crop.phosphorusRange.max
    ) {
      reasons.push(`Phosphore adéquat (${soil.npk.phosphorus} mg/kg)`);
    }

    if (
      soil.npk.potassium >= crop.potassiumRange.min &&
      soil.npk.potassium <= crop.potassiumRange.max
    ) {
      reasons.push(`Potassium adéquat (${soil.npk.potassium} mg/kg)`);
    }

    // Texture
    if (crop.preferredTextures.includes(soil.texture)) {
      reasons.push(`Texture du sol adaptée (${soil.texture})`);
    }

    // Drainage
    if (crop.preferredDrainage.includes(soil.drainage)) {
      reasons.push(`Drainage adapté (${soil.drainage})`);
    }

    // Humidité
    if (
      soil.moisture >= crop.moistureRange.min &&
      soil.moisture <= crop.moistureRange.max
    ) {
      reasons.push(`Humidité optimale (${soil.moisture}%)`);
    }

    return reasons.length > 0 ? reasons : ['Conditions générales acceptables'];
  }

  /**
   * Récupère toutes les cultures disponibles
   */
  getAllCrops(): CropData[] {
    return CROPS_DATABASE;
  }

  /**
   * Récupère les cultures par catégorie
   */
  getCropsByCategory(category: string): CropData[] {
    return CROPS_DATABASE.filter((crop) => crop.category === category);
  }
}
