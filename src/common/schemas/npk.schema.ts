import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Schema pour les valeurs NPK du sol
 */
@Schema({ _id: false })
export class NPK {
  @Prop({ required: true, min: 0 })
  nitrogen: number;

  @Prop({ required: true, min: 0 })
  phosphorus: number;

  @Prop({ required: true, min: 0 })
  potassium: number;
}

export const NPKSchema = SchemaFactory.createForClass(NPK);
