import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam,
  ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import {
  RegisterProviderDto, UpdateProviderDto, FilterProvidersDto,
  ApproveProviderDto, RejectProviderDto, LoginProviderDto,
} from './dto/provider.dto';
import {
  CreateServiceOfferDto, UpdateServiceOfferDto, FilterServiceOffersDto,
  CreateServiceRequestDto, RespondToServiceRequestDto, RateServiceRequestDto,
} from './dto/service.dto';
import {
  CreateMissionDto, UpdateMissionDto, FilterMissionsDto,
} from './dto/mission.dto';
import { UpdateSoilDataDto } from './dto/soil-data.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';
import { ProviderStatus } from '../common/enums/marketplace.enum';
import { ProviderType } from '../common/enums/provider-type.enum';
import { LandsService } from '../lands/lands.service';
import { SoilAnalysisRequestsService } from '../soil-analysis-requests/soil-analysis-requests.service';
import { CreateLandDto } from '../lands/dto';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly service: MarketplaceService,
    private readonly landsService: LandsService,
    private readonly soilAnalysisRequestsService: SoilAnalysisRequestsService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════
  // HOME PAGE (public)
  // ═══════════════════════════════════════════════════════════════════

  @Get('home')
  @ApiOperation({
    summary: 'Page d\'accueil de la marketplace',
    description: 'Retourne les providers mis en avant, les offres récentes, les catégories et les statistiques.',
  })
  @ApiResponse({ status: 200, description: 'Données de la page d\'accueil' })
  async getHomePage() {
    const data = await this.service.getHomePage();
    return { success: true, data };
  }

  // ═══════════════════════════════════════════════════════════════════
  // AUTH FOURNISSEUR (public)
  // ═══════════════════════════════════════════════════════════════════

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inscription d\'un fournisseur / technicien agronome',
    description: 'Auto-inscription. Le profil passe en statut PENDING jusqu\'à validation par un administrateur.',
  })
  @ApiResponse({ status: 201, description: 'Inscription enregistrée, en attente de validation' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() dto: RegisterProviderDto) {
    const data = await this.service.register(dto);
    return { success: true, data };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d\'un fournisseur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie, retourne un JWT' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides ou compte non actif' })
  async login(@Body() dto: LoginProviderDto) {
    const data = await this.service.login(dto);
    return { success: true, data };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ANNUAIRE PUBLIC DES FOURNISSEURS
  // ═══════════════════════════════════════════════════════════════════

  @Get('providers')
  @ApiOperation({ summary: 'Liste publique des fournisseurs actifs' })
  @ApiQuery({ name: 'providerType', enum: ProviderType, required: false })
  @ApiQuery({ name: 'region', example: 'Dakar', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', example: 'rating', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Liste paginée des fournisseurs' })
  async listProviders(@Query() filterDto: FilterProvidersDto) {
    const result = await this.service.findAll(filterDto);
    return { success: true, ...result };
  }

  @Get('providers/:id')
  @ApiOperation({ summary: 'Détail d\'un fournisseur (public)' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  async getProvider(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { success: true, data };
  }

  @Get('providers/:id/offers')
  @ApiOperation({ summary: 'Offres de service d\'un fournisseur' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  async getProviderOffers(@Param('id') id: string) {
    const data = await this.service.getOffersByProvider(id);
    return { success: true, data, total: data.length };
  }

  // ═══════════════════════════════════════════════════════════════════
  // OFFRES DE SERVICE (publiques)
  // ═══════════════════════════════════════════════════════════════════

  @Get('offers')
  @ApiOperation({ summary: 'Rechercher des offres de service' })
  async searchOffers(@Query() filterDto: FilterServiceOffersDto) {
    const result = await this.service.searchOffers(filterDto);
    return { success: true, ...result };
  }

  // ═══════════════════════════════════════════════════════════════════
  // DEMANDES DE SERVICE (public / connecté)
  // ═══════════════════════════════════════════════════════════════════

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Envoyer une demande de service à un fournisseur',
    description: 'Peut être soumise sans être connecté (nom + téléphone suffisent).',
  })
  async createRequest(@Body() dto: CreateServiceRequestDto, @CurrentUser() user?: any) {
    const data = await this.service.createRequest(dto, user?.userId);
    return {
      success: true,
      data,
      message: 'Votre demande a été envoyée au fournisseur. Il vous contactera sous peu.',
    };
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mes demandes de service (en tant que client connecté)' })
  async getMyRequests(@CurrentUser() user: any) {
    const data = await this.service.getRequestsByUser(user.userId);
    return { success: true, data, total: data.length };
  }

  @Post('requests/:id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Évaluer un service terminé' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  async rateService(@Param('id') id: string, @Body() dto: RateServiceRequestDto, @CurrentUser() user: any) {
    const data = await this.service.rateRequest(user.userId, id, dto);
    return { success: true, data, message: 'Merci pour votre évaluation !' };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PORTAIL FOURNISSEUR (JWT avec role PROVIDER)
  // ═══════════════════════════════════════════════════════════════════

  @Patch('portal/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier mon profil fournisseur (portail)' })
  async updateMyProfile(@Body() dto: UpdateProviderDto, @CurrentUser() user: any) {
    const data = await this.service.updateProfile(user.sub || user.userId, dto);
    return { success: true, data };
  }

  @Get('portal/requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mes demandes de service reçues (portail fournisseur)' })
  async getMyReceivedRequests(@CurrentUser() user: any) {
    const data = await this.service.getRequestsByProvider(user.sub || user.userId);
    return { success: true, data, total: data.length };
  }

  @Patch('portal/requests/:id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Répondre à une demande de service (accepter/refuser)' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  async respondToRequest(
    @Param('id') id: string,
    @Body() dto: RespondToServiceRequestDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.service.respondToRequest(user.sub || user.userId, id, dto);
    return { success: true, data };
  }

  @Post('portal/offers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publier une offre de service (portail fournisseur)' })
  async createOffer(@Body() dto: CreateServiceOfferDto, @CurrentUser() user: any) {
    const data = await this.service.createOffer(user.sub || user.userId, dto);
    return { success: true, data, message: 'Offre publiée avec succès' };
  }

  @Patch('portal/offers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier une offre de service' })
  @ApiParam({ name: 'id', description: 'ID de l\'offre' })
  async updateOffer(
    @Param('id') id: string,
    @Body() dto: UpdateServiceOfferDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.service.updateOffer(user.sub || user.userId, id, dto);
    return { success: true, data };
  }

  @Delete('portal/offers/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une offre de service' })
  @ApiParam({ name: 'id', description: 'ID de l\'offre' })
  async deleteOffer(@Param('id') id: string, @CurrentUser() user: any) {
    await this.service.deleteOffer(user.sub || user.userId, id);
    return { success: true, message: 'Offre supprimée' };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PORTAIL AGRONOMISTE — Missions (JWT Provider)
  // ═══════════════════════════════════════════════════════════════════

  @Get('portal/missions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer mes missions (agronome connecté)' })
  @ApiResponse({ status: 200, description: 'Liste des missions' })
  async getMyMissions(@CurrentUser() user: any) {
    const providerId = user.sub || user.userId;
    const missions = await this.service.findMissionsByProvider(providerId);
    return { success: true, data: missions, total: missions.length };
  }

  @Get('portal/missions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Détails d\'une mission' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  async getMissionDetails(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const providerId = user.sub || user.userId;
    const mission = await this.service.findOneMission(id);

    // Vérifier que la mission appartient au provider
    const missionProviderId = (mission.provider as any)._id?.toString() || mission.provider.toString();
    if (missionProviderId !== providerId) {
      return { success: false, message: 'Cette mission ne vous est pas assignée' };
    }

    return { success: true, data: mission };
  }

  @Patch('portal/missions/:id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Démarrer une mission (passer en cours)' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  async startMission(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const providerId = user.sub || user.userId;
    const mission = await this.service.findOneMission(id);

    const missionProviderId = (mission.provider as any)._id?.toString() || mission.provider.toString();
    if (missionProviderId !== providerId) {
      return { success: false, message: 'Cette mission ne vous est pas assignée' };
    }

    const updated = await this.service.updateMission(id, { status: 'in_progress' as any });
    return { success: true, data: updated, message: 'Mission démarrée' };
  }

  @Patch('portal/missions/:id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marquer une mission comme terminée' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  async completeMission(
    @Param('id') id: string,
    @Body() body: { report?: string },
    @CurrentUser() user: any,
  ) {
    const providerId = user.sub || user.userId;
    const mission = await this.service.findOneMission(id);

    const missionProviderId = (mission.provider as any)._id?.toString() || mission.provider.toString();
    if (missionProviderId !== providerId) {
      return { success: false, message: 'Cette mission ne vous est pas assignée' };
    }

    const updated = await this.service.updateMission(id, {
      status: 'completed' as any,
      report: body.report,
    });
    return { success: true, data: updated, message: 'Mission terminée avec succès' };
  }

  @Patch('portal/missions/:id/link-land')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lier une terre à la demande d\'analyse d\'une mission' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  async linkLandToMission(
    @Param('id') id: string,
    @Body() body: { landId: string },
    @CurrentUser() user: any,
  ) {
    const providerId = user.sub || user.userId;
    const mission = await this.service.findOneMission(id);

    const missionProviderId = (mission.provider as any)._id?.toString() || mission.provider.toString();
    if (missionProviderId !== providerId) {
      return { success: false, message: 'Cette mission ne vous est pas assignée' };
    }

    const analysisRequestId = (mission.analysisRequest as any)._id?.toString() || mission.analysisRequest.toString();
    const updatedRequest = await this.soilAnalysisRequestsService.linkLand(
      analysisRequestId,
      body.landId,
    );

    return { success: true, data: updatedRequest, message: 'Terre liée à la demande d\'analyse avec succès' };
  }

  @Patch('portal/lands/:id/soil-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour les données du capteur de sol' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  async updateSoilData(
    @Param('id') id: string,
    @Body() updateSoilDataDto: UpdateSoilDataDto,
    @CurrentUser() user: any,
  ) {
    const providerId = user.sub || user.userId;
    const land = await this.landsService.updateSoilParametersByProvider(
      id,
      updateSoilDataDto,
      providerId,
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

  @Post('portal/lands')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle parcelle (en attente de validation admin)' })
  @ApiResponse({ status: 201, description: 'Parcelle créée (en attente de validation)' })
  async createLand(
    @Body() createLandDto: CreateLandDto,
    @CurrentUser() user: any,
  ) {
    const providerId = user.sub || user.userId;
    const ownerId = (createLandDto as any).ownerId;

    if (!ownerId) {
      return { success: false, message: 'Le propriétaire (ownerId) est requis' };
    }

    const land = await this.landsService.createByProvider(
      createLandDto,
      ownerId,
      providerId,
    );

    return {
      success: true,
      data: land,
      message: 'Parcelle créée avec succès. En attente de validation par l\'administrateur.',
    };
  }

  @Get('portal/lands/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les détails d\'une parcelle' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  async getLandDetails(@Param('id') id: string) {
    const land = await this.landsService.findOne(id);
    return { success: true, data: land };
  }

  @Patch('portal/lands/:id/location-photos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Compléter la géolocalisation et les photos d\'une terre' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  async updateLocationAndPhotos(
    @Param('id') id: string,
    @Body() body: {
      location?: { type?: string; coordinates: number[] };
      images?: string[];
      thumbnail?: string;
    },
  ) {
    const land = await this.landsService.updateLocationAndPhotos(id, body);
    return {
      success: true,
      data: {
        id: land._id,
        title: land.title,
        location: land.location,
        images: land.images,
        thumbnail: land.thumbnail,
      },
      message: 'Géolocalisation et photos mises à jour avec succès',
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ADMIN — Gestion des fournisseurs
  // ═══════════════════════════════════════════════════════════════════

  @Get('admin/providers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Liste tous les fournisseurs avec filtres' })
  @ApiQuery({ name: 'status', enum: ProviderStatus, required: false })
  async adminListProviders(@Query() filterDto: FilterProvidersDto & { status?: ProviderStatus }) {
    const result = await this.service.findAllAdmin(filterDto);
    return { success: true, ...result };
  }

  @Post('admin/providers/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Approuver un fournisseur en attente' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  async approveProvider(@Param('id') id: string, @Body() dto: ApproveProviderDto) {
    const data = await this.service.approve(id, dto);
    return { success: true, data, message: 'Fournisseur approuvé et activé' };
  }

  @Post('admin/providers/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Rejeter un fournisseur' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  async rejectProvider(@Param('id') id: string, @Body() dto: RejectProviderDto) {
    const data = await this.service.reject(id, dto);
    return { success: true, data, message: 'Fournisseur rejeté' };
  }

  @Patch('admin/providers/:id/toggle-suspension')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Suspendre / réactiver un fournisseur' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  async toggleSuspension(@Param('id') id: string) {
    const data = await this.service.toggleSuspension(id);
    return { success: true, data };
  }

  @Patch('admin/providers/:id/toggle-featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Mettre en avant / retirer un fournisseur' })
  @ApiParam({ name: 'id', description: 'ID du fournisseur' })
  async toggleFeatured(@Param('id') id: string) {
    const data = await this.service.toggleFeatured(id);
    return { success: true, data };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ADMIN — Gestion des missions
  // ═══════════════════════════════════════════════════════════════════

  @Post('admin/missions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[ADMIN] Créer un ordre de mission — Affecter un agronome à une demande d\'analyse' })
  @ApiResponse({ status: 201, description: 'Mission créée avec succès' })
  async createMission(@Body() createDto: CreateMissionDto, @CurrentUser() user: any) {
    const data = await this.service.createMission(createDto, user.userId);
    return { success: true, data, message: 'Ordre de mission créé avec succès' };
  }

  @Get('admin/missions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Lister tous les ordres de mission' })
  async listMissions(@Query() filterDto: FilterMissionsDto) {
    const result = await this.service.findAllMissions(filterDto);
    return { success: true, ...result };
  }

  @Get('admin/missions/by-provider/:providerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Missions d\'un provider (agronome)' })
  @ApiParam({ name: 'providerId', description: 'ID du provider' })
  async getMissionsByProvider(@Param('providerId') providerId: string) {
    const data = await this.service.findMissionsByProvider(providerId);
    return { success: true, data, total: data.length };
  }

  @Get('admin/missions/by-analysis-request/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Mission associée à une demande d\'analyse' })
  @ApiParam({ name: 'id', description: 'ID de la demande d\'analyse' })
  async getMissionByAnalysisRequest(@Param('id') id: string) {
    const data = await this.service.findMissionByAnalysisRequest(id);
    return { success: true, data };
  }

  @Get('admin/missions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Détail d\'une mission' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  async getMission(@Param('id') id: string) {
    const data = await this.service.findOneMission(id);
    return { success: true, data };
  }

  @Patch('admin/missions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Mettre à jour une mission' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  async updateMission(@Param('id') id: string, @Body() updateDto: UpdateMissionDto) {
    const data = await this.service.updateMission(id, updateDto);
    return { success: true, data, message: 'Mission mise à jour avec succès' };
  }

  @Delete('admin/missions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[ADMIN] Supprimer une mission' })
  @ApiParam({ name: 'id', description: 'ID de la mission' })
  async removeMission(@Param('id') id: string) {
    await this.service.removeMission(id);
    return { success: true, message: 'Mission supprimée avec succès' };
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Statistiques de la marketplace' })
  async getStats() {
    const data = await this.service.getMarketplaceStats();
    return { success: true, data };
  }
}
