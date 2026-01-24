import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO pour l'adresse d'une terre
 */
export class AddressDto {
  @ApiProperty({
    example: 'Rufisque',
    description: 'Ville',
  })
  @IsNotEmpty({ message: 'La ville est requise' })
  @IsString()
  city: string;

  @ApiProperty({
    example: 'Dakar',
    description: 'Région administrative',
  })
  @IsNotEmpty({ message: 'La région est requise' })
  @IsString()
  region: string;

  @ApiProperty({
    example: 'Rufisque',
    description: 'Commune',
  })
  @IsNotEmpty({ message: 'La commune est requise' })
  @IsString()
  commune: string;

  @ApiProperty({
    example: 'Sangalkam',
    description: 'Village (optionnel)',
    required: false,
  })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiProperty({
    example: 'Route de Sangalkam, Rufisque',
    description: 'Adresse complète (optionnel)',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullAddress?: string;

  @ApiProperty({
    example: 'Sénégal',
    description: 'Pays',
    default: 'Sénégal',
  })
  @IsOptional()
  @IsString()
  country?: string = 'Sénégal';
}
