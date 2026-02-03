import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [RecommendationsModule],
  providers: [ReportsService, PdfGeneratorService],
  exports: [ReportsService],
})
export class ReportsModule {}
