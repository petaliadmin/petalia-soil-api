import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/enums';
import { ProviderSchema } from '../../market-place/schema/provider.schema';

export type UserDocument = User & Document;

/**
 * Schema MongoDB pour les utilisateurs
 */
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  whatsapp?: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.FARMER,
  })
  role: UserRole;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index pour améliorer les performances de recherche
UserSchema.index({ email: 1 });

ProviderSchema.index({ email: 1 }, { unique: true });
ProviderSchema.index({ accessCode: 1 }, { unique: true, sparse: true });