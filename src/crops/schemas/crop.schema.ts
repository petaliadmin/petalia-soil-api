import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CropDocument = Crop & Document;

class RangeValue {
  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;
}

/**
 * Schema MongoDB pour les cultures
 */
@Schema({ timestamps: true })
export class Crop {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({
    required: true,
    enum: ['cereales', 'legumineuses', 'tubercules', 'maraichage', 'industrielles', 'fruits'],
  })
  category: string;

  @Prop({ required: true })
  season: string;

  @Prop({ type: RangeValue, required: true })
  phRange: RangeValue;

  @Prop({ type: RangeValue, required: true })
  nitrogenRange: RangeValue;

  @Prop({ type: RangeValue, required: true })
  phosphorusRange: RangeValue;

  @Prop({ type: RangeValue, required: true })
  potassiumRange: RangeValue;

  @Prop({ type: RangeValue, required: true })
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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CropSchema = SchemaFactory.createForClass(Crop);

// Index pour les recherches courantes
CropSchema.index({ category: 1 });
CropSchema.index({ name: 'text' });
CropSchema.index({ preferredTextures: 1 });
CropSchema.index({ preferredDrainage: 1 });
