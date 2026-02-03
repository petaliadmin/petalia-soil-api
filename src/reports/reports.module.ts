import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { LandsModule } from '../lands/lands.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [LandsModule, RecommendationsModule],
  controllers: [ReportsController],
  providers: [ReportsService, PdfGeneratorService],
})
export class ReportsModule {}
