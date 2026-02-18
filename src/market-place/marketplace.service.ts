import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

import {
  RegisterProviderDto,
  UpdateProviderDto,
  FilterProvidersDto,
  ApproveProviderDto,
  RejectProviderDto,
  LoginProviderDto,
} from './dto/provider.dto';
import {
  CreateServiceOfferDto,
  UpdateServiceOfferDto,
  FilterServiceOffersDto,
  CreateServiceRequestDto,
  RespondToServiceRequestDto,
  RateServiceRequestDto,
} from './dto/service.dto';
import { Provider, ProviderDocument } from './schema/provider.schema';
import { ServiceOffer, ServiceOfferDocument } from './schema/service-offer.schema';
import { ServiceRequest, ServiceRequestDocument } from './service-request.schema';
import { ProviderStatus, ServiceRequestStatus } from '@/common/enums/marketplace.enum';

/**
 * Génère un code d'accès unique pour le portail fournisseur
 */
function generateProviderAccessCode(prefix = 'PRV'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array.from(randomBytes(6))
    .map((byte) => chars[byte % chars.length])
    .join('');
  return `${prefix}-${randomPart}`;
}

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel(Provider.name)
    private providerModel: Model<ProviderDocument>,
    @InjectModel(ServiceOffer.name)
    private serviceOfferModel: Model<ServiceOfferDocument>,
    @InjectModel(ServiceRequest.name)
    private serviceRequestModel: Model<ServiceRequestDocument>,
    private jwtService: JwtService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════
  // AUTH FOURNISSEUR
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Inscription libre d'un fournisseur — statut PENDING jusqu'à validation admin
   */
  async register(dto: RegisterProviderDto) {
    const existing = await this.providerModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const provider = new this.providerModel({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      status: ProviderStatus.PENDING,
    });

    await provider.save();

    // On ne retourne pas le mot de passe
    const { password, ...result } = provider.toObject();
    return {
      ...result,
      message: 'Votre inscription a bien été enregistrée. Un administrateur va valider votre profil sous 24-48h.',
    };
  }

  /**
   * Connexion fournisseur — retourne un JWT
   */
  async login(dto: LoginProviderDto) {
    const provider = await this.providerModel.findOne({ email: dto.email.toLowerCase() });

    if (!provider) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const passwordOk = await bcrypt.compare(dto.password, provider.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (provider.status === ProviderStatus.REJECTED) {
      throw new UnauthorizedException('Votre demande d\'inscription a été refusée. Contactez l\'administration.');
    }

    if (provider.status === ProviderStatus.SUSPENDED) {
      throw new UnauthorizedException('Votre compte est suspendu. Contactez l\'administration.');
    }

    const payload = {
      sub: provider._id.toString(),
      email: provider.email,
      role: 'PROVIDER',
      providerType: provider.providerType,
      status: provider.status,
    };

    const { password, ...providerData } = provider.toObject();

    return {
      access_token: this.jwtService.sign(payload),
      provider: providerData,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // CRUD FOURNISSEURS (public + admin)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Liste publique des fournisseurs actifs
   */
  async findAll(filterDto: FilterProvidersDto) {
    const {
      providerType, region, search,
      page = 1, limit = 12, sortBy = 'rating',
    } = filterDto;

    const query: any = { status: ProviderStatus.ACTIVE };

    if (providerType) query.providerType = providerType;
    if (region) query.$or = [
      { coverageRegions: region },
      { nationalCoverage: true },
    ];
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions: any = {};
    if (sortBy === 'rating') sortOptions.averageRating = -1;
    else if (sortBy === 'completedServices') sortOptions.completedServices = -1;
    else sortOptions.createdAt = -1;

    // Featured toujours en premier
    sortOptions.isFeatured = -1;

    const skip = (page - 1) * limit;
    const [providers, total] = await Promise.all([
      this.providerModel
        .find(query)
        .select('-password -accessCode')
        .skip(skip)
        .limit(limit)
        .sort(sortOptions)
        .exec(),
      this.providerModel.countDocuments(query),
    ]);

    return {
      data: providers,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Liste admin (tous statuts)
   */
  async findAllAdmin(filterDto: FilterProvidersDto & { status?: ProviderStatus }) {
    const { providerType, region, search, page = 1, limit = 20 } = filterDto;
    const query: any = {};

    if ((filterDto as any).status) query.status = (filterDto as any).status;
    if (providerType) query.providerType = providerType;
    if (region) query.coverageRegions = region;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [providers, total] = await Promise.all([
      this.providerModel
        .find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.providerModel.countDocuments(query),
    ]);

    return { data: providers, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Détail d'un fournisseur (public)
   */
  async findOne(id: string): Promise<ProviderDocument> {
    const provider = await this.providerModel.findById(id).select('-password -accessCode');
    if (!provider) throw new NotFoundException('Fournisseur non trouvé');
    return provider;
  }

  /**
   * Mise à jour du profil (par le fournisseur lui-même)
   */
  async updateProfile(providerId: string, dto: UpdateProviderDto): Promise<ProviderDocument> {
    const provider = await this.providerModel.findByIdAndUpdate(
      providerId,
      { $set: dto },
      { new: true },
    ).select('-password -accessCode');

    if (!provider) throw new NotFoundException('Fournisseur non trouvé');
    return provider;
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACTIONS ADMIN
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Approuver un fournisseur → génère son code d'accès portail
   */
  async approve(id: string, dto: ApproveProviderDto): Promise<ProviderDocument> {
    const provider = await this.providerModel.findById(id);
    if (!provider) throw new NotFoundException('Fournisseur non trouvé');

    const accessCode = generateProviderAccessCode(
      provider.providerType.substring(0, 3).toUpperCase(),
    );

    const updated = await this.providerModel.findByIdAndUpdate(
      id,
      {
        status: ProviderStatus.ACTIVE,
        isVerified: true,
        isFeatured: dto.isFeatured ?? false,
        accessCode,
        approvedAt: new Date(),
        rejectionReason: null,
      },
      { new: true },
    ).select('-password');

    return updated!;
  }

  /**
   * Rejeter un fournisseur avec motif
   */
  async reject(id: string, dto: RejectProviderDto): Promise<ProviderDocument> {
    const provider = await this.providerModel.findByIdAndUpdate(
      id,
      {
        status: ProviderStatus.REJECTED,
        rejectionReason: dto.reason,
      },
      { new: true },
    ).select('-password -accessCode');

    if (!provider) throw new NotFoundException('Fournisseur non trouvé');
    return provider;
  }

  /**
   * Suspendre ou réactiver un fournisseur
   */
  async toggleSuspension(id: string): Promise<ProviderDocument> {
    const provider = await this.providerModel.findById(id);
    if (!provider) throw new NotFoundException('Fournisseur non trouvé');

    const newStatus = provider.status === ProviderStatus.SUSPENDED
      ? ProviderStatus.ACTIVE
      : ProviderStatus.SUSPENDED;

    return (await this.providerModel.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true },
    ).select('-password -accessCode'))!;
  }

  /**
   * Mettre en avant / retirer de la mise en avant
   */
  async toggleFeatured(id: string): Promise<ProviderDocument> {
    const provider = await this.providerModel.findById(id);
    if (!provider) throw new NotFoundException('Fournisseur non trouvé');

    return (await this.providerModel.findByIdAndUpdate(
      id,
      { isFeatured: !provider.isFeatured },
      { new: true },
    ).select('-password -accessCode'))!;
  }

  // ═══════════════════════════════════════════════════════════════════
  // OFFRES DE SERVICE
  // ═══════════════════════════════════════════════════════════════════

  async createOffer(providerId: string, dto: CreateServiceOfferDto) {
    const offer = new this.serviceOfferModel({ ...dto, provider: providerId });
    return offer.save();
  }

  async updateOffer(providerId: string, offerId: string, dto: UpdateServiceOfferDto) {
    const offer = await this.serviceOfferModel.findOneAndUpdate(
      { _id: offerId, provider: providerId },
      { $set: dto },
      { new: true },
    );
    if (!offer) throw new NotFoundException('Offre non trouvée ou accès non autorisé');
    return offer;
  }

  async deleteOffer(providerId: string, offerId: string) {
    const result = await this.serviceOfferModel.findOneAndDelete({ _id: offerId, provider: providerId });
    if (!result) throw new NotFoundException('Offre non trouvée ou accès non autorisé');
    return { success: true };
  }

  async getOffersByProvider(providerId: string) {
    return this.serviceOfferModel.find({ provider: providerId, status: { $ne: 'archived' } }).sort({ createdAt: -1 });
  }

  async searchOffers(filterDto: FilterServiceOffersDto) {
    const { category, region, search, maxPrice, page = 1, limit = 12 } = filterDto;
    const query: any = { status: 'active' };

    if (category) query.category = { $regex: category, $options: 'i' };
    if (maxPrice) query.price = { $lte: maxPrice };
    if (region) query.$or = [{ availableRegions: region }, { isAvailableNationwide: true }];
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];

    const skip = (page - 1) * limit;
    const [offers, total] = await Promise.all([
      this.serviceOfferModel
        .find(query)
        .populate('provider', 'fullName companyName averageRating isVerified avatar providerType')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.serviceOfferModel.countDocuments(query),
    ]);

    return { data: offers, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ═══════════════════════════════════════════════════════════════════
  // DEMANDES DE SERVICE
  // ═══════════════════════════════════════════════════════════════════

  async createRequest(dto: CreateServiceRequestDto, userId?: string) {
    const provider = await this.providerModel.findById(dto.providerId);
    if (!provider || provider.status !== ProviderStatus.ACTIVE) {
      throw new NotFoundException('Fournisseur non disponible');
    }

    const request = new this.serviceRequestModel({
      provider: dto.providerId,
      serviceOffer: dto.serviceOfferId || undefined,
      requestedBy: userId || undefined,
      clientName: dto.clientName,
      clientPhone: dto.clientPhone,
      clientEmail: dto.clientEmail,
      clientRegion: dto.clientRegion,
      clientCommune: dto.clientCommune,
      description: dto.description,
      surfaceHectares: dto.surfaceHectares,
      preferredDate: dto.preferredDate,
      urgency: dto.urgency || 'normal',
      status: ServiceRequestStatus.PENDING,
    });

    // Incrémenter le compteur de demandes de l'offre
    if (dto.serviceOfferId) {
      await this.serviceOfferModel.findByIdAndUpdate(dto.serviceOfferId, { $inc: { requestCount: 1 } });
    }

    return request.save();
  }

  async getRequestsByProvider(providerId: string) {
    return this.serviceRequestModel
      .find({ provider: providerId })
      .populate('serviceOffer', 'title price priceUnit')
      .populate('requestedBy', 'fullName email phone')
      .sort({ createdAt: -1 });
  }

  async getRequestsByUser(userId: string) {
    return this.serviceRequestModel
      .find({ requestedBy: userId })
      .populate('provider', 'fullName companyName phone whatsapp providerType averageRating')
      .populate('serviceOffer', 'title price')
      .sort({ createdAt: -1 });
  }

  async respondToRequest(providerId: string, requestId: string, dto: RespondToServiceRequestDto) {
    const request = await this.serviceRequestModel.findOne({ _id: requestId, provider: providerId });
    if (!request) throw new NotFoundException('Demande non trouvée');

    const newStatus = dto.action === 'accepted'
      ? ServiceRequestStatus.ACCEPTED
      : ServiceRequestStatus.DECLINED;

    const updated = await this.serviceRequestModel.findByIdAndUpdate(
      requestId,
      {
        status: newStatus,
        providerResponse: dto.response,
        quotedPrice: dto.quotedPrice,
      },
      { new: true },
    );

    return updated;
  }

  async rateRequest(userId: string, requestId: string, dto: RateServiceRequestDto) {
    const request = await this.serviceRequestModel.findOne({
      _id: requestId,
      requestedBy: userId,
      status: ServiceRequestStatus.COMPLETED,
    });
    if (!request) throw new NotFoundException('Demande non trouvée ou non terminée');

    request.rating = dto.rating;
    request.review = dto.review;
    await request.save();

    // Recalculer la note moyenne du fournisseur
    const allRatings = await this.serviceRequestModel.find({
      provider: request.provider,
      rating: { $exists: true, $ne: null },
    }).select('rating');

    if (allRatings.length > 0) {
      const avg = allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length;
      await this.providerModel.findByIdAndUpdate(request.provider, {
        averageRating: Math.round(avg * 10) / 10,
        reviewCount: allRatings.length,
      });
    }

    return request;
  }

  // ═══════════════════════════════════════════════════════════════════
  // STATS POUR L'ADMIN
  // ═══════════════════════════════════════════════════════════════════

  async getMarketplaceStats() {
    const [total, pending, active, byType] = await Promise.all([
      this.providerModel.countDocuments(),
      this.providerModel.countDocuments({ status: ProviderStatus.PENDING }),
      this.providerModel.countDocuments({ status: ProviderStatus.ACTIVE }),
      this.providerModel.aggregate([
        { $group: { _id: '$providerType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totalRequests = await this.serviceRequestModel.countDocuments();
    const pendingRequests = await this.serviceRequestModel.countDocuments({ status: ServiceRequestStatus.PENDING });

    return { total, pending, active, byType, totalRequests, pendingRequests };
  }
}
