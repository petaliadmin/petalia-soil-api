import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards';

/**
 * Controller pour la generation de rapports PDF
 */
@ApiTags('Reports')
@Controller('lands')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/report/pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generer le rapport PDF d\'analyse de sol',
    description:
      'Genere un rapport complet incluant analyse du sol, recommandations de cultures, plan de fertilisation, calendrier cultural et conseils agronomiques adaptes au contexte senegalais.',
  })
  @ApiResponse({ status: 200, description: 'Rapport PDF genere avec succes' })
  @ApiResponse({
    status: 400,
    description: 'Parametres de sol manquants sur cette terre',
  })
  @ApiResponse({ status: 404, description: 'Terre non trouvee' })
  @ApiResponse({ status: 401, description: 'Non authentifie' })
  async generateReport(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.reportsService.generateSoilReport(id, res);
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la generation du rapport',
        });
      }
    }
  }
}
