import { PartialType } from '@nestjs/swagger';
import { CreateLandDto } from './create-land.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO pour mettre à jour une terre
 * Tous les champs sont optionnels
 */
export class UpdateLandDto extends PartialType(CreateLandDto) {
  @ApiProperty({ 
    example: true,
    description: 'Disponibilité de la terre',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
