import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Schema pour les coordonnées GeoJSON Point
 */
@Schema({ _id: false })
class GeoJsonPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: [number, number]; // [longitude, latitude]
}

const GeoJsonPointSchema = SchemaFactory.createForClass(GeoJsonPoint);

/**
 * Schema pour la localisation d'une terre
 */
@Schema({ _id: false })
export class Location {
  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  commune: string;

  @Prop({ type: GeoJsonPointSchema, required: true })
  coordinates: GeoJsonPoint;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
