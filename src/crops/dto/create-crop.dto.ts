import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class RangeValueDto {
  @ApiProperty({ example: 5.5 })
  @IsNumber()
  min: number;

  @ApiProperty({ example: 7.5 })
  @IsNumber()
  max: number;
}

export class CreateCropDto {
  @ApiProperty({ example: 'mil', description: 'Identifiant unique de la culture' })
  @IsNotEmpty({ message: "L'identifiant de la culture est requis" })
  @IsString()
  cropId: string;

  @ApiProperty({ example: 'Mil', description: 'Nom de la culture' })
  @IsNotEmpty({ message: 'Le nom de la culture est requis' })
  @IsString()
  name: string;

  @ApiProperty({ example: '🌾', description: 'Icône/emoji de la culture' })
  @IsNotEmpty({ message: "L'icône est requise" })
  @IsString()
  icon: string;

  @ApiProperty({
    example: 'cereales',
    description: 'Catégorie de la culture',
    enum: ['cereales', 'legumineuses', 'tubercules', 'maraichage', 'industrielles', 'fruits'],
  })
  @IsNotEmpty({ message: 'La catégorie est requise' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Hivernage (Juin-Octobre)', description: 'Saison de culture' })
  @IsNotEmpty({ message: 'La saison est requise' })
  @IsString()
  season: string;

  @ApiProperty({ type: RangeValueDto, description: 'Plage de pH optimal' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RangeValueDto)
  phRange: RangeValueDto;

  @ApiProperty({ type: RangeValueDto, description: "Plage d'azote optimal (kg/ha)" })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RangeValueDto)
  nitrogenRange: RangeValueDto;

  @ApiProperty({ type: RangeValueDto, description: 'Plage de phosphore optimal (kg/ha)' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RangeValueDto)
  phosphorusRange: RangeValueDto;

  @ApiProperty({ type: RangeValueDto, description: 'Plage de potassium optimal (kg/ha)' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RangeValueDto)
  potassiumRange: RangeValueDto;

  @ApiProperty({ type: RangeValueDto, description: "Plage d'humidité optimale (%)" })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => RangeValueDto)
  moistureRange: RangeValueDto;

  @ApiProperty({
    type: [String],
    example: ['sandy', 'loamy'],
    description: 'Textures de sol préférées',
  })
  @IsArray()
  @IsString({ each: true })
  preferredTextures: string[];

  @ApiProperty({
    type: [String],
    example: ['good', 'moderate'],
    description: 'Qualités de drainage préférées',
  })
  @IsArray()
  @IsString({ each: true })
  preferredDrainage: string[];

  @ApiProperty({ example: '800-1200 kg/ha', description: 'Rendement attendu' })
  @IsNotEmpty({ message: 'Le rendement attendu est requis' })
  @IsString()
  expectedYield: string;

  @ApiPropertyOptional({ example: 'Culture céréalière traditionnelle du Sahel' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/mil.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}