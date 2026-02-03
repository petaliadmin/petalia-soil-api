import { CropRecommendationResult } from '../../recommendations/recommendations.service';
import { PlantingCalendarEntry } from '../interfaces/report-data.interface';

/**
 * Generateur de calendrier cultural adapte au Senegal
 * Base sur les deux saisons principales : hivernage et saison seche
 */
export class PlantingCalendar {
  /**
   * Genere un calendrier cultural sur 12 mois
   */
  static generateCalendar(
    recommendations: CropRecommendationResult[],
    region?: string,
  ): PlantingCalendarEntry[] {
    const topCrops = recommendations.slice(0, 8);
    const calendar: PlantingCalendarEntry[] = [];

    const months = [
      { name: 'Janvier', season: 'Saison seche (fraiche)', index: 0 },
      { name: 'Fevrier', season: 'Saison seche (fraiche)', index: 1 },
      { name: 'Mars', season: 'Saison seche (chaude)', index: 2 },
      { name: 'Avril', season: 'Transition vers hivernage', index: 3 },
      { name: 'Mai', season: 'Preparation hivernage', index: 4 },
      { name: 'Juin', season: 'Debut hivernage', index: 5 },
      { name: 'Juillet', season: 'Hivernage', index: 6 },
      { name: 'Aout', season: 'Hivernage (pic des pluies)', index: 7 },
      { name: 'Septembre', season: 'Hivernage', index: 8 },
      { name: 'Octobre', season: 'Fin hivernage', index: 9 },
      { name: 'Novembre', season: 'Debut saison seche', index: 10 },
      { name: 'Decembre', season: 'Saison seche (fraiche)', index: 11 },
    ];

    for (const month of months) {
      const activities = this.getActivities(month.index, region);
      const crops = this.getCropsForMonth(month.index, topCrops);

      calendar.push({
        month: month.name,
        season: month.season,
        activities,
        recommendedCrops: crops,
      });
    }

    return calendar;
  }

  private static getActivities(monthIndex: number, region?: string): string[] {
    const activities: Record<number, string[]> = {
      0: [ // Janvier
        'Recolte des cultures maraicheres de contre-saison',
        'Entretien du maraichage irrigue',
        'Taille des arbres fruitiers',
      ],
      1: [ // Fevrier
        'Poursuite du maraichage irrigue',
        'Recolte mangues precoces (sud)',
        'Planification de la campagne hivernale',
      ],
      2: [ // Mars
        'Recolte des dernieres cultures de contre-saison',
        'Debut recolte mangues',
        'Preparation des semences',
      ],
      3: [ // Avril
        'Preparation des sols (labour, hersage)',
        'Epandage de compost et fumure de fond',
        'Chaulage si necessaire',
        'Achat des intrants (semences, engrais)',
      ],
      4: [ // Mai
        'Fin de la preparation des sols',
        'Application des amendements calcaires',
        'Nettoyage et amenagement des parcelles',
        'Premieres pluies : preparation des semis',
      ],
      5: [ // Juin
        'Semis des cereales (mil, sorgho, mais)',
        'Semis des legumineuses (arachide, niebe)',
        'Application engrais de fond NPK',
        'Mise en place de la riziculture',
      ],
      6: [ // Juillet
        '1er sarclage et demariage',
        '1ere application uree de couverture',
        'Semis du riz en pepiniere ou repiquage',
        'Surveillance phytosanitaire',
      ],
      7: [ // Aout
        '2eme sarclage',
        '2eme application uree',
        'Surveillance des ravageurs et maladies',
        'Buttage du mais et du mil',
      ],
      8: [ // Septembre
        'Epiaison et maturation des cereales',
        'Recolte precoce du niebe',
        'Preparation des pepinieres maraicheres',
        'Surveillance des oiseaux granivores',
      ],
      9: [ // Octobre
        'Recolte des cereales (mil, sorgho)',
        'Recolte de l\'arachide',
        'Preparation des parcelles maraicheres',
        'Semis du maraichage de contre-saison',
      ],
      10: [ // Novembre
        'Poursuite des recoltes',
        'Installation des cultures maraicheres',
        'Mise en place de l\'irrigation',
        'Semis tomates, oignons, choux',
      ],
      11: [ // Decembre
        'Entretien du maraichage',
        'Recolte du riz',
        'Commercialisation des produits',
        'Bilan de la campagne et planification',
      ],
    };

    const monthActivities = [...(activities[monthIndex] || [])];

    // Ajout de conseils specifiques par region
    if (region) {
      const regionalTip = this.getRegionalTip(monthIndex, region);
      if (regionalTip) {
        monthActivities.push(regionalTip);
      }
    }

    return monthActivities;
  }

  private static getCropsForMonth(
    monthIndex: number,
    recommendations: CropRecommendationResult[],
  ): string[] {
    const cropSeasons: Record<string, number[]> = {
      // Cereales (hivernage)
      'Mil': [5, 6, 7, 8, 9],
      'Sorgho': [5, 6, 7, 8, 9],
      'Mais': [5, 6, 7, 8],
      'Riz': [6, 7, 8, 9, 10, 11],
      'Fonio': [6, 7, 8, 9],
      // Legumineuses
      'Arachide': [5, 6, 7, 8, 9],
      'Niebe': [5, 6, 7, 8],
      'Soja': [6, 7, 8, 9],
      // Maraichage (contre-saison)
      'Tomate': [10, 11, 0, 1, 2, 3, 4],
      'Oignon': [9, 10, 11, 0, 1, 2, 3],
      'Chou': [10, 11, 0, 1, 2, 3],
      'Carotte': [9, 10, 11, 0, 1, 2],
      'Laitue': [10, 11, 0, 1, 2],
      'Haricot Vert': [10, 11, 0, 1, 2],
      'Gombo': [5, 6, 7, 8, 9, 10],
      'Aubergine': [10, 11, 0, 1, 2, 3, 4],
      'Piment': [9, 10, 11, 0, 1, 2, 3, 4],
      'Poivron': [9, 10, 11, 0, 1, 2, 3, 4],
      'Courge': [6, 7, 8, 9],
      // Industrielles
      'Coton': [5, 6, 7, 8, 9, 10],
      'Sesame': [6, 7, 8, 9],
      'Canne a Sucre': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      'Bissap': [6, 7, 8, 9, 10],
      // Fruits (toute l'annee mais recolte saisonniere)
      'Mangue': [2, 3, 4, 5, 6],
      'Banane': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      'Pasteque': [5, 6, 7, 8, 9],
      'Melon': [5, 6, 7, 8, 9],
      'Papaye': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      'Anacarde': [2, 3, 4],
      'Agrumes': [10, 11, 0, 1],
      // Tubercules
      'Manioc': [5, 6, 7, 8, 9, 10, 11, 0],
      'Patate Douce': [6, 7, 8, 9, 10, 11],
    };

    return recommendations
      .filter((rec) => {
        const months = cropSeasons[rec.name];
        return months && months.includes(monthIndex);
      })
      .map((rec) => rec.name);
  }

  private static getRegionalTip(monthIndex: number, region: string): string | null {
    const regionLower = region.toLowerCase();

    // Niayes / Zone cotiere
    if (regionLower.includes('dakar') || regionLower.includes('thies')) {
      if (monthIndex >= 10 || monthIndex <= 3) {
        return 'Zone des Niayes : periode optimale pour le maraichage irrigue';
      }
    }

    // Vallee du fleuve
    if (regionLower.includes('saint-louis') || regionLower.includes('matam')) {
      if (monthIndex >= 6 && monthIndex <= 10) {
        return 'Vallee du fleuve : campagne rizicole irriguee en cours';
      }
      if (monthIndex >= 1 && monthIndex <= 5) {
        return 'Vallee du fleuve : contre-saison chaude, cultures irriguees possibles';
      }
    }

    // Casamance
    if (regionLower.includes('ziguinchor') || regionLower.includes('sedhiou') || regionLower.includes('kolda')) {
      if (monthIndex >= 5 && monthIndex <= 9) {
        return 'Casamance : pluviometrie elevee, attention a l\'exces d\'eau sur les bas-fonds';
      }
    }

    // Bassin arachidier
    if (regionLower.includes('kaolack') || regionLower.includes('kaffrine') || regionLower.includes('fatick') || regionLower.includes('diourbel')) {
      if (monthIndex >= 5 && monthIndex <= 6) {
        return 'Bassin arachidier : semis de l\'arachide des les premieres pluies utiles';
      }
    }

    return null;
  }
}
