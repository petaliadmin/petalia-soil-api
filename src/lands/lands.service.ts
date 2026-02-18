import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Land, LandDocument } from './schemas/land.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  SoilAnalysisRequest,
  SoilAnalysisRequestDocument,
} from '../soil-analysis-requests/schemas/soil-analysis-request.schema';
import { CreateLandDto, UpdateLandDto, FilterLandsDto } from './dto';
import { LandStatus, AnalysisRequestStatus } from '../common/enums';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { createPaginatedResult, calculateSkip } from '../common/dto';

/**
 * Service pour la gestion des terres agricoles
 */
@Injectable()
export class LandsService {
  constructor(
    @InjectModel(Land.name) private landModel: Model<LandDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SoilAnalysisRequest.name)
    private soilAnalysisRequestModel: Model<SoilAnalysisRequestDocument>,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Créer une nouvelle annonce de terre
   * Génère automatiquement une demande d'analyse de sol
   */
  async create(
    createLandDto: CreateLandDto,
    ownerId: string,
  ): Promise<LandDocument> {
    const createdLand = new this.landModel({
      ...createLandDto,
      owner: ownerId,
      status: LandStatus.AVAILABLE,
      isValidated: true,
    });

    const savedLand = await createdLand.save();

    // Récupérer les infos du propriétaire pour la demande d'analyse
    const owner = await this.userModel.findById(ownerId).exec();

    if (owner && createLandDto.address?.region) {
      const analysisRequest = new this.soilAnalysisRequestModel({
        fullName: owner.fullName,
        email: owner.email,
        phone: owner.phone,
        region: createLandDto.address.region,
        commune: createLandDto.address.commune || '',
        surface: createLandDto.surfaceHectares,
        description: `Demande d'analyse automatique pour la terre: ${createLandDto.title}`,
        land: savedLand._id,
        status: AnalysisRequestStatus.PENDING,
        ...(createLandDto.location?.coordinates && {
          coordinates: {
            latitude: createLandDto.location.coordinates[1],
            longitude: createLandDto.location.coordinates[0],
          },
        }),
      });
      await analysisRequest.save();
    }

    return savedLand;
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

    // Seules les terres validées sont affichées
    query.isValidated = true;

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

    const skip = calculateSkip(page, limit);

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

    return createPaginatedResult(lands, total, page, limit);
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

  /**
   * Créer une terre par un provider/agronome (en attente de validation admin)
   */
  async createByProvider(
    createLandDto: CreateLandDto,
    ownerId: string,
    providerId: string,
  ): Promise<LandDocument> {
    const createdLand = new this.landModel({
      ...createLandDto,
      owner: ownerId,
      status: LandStatus.AVAILABLE,
      isValidated: false,
      createdByProvider: providerId,
    });

    return createdLand.save();
  }

  /**
   * Mettre à jour les paramètres du sol par un provider/agronome
   */
  async updateSoilParametersByProvider(
    id: string,
    soilParameters: any,
    providerId: string,
  ): Promise<LandDocument> {
    const land = await this.findOne(id);

    const recommendations = this.recommendationsService.generateRecommendations(
      soilParameters,
    );
    land.recommendedCrops = recommendations.map((rec) => ({
      name: rec.name,
      suitability: rec.suitability,
      icon: rec.icon,
      season: rec.season,
      expectedYield: rec.expectedYield,
    }));

    land.soilParameters = {
      ...soilParameters,
      measuredBy: providerId,
      measurementDate: soilParameters.measurementDate
        ? new Date(soilParameters.measurementDate)
        : new Date(),
    };
    return land.save();
  }

  /**
   * Mettre à jour la géolocalisation et les photos par un technicien
   */
  async updateLocationAndPhotos(
    id: string,
    data: {
      location?: { type?: string; coordinates: number[] };
      images?: string[];
      thumbnail?: string;
    },
  ): Promise<LandDocument> {
    const land = await this.findOne(id);

    if (data.location) {
      land.location = {
        type: data.location.type || 'Point',
        coordinates: data.location.coordinates,
      } as any;
    }

    if (data.images) {
      land.images = [...(land.images || []), ...data.images];
    }

    if (data.thumbnail) {
      land.thumbnail = data.thumbnail;
    }

    return land.save();
  }

  /**
   * Valider une terre (Admin uniquement)
   */
  async validateLand(id: string, adminId: string): Promise<LandDocument> {
    const land = await this.landModel.findByIdAndUpdate(
      id,
      {
        isValidated: true,
        validatedBy: adminId,
        validatedAt: new Date(),
      },
      { new: true },
    ).populate('owner', 'fullName email phone whatsapp avatar');

    if (!land) {
      throw new NotFoundException('Terre non trouvée');
    }

    return land;
  }

  /**
   * Rejeter/Invalider une terre (Admin uniquement)
   */
  async invalidateLand(id: string): Promise<LandDocument> {
    const land = await this.landModel.findByIdAndUpdate(
      id,
      {
        isValidated: false,
        validatedBy: null,
        validatedAt: null,
      },
      { new: true },
    ).populate('owner', 'fullName email phone whatsapp avatar');

    if (!land) {
      throw new NotFoundException('Terre non trouvée');
    }

    return land;
  }

  /**
   * Récupérer les terres en attente de validation (Admin)
   */
  async findPendingValidation(page: number = 1, limit: number = 10) {
    const query = { isValidated: false };
    const skip = calculateSkip(page, limit);

    const [lands, total] = await Promise.all([
      this.landModel
        .find(query)
        .populate('owner', 'fullName email phone whatsapp avatar')
        .populate('createdByProvider', 'fullName email phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.landModel.countDocuments(query),
    ]);

    return createPaginatedResult(lands, total, page, limit);
  }
}
