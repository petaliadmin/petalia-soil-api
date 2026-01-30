import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserFavorite,
  UserFavoriteDocument,
  LandRental,
  LandRentalDocument,
  UserVisit,
  UserVisitDocument,
} from './schemas';
import { Land, LandDocument } from '../lands/schemas/land.schema';
import { CreateRentalRequestDto, UpdateRentalStatusDto } from './dto';
import { RentalStatus } from '../common/enums';

/**
 * Service pour la gestion des interactions utilisateur-terre
 */
@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(UserFavorite.name)
    private userFavoriteModel: Model<UserFavoriteDocument>,
    @InjectModel(LandRental.name)
    private landRentalModel: Model<LandRentalDocument>,
    @InjectModel(UserVisit.name)
    private userVisitModel: Model<UserVisitDocument>,
    @InjectModel(Land.name)
    private landModel: Model<LandDocument>,
  ) {}

  // ==================== FAVORIS ====================

  /**
   * Ajouter une terre aux favoris
   */
  async addFavorite(userId: string, landId: string): Promise<UserFavoriteDocument> {
    // Vérifier que la terre existe
    const land = await this.landModel.findById(landId);
    if (!land) {
      throw new NotFoundException('Terre non trouvée');
    }

    try {
      const favorite = new this.userFavoriteModel({ userId, landId });
      const saved = await favorite.save();

      // Incrémenter le compteur de favoris sur la terre
      await this.landModel.findByIdAndUpdate(landId, { $inc: { favorites: 1 } });

      return saved;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Cette terre est déjà dans vos favoris');
      }
      throw error;
    }
  }

  /**
   * Retirer une terre des favoris
   */
  async removeFavorite(userId: string, landId: string): Promise<void> {
    const result = await this.userFavoriteModel.findOneAndDelete({
      userId,
      landId,
    });

    if (result) {
      // Décrémenter le compteur de favoris sur la terre
      await this.landModel.findByIdAndUpdate(landId, { $inc: { favorites: -1 } });
    }
  }

  /**
   * Vérifier si une terre est dans les favoris
   */
  async isFavorite(userId: string, landId: string): Promise<boolean> {
    const favorite = await this.userFavoriteModel.findOne({ userId, landId });
    return !!favorite;
  }

  /**
   * Récupérer les IDs des terres favorites d'un utilisateur
   */
  async getFavoriteLandIds(userId: string): Promise<string[]> {
    const favorites = await this.userFavoriteModel
      .find({ userId })
      .select('landId')
      .exec();
    return favorites.map((f) => f.landId.toString());
  }

  // ==================== DEMANDES DE LOCATION ====================

  /**
   * Créer une demande de location
   */
  async createRentalRequest(
    userId: string,
    landId: string,
    dto: CreateRentalRequestDto,
  ): Promise<LandRentalDocument> {
    // Vérifier que la terre existe
    const land = await this.landModel.findById(landId).populate('owner');
    if (!land) {
      throw new NotFoundException('Terre non trouvée');
    }

    // Vérifier que l'utilisateur n'est pas le propriétaire
    const ownerId = (land.owner as any)._id?.toString() || land.owner.toString();
    if (ownerId === userId) {
      throw new BadRequestException(
        'Vous ne pouvez pas louer votre propre terre',
      );
    }

    // Vérifier qu'il n'y a pas déjà une demande en cours
    const existingRequest = await this.landRentalModel.findOne({
      userId,
      landId,
      status: RentalStatus.PENDING,
    });

    if (existingRequest) {
      throw new ConflictException(
        'Vous avez déjà une demande en cours pour cette terre',
      );
    }

    const rentalRequest = new this.landRentalModel({
      userId,
      landId,
      status: RentalStatus.PENDING,
      message: dto.message,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });

    return rentalRequest.save();
  }

  /**
   * Récupérer les demandes de location d'un agriculteur
   */
  async getMyRentalRequests(userId: string): Promise<LandRentalDocument[]> {
    return this.landRentalModel
      .find({ userId })
      .populate('landId', 'title thumbnail surfaceHectares price type address')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Récupérer les demandes de location reçues par un propriétaire
   */
  async getReceivedRentalRequests(ownerId: string): Promise<LandRentalDocument[]> {
    // Trouver les terres du propriétaire
    const ownerLands = await this.landModel.find({ owner: ownerId }).select('_id');
    const landIds = ownerLands.map((l) => l._id);

    return this.landRentalModel
      .find({ landId: { $in: landIds } })
      .populate('userId', 'fullName email phone whatsapp avatar')
      .populate('landId', 'title thumbnail surfaceHectares price type address')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Mettre à jour le statut d'une demande de location (propriétaire uniquement)
   */
  async updateRentalStatus(
    rentalId: string,
    ownerId: string,
    dto: UpdateRentalStatusDto,
  ): Promise<LandRentalDocument> {
    const rental = await this.landRentalModel
      .findById(rentalId)
      .populate('landId');

    if (!rental) {
      throw new NotFoundException('Demande de location non trouvée');
    }

    // Vérifier que l'utilisateur est le propriétaire de la terre
    const land = rental.landId as any;
    const landOwnerId = land.owner?.toString() || land.owner;

    if (landOwnerId !== ownerId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cette demande",
      );
    }

    // Vérifier que la demande est en attente
    if (rental.status !== RentalStatus.PENDING) {
      throw new BadRequestException(
        'Cette demande a déjà été traitée',
      );
    }

    rental.status = dto.status;
    if (dto.ownerResponse) {
      rental.ownerResponse = dto.ownerResponse;
    }

    return rental.save();
  }

  /**
   * Annuler une demande de location (agriculteur uniquement)
   */
  async cancelRentalRequest(
    rentalId: string,
    userId: string,
  ): Promise<LandRentalDocument> {
    const rental = await this.landRentalModel.findById(rentalId);

    if (!rental) {
      throw new NotFoundException('Demande de location non trouvée');
    }

    if (rental.userId.toString() !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à annuler cette demande",
      );
    }

    if (rental.status !== RentalStatus.PENDING) {
      throw new BadRequestException(
        'Seules les demandes en attente peuvent être annulées',
      );
    }

    rental.status = RentalStatus.CANCELLED;
    return rental.save();
  }

  /**
   * Récupérer les IDs des terres louées (demandes acceptées) par un utilisateur
   */
  async getRentedLandIds(userId: string): Promise<string[]> {
    const rentals = await this.landRentalModel
      .find({ userId, status: RentalStatus.ACCEPTED })
      .select('landId')
      .exec();
    return rentals.map((r) => r.landId.toString());
  }

  // ==================== VISITES ====================

  /**
   * Enregistrer une visite (consultation) d'une terre
   */
  async recordVisit(userId: string, landId: string): Promise<void> {
    try {
      await this.userVisitModel.findOneAndUpdate(
        { userId, landId },
        { visitedAt: new Date() },
        { upsert: true },
      );
    } catch (error) {
      // Ignorer les erreurs silencieusement pour ne pas bloquer la consultation
      console.error('Erreur lors de l\'enregistrement de la visite:', error);
    }
  }

  /**
   * Récupérer les IDs des terres visitées par un utilisateur
   */
  async getVisitedLandIds(userId: string): Promise<string[]> {
    const visits = await this.userVisitModel
      .find({ userId })
      .select('landId')
      .sort({ visitedAt: -1 })
      .exec();
    return visits.map((v) => v.landId.toString());
  }

  // ==================== ESPACE PERSONNEL ====================

  /**
   * Récupérer les statistiques d'interaction pour un utilisateur
   */
  async getUserStats(userId: string) {
    const [favoritesCount, rentalsCount, visitsCount] = await Promise.all([
      this.userFavoriteModel.countDocuments({ userId }),
      this.landRentalModel.countDocuments({ userId }),
      this.userVisitModel.countDocuments({ userId }),
    ]);

    return {
      favorites: favoritesCount,
      rentalRequests: rentalsCount,
      visits: visitsCount,
    };
  }
}
