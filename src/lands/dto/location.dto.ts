import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  ValidateNested, 
  IsArray, 
  ArrayMinSize, 
  ArrayMaxSize, 
  IsNumber 
} from 'class-validator';

/**
 * DTO pour les coordonnées GeoJSON Point
 */
class GeoJsonPointDto {
  @ApiProperty({ 
    example: 'Point',
    description: 'Type de géométrie (toujours "Point")'
  })
  @IsNotEmpty()
  @IsString()
  type: 'Point';

  @ApiProperty({ 
    example: [-17.4467, 14.6937],
    description: 'Coordonnées [longitude, latitude]',
    type: [Number]
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

/**
 * DTO pour la localisation d'une terre
 */
export class LocationDto {
  @ApiProperty({ 
    example: 'Dakar',
    description: 'Région administrative'
  })
  @IsNotEmpty({ message: 'La région est requise' })
  @IsString()
  region: string;

  @ApiProperty({ 
    example: 'Rufisque',
    description: 'Commune ou ville'
  })
  @IsNotEmpty({ message: 'La commune est requise' })
  @IsString()
  commune: string;

  @ApiProperty({ 
    type: GeoJsonPointDto,
    description: 'Coordonnées géographiques'
  })
  @IsNotEmpty({ message: 'Les coordonnées sont requises' })
  @ValidateNested()
  @Type(() => GeoJsonPointDto)
  coordinates: GeoJsonPointDto;
}
