import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SoilAnalysisRequest,
  SoilAnalysisRequestDocument,
} from './schemas/soil-analysis-request.schema';
import {
  CreateSoilAnalysisRequestDto,
  UpdateSoilAnalysisRequestDto,
  FilterSoilAnalysisRequestsDto,
} from './dto';
import { createPaginatedResult, calculateSkip } from '../common/dto';

/**
 * Service pour la gestion des demandes d'analyse de sol
 */
@Injectable()
export class SoilAnalysisRequestsService {
  constructor(
    @InjectModel(SoilAnalysisRequest.name)
    private soilAnalysisRequestModel: Model<SoilAnalysisRequestDocument>,
  ) {}

  /**
   * Créer une nouvelle demande d'analyse de sol
   */
  async create(
    createDto: CreateSoilAnalysisRequestDto,
  ): Promise<SoilAnalysisRequestDocument> {
    const createdRequest = new this.soilAnalysisRequestModel(createDto);
    return createdRequest.save();
  }

  /**
   * Récupérer toutes les demandes avec filtres et pagination
   */
  async findAll(filterDto: FilterSoilAnalysisRequestsDto) {
    const { status, region, page = 1, limit = 10 } = filterDto;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (region) {
      query.region = region;
    }

    const skip = calculateSkip(page, limit);

    const [requests, total] = await Promise.all([
      this.soilAnalysisRequestModel
        .find(query)
        .populate('land', 'title surfaceHectares address type price status thumbnail')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.soilAnalysisRequestModel.countDocuments(query),
    ]);

    return createPaginatedResult(requests, total, page, limit);
  }

  /**
   * Récupérer une demande par ID
   */
  async findOne(id: string): Promise<SoilAnalysisRequestDocument> {
    const request = await this.soilAnalysisRequestModel
      .findById(id)
      .populate('land', 'title surfaceHectares address type price status thumbnail soilParameters recommendedCrops')
      .exec();

    if (!request) {
      throw new NotFoundException("Demande d'analyse non trouvée");
    }

    return request;
  }

  /**
   * Mettre à jour le statut d'une demande
   */
  async update(
    id: string,
    updateDto: UpdateSoilAnalysisRequestDto,
  ): Promise<SoilAnalysisRequestDocument> {
    const request = await this.soilAnalysisRequestModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('land', 'title surfaceHectares address type price status thumbnail')
      .exec();

    if (!request) {
      throw new NotFoundException("Demande d'analyse non trouvée");
    }

    return request;
  }

  /**
   * Lier une terre à une demande d'analyse
   */
  async linkLand(
    requestId: string,
    landId: string,
  ): Promise<SoilAnalysisRequestDocument> {
    const request = await this.soilAnalysisRequestModel
      .findByIdAndUpdate(requestId, { land: landId }, { new: true })
      .populate('land')
      .exec();

    if (!request) {
      throw new NotFoundException("Demande d'analyse non trouvée");
    }

    return request;
  }

  /**
   * Supprimer une demande
   */
  async remove(id: string): Promise<void> {
    const result = await this.soilAnalysisRequestModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException("Demande d'analyse non trouvée");
    }
  }
}
