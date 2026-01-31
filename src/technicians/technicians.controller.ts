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
  ApiQuery,
} from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';
import {
  CreateTechnicianDto,
  UpdateTechnicianDto,
  FilterTechniciansDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { UserRole, SenegalRegion } from '../common/enums';

/**
 * Contrôleur pour la gestion des techniciens agronomes
 */
@ApiTags('Technicians')
@Controller('technicians')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouveau technicien (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Technicien créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async create(@Body() createDto: CreateTechnicianDto) {
    const data = await this.techniciansService.create(createDto);
    return {
      success: true,
      data,
      message: 'Technicien créé avec succès',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les techniciens (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Liste des techniciens' })
  async findAll(@Query() filterDto: FilterTechniciansDto) {
    const result = await this.techniciansService.findAll(filterDto);
    return {
      success: true,
      ...result,
    };
  }

  @Get('available')
  @ApiOperation({ summary: 'Récupérer les techniciens disponibles pour une région (ADMIN)' })
  @ApiQuery({ name: 'region', enum: SenegalRegion, required: true })
  @ApiResponse({ status: 200, description: 'Liste des techniciens disponibles' })
  async findAvailable(@Query('region') region: SenegalRegion) {
    const data = await this.techniciansService.findAvailableByRegion(region);
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un technicien par ID (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID du technicien' })
  @ApiResponse({ status: 200, description: 'Détails du technicien' })
  @ApiResponse({ status: 404, description: 'Technicien non trouvé' })
  async findOne(@Param('id') id: string) {
    const data = await this.techniciansService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un technicien (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID du technicien' })
  @ApiResponse({ status: 200, description: 'Technicien mis à jour' })
  @ApiResponse({ status: 404, description: 'Technicien non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTechnicianDto,
  ) {
    const data = await this.techniciansService.update(id, updateDto);
    return {
      success: true,
      data,
      message: 'Technicien mis à jour avec succès',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un technicien (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID du technicien' })
  @ApiResponse({ status: 200, description: 'Technicien supprimé' })
  @ApiResponse({ status: 404, description: 'Technicien non trouvé' })
  async remove(@Param('id') id: string) {
    await this.techniciansService.remove(id);
    return {
      success: true,
      message: 'Technicien supprimé avec succès',
    };
  }
}
