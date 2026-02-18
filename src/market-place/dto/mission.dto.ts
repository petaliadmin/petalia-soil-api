import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { MissionStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto';

/**
 * DTO pour la création d'un ordre de mission
 */
export class CreateMissionDto {
  @ApiProperty({
    description: "ID de la demande d'analyse de sol",
    example: '64abc123def456',
  })
  @IsMongoId()
  @IsNotEmpty()
  analysisRequestId: string;

  @ApiProperty({
    description: 'ID du provider (agronome) assigné',
    example: '64def456abc789',
  })
  @IsMongoId()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    description: "Date planifiée de l'intervention",
    example: '2024-01-20T09:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiPropertyOptional({
    description: "Instructions pour l'agronome",
    example: 'Prélever des échantillons à 3 points différents de la parcelle',
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}

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
    description: "Notes de l'agronome",
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
    description: 'Filtrer par provider (agronome)',
  })
  @IsMongoId()
  @IsOptional()
  providerId?: string;
}
