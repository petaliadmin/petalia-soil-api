import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { VisitTrackerService } from './visit-tracker.service';
import { Land, LandSchema } from './schemas/land.schema';
import { UserVisit, UserVisitSchema } from '../interactions/schemas';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SoilAnalysisRequest, SoilAnalysisRequestSchema } from '../soil-analysis-requests/schemas/soil-analysis-request.schema';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { MarketplaceModule } from '../market-place/marketplace.module';
import { ReportsService } from '../reports/reports.service';
import { PdfGeneratorService } from '../reports/pdf/pdf-generator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Land.name, schema: LandSchema },
      { name: UserVisit.name, schema: UserVisitSchema },
      { name: User.name, schema: UserSchema },
      { name: SoilAnalysisRequest.name, schema: SoilAnalysisRequestSchema },
    ]),
    RecommendationsModule,
    forwardRef(() => MarketplaceModule),
  ],
  controllers: [LandsController],
  providers: [LandsService, VisitTrackerService, ReportsService, PdfGeneratorService],
  exports: [LandsService],
})
export class LandsModule {}
