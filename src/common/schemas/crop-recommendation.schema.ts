import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Schema pour les recommandations de cultures
 */
@Schema({ _id: false })
export class CropRecommendation {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['excellent', 'good', 'moderate'] })
  suitability: string;

  @Prop()
  icon?: string;

  @Prop()
  season?: string;

  @Prop()
  expectedYield?: string;
}

export const CropRecommendationSchema = SchemaFactory.createForClass(CropRecommendation);
