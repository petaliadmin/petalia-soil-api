/**
 * Interface pour une recommandation de culture
 */
export interface CropRecommendation {
  crop: string;
  suitability: 'Excellente' | 'Bonne' | 'Moyenne' | 'Faible';
  reason: string;
  confidence: number; // 0-100
}
