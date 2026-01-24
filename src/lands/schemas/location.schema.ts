import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Schema pour les coordonnées GeoJSON Point
 */
@Schema({ _id: false })
export class Location {
  @Prop({ required: true, enum: ['Point'], default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: number[]; // [longitude, latitude]
}

export const LocationSchema = SchemaFactory.createForClass(Location);
