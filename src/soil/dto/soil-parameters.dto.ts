import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { SoilTexture } from '../../common/enums';

/**
 * DTO pour les paramètres du sol
 */
export class SoilParametersDto {
  @ApiProperty({ 
    example: 6.5,
    description: 'pH du sol (0-14)',
    minimum: 0,
    maximum: 14
  })
  @IsNotEmpty({ message: 'Le pH est requis' })
  @IsNumber({}, { message: 'Le pH doit être un nombre' })
  @Min(0, { message: 'Le pH doit être au minimum 0' })
  @Max(14, { message: 'Le pH doit être au maximum 14' })
  ph: number;

  @ApiProperty({ 
    example: 45,
    description: 'Taux d\'azote (N) en mg/kg',
    minimum: 0
  })
  @IsNotEmpty({ message: 'L\'azote est requis' })
  @IsNumber({}, { message: 'L\'azote doit être un nombre' })
  @Min(0, { message: 'L\'azote doit être positif' })
  nitrogen: number;

  @ApiProperty({ 
    example: 30,
    description: 'Taux de phosphore (P) en mg/kg',
    minimum: 0
  })
  @IsNotEmpty({ message: 'Le phosphore est requis' })
  @IsNumber({}, { message: 'Le phosphore doit être un nombre' })
  @Min(0, { message: 'Le phosphore doit être positif' })
  phosphorus: number;

  @ApiProperty({ 
    example: 150,
    description: 'Taux de potassium (K) en mg/kg',
    minimum: 0
  })
  @IsNotEmpty({ message: 'Le potassium est requis' })
  @IsNumber({}, { message: 'Le potassium doit être un nombre' })
  @Min(0, { message: 'Le potassium doit être positif' })
  potassium: number;

  @ApiProperty({ 
    example: SoilTexture.LOAM,
    enum: SoilTexture,
    description: 'Texture du sol'
  })
  @IsNotEmpty({ message: 'La texture du sol est requise' })
  @IsEnum(SoilTexture, { message: 'Texture de sol invalide' })
  soilTexture: SoilTexture;

  @ApiProperty({ 
    example: 35,
    description: 'Taux d\'humidité (0-100%)',
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'L\'humidité doit être un nombre' })
  @Min(0, { message: 'L\'humidité doit être au minimum 0' })
  @Max(100, { message: 'L\'humidité doit être au maximum 100' })
  moisture?: number;
}
