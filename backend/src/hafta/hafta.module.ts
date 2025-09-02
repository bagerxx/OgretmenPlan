import { Module } from '@nestjs/common';
import { HaftaController } from './hafta.controller';
import { HaftaService } from './hafta.service';

@Module({
  controllers: [HaftaController],
  providers: [HaftaService],
  exports: [HaftaService],
})
export class HaftaModule {}
