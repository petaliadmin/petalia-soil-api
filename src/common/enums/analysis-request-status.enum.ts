/**
 * Énumération des statuts des demandes d'analyse de sol
 */
export enum AnalysisRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
