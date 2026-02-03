import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LandsModule } from './lands/lands.module';
import { CropsModule } from './crops/crops.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ContactModule } from './contact/contact.module';
import { InteractionsModule } from './interactions/interactions.module';
import { SoilAnalysisRequestsModule } from './soil-analysis-requests/soil-analysis-requests.module';
import { TechniciansModule } from './technicians/technicians.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Connexion MongoDB Atlas
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryWrites: true,
        w: 'majority',
      }),
      inject: [ConfigService],
    }),

    // Modules de l'application
    AuthModule,
    UsersModule,
    LandsModule,
    CropsModule,
    RecommendationsModule,
    ContactModule,
    InteractionsModule,
    SoilAnalysisRequestsModule,
    TechniciansModule,
    ReportsModule,
  ],
})
export class AppModule {}
