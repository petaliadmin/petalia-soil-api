import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SoilTexture } from '../../common/enums';

/**
 * Schema pour les paramètres du sol
 * Sous-document utilisé dans le schema Land
 */
@Schema({ _id: false })
export class SoilParameters {
  @Prop({ required: true, min: 0, max: 14 })
  ph: number;

  @Prop({ required: true, min: 0 })
  nitrogen: number;

  @Prop({ required: true, min: 0 })
  phosphorus: number;

  @Prop({ required: true, min: 0 })
  potassium: number;

  @Prop({ 
    required: true, 
    enum: SoilTexture 
  })
  soilTexture: SoilTexture;

  @Prop({ min: 0, max: 100 })
  moisture?: number;
}

export const SoilParametersSchema = SchemaFactory.createForClass(SoilParameters);
