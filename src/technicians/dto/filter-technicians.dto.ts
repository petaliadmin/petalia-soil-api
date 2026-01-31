import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TechnicianStatus, SenegalRegion } from '../../common/enums';
import { PaginationDto } from '../../common/dto';

/**
 * DTO pour filtrer et paginer les techniciens
 */
export class FilterTechniciansDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: TechnicianStatus,
  })
  @IsEnum(TechnicianStatus)
  @IsOptional()
  status?: TechnicianStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par région couverte',
    enum: SenegalRegion,
  })
  @IsEnum(SenegalRegion)
  @IsOptional()
  region?: SenegalRegion;
}
