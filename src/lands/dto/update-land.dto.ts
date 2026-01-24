import { PartialType } from '@nestjs/swagger';
import { CreateLandDto } from './create-land.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { LandStatus } from '../../common/enums';

/**
 * DTO pour mettre à jour une terre
 * Tous les champs sont optionnels
 */
export class UpdateLandDto extends PartialType(CreateLandDto) {
  @ApiProperty({
    example: LandStatus.AVAILABLE,
    enum: LandStatus,
    description: 'Statut de disponibilité de la terre',
    required: false,
  })
  @IsOptional()
  @IsEnum(LandStatus)
  status?: LandStatus;
}
