/**
 * Statuts d'un profil fournisseur sur la marketplace
 */
export enum ProviderStatus {
  PENDING = 'pending',         // En attente de validation admin
  ACTIVE = 'active',           // Validé et visible
  SUSPENDED = 'suspended',     // Suspendu temporairement
  REJECTED = 'rejected',       // Rejeté par l'admin
}

/**
 * Statuts d'une offre de service
 */
export enum ServiceOfferStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

/**
 * Statuts d'une demande de service (devis)
 */
export enum ServiceRequestStatus {
  PENDING = 'pending',         // En attente de réponse du fournisseur
  ACCEPTED = 'accepted',       // Acceptée par le fournisseur
  DECLINED = 'declined',       // Refusée
  IN_PROGRESS = 'in_progress', // En cours d'exécution
  COMPLETED = 'completed',     // Terminée
  CANCELLED = 'cancelled',     // Annulée par le client
}

/**
 * Labels pour les statuts
 */
export const PROVIDER_STATUS_LABELS: Record<ProviderStatus, string> = {
  [ProviderStatus.PENDING]: 'En attente de validation',
  [ProviderStatus.ACTIVE]: 'Actif',
  [ProviderStatus.SUSPENDED]: 'Suspendu',
  [ProviderStatus.REJECTED]: 'Rejeté',
};

export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  [ServiceRequestStatus.PENDING]: 'En attente',
  [ServiceRequestStatus.ACCEPTED]: 'Acceptée',
  [ServiceRequestStatus.DECLINED]: 'Refusée',
  [ServiceRequestStatus.IN_PROGRESS]: 'En cours',
  [ServiceRequestStatus.COMPLETED]: 'Terminée',
  [ServiceRequestStatus.CANCELLED]: 'Annulée',
};
