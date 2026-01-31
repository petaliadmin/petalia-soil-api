import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsOptional,
} from 'class-validator';

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
    description: 'ID du technicien assigné',
    example: '64def456abc789',
  })
  @IsMongoId()
  @IsNotEmpty()
  technicianId: string;

  @ApiProperty({
    description: "Date planifiée de l'intervention",
    example: '2024-01-20T09:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiPropertyOptional({
    description: 'Instructions pour le technicien',
    example: 'Prélever des échantillons à 3 points différents de la parcelle',
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}
