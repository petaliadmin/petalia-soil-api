import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AnalysisRequestStatus, SenegalRegion } from '../../common/enums';
import { PaginationDto } from '../../common/dto';

/**
 * DTO pour filtrer et paginer les demandes d'analyse de sol
 */
export class FilterSoilAnalysisRequestsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: AnalysisRequestStatus,
  })
  @IsEnum(AnalysisRequestStatus)
  @IsOptional()
  status?: AnalysisRequestStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par région',
    enum: SenegalRegion,
  })
  @IsEnum(SenegalRegion)
  @IsOptional()
  region?: SenegalRegion;
}
