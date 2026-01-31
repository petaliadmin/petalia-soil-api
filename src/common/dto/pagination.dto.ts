import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO de base pour la pagination
 * À étendre par tous les DTOs de filtrage
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Numéro de page (commence à 1)',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page (max: 100)",
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}

/**
 * Interface pour le résultat paginé
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Fonction utilitaire pour créer un résultat paginé
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Calcule le nombre d'éléments à sauter pour la pagination
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
