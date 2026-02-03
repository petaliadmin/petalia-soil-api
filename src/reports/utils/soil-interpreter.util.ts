import { SoilParameters } from '../../soil/schemas/soil-parameters.schema';
import { SoilTexture, DrainageQuality } from '../../common/enums';
import {
  SoilAnalysisSection,
  SoilHealthDiagnosis,
  ParameterInterpretation,
  NutrientLevel,
} from '../interfaces/report-data.interface';

/**
 * Interpreteur agronomique des parametres du sol
 * Fournit des diagnostics detailles en francais
 */
export class SoilInterpreter {
  /**
   * Interprete l'ensemble des parametres du sol
   */
  static interpretSoil(soil: SoilParameters): SoilAnalysisSection {
    const result: SoilAnalysisSection = {
      ph: this.interpretPh(soil.ph),
      nitrogen: this.interpretNutrient('Azote', soil.npk.nitrogen, [10, 20, 40, 80]),
      phosphorus: this.interpretNutrient('Phosphore', soil.npk.phosphorus, [10, 20, 40, 60]),
      potassium: this.interpretNutrient('Potassium', soil.npk.potassium, [20, 40, 80, 150]),
      texture: this.interpretTexture(soil.texture),
      drainage: this.interpretDrainage(soil.drainage),
      moisture: this.interpretMoisture(soil.moisture),
    };

    if (soil.organicMatter !== undefined && soil.organicMatter !== null) {
      result.organicMatter = this.interpretOrganicMatter(soil.organicMatter);
    }

    if (soil.salinity !== undefined && soil.salinity !== null) {
      result.salinity = this.interpretSalinity(soil.salinity);
    }

    if (soil.cec !== undefined && soil.cec !== null) {
      result.cec = this.interpretCEC(soil.cec);
    }

    return result;
  }

  /**
   * Diagnostic global de la sante du sol
   */
  static diagnoseHealth(soil: SoilParameters): SoilHealthDiagnosis {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    let totalScore = 0;
    let factors = 0;

    // pH (25% du score)
    const phScore = this.getPhScore(soil.ph);
    totalScore += phScore * 25;
    factors += 25;
    if (phScore >= 0.8) {
      strengths.push('pH du sol equilibre, favorable a la majorite des cultures');
    } else if (phScore < 0.5) {
      weaknesses.push(
        soil.ph < 5.5
          ? 'Sol trop acide, necessite un chaulage'
          : 'Sol trop alcalin, risque de carences en micronutriments',
      );
    }

    // Azote (10%)
    const nScore = this.getNutrientScore(soil.npk.nitrogen, [10, 20, 40, 80]);
    totalScore += nScore * 10;
    factors += 10;
    if (nScore >= 0.8) strengths.push('Bonne teneur en azote');
    else if (nScore < 0.4) weaknesses.push('Deficit en azote (N), fertilisation necessaire');

    // Phosphore (10%)
    const pScore = this.getNutrientScore(soil.npk.phosphorus, [10, 20, 40, 60]);
    totalScore += pScore * 10;
    factors += 10;
    if (pScore >= 0.8) strengths.push('Bonne teneur en phosphore');
    else if (pScore < 0.4) weaknesses.push('Deficit en phosphore (P), apport recommande');

    // Potassium (10%)
    const kScore = this.getNutrientScore(soil.npk.potassium, [20, 40, 80, 150]);
    totalScore += kScore * 10;
    factors += 10;
    if (kScore >= 0.8) strengths.push('Bonne teneur en potassium');
    else if (kScore < 0.4) weaknesses.push('Deficit en potassium (K), apport necessaire');

    // Texture (15%)
    const textureScore = this.getTextureScore(soil.texture);
    totalScore += textureScore * 15;
    factors += 15;
    if (textureScore >= 0.8) strengths.push('Texture du sol equilibree (limoneuse), ideale pour la plupart des cultures');
    else if (soil.texture === SoilTexture.SANDY) weaknesses.push('Sol sableux, faible retention en eau et nutriments');
    else if (soil.texture === SoilTexture.CLAY) weaknesses.push('Sol argileux, risque de compaction et mauvais drainage');

    // Drainage (10%)
    const drainageScore = this.getDrainageScore(soil.drainage);
    totalScore += drainageScore * 10;
    factors += 10;
    if (drainageScore >= 0.8) strengths.push('Bon drainage du sol');
    else if (drainageScore < 0.4) weaknesses.push('Drainage insuffisant, risque d\'engorgement');

    // Matiere organique (15%)
    if (soil.organicMatter !== undefined && soil.organicMatter !== null) {
      const omScore = this.getOrganicMatterScore(soil.organicMatter);
      totalScore += omScore * 15;
      factors += 15;
      if (omScore >= 0.8) strengths.push('Bonne teneur en matiere organique');
      else if (omScore < 0.4) weaknesses.push('Faible teneur en matiere organique, apport de compost indispensable');
    }

    // Humidite (5%)
    const moistureScore = this.getMoistureScore(soil.moisture, soil.texture);
    totalScore += moistureScore * 5;
    factors += 5;
    if (moistureScore >= 0.8) strengths.push('Niveau d\'humidite adequat');
    else if (moistureScore < 0.4) weaknesses.push('Humidite du sol inadequate');

    const overallScore = Math.round((totalScore / factors) * 100);
    const overallLevel = this.getOverallLevel(overallScore);

    const summary = this.generateSummary(overallScore, overallLevel, strengths, weaknesses);

    return { overallScore, overallLevel, strengths, weaknesses, summary };
  }

  // --- Methodes d'interpretation individuelles ---

  private static interpretPh(ph: number): ParameterInterpretation {
    let level: string;
    let interpretation: string;

    if (ph < 4.5) {
      level = 'Tres acide';
      interpretation = 'Sol tres acide. Le chaulage est indispensable avant toute mise en culture. Risque de toxicite aluminique pour les plantes.';
    } else if (ph < 5.5) {
      level = 'Acide';
      interpretation = 'Sol acide. Un amendement calcaire est recommande pour ameliorer la disponibilite des nutriments et favoriser l\'activite biologique.';
    } else if (ph < 6.5) {
      level = 'Legerement acide';
      interpretation = 'Sol legerement acide. Conditions favorables pour la plupart des cultures tropicales et subtropicales du Senegal.';
    } else if (ph < 7.5) {
      level = 'Neutre';
      interpretation = 'pH optimal. Excellente disponibilite des nutriments et bonne activite biologique du sol.';
    } else if (ph < 8.5) {
      level = 'Alcalin';
      interpretation = 'Sol alcalin. Attention aux carences possibles en fer, zinc et manganese. Frequemment observe dans les zones saheliennes.';
    } else {
      level = 'Tres alcalin';
      interpretation = 'Sol tres alcalin. Amendement au soufre recommande. Nombreuses carences en micronutriments possibles.';
    }

    return { value: ph, level, interpretation };
  }

  private static interpretNutrient(
    name: string,
    value: number,
    thresholds: [number, number, number, number],
  ): ParameterInterpretation {
    const [t1, t2, t3, t4] = thresholds;
    let level: NutrientLevel;
    let interpretation: string;

    if (value < t1) {
      level = 'deficient';
      interpretation = `Carence severe en ${name.toLowerCase()}. Un apport correctif urgent est necessaire pour assurer une production viable.`;
    } else if (value < t2) {
      level = 'bas';
      interpretation = `Teneur faible en ${name.toLowerCase()}. Un apport complementaire est recommande pour optimiser les rendements.`;
    } else if (value < t3) {
      level = 'modere';
      interpretation = `Teneur moderee en ${name.toLowerCase()}. Suffisant pour des cultures peu exigeantes, mais un complement peut etre benefique pour les cultures gourmandes.`;
    } else if (value < t4) {
      level = 'bon';
      interpretation = `Bonne teneur en ${name.toLowerCase()}. Niveau adequat pour la majorite des cultures.`;
    } else {
      level = 'excessif';
      interpretation = `Teneur elevee en ${name.toLowerCase()}. Reduire les apports pour eviter les desequilibres et la pollution.`;
    }

    return { value, level, interpretation };
  }

  private static interpretTexture(texture: SoilTexture): { value: string; interpretation: string } {
    const textures: Record<SoilTexture, { label: string; interpretation: string }> = {
      [SoilTexture.SANDY]: {
        label: 'Sableux',
        interpretation: 'Sol sableux a faible retention en eau et en nutriments. Bonne aeration et facilite de travail. Privilegier le paillage et les apports organiques reguliers pour ameliorer la structure.',
      },
      [SoilTexture.CLAY]: {
        label: 'Argileux',
        interpretation: 'Sol argileux avec forte capacite de retention en eau et nutriments. Peut etre difficile a travailler. Ameliorer la structure par des apports de compost et eviter le travail du sol en conditions humides.',
      },
      [SoilTexture.LOAMY]: {
        label: 'Limoneux',
        interpretation: 'Sol limoneux equilibre, ideal pour l\'agriculture. Bonne retention en eau, bonne aeration et bonne fertilite naturelle. Le meilleur type de sol pour la plupart des cultures.',
      },
      [SoilTexture.SILTY]: {
        label: 'Silteux',
        interpretation: 'Sol silteux, bonne retention en eau mais sensible a la battance et a l\'erosion. Maintenir une couverture vegetale permanente et incorporer de la matiere organique.',
      },
      [SoilTexture.PEATY]: {
        label: 'Tourbeux',
        interpretation: 'Sol tourbeux riche en matiere organique. Tres bonne retention en eau mais peut etre trop acide. Verifier le pH regulierement et drainer si necessaire.',
      },
      [SoilTexture.CHALKY]: {
        label: 'Calcaire',
        interpretation: 'Sol calcaire a pH generalement eleve. Bonne structure mais risque de blocage du fer et du phosphore. Apports de matiere organique acide recommandes.',
      },
    };

    const t = textures[texture];
    return { value: t.label, interpretation: t.interpretation };
  }

  private static interpretDrainage(drainage: DrainageQuality): { value: string; interpretation: string } {
    const drainages: Record<DrainageQuality, { label: string; interpretation: string }> = {
      [DrainageQuality.EXCELLENT]: {
        label: 'Excellent',
        interpretation: 'Drainage excellent. L\'eau s\'infiltre rapidement (moins de 24h). Ideal pour les cultures fruitieres et le maraichage. Attention a l\'irrigation en saison seche.',
      },
      [DrainageQuality.GOOD]: {
        label: 'Bon',
        interpretation: 'Bon drainage. L\'eau s\'evacue en 1 a 3 jours. Convient a la grande majorite des cultures tropicales et maraicheres.',
      },
      [DrainageQuality.MODERATE]: {
        label: 'Modere',
        interpretation: 'Drainage modere. L\'eau met 3 a 7 jours pour s\'evacuer. Convient aux cereales et a certaines cultures maraicheres. Eviter les cultures sensibles a l\'exces d\'eau.',
      },
      [DrainageQuality.POOR]: {
        label: 'Mauvais',
        interpretation: 'Mauvais drainage. Risque d\'engorgement et d\'asphyxie racinaire. Convient a la riziculture irriguee. Pour d\'autres cultures, amenager des billons ou des planches sureleves.',
      },
    };

    const d = drainages[drainage];
    return { value: d.label, interpretation: d.interpretation };
  }

  private static interpretOrganicMatter(om: number): ParameterInterpretation {
    let level: string;
    let interpretation: string;

    if (om < 1) {
      level = 'Tres faible';
      interpretation = 'Teneur tres faible en matiere organique. Le sol manque de vie biologique et de capacite de retention. Apport massif de compost (15-20 t/ha) indispensable.';
    } else if (om < 2) {
      level = 'Faible';
      interpretation = 'Teneur faible en matiere organique. Situation courante dans les zones saheliennes. Apporter 10-15 t/ha de compost et pratiquer l\'enfouissement des residus de culture.';
    } else if (om < 3) {
      level = 'Moderee';
      interpretation = 'Teneur moderee en matiere organique. Maintenir le niveau par des apports reguliers de compost (5-10 t/ha/an) et la rotation avec des legumineuses.';
    } else if (om < 5) {
      level = 'Bonne';
      interpretation = 'Bonne teneur en matiere organique. Sol biologiquement actif avec une bonne capacite de retention en eau et en nutriments. Maintenir par des pratiques conservatoires.';
    } else {
      level = 'Tres bonne';
      interpretation = 'Excellente teneur en matiere organique. Sol tres fertile et biologiquement actif. Situation ideale pour une agriculture durable et performante.';
    }

    return { value: om, level, interpretation };
  }

  private static interpretMoisture(moisture: number): ParameterInterpretation {
    let level: string;
    let interpretation: string;

    if (moisture < 15) {
      level = 'Tres sec';
      interpretation = 'Sol tres sec, stress hydrique severe. Irrigation indispensable. Privilegier des cultures resistantes a la secheresse (mil, sorgho, niebe).';
    } else if (moisture < 30) {
      level = 'Sec';
      interpretation = 'Sol sec. Irrigation recommandee pour les cultures maraicheres. Les cereales pluviales peuvent s\'adapter en saison des pluies.';
    } else if (moisture < 50) {
      level = 'Modere';
      interpretation = 'Humidite moderee. Conditions acceptables pour la plupart des cultures. Surveiller l\'humidite en periode seche.';
    } else if (moisture < 70) {
      level = 'Humide';
      interpretation = 'Sol bien humide. Conditions favorables pour le maraichage et les cultures exigeantes en eau. Attention au drainage en cas de fortes pluies.';
    } else {
      level = 'Tres humide';
      interpretation = 'Sol tres humide, risque d\'engorgement. Convient a la riziculture. Pour les autres cultures, ameliorer le drainage.';
    }

    return { value: moisture, level, interpretation };
  }

  private static interpretSalinity(salinity: number): ParameterInterpretation {
    let level: string;
    let interpretation: string;

    if (salinity < 0.5) {
      level = 'Non salin';
      interpretation = 'Sol non salin. Aucune contrainte liee a la salinite.';
    } else if (salinity < 2) {
      level = 'Legerement salin';
      interpretation = 'Sol legerement salin. La plupart des cultures tolerent ce niveau. Surveiller l\'evolution et eviter l\'accumulation de sels.';
    } else if (salinity < 4) {
      level = 'Moderement salin';
      interpretation = 'Sol moderement salin. Choisir des cultures tolerantes au sel (sorgho, orge). Lessiver le sol periodiquement.';
    } else {
      level = 'Tres salin';
      interpretation = 'Sol tres salin. Seules les cultures halophytes supportent ce niveau. Drainage et lessivage urgents necessaires.';
    }

    return { value: salinity, level, interpretation };
  }

  private static interpretCEC(cec: number): ParameterInterpretation {
    let level: string;
    let interpretation: string;

    if (cec < 5) {
      level = 'Tres faible';
      interpretation = 'Capacite d\'echange tres faible. Le sol retient tres peu les nutriments. Apports frequents mais en petites doses recommandes (fertilisation fractionnee).';
    } else if (cec < 10) {
      level = 'Faible';
      interpretation = 'Capacite d\'echange faible. Caracteristique des sols sableux. Fractionner les apports d\'engrais pour limiter les pertes par lessivage.';
    } else if (cec < 20) {
      level = 'Moyenne';
      interpretation = 'Capacite d\'echange correcte. Le sol retient convenablement les nutriments apportes.';
    } else if (cec < 40) {
      level = 'Bonne';
      interpretation = 'Bonne capacite d\'echange. Le sol est un bon reservoir de nutriments. Fertilisation classique efficace.';
    } else {
      level = 'Elevee';
      interpretation = 'Capacite d\'echange elevee. Caracteristique des sols argileux ou riches en matiere organique. Excellent pouvoir tampon.';
    }

    return { value: cec, level, interpretation };
  }

  // --- Scores pour le diagnostic global ---

  private static getPhScore(ph: number): number {
    if (ph >= 6.0 && ph <= 7.0) return 1.0;
    if (ph >= 5.5 && ph < 6.0) return 0.8;
    if (ph > 7.0 && ph <= 7.5) return 0.8;
    if (ph >= 5.0 && ph < 5.5) return 0.6;
    if (ph > 7.5 && ph <= 8.0) return 0.5;
    if (ph >= 4.5 && ph < 5.0) return 0.3;
    if (ph > 8.0 && ph <= 8.5) return 0.3;
    return 0.1;
  }

  private static getNutrientScore(value: number, thresholds: number[]): number {
    const [t1, t2, t3, t4] = thresholds;
    if (value >= t3 && value <= t4) return 1.0;
    if (value >= t2 && value < t3) return 0.7;
    if (value > t4) return 0.6;
    if (value >= t1 && value < t2) return 0.4;
    return 0.1;
  }

  private static getTextureScore(texture: SoilTexture): number {
    const scores: Record<SoilTexture, number> = {
      [SoilTexture.LOAMY]: 1.0,
      [SoilTexture.SILTY]: 0.7,
      [SoilTexture.SANDY]: 0.5,
      [SoilTexture.CLAY]: 0.5,
      [SoilTexture.PEATY]: 0.6,
      [SoilTexture.CHALKY]: 0.4,
    };
    return scores[texture] ?? 0.5;
  }

  private static getDrainageScore(drainage: DrainageQuality): number {
    const scores: Record<DrainageQuality, number> = {
      [DrainageQuality.GOOD]: 1.0,
      [DrainageQuality.EXCELLENT]: 0.9,
      [DrainageQuality.MODERATE]: 0.6,
      [DrainageQuality.POOR]: 0.3,
    };
    return scores[drainage] ?? 0.5;
  }

  private static getOrganicMatterScore(om: number): number {
    if (om >= 3 && om <= 5) return 1.0;
    if (om >= 2 && om < 3) return 0.7;
    if (om > 5) return 0.8;
    if (om >= 1 && om < 2) return 0.4;
    return 0.1;
  }

  private static getMoistureScore(moisture: number, texture: SoilTexture): number {
    // Humidite optimale depend de la texture
    const optimalRanges: Record<SoilTexture, [number, number]> = {
      [SoilTexture.SANDY]: [20, 40],
      [SoilTexture.CLAY]: [40, 65],
      [SoilTexture.LOAMY]: [30, 55],
      [SoilTexture.SILTY]: [30, 55],
      [SoilTexture.PEATY]: [50, 70],
      [SoilTexture.CHALKY]: [25, 45],
    };

    const [min, max] = optimalRanges[texture] || [25, 55];
    if (moisture >= min && moisture <= max) return 1.0;

    const distance = moisture < min ? min - moisture : moisture - max;
    const tolerance = (max - min) * 0.5;
    return Math.max(0.1, 1 - distance / tolerance);
  }

  private static getOverallLevel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Bon';
    if (score >= 50) return 'Moyen';
    if (score >= 35) return 'Faible';
    return 'Critique';
  }

  private static generateSummary(
    score: number,
    level: string,
    strengths: string[],
    weaknesses: string[],
  ): string {
    let summary = `Le sol presente un etat de sante global ${level.toLowerCase()} avec un score de ${score}/100. `;

    if (strengths.length > 0) {
      summary += `Points forts : ${strengths.length} parametre(s) favorable(s). `;
    }

    if (weaknesses.length > 0) {
      summary += `Points a ameliorer : ${weaknesses.length} parametre(s) necessitant une correction. `;
    }

    if (score >= 65) {
      summary += 'Ce sol offre de bonnes conditions pour la mise en culture avec un suivi agronomique adapte.';
    } else if (score >= 50) {
      summary += 'Des amendements cibles permettront d\'ameliorer significativement le potentiel de ce sol.';
    } else {
      summary += 'Un programme de rehabilitation du sol est recommande avant toute mise en culture intensive.';
    }

    return summary;
  }
}
