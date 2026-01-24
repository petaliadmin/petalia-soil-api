import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CropsService } from './crops.service';
import { CropsController } from './crops.controller';
import { Crop, CropSchema } from './schemas/crop.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Crop.name, schema: CropSchema }]),
  ],
  controllers: [CropsController],
  providers: [CropsService],
  exports: [CropsService],
})
export class CropsModule {}
