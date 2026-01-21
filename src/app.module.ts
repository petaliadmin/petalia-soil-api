import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LandsModule } from './lands/lands.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ContactModule } from './contact/contact.module';

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
    RecommendationsModule,
    ContactModule,
  ],
})
export class AppModule {}
