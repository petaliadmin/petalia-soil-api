import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MissionStatus } from '../../common/enums';

export type MissionDocument = Mission & Document;

/**
 * Schema MongoDB pour les ordres de mission
 */
@Schema({ timestamps: true })
export class Mission {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'SoilAnalysisRequest',
    required: true,
  })
  analysisRequest: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  })
  provider: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  assignedBy: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: MissionStatus,
    default: MissionStatus.ASSIGNED,
  })
  status: MissionStatus;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop()
  completedDate?: Date;

  @Prop({ trim: true })
  instructions?: string;

  @Prop({ trim: true })
  technicianNotes?: string;

  @Prop({ trim: true })
  report?: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MissionSchema = SchemaFactory.createForClass(Mission);

// Index pour les requêtes courantes
MissionSchema.index({ analysisRequest: 1 });
MissionSchema.index({ provider: 1 });
MissionSchema.index({ status: 1 });
MissionSchema.index({ scheduledDate: 1 });
MissionSchema.index({ provider: 1, status: 1 });
