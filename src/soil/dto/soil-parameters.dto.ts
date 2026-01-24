import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SoilTexture, DrainageQuality } from '../../common/enums';

/**
 * DTO pour les valeurs NPK
 */
export class NPKDto {
  @ApiProperty({
    example: 45,
    description: "Taux d'azote (N) en mg/kg",
    minimum: 0,
  })
  @IsNotEmpty({ message: "L'azote est requis" })
  @IsNumber({}, { message: "L'azote doit être un nombre" })
  @Min(0, { message: "L'azote doit être positif" })
  nitrogen: number;

  @ApiProperty({
    example: 30,
    description: 'Taux de phosphore (P) en mg/kg',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Le phosphore est requis' })
  @IsNumber({}, { message: 'Le phosphore doit être un nombre' })
  @Min(0, { message: 'Le phosphore doit être positif' })
  phosphorus: number;

  @ApiProperty({
    example: 150,
    description: 'Taux de potassium (K) en mg/kg',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Le potassium est requis' })
  @IsNumber({}, { message: 'Le potassium doit être un nombre' })
  @Min(0, { message: 'Le potassium doit être positif' })
  potassium: number;
}

/**
 * DTO pour les paramètres du sol
 */
export class SoilParametersDto {
  @ApiProperty({
    example: 6.5,
    description: 'pH du sol (0-14)',
    minimum: 0,
    maximum: 14,
  })
  @IsNotEmpty({ message: 'Le pH est requis' })
  @IsNumber({}, { message: 'Le pH doit être un nombre' })
  @Min(0, { message: 'Le pH doit être au minimum 0' })
  @Max(14, { message: 'Le pH doit être au maximum 14' })
  ph: number;

  @ApiProperty({
    type: NPKDto,
    description: 'Valeurs NPK du sol',
  })
  @IsNotEmpty({ message: 'Les valeurs NPK sont requises' })
  @ValidateNested()
  @Type(() => NPKDto)
  npk: NPKDto;

  @ApiProperty({
    example: SoilTexture.LOAMY,
    enum: SoilTexture,
    description: 'Texture du sol',
  })
  @IsNotEmpty({ message: 'La texture du sol est requise' })
  @IsString( { message: 'Texture de sol invalide' })
  texture: SoilTexture;

  @ApiProperty({
    example: 35,
    description: "Taux d'humidité (0-100%)",
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty({ message: "L'humidité est requise" })
  @IsNumber({}, { message: "L'humidité doit être un nombre" })
  @Min(0, { message: "L'humidité doit être au minimum 0" })
  @Max(100, { message: "L'humidité doit être au maximum 100" })
  moisture: number;

  @ApiProperty({
    example: DrainageQuality.GOOD,
    enum: DrainageQuality,
    description: 'Qualité du drainage',
  })
  @IsNotEmpty({ message: 'La qualité du drainage est requise' })
  @IsString( { message: 'Qualité de drainage invalide' })
  drainage: DrainageQuality;

  @ApiProperty({
    example: 3.5,
    description: 'Taux de matière organique (%)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La matière organique doit être un nombre' })
  @Min(0)
  organicMatter?: number;

  @ApiProperty({
    example: 0.5,
    description: 'Salinité (dS/m)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La salinité doit être un nombre' })
  @Min(0)
  salinity?: number;

  @ApiProperty({
    example: 15,
    description: "Capacité d'échange cationique (meq/100g)",
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La CEC doit être un nombre' })
  @Min(0)
  cec?: number;
}
