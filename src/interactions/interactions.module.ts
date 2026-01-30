import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import {
  UserFavorite,
  UserFavoriteSchema,
  LandRental,
  LandRentalSchema,
  UserVisit,
  UserVisitSchema,
} from './schemas';
import { Land, LandSchema } from '../lands/schemas/land.schema';
import { LandsModule } from '../lands/lands.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserFavorite.name, schema: UserFavoriteSchema },
      { name: LandRental.name, schema: LandRentalSchema },
      { name: UserVisit.name, schema: UserVisitSchema },
      { name: Land.name, schema: LandSchema },
    ]),
    LandsModule,
  ],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
