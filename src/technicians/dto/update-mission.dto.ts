import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';
import { MissionStatus } from '../../common/enums';

/**
 * DTO pour la mise à jour d'un ordre de mission
 */
export class UpdateMissionDto {
  @ApiPropertyOptional({
    description: 'Nouveau statut de la mission',
    enum: MissionStatus,
  })
  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;

  @ApiPropertyOptional({
    description: 'Nouvelle date planifiée',
  })
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @ApiPropertyOptional({
    description: 'Date de complétion',
  })
  @IsDateString()
  @IsOptional()
  completedDate?: string;

  @ApiPropertyOptional({
    description: 'Instructions mises à jour',
  })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Notes du technicien',
  })
  @IsString()
  @IsOptional()
  technicianNotes?: string;

  @ApiPropertyOptional({
    description: 'Rapport de mission',
  })
  @IsString()
  @IsOptional()
  report?: string;

  @ApiPropertyOptional({
    description: 'URLs des pièces jointes',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
