import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SoilAnalysisRequestsService } from './soil-analysis-requests.service';
import {
  CreateSoilAnalysisRequestDto,
  UpdateSoilAnalysisRequestDto,
  FilterSoilAnalysisRequestsDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';

/**
 * Contrôleur pour les demandes d'analyse de sol
 */
@ApiTags('Soil Analysis Requests')
@Controller('soil-analysis-requests')
export class SoilAnalysisRequestsController {
  constructor(
    private readonly soilAnalysisRequestsService: SoilAnalysisRequestsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Créer une nouvelle demande d'analyse de sol" })
  @ApiResponse({
    status: 201,
    description: 'Demande créée avec succès',
    schema: {
      example: {
        success: true,
        data: {
          _id: '64abc123def456',
          fullName: 'Moussa Diop',
          email: 'moussa.diop@email.com',
          phone: '+221 77 123 45 67',
          region: 'Thies',
          commune: 'Mbour',
          surface: 5.5,
          description: "Parcelle destinée à la culture de l'arachide",
          status: 'pending',
          createdAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createDto: CreateSoilAnalysisRequestDto) {
    const data = await this.soilAnalysisRequestsService.create(createDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lister toutes les demandes avec pagination et filtres (ADMIN)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des demandes',
    schema: {
      example: {
        success: true,
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  async findAll(@Query() filterDto: FilterSoilAnalysisRequestsDto) {
    const result = await this.soilAnalysisRequestsService.findAll(filterDto);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer une demande par ID (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({
    status: 200,
    description: 'Détails de la demande',
    schema: {
      example: {
        success: true,
        data: {
          _id: '64abc123def456',
          fullName: 'Moussa Diop',
          email: 'moussa.diop@email.com',
          phone: '+221 77 123 45 67',
          region: 'Thies',
          commune: 'Mbour',
          surface: 5.5,
          status: 'pending',
          createdAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async findOne(@Param('id') id: string) {
    const data = await this.soilAnalysisRequestsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour le statut d'une demande (ADMIN)" })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({
    status: 200,
    description: 'Demande mise à jour',
    schema: {
      example: {
        success: true,
        data: {
          _id: '64abc123def456',
          status: 'processing',
        },
        message: 'Statut mis à jour avec succès',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSoilAnalysisRequestDto,
  ) {
    const data = await this.soilAnalysisRequestsService.update(id, updateDto);
    return {
      success: true,
      data,
      message: 'Statut mis à jour avec succès',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une demande (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({
    status: 200,
    description: 'Demande supprimée',
    schema: {
      example: {
        success: true,
        message: 'Demande supprimée avec succès',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async remove(@Param('id') id: string) {
    await this.soilAnalysisRequestsService.remove(id);
    return {
      success: true,
      message: 'Demande supprimée avec succès',
    };
  }
}
