import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { LandsService } from '../lands/lands.service';

/**
 * Contrôleur pour les recommandations de cultures
 */
@ApiTags('Recommendations')
@Controller('lands')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly landsService: LandsService,
  ) {}

  @Get(':id/recommendations')
  @ApiOperation({ 
    summary: 'Obtenir des recommandations de cultures pour une terre' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Recommandations générées avec succès' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Terre non trouvée' 
  })
  async getRecommendations(@Param('id') id: string) {
    const land = await this.landsService.findOne(id);
    
    if (!land) {
      throw new NotFoundException('Terre non trouvée');
    }

    const recommendations = this.recommendationsService.generateRecommendations(
      land.soil,
    );

    return {
      landId: land._id,
      landTitle: land.title,
      soilParameters: land.soil,
      recommendations,
      generatedAt: new Date(),
    };
  }
}
