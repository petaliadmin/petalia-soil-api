import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Land, LandDocument } from './schemas/land.schema';
import { CreateLandDto, UpdateLandDto, FilterLandsDto } from './dto';

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
  async create(createLandDto: CreateLandDto, ownerId: string): Promise<Land> {
    const createdLand = new this.landModel({
      ...createLandDto,
      owner: ownerId,
    });

    return createdLand.save();
  }

  /**
   * Récupérer toutes les terres avec filtres et pagination
   */
  async findAll(filterDto: FilterLandsDto) {
    const { 
      type, 
      minSurface, 
      maxSurface, 
      minPh, 
      maxPh, 
      page = 1, 
      limit = 10 
    } = filterDto;

    const query: any = { isAvailable: true };

    if (type) {
      query.type = type;
    }

    if (minSurface !== undefined || maxSurface !== undefined) {
      query.surfaceHectares = {};
      if (minSurface !== undefined) {
        query.surfaceHectares.$gte = minSurface;
      }
      if (maxSurface !== undefined) {
        query.surfaceHectares.$lte = maxSurface;
      }
    }

    if (minPh !== undefined || maxPh !== undefined) {
      query['soil.ph'] = {};
      if (minPh !== undefined) {
        query['soil.ph'].$gte = minPh;
      }
      if (maxPh !== undefined) {
        query['soil.ph'].$lte = maxPh;
      }
    }

    const skip = (page - 1) * limit;

    const [lands, total] = await Promise.all([
      this.landModel
        .find(query)
        .populate('owner', 'fullName email phone')
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
  async findOne(id: string): Promise<Land> {
    const land = await this.landModel
      .findById(id)
      .populate('owner', 'fullName email phone')
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
      .find({ isAvailable: true })
      .select('title type price location surfaceHectares')
      .exec();
  }

  /**
   * Recherche géographique par rayon (en kilomètres)
   */
  async findNearby(longitude: number, latitude: number, radiusKm: number) {
    const radiusMeters = radiusKm * 1000;

    return this.landModel
      .find({
        isAvailable: true,
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: radiusMeters,
          },
        },
      })
      .populate('owner', 'fullName email phone')
      .exec();
  }

  /**
   * Mettre à jour une terre
   */
  async update(
    id: string, 
    updateLandDto: UpdateLandDto, 
    userId: string
  ): Promise<Land> {
    const land = await this.findOne(id);

    // Vérifier que l'utilisateur est le propriétaire
    if (land.owner._id.toString() !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette terre');
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
    if (land.owner._id.toString() !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cette terre');
    }

    await this.landModel.findByIdAndDelete(id);
  }

  /**
   * Récupérer les terres d'un propriétaire
   */
  async findByOwner(ownerId: string): Promise<Land[]> {
    return this.landModel
      .find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
