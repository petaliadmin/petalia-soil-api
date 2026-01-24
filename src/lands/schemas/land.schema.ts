import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { LandType, LandStatus } from '../../common/enums';
import { Location, LocationSchema } from './location.schema';
import { SoilParameters, SoilParametersSchema } from '../../soil/schemas/soil-parameters.schema';
import {
  Address,
  AddressSchema,
  CropRecommendation,
  CropRecommendationSchema,
  CultureHistory,
  CultureHistorySchema,
} from '../../common/schemas';

export type LandDocument = Land & Document;

/**
 * Schema MongoDB pour les terres agricoles
 */
@Schema({ timestamps: true })
export class Land {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  surface: number;

  @Prop({ required: true, enum: LandType })
  type: LandType;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 'FCFA' })
  priceUnit: string;

  @Prop()
  pricePerHectare: number;

  @Prop({
    required: true,
    enum: LandStatus,
    default: LandStatus.AVAILABLE,
  })
  status: LandStatus;

  @Prop({ type: LocationSchema, required: true })
  location: Location;

  @Prop({ type: AddressSchema, required: true })
  address: Address;

  @Prop({ type: SoilParametersSchema, required: true })
  soilParameters: SoilParameters;

  @Prop({ type: [CropRecommendationSchema], default: [] })
  recommendedCrops: CropRecommendation[];

  @Prop({ type: [CultureHistorySchema], default: [] })
  cultureHistory: CultureHistory[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner: MongooseSchema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  thumbnail: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  favorites: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LandSchema = SchemaFactory.createForClass(Land);

// Index géospatial pour les requêtes de proximité
LandSchema.index({ location: '2dsphere' });

// Index pour les filtres courants
LandSchema.index({ type: 1, status: 1 });
LandSchema.index({ owner: 1 });
LandSchema.index({ 'soilParameters.ph': 1 });
LandSchema.index({ surface: 1 });
LandSchema.index({ 'address.region': 1 });
LandSchema.index({ 'address.city': 1 });

// Middleware pour calculer pricePerHectare avant sauvegarde
LandSchema.pre('save', function (next) {
  if (this.surface > 0) {
    this.pricePerHectare = Math.round(this.price / this.surface);
  }
  next();
});
