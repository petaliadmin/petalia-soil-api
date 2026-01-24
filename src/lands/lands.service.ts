import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Land, LandDocument } from './schemas/land.schema';
import { CreateLandDto, UpdateLandDto, FilterLandsDto } from './dto';
import { LandStatus } from '../common/enums';

/**
 * Service pour la gestion des terres agricoles
 */
@Injectable()
export class LandsService {
  constructor(
    @InjectModel(Land.name) private landModel: Model<LandDocument>,
  ) {}

  /**
   * Créer une nouvelle annonce de terre
   */
  async create(
    createLandDto: CreateLandDto,
    ownerId: string,
  ): Promise<LandDocument> {
    const createdLand = new this.landModel({
      ...createLandDto,
      owner: ownerId,
      status: LandStatus.AVAILABLE,
    });

    return createdLand.save();
  }

  /**
   * Récupérer toutes les terres avec filtres et pagination
   */
  async findAll(filterDto: FilterLandsDto) {
    const {
      type,
      status,
      region,
      minSurface,
      maxSurface,
      minPh,
      maxPh,
      page = 1,
      limit = 10,
    } = filterDto;

    const query: any = {};

    // Par défaut, ne montrer que les terres disponibles
    query.status = status || LandStatus.AVAILABLE;

    if (type) {
      query.type = type;
    }

    if (region) {
      query['address.region'] = { $regex: region, $options: 'i' };
    }

    if (minSurface !== undefined || maxSurface !== undefined) {
      query.surface = {};
      if (minSurface !== undefined) {
        query.surface.$gte = minSurface;
      }
      if (maxSurface !== undefined) {
        query.surface.$lte = maxSurface;
      }
    }

    if (minPh !== undefined || maxPh !== undefined) {
      query['soilParameters.ph'] = {};
      if (minPh !== undefined) {
        query['soilParameters.ph'].$gte = minPh;
      }
      if (maxPh !== undefined) {
        query['soilParameters.ph'].$lte = maxPh;
      }
    }

    const skip = (page - 1) * limit;

    const [lands, total] = await Promise.all([
      this.landModel
        .find(query)
        .populate('owner', 'fullName email phone whatsapp avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.landModel.countDocuments(query),
    ]);

    return {
      data: lands,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer une terre par ID
   */
  async findOne(id: string): Promise<LandDocument> {
    const land = await this.landModel
      .findById(id)
      .populate('owner', 'fullName email phone whatsapp avatar')
      .exec();

    if (!land) {
      throw new NotFoundException('Terre non trouvée');
    }

    return land;
  }

  /**
   * Récupérer une terre par ID et incrémenter les vues
   */
  async findOneAndIncrementViews(id: string): Promise<LandDocument> {
    const land = await this.landModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate('owner', 'fullName email phone whatsapp avatar')
      .exec();

    if (!land) {
      throw new NotFoundException('Terre non trouvée');
    }

    return land;
  }

  /**
   * Récupérer les terres pour affichage sur carte
   */
  async findForMap() {
    return this.landModel
      .find({ status: LandStatus.AVAILABLE })
      .select('title type price location address surface thumbnail')
      .exec();
  }

  /**
   * Recherche géographique par rayon (en kilomètres)
   */
  async findNearby(longitude: number, latitude: number, radiusKm: number) {
    const radiusMeters = radiusKm * 1000;

    return this.landModel
      .find({
        status: LandStatus.AVAILABLE,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radiusMeters,
          },
        },
      })
      .populate('owner', 'fullName email phone whatsapp avatar')
      .exec();
  }

  /**
   * Mettre à jour une terre
   */
  async update(
    id: string,
    updateLandDto: UpdateLandDto,
    userId: string,
  ): Promise<LandDocument> {
    const land = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    const ownerId =
      (land.owner as any)._id?.toString() || land.owner.toString();
    if (ownerId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cette terre",
      );
    }

    Object.assign(land, updateLandDto);
    return land.save();
  }

  /**
   * Supprimer une terre
   */
  async remove(id: string, userId: string): Promise<void> {
    const land = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    const ownerId =
      (land.owner as any)._id?.toString() || land.owner.toString();
    if (ownerId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer cette terre",
      );
    }

    await this.landModel.findByIdAndDelete(id);
  }

  /**
   * Récupérer les terres d'un propriétaire
   */
  async findByOwner(ownerId: string): Promise<LandDocument[]> {
    return this.landModel.find({ owner: ownerId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Récupérer les recommandations de cultures pour une terre
   */
  async getRecommendations(id: string) {
    const land = await this.findOne(id);
    return land.recommendedCrops || [];
  }
}
