import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ServiceOfferStatus } from '../../common/enums/marketplace.enum';

export type ServiceOfferDocument = ServiceOffer & Document;

@Schema({ timestamps: true })
export class ServiceOffer {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  })
  provider: MongooseSchema.Types.ObjectId;

  // ─── Informations de l'offre ──────────────────────────────────────
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: String })
  category: string;  // Ex: "Analyse de sol", "Fourniture d'engrais NPK"

  @Prop({ type: [String], default: [] })
  tags: string[];    // Mots-clés pour la recherche

  // ─── Tarification ────────────────────────────────────────────────
  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 'FCFA' })
  currency: string;

  @Prop({ required: true, trim: true })
  priceUnit: string;  // "par hectare", "par analyse", "par jour", "le litre"...

  @Prop({ default: false })
  isNegotiable: boolean;

  @Prop({ min: 0 })
  minQuantity?: number;   // Quantité minimale de commande

  // ─── Disponibilité ───────────────────────────────────────────────
  @Prop({ type: [String], default: [] })
  availableRegions: string[];

  @Prop({ default: true })
  isAvailableNationwide: boolean;

  @Prop({ trim: true })
  deliveryTime?: string;  // "24h", "3-5 jours", "selon disponibilité"

  // ─── Médias ──────────────────────────────────────────────────────
  @Prop({ type: [String], default: [] })
  images: string[];

  // ─── Statut ──────────────────────────────────────────────────────
  @Prop({
    type: String,
    enum: Object.values(ServiceOfferStatus),
    default: ServiceOfferStatus.ACTIVE,
  })
  status: ServiceOfferStatus;

  // ─── Statistiques ────────────────────────────────────────────────
  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  requestCount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ServiceOfferSchema = SchemaFactory.createForClass(ServiceOffer);

ServiceOfferSchema.index({ provider: 1 });
ServiceOfferSchema.index({ status: 1 });
ServiceOfferSchema.index({ category: 1 });
ServiceOfferSchema.index({ availableRegions: 1 });
