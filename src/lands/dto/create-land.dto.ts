import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { LandType } from '../../common/enums';
import { LocationDto } from './location.dto';
import { AddressDto } from './address.dto';

/**
 * DTO pour créer une nouvelle terre
 */
export class CreateLandDto {
  @ApiProperty({
    example: 'Terrain agricole près de Rufisque',
    description: "Titre de l'annonce",
  })
  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      "Excellente terre cultivable avec accès à l'eau, idéale pour le maraîchage",
    description: 'Description détaillée',
  })
  @IsNotEmpty({ message: 'La description est requise' })
  @IsString()
  description: string;

  @ApiProperty({
    example: 5.5,
    description: 'Surface en hectares',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'La surface est requise' })
  @IsNumber({}, { message: 'La surface doit être un nombre' })
  @Min(0, { message: 'La surface doit être positive' })
  surfaceHectares: number;

  @ApiProperty({
    example: LandType.RENT,
    enum: LandType,
    description: 'Type de transaction (location ou vente)',
  })
  @IsNotEmpty({ message: 'Le type est requis' })
  @IsEnum(LandType, { message: 'Type de transaction invalide' })
  type: LandType;

  @ApiProperty({
    example: 500000,
    description: 'Prix (FCFA/an pour location, FCFA pour vente)',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Le prix est requis' })
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0, { message: 'Le prix doit être positif' })
  price: number;

  @ApiPropertyOptional({
    example: 'FCFA',
    description: 'Unité de prix',
    default: 'FCFA',
  })
  @IsOptional()
  @IsString()
  priceUnit?: string;

  @ApiProperty({
    type: LocationDto,
    description: 'Coordonnées GeoJSON',
  })
  @IsNotEmpty({ message: 'La localisation est requise' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiPropertyOptional({
    type: AddressDto,
    description: 'Adresse de la terre',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Liste des URLs des images',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
