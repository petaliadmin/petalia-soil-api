import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { Provider, ProviderSchema } from './schema/provider.schema';
import { ServiceOffer, ServiceOfferSchema } from './schema/service-offer.schema';
import { ServiceRequest, ServiceRequestSchema } from './service-request.schema';
import { Mission, MissionSchema } from './schema/mission.schema';
import {
  SoilAnalysisRequest,
  SoilAnalysisRequestSchema,
} from '../soil-analysis-requests/schemas/soil-analysis-request.schema';
import { LandsModule } from '../lands/lands.module';
import { SoilAnalysisRequestsModule } from '../soil-analysis-requests/soil-analysis-requests.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Provider.name, schema: ProviderSchema },
      { name: ServiceOffer.name, schema: ServiceOfferSchema },
      { name: ServiceRequest.name, schema: ServiceRequestSchema },
      { name: Mission.name, schema: MissionSchema },
      { name: SoilAnalysisRequest.name, schema: SoilAnalysisRequestSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION', '7d') },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => LandsModule),
    SoilAnalysisRequestsModule,
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService, MongooseModule],
})
export class MarketplaceModule {}
