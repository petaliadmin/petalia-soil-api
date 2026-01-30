import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { LandsService } from './lands.service';
import { VisitTrackerService } from './visit-tracker.service';
import { CreateLandDto, UpdateLandDto, FilterLandsDto } from './dto';
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';

/**
 * Contrôleur pour la gestion des terres agricoles
 */
@ApiTags('Lands')
@Controller('lands')
export class LandsController {
  constructor(
    private readonly landsService: LandsService,
    private readonly visitTrackerService: VisitTrackerService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle annonce de terre (OWNER uniquement)',
  })
  @ApiResponse({ status: 201, description: 'Terre créée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  create(@Body() createLandDto: CreateLandDto, @CurrentUser() user: any) {
    return this.landsService.create(createLandDto, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer toutes les terres disponibles avec filtres',
  })
  @ApiResponse({ status: 200, description: 'Liste des terres' })
  findAll(@Query() filterDto: FilterLandsDto) {
    return this.landsService.findAll(filterDto);
  }

  @Get('map')
  @ApiOperation({ summary: 'Récupérer les terres pour affichage sur carte' })
  @ApiResponse({ status: 200, description: 'Terres pour la carte' })
  findForMap() {
    return this.landsService.findForMap();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Rechercher des terres dans un rayon donné' })
  @ApiQuery({ name: 'latitude', example: 14.6928, required: true })
  @ApiQuery({ name: 'longitude', example: -17.4467, required: true })
  @ApiQuery({
    name: 'radiusKm',
    example: 50,
    description: 'Rayon en kilomètres',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Terres à proximité' })
  findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusKm') radiusKm: number = 50,
  ) {
    return this.landsService.findNearby(
      Number(longitude),
      Number(latitude),
      Number(radiusKm),
    );
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer une terre par ID' })
  @ApiResponse({ status: 200, description: 'Détails de la terre' })
  @ApiResponse({ status: 404, description: 'Terre non trouvée' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // Enregistrer la visite si l'utilisateur est authentifié
    if (user?.userId) {
      this.visitTrackerService.recordVisit(user.userId, id);
    }
    return this.landsService.findOneAndIncrementViews(id);
  }

  @Get(':id/recommendations')
  @ApiOperation({
    summary: 'Récupérer les recommandations de cultures pour une terre',
  })
  @ApiResponse({ status: 200, description: 'Liste des recommandations' })
  @ApiResponse({ status: 404, description: 'Terre non trouvée' })
  getRecommendations(@Param('id') id: string) {
    return this.landsService.getRecommendations(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une terre (OWNER uniquement)' })
  @ApiResponse({ status: 200, description: 'Terre mise à jour' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Terre non trouvée' })
  update(
    @Param('id') id: string,
    @Body() updateLandDto: UpdateLandDto,
    @CurrentUser() user: any,
  ) {
    return this.landsService.update(id, updateLandDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une terre (OWNER uniquement)' })
  @ApiResponse({ status: 204, description: 'Terre supprimée' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Terre non trouvée' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.landsService.remove(id, user.userId);
  }
}
