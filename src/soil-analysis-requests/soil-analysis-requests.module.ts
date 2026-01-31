import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SoilAnalysisRequestsController } from './soil-analysis-requests.controller';
import { SoilAnalysisRequestsService } from './soil-analysis-requests.service';
import {
  SoilAnalysisRequest,
  SoilAnalysisRequestSchema,
} from './schemas/soil-analysis-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SoilAnalysisRequest.name, schema: SoilAnalysisRequestSchema },
    ]),
  ],
  controllers: [SoilAnalysisRequestsController],
  providers: [SoilAnalysisRequestsService],
  exports: [SoilAnalysisRequestsService],
})
export class SoilAnalysisRequestsModule {}
