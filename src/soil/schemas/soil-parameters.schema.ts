import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { SoilTexture, DrainageQuality } from '../../common/enums';
import { NPK, NPKSchema } from '../../common/schemas';

/**
 * Sous-schéma pour la localisation de la mesure
 */
@Schema({ _id: false })
export class MeasurementLocation {
  @Prop({ required: true, min: -90, max: 90 })
  latitude: number;

  @Prop({ required: true, min: -180, max: 180 })
  longitude: number;
}

export const MeasurementLocationSchema = SchemaFactory.createForClass(MeasurementLocation);

/**
 * Schema pour les paramètres du sol
 * Sous-document utilisé dans le schema Land
 */
@Schema({ _id: false })
export class SoilParameters {
  @Prop({ required: true, min: 0, max: 14 })
  ph: number;

  @Prop({ type: NPKSchema, required: true })
  npk: NPK;

  @Prop({ required: true, enum: SoilTexture })
  texture: SoilTexture;

  @Prop({ required: true, min: 0, max: 100 })
  moisture: number;

  @Prop({ required: true, enum: DrainageQuality })
  drainage: DrainageQuality;

  @Prop({ min: 0 })
  organicMatter?: number;

  @Prop({ min: 0 })
  salinity?: number;

  @Prop({ min: 0 })
  cec?: number;

  @Prop({ trim: true })
  sensorModel?: string;

  @Prop({ trim: true })
  sensorSerialNumber?: string;

  @Prop()
  measurementDate?: Date;

  @Prop({ type: MeasurementLocationSchema })
  measurementLocation?: MeasurementLocation;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Provider',
  })
  measuredBy?: MongooseSchema.Types.ObjectId;
}

export const SoilParametersSchema = SchemaFactory.createForClass(SoilParameters);
