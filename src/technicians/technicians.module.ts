import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechniciansController } from './technicians.controller';
import { MissionsController } from './missions.controller';
import { TechnicianPortalController } from './technician-portal.controller';
import { TechniciansService } from './technicians.service';
import { MissionsService } from './missions.service';
import { Technician, TechnicianSchema } from './schemas/technician.schema';
import { Mission, MissionSchema } from './schemas/mission.schema';
import {
  SoilAnalysisRequest,
  SoilAnalysisRequestSchema,
} from '../soil-analysis-requests/schemas/soil-analysis-request.schema';
import { LandsModule } from '../lands/lands.module';
import { SoilAnalysisRequestsModule } from '../soil-analysis-requests/soil-analysis-requests.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Technician.name, schema: TechnicianSchema },
      { name: Mission.name, schema: MissionSchema },
      { name: SoilAnalysisRequest.name, schema: SoilAnalysisRequestSchema },
    ]),
    forwardRef(() => LandsModule),
    SoilAnalysisRequestsModule,
  ],
  controllers: [TechniciansController, MissionsController, TechnicianPortalController],
  providers: [TechniciansService, MissionsService],
  exports: [TechniciansService, MissionsService, MongooseModule],
})
export class TechniciansModule {}
