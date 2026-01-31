import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechniciansController } from './technicians.controller';
import { MissionsController } from './missions.controller';
import { TechniciansService } from './technicians.service';
import { MissionsService } from './missions.service';
import { Technician, TechnicianSchema } from './schemas/technician.schema';
import { Mission, MissionSchema } from './schemas/mission.schema';
import {
  SoilAnalysisRequest,
  SoilAnalysisRequestSchema,
} from '../soil-analysis-requests/schemas/soil-analysis-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Technician.name, schema: TechnicianSchema },
      { name: Mission.name, schema: MissionSchema },
      { name: SoilAnalysisRequest.name, schema: SoilAnalysisRequestSchema },
    ]),
  ],
  controllers: [TechniciansController, MissionsController],
  providers: [TechniciansService, MissionsService],
  exports: [TechniciansService, MissionsService],
})
export class TechniciansModule {}
