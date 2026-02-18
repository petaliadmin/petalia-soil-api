import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProviderType } from '../../common/enums/provider-type.enum';
import { ProviderStatus } from '../../common/enums/marketplace.enum';

export type ProviderDocument = Provider & Document;

/**
 * Sous-schema pour les certifications et diplômes
 */
@Schema({ _id: false })
class Certification {
  @Prop({ required: true })
  title: string;

  @Prop()
  institution?: string;

  @Prop()
  year?: number;

  @Prop()
  documentUrl?: string;
}

/**
 * Sous-schema pour les informations de tarification
 */
@Schema({ _id: false })
class PricingInfo {
  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'FCFA' })
  currency: string;

  @Prop({ default: 'par prestation' })
  unit: string; // par jour, par hectare, par analyse, etc.

  @Prop({ default: false })
  isNegotiable: boolean;
}

/**
 * Schema principal du fournisseur de service
 */
@Schema({ timestamps: true })
export class Provider {
  // ─── Informations personnelles / entreprise ───────────────────────
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true })
  whatsapp?: string;

  @Prop()
  avatar?: string;

  @Prop({ trim: true })
  companyName?: string;   // Nom de l'entreprise si applicable

  @Prop({ trim: true })
  taxId?: string;         // NINEA ou numéro fiscal sénégalais

  // ─── Type et spécialisation ───────────────────────────────────────
  @Prop({
    required: true,
    type: String,
    enum: Object.values(ProviderType),
  })
  providerType: ProviderType;

  @Prop({ trim: true })
  specialization?: string;   // Ex: "Analyse de sol", "Cultures maraîchères"

  @Prop({ type: [String], default: [] })
  skills: string[];           // Liste de compétences libres

  @Prop({ type: [Object], default: [] })
  certifications: Certification[];

  @Prop({ type: Number, min: 0, default: 0 })
  yearsOfExperience: number;

  // ─── Zones de couverture ─────────────────────────────────────────
  @Prop({ type: [String], default: [] })
  coverageRegions: string[];

  @Prop({ type: [String], default: [] })
  coverageCommunes: string[];

  @Prop({ default: false })
  nationalCoverage: boolean; // Intervient partout au Sénégal

  // ─── Description et portfolio ─────────────────────────────────────
  @Prop({ trim: true })
  bio?: string;              // Présentation courte

  @Prop({ trim: true })
  description?: string;      // Description longue des services

  @Prop({ type: [String], default: [] })
  portfolioImages: string[];

  @Prop({ type: [String], default: [] })
  portfolioDocuments: string[];

  // ─── Tarification ────────────────────────────────────────────────
  @Prop({ type: Object })
  pricing?: PricingInfo;

  // ─── Réseaux sociaux et web ───────────────────────────────────────
  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  facebookUrl?: string;

  @Prop({ trim: true })
  linkedinUrl?: string;

  // ─── Statut et validation ─────────────────────────────────────────
  @Prop({
    required: true,
    type: String,
    enum: Object.values(ProviderStatus),
    default: ProviderStatus.PENDING,
  })
  status: ProviderStatus;

  @Prop({ trim: true })
  rejectionReason?: string;  // Raison du rejet par l'admin

  @Prop({ default: false })
  isVerified: boolean;       // Identité vérifiée par un admin

  @Prop({ default: false })
  isFeatured: boolean;       // Mis en avant sur la marketplace

  // ─── Statistiques ────────────────────────────────────────────────
  @Prop({ default: 0 })
  completedServices: number;

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: 0 })
  responseRate: number;     // % de demandes auxquelles il répond

  // ─── Code d'accès portail ─────────────────────────────────────────
  @Prop({ sparse: true })
  accessCode?: string;      // Généré après validation par l'admin

  // ─── Timestamps ──────────────────────────────────────────────────
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  approvedAt?: Date;
}

export const ProviderSchema = SchemaFactory.createForClass(Provider);

// Index pour les recherches courantes
ProviderSchema.index({ providerType: 1 });
ProviderSchema.index({ status: 1 });
ProviderSchema.index({ coverageRegions: 1 });
ProviderSchema.index({ isFeatured: 1 });
ProviderSchema.index({ averageRating: -1 });
ProviderSchema.index({ providerType: 1, status: 1, coverageRegions: 1 });

// Index uniques
ProviderSchema.index({ email: 1 }, { unique: true });
ProviderSchema.index({ accessCode: 1 }, { unique: true, sparse: true });