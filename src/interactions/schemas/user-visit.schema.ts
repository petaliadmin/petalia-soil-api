import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserVisitDocument = UserVisit & Document;

/**
 * Schema MongoDB pour l'historique des visites/consultations de terres
 */
@Schema()
export class UserVisit {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Land',
    required: true,
  })
  landId: MongooseSchema.Types.ObjectId;

  @Prop({ default: Date.now })
  visitedAt: Date;
}

export const UserVisitSchema = SchemaFactory.createForClass(UserVisit);

// Index unique pour éviter les doublons (un seul enregistrement par user/land)
UserVisitSchema.index({ userId: 1, landId: 1 }, { unique: true });

// Index pour les requêtes par utilisateur
UserVisitSchema.index({ userId: 1 });

// Index pour trier par date de visite
UserVisitSchema.index({ visitedAt: -1 });
