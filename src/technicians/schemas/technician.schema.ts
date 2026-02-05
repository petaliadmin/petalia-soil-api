import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TechnicianStatus, SenegalRegion } from '../../common/enums';
import { randomBytes } from 'crypto';

export type TechnicianDocument = Technician & Document;

/**
 * Génère un code d'accès unique pour le technicien
 * Format: TECH-XXXXXX (6 caractères alphanumériques)
 */
function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from(randomBytes(6))
    .map((byte) => chars[byte % chars.length])
    .join('');
  return `TECH-${randomPart}`;
}

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

  @Prop({ unique: true })
  accessCode: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TechnicianSchema = SchemaFactory.createForClass(Technician);

// Générer le code d'accès avant la sauvegarde
TechnicianSchema.pre('save', function (next) {
  if (!this.accessCode) {
    this.accessCode = generateAccessCode();
  }
  next();
});

// Index pour les requêtes courantes
TechnicianSchema.index({ status: 1 });
TechnicianSchema.index({ coverageRegions: 1 });
TechnicianSchema.index({ email: 1 });
TechnicianSchema.index({ accessCode: 1 }, { unique: true });
