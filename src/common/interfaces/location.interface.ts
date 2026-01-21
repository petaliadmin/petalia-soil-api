/**
 * Interface pour les coordonnées GeoJSON Point
 * Format: [longitude, latitude]
 */
export interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * Interface pour la localisation complète d'une terre
 */
export interface Location {
  region: string;
  commune: string;
  coordinates: GeoJsonPoint;
}
