import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { LandsModule } from '../lands/lands.module';

@Module({
  imports: [LandsModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
