import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mission, MissionDocument } from './schemas/mission.schema';
import { Technician, TechnicianDocument } from './schemas/technician.schema';
import {
  SoilAnalysisRequest,
  SoilAnalysisRequestDocument,
} from '../soil-analysis-requests/schemas/soil-analysis-request.schema';
import { CreateMissionDto, UpdateMissionDto, FilterMissionsDto } from './dto';
import { MissionStatus, AnalysisRequestStatus, TechnicianStatus } from '../common/enums';

/**
 * Service pour la gestion des ordres de mission
 */
@Injectable()
export class MissionsService {
  constructor(
    @InjectModel(Mission.name)
    private missionModel: Model<MissionDocument>,
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
    @InjectModel(SoilAnalysisRequest.name)
    private analysisRequestModel: Model<SoilAnalysisRequestDocument>,
  ) {}

  /**
   * Créer un nouvel ordre de mission
   */
  async create(
    createDto: CreateMissionDto,
    adminId: string,
  ): Promise<MissionDocument> {
    // Vérifier que la demande d'analyse existe
    const analysisRequest = await this.analysisRequestModel.findById(
      createDto.analysisRequestId,
    );
    if (!analysisRequest) {
      throw new NotFoundException("Demande d'analyse non trouvée");
    }

    // Vérifier que le technicien existe et est actif
    const technician = await this.technicianModel.findById(
      createDto.technicianId,
    );
    if (!technician) {
      throw new NotFoundException('Technicien non trouvé');
    }
    if (technician.status !== TechnicianStatus.ACTIVE) {
      throw new BadRequestException("Ce technicien n'est pas disponible");
    }

    // Créer la mission
    const mission = new this.missionModel({
      analysisRequest: createDto.analysisRequestId,
      technician: createDto.technicianId,
      assignedBy: adminId,
      scheduledDate: new Date(createDto.scheduledDate),
      instructions: createDto.instructions,
      status: MissionStatus.ASSIGNED,
    });

    const savedMission = await mission.save();

    // Mettre à jour le statut de la demande d'analyse
    await this.analysisRequestModel.findByIdAndUpdate(
      createDto.analysisRequestId,
      { status: AnalysisRequestStatus.PROCESSING },
    );

    return savedMission.populate([
      { path: 'technician', select: 'fullName email phone' },
      { path: 'analysisRequest', select: 'fullName region commune surface' },
    ]);
  }

  /**
   * Récupérer toutes les missions avec filtres et pagination
   */
  async findAll(filterDto: FilterMissionsDto) {
    const { status, technicianId, page = 1, limit = 10 } = filterDto;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (technicianId) {
      query.technician = technicianId;
    }

    const skip = (page - 1) * limit;

    const [missions, total] = await Promise.all([
      this.missionModel
        .find(query)
        .populate('technician', 'fullName email phone')
        .populate('analysisRequest', 'fullName email phone region commune surface')
        .populate('assignedBy', 'fullName email')
        .skip(skip)
        .limit(limit)
        .sort({ scheduledDate: -1 })
        .exec(),
      this.missionModel.countDocuments(query),
    ]);

    return {
      data: missions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupérer une mission par ID
   */
  async findOne(id: string): Promise<MissionDocument> {
    const mission = await this.missionModel
      .findById(id)
      .populate('technician', 'fullName email phone specialization')
      .populate('analysisRequest')
      .populate('assignedBy', 'fullName email')
      .exec();

    if (!mission) {
      throw new NotFoundException('Mission non trouvée');
    }

    return mission;
  }

  /**
   * Récupérer les missions d'un technicien
   */
  async findByTechnician(technicianId: string): Promise<MissionDocument[]> {
    return this.missionModel
      .find({ technician: technicianId })
      .populate('analysisRequest', 'fullName region commune surface scheduledDate')
      .sort({ scheduledDate: -1 })
      .exec();
  }

  /**
   * Récupérer la mission associée à une demande d'analyse
   */
  async findByAnalysisRequest(analysisRequestId: string): Promise<MissionDocument | null> {
    return this.missionModel
      .findOne({ analysisRequest: analysisRequestId })
      .populate('technician', 'fullName email phone')
      .exec();
  }

  /**
   * Mettre à jour une mission
   */
  async update(
    id: string,
    updateDto: UpdateMissionDto,
  ): Promise<MissionDocument> {
    const mission = await this.missionModel.findById(id);

    if (!mission) {
      throw new NotFoundException('Mission non trouvée');
    }

    // Si la mission est marquée comme complétée
    if (updateDto.status === MissionStatus.COMPLETED && mission.status !== MissionStatus.COMPLETED) {
      updateDto.completedDate = updateDto.completedDate || new Date().toISOString();

      // Incrémenter le compteur de missions du technicien
      await this.technicianModel.findByIdAndUpdate(mission.technician, {
        $inc: { completedMissions: 1 },
      });

      // Mettre à jour le statut de la demande d'analyse
      await this.analysisRequestModel.findByIdAndUpdate(mission.analysisRequest, {
        status: AnalysisRequestStatus.COMPLETED,
      });
    }

    // Si la mission est annulée
    if (updateDto.status === MissionStatus.CANCELLED) {
      // Remettre la demande en attente
      await this.analysisRequestModel.findByIdAndUpdate(mission.analysisRequest, {
        status: AnalysisRequestStatus.PENDING,
      });
    }

    Object.assign(mission, updateDto);
    if (updateDto.scheduledDate) {
      mission.scheduledDate = new Date(updateDto.scheduledDate);
    }
    if (updateDto.completedDate) {
      mission.completedDate = new Date(updateDto.completedDate);
    }

    await mission.save();

    return mission.populate([
      { path: 'technician', select: 'fullName email phone' },
      { path: 'analysisRequest', select: 'fullName region commune surface' },
    ]);
  }

  /**
   * Supprimer une mission
   */
  async remove(id: string): Promise<void> {
    const mission = await this.missionModel.findById(id);

    if (!mission) {
      throw new NotFoundException('Mission non trouvée');
    }

    // Remettre la demande en attente si la mission n'était pas complétée
    if (mission.status !== MissionStatus.COMPLETED) {
      await this.analysisRequestModel.findByIdAndUpdate(mission.analysisRequest, {
        status: AnalysisRequestStatus.PENDING,
      });
    }

    await this.missionModel.findByIdAndDelete(id);
  }
}
