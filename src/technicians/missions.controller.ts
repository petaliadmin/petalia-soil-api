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
import { MissionsService } from './missions.service';
import { CreateMissionDto, UpdateMissionDto, FilterMissionsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';

/**
 * Contrôleur pour la gestion des ordres de mission
 */
@ApiTags('Missions')
@Controller('missions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Créer un ordre de mission - Affecter un technicien à une demande d'analyse (ADMIN)" })
  @ApiResponse({ status: 201, description: 'Mission créée avec succès' })
  @ApiResponse({ status: 404, description: 'Demande ou technicien non trouvé' })
  @ApiResponse({ status: 400, description: 'Technicien non disponible' })
  async create(
    @Body() createDto: CreateMissionDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.missionsService.create(createDto, user.userId);
    return {
      success: true,
      data,
      message: 'Ordre de mission créé avec succès',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les ordres de mission (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Liste des missions' })
  async findAll(@Query() filterDto: FilterMissionsDto) {
    const result = await this.missionsService.findAll(filterDto);
    return {
      success: true,
      ...result,
    };
  }

  @Get('by-technician/:technicianId')
  @ApiOperation({ summary: "Récupérer les missions d'un technicien (ADMIN)" })
  @ApiParam({ name: 'technicianId', description: 'ID du technicien' })
  @ApiResponse({ status: 200, description: 'Missions du technicien' })
  async findByTechnician(@Param('technicianId') technicianId: string) {
    const data = await this.missionsService.findByTechnician(technicianId);
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  @Get('by-analysis-request/:analysisRequestId')
  @ApiOperation({ summary: "Récupérer la mission associée à une demande d'analyse (ADMIN)" })
  @ApiParam({ name: 'analysisRequestId', description: "ID de la demande d'analyse" })
  @ApiResponse({ status: 200, description: 'Mission associée' })
  async findByAnalysisRequest(@Param('analysisRequestId') analysisRequestId: string) {
    const data = await this.missionsService.findByAnalysisRequest(analysisRequestId);
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une mission par ID (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  @ApiResponse({ status: 200, description: 'Détails de la mission' })
  @ApiResponse({ status: 404, description: 'Mission non trouvée' })
  async findOne(@Param('id') id: string) {
    const data = await this.missionsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: "Mettre à jour une mission (statut, notes, date...) (ADMIN)" })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  @ApiResponse({ status: 200, description: 'Mission mise à jour' })
  @ApiResponse({ status: 404, description: 'Mission non trouvée' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMissionDto,
  ) {
    const data = await this.missionsService.update(id, updateDto);
    return {
      success: true,
      data,
      message: 'Mission mise à jour avec succès',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une mission (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  @ApiResponse({ status: 200, description: 'Mission supprimée' })
  @ApiResponse({ status: 404, description: 'Mission non trouvée' })
  async remove(@Param('id') id: string) {
    await this.missionsService.remove(id);
    return {
      success: true,
      message: 'Mission supprimée avec succès',
    };
  }
}
