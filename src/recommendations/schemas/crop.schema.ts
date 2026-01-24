import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CropDocument = Crop & Document;

@Schema({ _id: false })
class RangeValue {
  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;
}

const RangeValueSchema = SchemaFactory.createForClass(RangeValue);

/**
 * Schema MongoDB pour les cultures
 */
@Schema({ timestamps: true })
export class Crop {
  @Prop({ required: true, unique: true })
  cropId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  season: string;

  @Prop({ type: RangeValueSchema, required: true })
  phRange: RangeValue;

  @Prop({ type: RangeValueSchema, required: true })
  nitrogenRange: RangeValue;

  @Prop({ type: RangeValueSchema, required: true })
  phosphorusRange: RangeValue;

  @Prop({ type: RangeValueSchema, required: true })
  potassiumRange: RangeValue;

  @Prop({ type: RangeValueSchema, required: true })
  moistureRange: RangeValue;

  @Prop({ type: [String], required: true })
  preferredTextures: string[];

  @Prop({ type: [String], required: true })
  preferredDrainage: string[];

  @Prop({ required: true })
  expectedYield: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;
}

export const CropSchema = SchemaFactory.createForClass(Crop);

// Index pour la recherche
CropSchema.index({ category: 1 });
CropSchema.index({ name: 'text' });
