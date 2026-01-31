import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalysisRequestStatus, SenegalRegion } from '../../common/enums';

/**
 * DTO pour filtrer et paginer les demandes d'analyse de sol
 */
export class FilterSoilAnalysisRequestsDto {
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

  @ApiPropertyOptional({
    description: 'Numéro de page',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    default: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
