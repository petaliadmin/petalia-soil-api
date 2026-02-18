import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { SoilTexture, DrainageQuality } from '../../common/enums';

/**
 * DTO pour les valeurs NPK
 */
class NpkDto {
  @ApiProperty({ description: 'Azote (N) en kg/ha', example: 45 })
  @IsNumber()
  @Min(0)
  nitrogen: number;

  @ApiProperty({ description: 'Phosphore (P) en kg/ha', example: 30 })
  @IsNumber()
  @Min(0)
  phosphorus: number;

  @ApiProperty({ description: 'Potassium (K) en kg/ha', example: 40 })
  @IsNumber()
  @Min(0)
  potassium: number;
}

/**
 * DTO pour la localisation GPS de la mesure
 */
class MeasurementLocationDto {
  @ApiProperty({ description: 'Latitude GPS', example: 14.6928 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitude GPS', example: -17.4467 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

/**
 * DTO pour la mise à jour des données du capteur de sol
 */
export class UpdateSoilDataDto {
  @ApiProperty({
    description: 'pH du sol (0-14)',
    example: 6.5,
    minimum: 0,
    maximum: 14,
  })
  @IsNumber()
  @Min(0)
  @Max(14)
  ph: number;

  @ApiProperty({
    description: 'Valeurs NPK',
    type: NpkDto,
  })
  @ValidateNested()
  @Type(() => NpkDto)
  npk: NpkDto;

  @ApiPropertyOptional({
    description: "Taux d'humidité du sol (%)",
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  moisture?: number;

  @ApiPropertyOptional({
    description: 'Texture du sol',
    enum: SoilTexture,
  })
  @IsEnum(SoilTexture)
  @IsOptional()
  texture?: SoilTexture;

  @ApiPropertyOptional({
    description: 'Qualité du drainage',
    enum: DrainageQuality,
  })
  @IsEnum(DrainageQuality)
  @IsOptional()
  drainage?: DrainageQuality;

  @ApiPropertyOptional({
    description: 'Teneur en matière organique (%)',
    example: 3.5,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  organicMatter?: number;

  @ApiPropertyOptional({
    description: 'Modèle/nom du capteur utilisé',
    example: 'SoilSensor Pro 3000',
  })
  @IsString()
  @IsOptional()
  sensorModel?: string;

  @ApiPropertyOptional({
    description: 'Numéro de série du capteur',
    example: 'SS-2024-001234',
  })
  @IsString()
  @IsOptional()
  sensorSerialNumber?: string;

  @ApiPropertyOptional({
    description: 'Date de la mesure (ISO 8601)',
    example: '2024-06-15T10:30:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  measurementDate?: string;

  @ApiPropertyOptional({
    description: 'Localisation GPS de la mesure',
    type: MeasurementLocationDto,
  })
  @ValidateNested()
  @Type(() => MeasurementLocationDto)
  @IsOptional()
  measurementLocation?: MeasurementLocationDto;
}
