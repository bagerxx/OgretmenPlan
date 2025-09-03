import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HaftaModule } from './hafta/hafta.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [PrismaModule, HaftaModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
