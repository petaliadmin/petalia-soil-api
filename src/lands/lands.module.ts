import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { Land, LandSchema } from './schemas/land.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Land.name, schema: LandSchema }]),
  ],
  controllers: [LandsController],
  providers: [LandsService],
  exports: [LandsService],
})
export class LandsModule {}
