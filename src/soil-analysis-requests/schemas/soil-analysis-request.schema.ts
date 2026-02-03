import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AnalysisRequestStatus, SenegalRegion } from '../../common/enums';

export type SoilAnalysisRequestDocument = SoilAnalysisRequest & Document;

/**
 * Sous-schéma pour les coordonnées GPS
 */
@Schema({ _id: false })
export class Coordinates {
  @Prop({ required: true, min: -90, max: 90 })
  latitude: number;

  @Prop({ required: true, min: -180, max: 180 })
  longitude: number;
}

/**
 * Schema MongoDB pour les demandes d'analyse de sol
 */
@Schema({ timestamps: true })
export class SoilAnalysisRequest {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, enum: SenegalRegion })
  region: SenegalRegion;

  @Prop({ required: true, trim: true })
  commune: string;

  @Prop({ required: true, min: 0 })
  surface: number;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Coordinates })
  coordinates?: Coordinates;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Land',
  })
  land?: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: AnalysisRequestStatus,
    default: AnalysisRequestStatus.PENDING,
  })
  status: AnalysisRequestStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SoilAnalysisRequestSchema =
  SchemaFactory.createForClass(SoilAnalysisRequest);

// Index pour les requêtes courantes
SoilAnalysisRequestSchema.index({ status: 1 });
SoilAnalysisRequestSchema.index({ region: 1 });
SoilAnalysisRequestSchema.index({ createdAt: -1 });
SoilAnalysisRequestSchema.index({ email: 1 });
SoilAnalysisRequestSchema.index({ land: 1 });
