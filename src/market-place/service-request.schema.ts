import { ServiceRequestStatus } from '@/common/enums/marketplace.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ServiceRequestDocument = ServiceRequest & Document;

@Schema({ timestamps: true })
export class ServiceRequest {
  // ─── Références ──────────────────────────────────────────────────
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  })
  provider: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ServiceOffer',
  })
  serviceOffer?: MongooseSchema.Types.ObjectId;  // Optionnel - peut être une demande directe

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  requestedBy?: MongooseSchema.Types.ObjectId;  // Si connecté

  // ─── Infos du demandeur (si non connecté) ─────────────────────────
  @Prop({ required: true, trim: true })
  clientName: string;

  @Prop({ required: true, trim: true })
  clientPhone: string;

  @Prop({ trim: true })
  clientEmail?: string;

  @Prop({ trim: true })
  clientRegion?: string;

  @Prop({ trim: true })
  clientCommune?: string;

  // ─── Détails de la demande ────────────────────────────────────────
  @Prop({ required: true, trim: true })
  description: string;   // Ce que le client demande

  @Prop()
  surfaceHectares?: number;   // Surface concernée si applicable

  @Prop({ trim: true })
  preferredDate?: string;     // Date souhaitée pour l'intervention

  @Prop({ trim: true })
  urgency?: string;           // 'urgent', 'normal', 'flexible'

  // ─── Statut et gestion ───────────────────────────────────────────
  @Prop({
    type: String,
    enum: Object.values(ServiceRequestStatus),
    default: ServiceRequestStatus.PENDING,
  })
  status: ServiceRequestStatus;

  @Prop({ trim: true })
  providerResponse?: string;  // Réponse/devis du fournisseur

  @Prop()
  quotedPrice?: number;       // Prix proposé par le fournisseur

  @Prop({ trim: true })
  adminNotes?: string;

  // ─── Suivi post-service ──────────────────────────────────────────
  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop({ trim: true })
  review?: string;

  @Prop()
  completedDate?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ServiceRequestSchema = SchemaFactory.createForClass(ServiceRequest);

ServiceRequestSchema.index({ provider: 1 });
ServiceRequestSchema.index({ requestedBy: 1 });
ServiceRequestSchema.index({ status: 1 });
ServiceRequestSchema.index({ provider: 1, status: 1 });
