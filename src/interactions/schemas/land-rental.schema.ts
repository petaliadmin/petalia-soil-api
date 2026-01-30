import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RentalStatus } from '../../common/enums';

export type LandRentalDocument = LandRental & Document;

/**
 * Schema MongoDB pour les demandes de location de terres
 */
@Schema({ timestamps: true })
export class LandRental {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Land',
    required: true,
  })
  landId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: RentalStatus,
    default: RentalStatus.PENDING,
  })
  status: RentalStatus;

  @Prop()
  message?: string;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  ownerResponse?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LandRentalSchema = SchemaFactory.createForClass(LandRental);

// Index pour les requêtes courantes
LandRentalSchema.index({ userId: 1, status: 1 });
LandRentalSchema.index({ landId: 1, status: 1 });
LandRentalSchema.index({ userId: 1, landId: 1 });
