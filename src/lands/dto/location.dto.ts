import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

/**
 * DTO pour les coordonnées GeoJSON Point
 */
export class LocationDto {
  @ApiProperty({
    example: 'Point',
    description: 'Type de géométrie (toujours "Point")',
    default: 'Point',
  })
  @IsOptional()
  @IsString()
  type?: string = 'Point';

  @ApiProperty({
    example: [-17.4467, 14.6937],
    description: 'Coordonnées [longitude, latitude]',
    type: [Number],
  })
  @IsNotEmpty({ message: 'Les coordonnées sont requises' })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[];
}
