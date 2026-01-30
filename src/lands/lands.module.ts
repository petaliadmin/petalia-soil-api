import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { VisitTrackerService } from './visit-tracker.service';
import { Land, LandSchema } from './schemas/land.schema';
import { UserVisit, UserVisitSchema } from '../interactions/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Land.name, schema: LandSchema },
      { name: UserVisit.name, schema: UserVisitSchema },
    ]),
  ],
  controllers: [LandsController],
  providers: [LandsService, VisitTrackerService],
  exports: [LandsService],
})
export class LandsModule {}
