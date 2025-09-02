import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { HaftaService } from './hafta.service';
import type { CreateHaftalarInput, UpdateHaftaInput } from './hafta.service';

@Controller('hafta')
export class HaftaController {
  constructor(private readonly haftaService: HaftaService) {}

  @Post('generate')
  async generateHaftalar(@Body() data: CreateHaftalarInput) {
    return await this.haftaService.generateHaftalar(data);
  }

  @Get(':yilId')
  async getHaftalarByYil(
    @Param('yilId') yilId: string,
    @Query('tip') tip?: string,
    @Query('donem') donem?: string
  ) {
    const filters: any = {};
    if (tip) filters.tip = tip;
    if (donem) filters.donem = donem;
    
    return await this.haftaService.getHaftalarByYil(yilId, filters);
  }

  @Put(':id')
  async updateHafta(@Param('id') id: string, @Body() data: UpdateHaftaInput) {
    return await this.haftaService.updateHafta(id, data);
  }

  @Delete(':id')
  async deleteHafta(@Param('id') id: string) {
    return await this.haftaService.deleteHafta(id);
  }

  @Get('stats/:yilId')
  async getEgitiYiliStats(@Param('yilId') yilId: string) {
    return await this.haftaService.getEgitiYiliStats(yilId);
  }
}
