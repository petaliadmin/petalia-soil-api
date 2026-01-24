import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Crop, CropDocument } from './schemas/crop.schema';
import { CreateCropDto, UpdateCropDto, FilterCropsDto } from './dto';

/**
 * Service pour la gestion des cultures
 */
@Injectable()
export class CropsService {
  constructor(
    @InjectModel(Crop.name) private cropModel: Model<CropDocument>,
  ) {}

  /**
   * Créer une nouvelle culture
   */
  async create(createCropDto: CreateCropDto): Promise<CropDocument> {
    // Vérifier si l'id existe déjà
    const existingCrop = await this.cropModel.findOne({ id: createCropDto.cropId });
    if (existingCrop) {
      throw new ConflictException(`Une culture avec l'id '${createCropDto.cropId}' existe déjà`);
    }

    const createdCrop = new this.cropModel({
      id: createCropDto.cropId,
      name: createCropDto.name,
      icon: createCropDto.icon,
      category: createCropDto.category,
      season: createCropDto.season,
      phRange: createCropDto.phRange,
      nitrogenRange: createCropDto.nitrogenRange,
      phosphorusRange: createCropDto.phosphorusRange,
      potassiumRange: createCropDto.potassiumRange,
      moistureRange: createCropDto.moistureRange,
      preferredTextures: createCropDto.preferredTextures,
      preferredDrainage: createCropDto.preferredDrainage,
      expectedYield: createCropDto.expectedYield,
      description: createCropDto.description,
      imageUrl: createCropDto.imageUrl,
    });

    return createdCrop.save();
  }

  /**
   * Récupérer toutes les cultures avec filtres et pagination
   */
  async findAll(filterDto: FilterCropsDto) {
    const { category, search, texture, drainage, page = 1, limit = 20 } = filterDto;

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (texture) {
      query.preferredTextures = texture;
    }

    if (drainage) {
      query.preferredDrainage = drainage;
    }

    const skip = (page - 1) * limit;

    const [crops, total] = await Promise.all([
      this.cropModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 })
        .exec(),
      this.cropModel.countDocuments(query),
    ]);

    return {
      data: crops,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer une culture par ID MongoDB
   */
  async findOne(id: string): Promise<CropDocument> {
    const crop = await this.cropModel.findById(id).exec();

    if (!crop) {
      throw new NotFoundException('Culture non trouvée');
    }

    return crop;
  }

  /**
   * Récupérer une culture par son identifiant (cropId)
   */
  async findByCropId(cropId: string): Promise<CropDocument> {
    const crop = await this.cropModel.findOne({ id: cropId }).exec();

    if (!crop) {
      throw new NotFoundException(`Culture '${cropId}' non trouvée`);
    }

    return crop;
  }

  /**
   * Récupérer les cultures par catégorie
   */
  async findByCategory(category: string): Promise<CropDocument[]> {
    return this.cropModel.find({ category }).sort({ name: 1 }).exec();
  }

  /**
   * Récupérer toutes les catégories disponibles
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.cropModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { category: 1 } },
    ]);
  }

  /**
   * Rechercher des cultures adaptées aux paramètres de sol
   */
  async findSuitableForSoil(
    ph: number,
    nitrogen: number,
    phosphorus: number,
    potassium: number,
    moisture: number,
    texture?: string,
    drainage?: string,
  ): Promise<CropDocument[]> {
    const query: any = {
      'phRange.min': { $lte: ph },
      'phRange.max': { $gte: ph },
      'nitrogenRange.min': { $lte: nitrogen },
      'nitrogenRange.max': { $gte: nitrogen },
      'phosphorusRange.min': { $lte: phosphorus },
      'phosphorusRange.max': { $gte: phosphorus },
      'potassiumRange.min': { $lte: potassium },
      'potassiumRange.max': { $gte: potassium },
      'moistureRange.min': { $lte: moisture },
      'moistureRange.max': { $gte: moisture },
    };

    if (texture) {
      query.preferredTextures = texture;
    }

    if (drainage) {
      query.preferredDrainage = drainage;
    }

    return this.cropModel.find(query).sort({ name: 1 }).exec();
  }

  /**
   * Mettre à jour une culture
   */
  async update(id: string, updateCropDto: UpdateCropDto): Promise<CropDocument> {
    const crop = await this.findOne(id);

    // Si le cropId est modifié, vérifier qu'il n'existe pas déjà
    if (updateCropDto.cropId && updateCropDto.cropId !== crop.id) {
      const existingCrop = await this.cropModel.findOne({ id: updateCropDto.cropId });
      if (existingCrop) {
        throw new ConflictException(`Une culture avec l'id '${updateCropDto.cropId}' existe déjà`);
      }
    }

    const updateData: any = { ...updateCropDto };
    if (updateCropDto.cropId) {
      updateData.id = updateCropDto.cropId;
      delete updateData.cropId;
    }

    Object.assign(crop, updateData);
    return crop.save();
  }

  /**
   * Supprimer une culture
   */
  async remove(id: string): Promise<void> {
    const result = await this.cropModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Culture non trouvée');
    }
  }

  /**
   * Compter le nombre total de cultures
   */
  async count(): Promise<number> {
    return this.cropModel.countDocuments();
  }
}
