import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserFavoriteDocument = UserFavorite & Document;

/**
 * Schema MongoDB pour les terres favorites des utilisateurs
 */
@Schema({ timestamps: true })
export class UserFavorite {
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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserFavoriteSchema = SchemaFactory.createForClass(UserFavorite);

// Index unique pour éviter les doublons
UserFavoriteSchema.index({ userId: 1, landId: 1 }, { unique: true });

// Index pour les requêtes par utilisateur
UserFavoriteSchema.index({ userId: 1 });
