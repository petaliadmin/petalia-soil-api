import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO pour créer une demande de location
 */
export class CreateRentalRequestDto {
  @ApiPropertyOptional({
    example: 'Je suis intéressé par cette terre pour cultiver du mil',
    description: 'Message optionnel pour le propriétaire',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Le message ne doit pas dépasser 1000 caractères' })
  message?: string;

  @ApiPropertyOptional({
    example: '2025-03-01',
    description: 'Date de début souhaitée pour la location',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date de début invalide' })
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Date de fin souhaitée pour la location',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date de fin invalide' })
  endDate?: string;
}
