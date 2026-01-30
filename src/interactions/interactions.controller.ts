import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { InteractionsService } from './interactions.service';
import { LandsService } from '../lands/lands.service';
import { CreateRentalRequestDto, UpdateRentalStatusDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';

/**
 * Contrôleur pour les interactions utilisateur-terre
 */
@ApiTags('Interactions')
@Controller()
export class InteractionsController {
  constructor(
    private readonly interactionsService: InteractionsService,
    private readonly landsService: LandsService,
  ) {}

  // ==================== ESPACE PERSONNEL ====================

  @Get('my-lands')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer les terres personnalisées selon le rôle',
    description:
      'OWNER: ses propres terres | FARMER: terres louées, visitées ou aimées',
  })
  @ApiResponse({ status: 200, description: 'Liste des terres personnalisées' })
  async getMyLands(@CurrentUser() user: any) {
    // Si OWNER: retourner ses propres terres
    if (user.role === UserRole.OWNER || user.role === UserRole.ADMIN) {
      const lands = await this.landsService.findByOwner(user.userId);
      return {
        type: 'owner',
        data: lands,
        total: lands.length,
      };
    }

    // Si FARMER: retourner les terres louées, visitées ou aimées
    if (user.role === UserRole.FARMER) {
      const [rentedLandIds, visitedLandIds, favoriteLandIds] = await Promise.all([
        this.interactionsService.getRentedLandIds(user.userId),
        this.interactionsService.getVisitedLandIds(user.userId),
        this.interactionsService.getFavoriteLandIds(user.userId),
      ]);

      // Fusionner et dédupliquer les IDs
      const allLandIds = [
        ...new Set([...rentedLandIds, ...visitedLandIds, ...favoriteLandIds]),
      ];

      const lands = allLandIds.length > 0
        ? await this.landsService.findByIds(allLandIds)
        : [];

      // Enrichir les données avec les métadonnées d'interaction
      const enrichedLands = lands.map((land) => {
        const landId = land._id.toString();
        return {
          ...land.toObject(),
          interactions: {
            isRented: rentedLandIds.includes(landId),
            isVisited: visitedLandIds.includes(landId),
            isFavorite: favoriteLandIds.includes(landId),
          },
        };
      });

      return {
        type: 'farmer',
        data: enrichedLands,
        total: enrichedLands.length,
        breakdown: {
          rented: rentedLandIds.length,
          visited: visitedLandIds.length,
          favorites: favoriteLandIds.length,
        },
      };
    }

    return { type: 'unknown', data: [], total: 0 };
  }

  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer les statistiques d'interaction de l'utilisateur" })
  @ApiResponse({ status: 200, description: "Statistiques de l'utilisateur" })
  async getMyStats(@CurrentUser() user: any) {
    return this.interactionsService.getUserStats(user.userId);
  }

  // ==================== FAVORIS ====================

  @Post('lands/:id/favorite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ajouter une terre aux favoris (FARMER uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  @ApiResponse({ status: 201, description: 'Ajouté aux favoris' })
  @ApiResponse({ status: 409, description: 'Déjà dans les favoris' })
  async addFavorite(@Param('id') landId: string, @CurrentUser() user: any) {
    await this.interactionsService.addFavorite(user.userId, landId);
    return { message: 'Terre ajoutée aux favoris' };
  }

  @Delete('lands/:id/favorite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer une terre des favoris (FARMER uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  @ApiResponse({ status: 204, description: 'Retiré des favoris' })
  async removeFavorite(@Param('id') landId: string, @CurrentUser() user: any) {
    await this.interactionsService.removeFavorite(user.userId, landId);
  }

  @Get('lands/:id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier si une terre est dans les favoris' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  @ApiResponse({ status: 200, description: 'Statut du favori' })
  async checkFavorite(@Param('id') landId: string, @CurrentUser() user: any) {
    const isFavorite = await this.interactionsService.isFavorite(
      user.userId,
      landId,
    );
    return { isFavorite };
  }

  // ==================== DEMANDES DE LOCATION ====================

  @Post('lands/:id/rental-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une demande de location (FARMER uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de la terre' })
  @ApiResponse({ status: 201, description: 'Demande créée' })
  @ApiResponse({ status: 409, description: 'Demande déjà en cours' })
  async createRentalRequest(
    @Param('id') landId: string,
    @Body() dto: CreateRentalRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.interactionsService.createRentalRequest(
      user.userId,
      landId,
      dto,
    );
  }

  @Get('my-rental-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer mes demandes de location (FARMER)' })
  @ApiResponse({ status: 200, description: 'Liste des demandes' })
  async getMyRentalRequests(@CurrentUser() user: any) {
    return this.interactionsService.getMyRentalRequests(user.userId);
  }

  @Get('rental-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer les demandes de location reçues (OWNER)',
  })
  @ApiResponse({ status: 200, description: 'Liste des demandes reçues' })
  async getReceivedRentalRequests(@CurrentUser() user: any) {
    return this.interactionsService.getReceivedRentalRequests(user.userId);
  }

  @Patch('rental-requests/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accepter ou refuser une demande de location (OWNER)',
  })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async updateRentalStatus(
    @Param('id') rentalId: string,
    @Body() dto: UpdateRentalStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.interactionsService.updateRentalStatus(
      rentalId,
      user.userId,
      dto,
    );
  }

  @Delete('rental-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FARMER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Annuler une demande de location (FARMER)' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiResponse({ status: 204, description: 'Demande annulée' })
  async cancelRentalRequest(
    @Param('id') rentalId: string,
    @CurrentUser() user: any,
  ) {
    await this.interactionsService.cancelRentalRequest(rentalId, user.userId);
  }
}
