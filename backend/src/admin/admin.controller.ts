import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import * as path from 'path';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get()
  async adminSayfasi(@Query('dersId') dersId: string | undefined, @Query('temaId') temaId: string | undefined, @Res() res: any) {
    const dersler = await this.adminService.dersleriGetir();
    const seciliDers = dersId ? await this.adminService.dersById(dersId) : null;
    return res.render('admin', { dersler, seciliDers, temalar: seciliDers?.temalar || [], selectedTemaId: temaId || '', flash: (res as any).locals.flash });
  }

  @Post('tema')
  async temaEkle(@Body() body: any, @Res() res: any) {
    const { dersId, ad, sira, saat } = body;
    try {
      await this.adminService.temaEkle(dersId, ad, Number(sira), saat ? Number(saat) : undefined);
      return res.redirect(`/api/admin?dersId=${dersId}`);
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  }

  @Post('tema-guncelle')
  async temaGuncelle(@Body() body: any, @Res() res: any) {
    const { dersId, temaId, ad, sira, saat } = body;
    try {
      await this.adminService.temaGuncelle(temaId, {
        ad: ad ?? undefined,
        sira: sira ? Number(sira) : undefined,
        saat: saat ? Number(saat) : undefined,
        olcmeDegerlendirme: body.olcmeDegerlendirme ?? undefined,
        sosyalDuygusalBeceriler: body.sosyalDuygusalBeceriler ?? undefined,
        degerler: body.degerler ?? undefined,
        okurYazarlikBecerileri: body.okurYazarlikBecerileri ?? undefined,
      });
      return res.redirect(`/api/admin?dersId=${dersId}&temaId=${temaId}`);
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  }

  @Post('konu-cercevesi')
  async konuCercevesiEkle(@Body() body: any, @Res() res: any) {
    const { dersId, temaId, ad } = body;
    try {
      await this.adminService.konuCercevesiEkle(temaId, ad);
      return res.redirect(`/api/admin?dersId=${dersId}&temaId=${temaId}`);
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  }

  @Post('ogrenme-ciktisi')
  async ogrenmeCiktisiEkle(@Body() body: any, @Res() res: any) {
    const { dersId, konuCercevesiId, ad } = body;
    try {
      await this.adminService.ogrenmeCiktisiEkle(konuCercevesiId, ad);
  return res.redirect(`/api/admin?dersId=${dersId}&konuCercevesiId=${konuCercevesiId}`);
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  }

  @Post('surec-bileseni')
  async surecBileseniEkle(@Body() body: any, @Res() res: any) {
    const { dersId, ogrenmeCiktisiId, ad } = body;
    try {
      await this.adminService.surecBileseniEkle(ogrenmeCiktisiId, ad);
  return res.redirect(`/api/admin?dersId=${dersId}&ogrenmeCiktisiId=${ogrenmeCiktisiId}`);
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
