import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TechnicianStatus, SenegalRegion } from '../../common/enums';

export type TechnicianDocument = Technician & Document;

/**
 * Schema MongoDB pour les techniciens agronomes
 */
@Schema({ timestamps: true })
export class Technician {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true })
  whatsapp?: string;

  @Prop()
  avatar?: string;

  @Prop({ trim: true })
  specialization?: string;

  @Prop({ type: [String], enum: SenegalRegion, default: [] })
  coverageRegions: SenegalRegion[];

  @Prop({
    required: true,
    enum: TechnicianStatus,
    default: TechnicianStatus.ACTIVE,
  })
  status: TechnicianStatus;

  @Prop({ default: 0 })
  completedMissions: number;

  @Prop({ trim: true })
  notes?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TechnicianSchema = SchemaFactory.createForClass(Technician);

// Index pour les requêtes courantes
TechnicianSchema.index({ status: 1 });
TechnicianSchema.index({ coverageRegions: 1 });
TechnicianSchema.index({ email: 1 });
