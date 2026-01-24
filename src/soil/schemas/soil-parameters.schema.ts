import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SoilTexture, DrainageQuality } from '../../common/enums';
import { NPK, NPKSchema } from '../../common/schemas';

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
}

export const SoilParametersSchema = SchemaFactory.createForClass(SoilParameters);
