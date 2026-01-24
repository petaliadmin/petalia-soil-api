import { Controller, Get, Param, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { SoilParametersDto } from '../soil/dto';

/**
 * Contrôleur pour les recommandations de cultures
 */
@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('crops')
  @ApiOperation({
    summary: 'Récupérer toutes les cultures disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des cultures',
  })
  getAllCrops() {
    return this.recommendationsService.getAllCrops();
  }

  @Get('crops/category/:category')
  @ApiOperation({
    summary: 'Récupérer les cultures par catégorie',
  })
  @ApiParam({
    name: 'category',
    example: 'cereales',
    description:
      'Catégorie de cultures (cereales, legumineuses, tubercules, maraichage, industrielles, fruits)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des cultures de la catégorie',
  })
  getCropsByCategory(@Param('category') category: string) {
    return this.recommendationsService.getCropsByCategory(category);
  }

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyser les paramètres du sol et obtenir des recommandations',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommandations générées avec succès',
  })
  analyzeAndRecommend(@Body() soilParameters: SoilParametersDto) {
    return this.recommendationsService.generateRecommendations(
      soilParameters as any,
    );
  }
}
