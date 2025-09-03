import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HaftaService } from './hafta.service';
import type { CreateHaftalarInput } from './hafta.service';

@Controller('hafta')
export class HaftaController {
  constructor(private readonly haftaService: HaftaService) {}

  @Post('generate')
  async generateHaftalar(@Body() data: CreateHaftalarInput) {
    return await this.haftaService.generateHaftalar(data);
  }

  @Get(':yil')
  async listByYil(@Param('yil', ParseIntPipe) yil: number) {
    return this.haftaService.getHaftalarByYil(yil)
  }
}
