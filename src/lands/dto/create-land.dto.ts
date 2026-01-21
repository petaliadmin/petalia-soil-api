import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsEnum, 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  Min, 
  ValidateNested 
} from 'class-validator';
import { LandType } from '../../common/enums';
import { LocationDto } from './location.dto';
import { SoilParametersDto } from '../../soil/dto';

/**
 * DTO pour créer une nouvelle terre
 */
export class CreateLandDto {
  @ApiProperty({ 
    example: 'Terrain agricole près de Rufisque',
    description: 'Titre de l\'annonce'
  })
  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 'Excellente terre cultivable avec accès à l\'eau, idéale pour le maraîchage',
    description: 'Description détaillée'
  })
  @IsNotEmpty({ message: 'La description est requise' })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: 5.5,
    description: 'Surface en hectares',
    minimum: 0
  })
  @IsNotEmpty({ message: 'La surface est requise' })
  @IsNumber({}, { message: 'La surface doit être un nombre' })
  @Min(0, { message: 'La surface doit être positive' })
  surfaceHectares: number;

  @ApiProperty({ 
    example: LandType.RENT,
    enum: LandType,
    description: 'Type de transaction (location ou vente)'
  })
  @IsNotEmpty({ message: 'Le type est requis' })
  @IsEnum(LandType, { message: 'Type de transaction invalide' })
  type: LandType;

  @ApiProperty({ 
    example: 500000,
    description: 'Prix (FCFA/an pour location, FCFA pour vente)',
    minimum: 0
  })
  @IsNotEmpty({ message: 'Le prix est requis' })
  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0, { message: 'Le prix doit être positif' })
  price: number;

  @ApiProperty({ 
    type: LocationDto,
    description: 'Localisation géographique'
  })
  @IsNotEmpty({ message: 'La localisation est requise' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ 
    type: SoilParametersDto,
    description: 'Paramètres du sol'
  })
  @IsNotEmpty({ message: 'Les paramètres du sol sont requis' })
  @ValidateNested()
  @Type(() => SoilParametersDto)
  soil: SoilParametersDto;
}
