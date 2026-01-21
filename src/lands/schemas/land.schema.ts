import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { LandType } from '../../common/enums';
import { Location, LocationSchema } from './location.schema';
import { SoilParameters, SoilParametersSchema } from '../../soil/schemas/soil-parameters.schema';

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
  surfaceHectares: number;

  @Prop({ 
    required: true, 
    enum: LandType 
  })
  type: LandType;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  })
  owner: MongooseSchema.Types.ObjectId;

  @Prop({ type: LocationSchema, required: true })
  location: Location;

  @Prop({ type: SoilParametersSchema, required: true })
  soil: SoilParameters;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LandSchema = SchemaFactory.createForClass(Land);

// Index géospatial pour les requêtes de proximité
LandSchema.index({ 'location.coordinates': '2dsphere' });

// Index pour les filtres courants
LandSchema.index({ type: 1, isAvailable: 1 });
LandSchema.index({ owner: 1 });
LandSchema.index({ 'soil.ph': 1 });
LandSchema.index({ surfaceHectares: 1 });
