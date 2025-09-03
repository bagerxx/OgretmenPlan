import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import * as path from 'path';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get()
  async adminSayfasi(@Query('dersId') dersId: string | undefined, @Res() res: any) {
    const dersler = await this.adminService.dersleriGetir();
    const seciliDers = dersId ? await this.adminService.dersById(dersId) : null;
    return res.render('admin', { dersler, seciliDers, temalar: seciliDers?.temalar || [], flash: (res as any).locals.flash });
  }

  @Post('tema')
  async temaEkle(@Body() body: any, @Res() res: any) {
    const { dersId, ad, sira } = body;
    try {
      await this.adminService.temaEkle(dersId, ad, Number(sira));
      return res.redirect(`/admin?dersId=${dersId}`);
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  }

  @Post('icerik')
  async beceriKazanimEkle(@Body() body: any, @Res() res: any) {
    const { dersId, temaId, ad, sira, saatSuresi, tip } = body;
    try {
      if (tip === 'beceri') {
        await this.adminService.beceriEkle(temaId, ad, Number(sira), Number(saatSuresi));
      } else {
        await this.adminService.kazanimEkle(temaId, ad, Number(sira), Number(saatSuresi));
      }
      return res.redirect(`/admin?dersId=${dersId}`);
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  }

  @Get('temalar')
  async temalarByDers(@Query('dersId') dersId: string) {
    if (!dersId) return { temalar: [] };
    const ders = await this.adminService.dersById(dersId);
    return { temalar: ders?.temalar || [] };
  }
}
