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
import { CropsService } from './crops.service';
import { CreateCropDto, UpdateCropDto, FilterCropsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole } from '../common/enums';

/**
 * Contrôleur pour la gestion des cultures
 */
@ApiTags('Crops')
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle culture (ADMIN uniquement)' })
  @ApiResponse({ status: 201, description: 'Culture créée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 409, description: 'Culture déjà existante' })
  create(@Body() createCropDto: CreateCropDto) {
    return this.cropsService.create(createCropDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les cultures avec filtres' })
  @ApiResponse({ status: 200, description: 'Liste des cultures' })
  findAll(@Query() filterDto: FilterCropsDto) {
    return this.cropsService.findAll(filterDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Récupérer toutes les catégories de cultures' })
  @ApiResponse({ status: 200, description: 'Liste des catégories' })
  getCategories() {
    return this.cropsService.getCategories();
  }

  @Get('suitable')
  @ApiOperation({ summary: 'Rechercher des cultures adaptées aux paramètres de sol' })
  @ApiQuery({ name: 'ph', example: 6.5, required: true })
  @ApiQuery({ name: 'nitrogen', example: 50, required: true })
  @ApiQuery({ name: 'phosphorus', example: 30, required: true })
  @ApiQuery({ name: 'potassium', example: 80, required: true })
  @ApiQuery({ name: 'moisture', example: 45, required: true })
  @ApiQuery({ name: 'texture', example: 'loamy', required: false })
  @ApiQuery({ name: 'drainage', example: 'good', required: false })
  @ApiResponse({ status: 200, description: 'Cultures adaptées' })
  findSuitable(
    @Query('ph') ph: number,
    @Query('nitrogen') nitrogen: number,
    @Query('phosphorus') phosphorus: number,
    @Query('potassium') potassium: number,
    @Query('moisture') moisture: number,
    @Query('texture') texture?: string,
    @Query('drainage') drainage?: string,
  ) {
    return this.cropsService.findSuitableForSoil(
      Number(ph),
      Number(nitrogen),
      Number(phosphorus),
      Number(potassium),
      Number(moisture),
      texture,
      drainage,
    );
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Récupérer les cultures par catégorie' })
  @ApiResponse({ status: 200, description: 'Liste des cultures de la catégorie' })
  findByCategory(@Param('category') category: string) {
    return this.cropsService.findByCategory(category);
  }

  @Get('by-crop-id/:cropId')
  @ApiOperation({ summary: 'Récupérer une culture par son identifiant (cropId)' })
  @ApiResponse({ status: 200, description: 'Détails de la culture' })
  @ApiResponse({ status: 404, description: 'Culture non trouvée' })
  findByCropId(@Param('cropId') cropId: string) {
    return this.cropsService.findByCropId(cropId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une culture par ID MongoDB' })
  @ApiResponse({ status: 200, description: 'Détails de la culture' })
  @ApiResponse({ status: 404, description: 'Culture non trouvée' })
  findOne(@Param('id') id: string) {
    return this.cropsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une culture (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Culture mise à jour' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Culture non trouvée' })
  update(@Param('id') id: string, @Body() updateCropDto: UpdateCropDto) {
    return this.cropsService.update(id, updateCropDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une culture (ADMIN uniquement)' })
  @ApiResponse({ status: 204, description: 'Culture supprimée' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Culture non trouvée' })
  remove(@Param('id') id: string) {
    return this.cropsService.remove(id);
  }
}
