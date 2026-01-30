import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * Service léger pour tracker les visites
 * Séparé pour éviter les dépendances circulaires
 */
@Injectable()
export class VisitTrackerService {
  constructor(
    @InjectModel('UserVisit') private userVisitModel: Model<any>,
  ) {}

  /**
   * Enregistrer une visite (upsert pour éviter les doublons)
   */
  async recordVisit(userId: string, landId: string): Promise<void> {
    try {
      await this.userVisitModel.findOneAndUpdate(
        { userId, landId },
        { visitedAt: new Date() },
        { upsert: true },
      );
    } catch (error) {
      // Ignorer les erreurs silencieusement pour ne pas bloquer la consultation
      console.error('Erreur lors de l\'enregistrement de la visite:', error);
    }
  }
}
