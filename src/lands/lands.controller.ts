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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { LandsService } from './lands.service';
import { CreateLandDto, UpdateLandDto, FilterLandsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';

/**
 * Contrôleur pour la gestion des terres agricoles
 */
@ApiTags('Lands')
@Controller('lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle annonce de terre (OWNER uniquement)' })
  @ApiResponse({ status: 201, description: 'Terre créée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  create(
    @Body() createLandDto: CreateLandDto,
    @CurrentUser() user: any,
  ) {
    return this.landsService.create(createLandDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les terres disponibles avec filtres' })
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
  @ApiQuery({ name: 'longitude', example: -17.4467 })
  @ApiQuery({ name: 'latitude', example: 14.6937 })
  @ApiQuery({ name: 'radius', example: 10, description: 'Rayon en kilomètres' })
  @ApiResponse({ status: 200, description: 'Terres à proximité' })
  findNearby(
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
    @Query('radius') radius: number,
  ) {
    return this.landsService.findNearby(
      Number(longitude),
      Number(latitude),
      Number(radius),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une terre par ID' })
  @ApiResponse({ status: 200, description: 'Détails de la terre' })
  @ApiResponse({ status: 404, description: 'Terre non trouvée' })
  findOne(@Param('id') id: string) {
    return this.landsService.findOne(id);
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
  @ApiOperation({ summary: 'Supprimer une terre (OWNER uniquement)' })
  @ApiResponse({ status: 200, description: 'Terre supprimée' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Terre non trouvée' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.landsService.remove(id, user.userId);
  }
}
