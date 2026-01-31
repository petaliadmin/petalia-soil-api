import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { MissionStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto';

/**
 * DTO pour filtrer et paginer les missions
 */
export class FilterMissionsDto extends PaginationDto {
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
}
