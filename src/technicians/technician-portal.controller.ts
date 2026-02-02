import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { TechniciansService } from './technicians.service';
import { LandsService } from '../lands/lands.service';
import { UpdateSoilDataDto } from './dto';
import { CreateLandDto } from '../lands/dto';
import { TechnicianAuthGuard } from '../common/guards';
import { CurrentTechnician } from '../common/decorators';

/**
 * Contrôleur pour le portail mobile des techniciens
 * Authentification via code d'accès (header: x-technician-code)
 */
@ApiTags('Technician Portal')
@Controller('technician-portal')
@UseGuards(TechnicianAuthGuard)
@ApiHeader({
  name: 'x-technician-code',
  description: "Code d'accès du technicien (ex: TECH-ABC123)",
  required: true,
})
export class TechnicianPortalController {
  constructor(
    private readonly missionsService: MissionsService,
    private readonly techniciansService: TechniciansService,
    private readonly landsService: LandsService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Récupérer les informations du technicien connecté' })
  @ApiResponse({ status: 200, description: 'Informations du technicien' })
  @ApiResponse({ status: 401, description: 'Code d\'accès invalide' })
  async getProfile(@CurrentTechnician() technician: any) {
    return {
      success: true,
      data: {
        id: technician._id,
        fullName: technician.fullName,
        email: technician.email,
        phone: technician.phone,
        specialization: technician.specialization,
        coverageRegions: technician.coverageRegions,
        completedMissions: technician.completedMissions,
        status: technician.status,
      },
    };
  }

  @Get('missions')
  @ApiOperation({ summary: 'Récupérer les missions assignées au technicien' })
  @ApiResponse({ status: 200, description: 'Liste des missions' })
  async getMyMissions(@CurrentTechnician() technician: any) {
    const missions = await this.missionsService.findByTechnician(
      technician._id.toString(),
    );
    return {
      success: true,
      data: missions,
      total: missions.length,
    };
  }

  @Get('missions/:id')
  @ApiOperation({ summary: 'Récupérer les détails d\'une mission' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  @ApiResponse({ status: 200, description: 'Détails de la mission' })
  @ApiResponse({ status: 404, description: 'Mission non trouvée' })
  async getMissionDetails(
    @Param('id') id: string,
    @CurrentTechnician() technician: any,
  ) {
    const mission = await this.missionsService.findOne(id);

    // Vérifier que la mission appartient au technicien
    const missionTechId = (mission.technician as any)._id?.toString() || mission.technician.toString();
    if (missionTechId !== technician._id.toString()) {
      return {
        success: false,
        message: 'Cette mission ne vous est pas assignée',
      };
    }

    return {
      success: true,
      data: mission,
    };
  }

  @Patch('missions/:id/start')
  @ApiOperation({ summary: 'Démarrer une mission (passer en cours)' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  @ApiResponse({ status: 200, description: 'Mission démarrée' })
  async startMission(
    @Param('id') id: string,
    @CurrentTechnician() technician: any,
  ) {
    const mission = await this.missionsService.findOne(id);

    const missionTechId = (mission.technician as any)._id?.toString() || mission.technician.toString();
    if (missionTechId !== technician._id.toString()) {
      return {
        success: false,
        message: 'Cette mission ne vous est pas assignée',
      };
    }

    const updated = await this.missionsService.update(id, {
      status: 'in_progress' as any,
    });

    return {
      success: true,
      data: updated,
      message: 'Mission démarrée',
    };
  }

  @Patch('missions/:id/complete')
  @ApiOperation({ summary: 'Marquer une mission comme terminée' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  @ApiResponse({ status: 200, description: 'Mission terminée' })
  async completeMission(
    @Param('id') id: string,
    @Body() body: { report?: string },
    @CurrentTechnician() technician: any,
  ) {
    const mission = await this.missionsService.findOne(id);

    const missionTechId = (mission.technician as any)._id?.toString() || mission.technician.toString();
    if (missionTechId !== technician._id.toString()) {
      return {
        success: false,
        message: 'Cette mission ne vous est pas assignée',
      };
    }

    const updated = await this.missionsService.update(id, {
      status: 'completed' as any,
      report: body.report,
    });

    return {
      success: true,
      data: updated,
      message: 'Mission terminée avec succès',
    };
  }

  @Patch('lands/:id/soil-data')
  @ApiOperation({ summary: 'Mettre à jour les données du capteur de sol' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  @ApiResponse({ status: 200, description: 'Données du sol mises à jour' })
  @ApiResponse({ status: 404, description: 'Terre non trouvée' })
  async updateSoilData(
    @Param('id') id: string,
    @Body() updateSoilDataDto: UpdateSoilDataDto,
    @CurrentTechnician() technician: any,
  ) {
    const land = await this.landsService.updateSoilParametersByTechnician(
      id,
      updateSoilDataDto,
    );

    return {
      success: true,
      data: {
        id: land._id,
        title: land.title,
        soilParameters: land.soilParameters,
        recommendedCrops: land.recommendedCrops,
      },
      message: 'Données du sol mises à jour avec succès',
    };
  }

  @Post('lands')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle parcelle (en attente de validation admin)',
  })
  @ApiResponse({
    status: 201,
    description: 'Parcelle créée (en attente de validation)',
  })
  async createLand(
    @Body() createLandDto: CreateLandDto,
    @CurrentTechnician() technician: any,
  ) {
    // Le technicien doit spécifier un owner (propriétaire) dans le DTO
    // ou on utilise un propriétaire par défaut/système
    const ownerId = (createLandDto as any).ownerId;

    if (!ownerId) {
      return {
        success: false,
        message: 'Le propriétaire (ownerId) est requis',
      };
    }

    const land = await this.landsService.createByTechnician(
      createLandDto,
      ownerId,
      technician._id.toString(),
    );

    return {
      success: true,
      data: land,
      message: 'Parcelle créée avec succès. En attente de validation par l\'administrateur.',
    };
  }

  @Get('lands/:id')
  @ApiOperation({ summary: 'Récupérer les détails d\'une parcelle' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  @ApiResponse({ status: 200, description: 'Détails de la terre' })
  async getLandDetails(@Param('id') id: string) {
    const land = await this.landsService.findOne(id);
    return {
      success: true,
      data: land,
    };
  }
}
