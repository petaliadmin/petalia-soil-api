import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Technician, TechnicianDocument } from './schemas/technician.schema';
import {
  CreateTechnicianDto,
  UpdateTechnicianDto,
  FilterTechniciansDto,
} from './dto';
import { TechnicianStatus, SenegalRegion } from '../common/enums';

/**
 * Service pour la gestion des techniciens agronomes
 */
@Injectable()
export class TechniciansService {
  constructor(
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
  ) {}

  /**
   * Créer un nouveau technicien
   */
  async create(createDto: CreateTechnicianDto): Promise<TechnicianDocument> {
    try {
      const technician = new this.technicianModel(createDto);
      return await technician.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Un technicien avec cet email existe déjà');
      }
      throw error;
    }
  }

  /**
   * Récupérer tous les techniciens avec filtres et pagination
   */
  async findAll(filterDto: FilterTechniciansDto) {
    const { status, region, page = 1, limit = 10 } = filterDto;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (region) {
      query.coverageRegions = region;
    }

    const skip = (page - 1) * limit;

    const [technicians, total] = await Promise.all([
      this.technicianModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.technicianModel.countDocuments(query),
    ]);

    return {
      data: technicians,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer un technicien par ID
   */
  async findOne(id: string): Promise<TechnicianDocument> {
    const technician = await this.technicianModel.findById(id).exec();

    if (!technician) {
      throw new NotFoundException('Technicien non trouvé');
    }

    return technician;
  }

  /**
   * Récupérer les techniciens disponibles pour une région
   */
  async findAvailableByRegion(region: SenegalRegion): Promise<TechnicianDocument[]> {
    return this.technicianModel
      .find({
        status: TechnicianStatus.ACTIVE,
        coverageRegions: region,
      })
      .sort({ completedMissions: -1 })
      .exec();
  }

  /**
   * Mettre à jour un technicien
   */
  async update(
    id: string,
    updateDto: UpdateTechnicianDto,
  ): Promise<TechnicianDocument> {
    try {
      const technician = await this.technicianModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .exec();

      if (!technician) {
        throw new NotFoundException('Technicien non trouvé');
      }

      return technician;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Un technicien avec cet email existe déjà');
      }
      throw error;
    }
  }

  /**
   * Supprimer un technicien
   */
  async remove(id: string): Promise<void> {
    const result = await this.technicianModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Technicien non trouvé');
    }
  }

  /**
   * Incrémenter le compteur de missions complétées
   */
  async incrementCompletedMissions(id: string): Promise<void> {
    await this.technicianModel.findByIdAndUpdate(id, {
      $inc: { completedMissions: 1 },
    });
  }
}
