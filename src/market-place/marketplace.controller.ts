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
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';
import { ProviderStatus } from '@/common/enums/marketplace.enum';
import { ProviderType } from '@/common/enums/provider-type.enum';


// ─── Guard pour le portail fournisseur (JWT avec role PROVIDER) ───────────────

@ApiTags('Marketplace - Fournisseurs')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

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
