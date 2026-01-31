import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { MissionStatus } from '../../common/enums';

/**
 * DTO pour filtrer et paginer les missions
 */
export class FilterMissionsDto {
  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: MissionStatus,
  })
  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par technicien',
  })
  @IsMongoId()
  @IsOptional()
  technicianId?: string;

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
    description: "Nombre d'éléments par page",
    default: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
