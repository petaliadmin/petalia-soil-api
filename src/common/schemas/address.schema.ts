import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Schema pour l'adresse d'une terre
 */
@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  commune: string;

  @Prop()
  village?: string;

  @Prop()
  fullAddress?: string;

  @Prop({ default: 'Sénégal' })
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
