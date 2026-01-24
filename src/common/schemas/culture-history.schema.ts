import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Schema pour l'historique des cultures
 */
@Schema({ _id: false })
export class CultureHistory {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  crop: string;

  @Prop()
  yield?: string;

  @Prop()
  notes?: string;
}

export const CultureHistorySchema = SchemaFactory.createForClass(CultureHistory);
