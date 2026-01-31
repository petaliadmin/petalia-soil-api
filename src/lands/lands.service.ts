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
import { RecommendationsService } from '../recommendations/recommendations.service';

/**
 * Service pour la gestion des terres agricoles
 */
@Injectable()
export class LandsService {
  constructor(
    @InjectModel(Land.name) private landModel: Model<LandDocument>,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Créer une nouvelle annonce de terre
   * Génère automatiquement les recommandations de cultures si les paramètres du sol sont fournis
   */
  async create(
    createLandDto: CreateLandDto,
    ownerId: string,
  ): Promise<LandDocument> {
    let recommendedCrops = [];

    // Générer les recommandations si les paramètres du sol sont fournis
    if (createLandDto.soilParameters) {
      const recommendations = this.recommendationsService.generateRecommendations(
        createLandDto.soilParameters as any,
      );
      recommendedCrops = recommendations.map((rec) => ({
        name: rec.name,
        suitability: rec.suitability,
        icon: rec.icon,
        season: rec.season,
        expectedYield: rec.expectedYield,
      }));
    }

    const createdLand = new this.landModel({
      ...createLandDto,
      owner: ownerId,
      status: LandStatus.AVAILABLE,
      recommendedCrops,
    });

    return createdLand.save();
  }

  /**
   * Récupérer toutes les terres avec filtres et pagination
   * Exclut par défaut les terres vendues (SOLD) et louées (RENTED)
   * Triées par date de création décroissante (les plus récentes en premier)
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

    // Exclure les terres vendues et louées de la liste principale
    // Seules les terres AVAILABLE et PENDING sont affichées par défaut
    if (status) {
      query.status = status;
    } else {
      query.status = { $nin: [LandStatus.SOLD, LandStatus.RENTED] };
    }

    if (type) {
      query.type = type;
    }

    if (region) {
      query['address.region'] = { $regex: region, $options: 'i' };
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
      .select('title type price location address surfaceHectares thumbnail')
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
   * Régénère les recommandations si les paramètres du sol sont mis à jour
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

    // Régénérer les recommandations si les paramètres du sol sont mis à jour
    if (updateLandDto.soilParameters) {
      const recommendations = this.recommendationsService.generateRecommendations(
        updateLandDto.soilParameters as any,
      );
      land.recommendedCrops = recommendations.map((rec) => ({
        name: rec.name,
        suitability: rec.suitability,
        icon: rec.icon,
        season: rec.season,
        expectedYield: rec.expectedYield,
      }));
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

  /**
   * Récupérer les terres par liste d'IDs
   */
  async findByIds(ids: string[]): Promise<LandDocument[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return this.landModel
      .find({ _id: { $in: ids } })
      .populate('owner', 'fullName email phone whatsapp avatar')
      .sort({ createdAt: -1 })
      .exec();
  }
}
