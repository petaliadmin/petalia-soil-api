/**
 * Interfaces pour les donnees du rapport d'analyse de sol
 */

export interface SoilAnalysisReportData {
  header: ReportHeader;
  soilAnalysis: SoilAnalysisSection;
  soilHealthDiagnosis: SoilHealthDiagnosis;
  cropRecommendations: CropRecommendationSection[];
  amendmentRecommendations: AmendmentRecommendation[];
  fertilizationPlan: FertilizationPlanEntry[];
  plantingCalendar: PlantingCalendarEntry[];
  conservationTips: string[];
  regionalContext: RegionalContextSection;
}

export interface ReportHeader {
  landTitle: string;
  landId: string;
  ownerName: string;
  ownerPhone: string;
  region: string;
  commune: string;
  village?: string;
  surfaceHectares: number;
  generatedAt: Date;
  coordinates: { longitude: number; latitude: number };
}

export type NutrientLevel = 'deficient' | 'bas' | 'modere' | 'bon' | 'excessif';

export interface ParameterInterpretation {
  value: number;
  level: string;
  interpretation: string;
}

export interface SoilAnalysisSection {
  ph: ParameterInterpretation;
  nitrogen: ParameterInterpretation;
  phosphorus: ParameterInterpretation;
  potassium: ParameterInterpretation;
  texture: { value: string; interpretation: string };
  drainage: { value: string; interpretation: string };
  organicMatter?: ParameterInterpretation;
  moisture: ParameterInterpretation;
  salinity?: ParameterInterpretation;
  cec?: ParameterInterpretation;
}

export interface SoilHealthDiagnosis {
  overallScore: number;
  overallLevel: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export interface CropRecommendationSection {
  rank: number;
  name: string;
  suitability: string;
  score: number;
  season: string;
  expectedYield: string;
  reasons: string[];
}

export interface AmendmentRecommendation {
  type: string;
  product: string;
  reason: string;
  quantityPerHectare: string;
  totalQuantity: string;
  estimatedCostPerHectare: number;
  totalEstimatedCost: number;
  priority: 'haute' | 'moyenne' | 'basse';
}

export interface FertilizationPlanEntry {
  period: string;
  action: string;
  product: string;
  quantity: string;
  targetCrops: string[];
}

export interface PlantingCalendarEntry {
  month: string;
  season: string;
  activities: string[];
  recommendedCrops: string[];
}

export interface RegionalContextSection {
  region: string;
  climateSummary: string;
  soilCharacteristics: string;
  mainChallenges: string[];
  specificAdvice: string[];
  waterResources: string;
}
