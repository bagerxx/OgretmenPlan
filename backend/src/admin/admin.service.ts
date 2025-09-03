import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  dersleriGetir() {
    return this.prisma.ders.findMany({
      include: { sinif: true },
      orderBy: [ { sinif: { seviye: 'asc' } }, { ad: 'asc' } ]
    });
  }

  dersById(id: string) {
    return this.prisma.ders.findUnique({
      where: { id },
      include: {
        sinif: true,
        temalar: {
          orderBy: { sira: 'asc' },
          include: {
            beceriler: { orderBy: { sira: 'asc' } },
            kazanimlar: { orderBy: { sira: 'asc' } }
          }
        }
      }
    });
  }

  async temaEkle(dersId: string, ad: string, sira: number) {
    const ders = await this.prisma.ders.findUnique({ where: { id: dersId } });
    if (!ders) throw new Error('Belirtilen ders bulunamadı');
    try {
      return await this.prisma.tema.create({ data: { dersId, ad, sira } });
    } catch (e: any) {
      if (e.code === 'P2002') throw new Error('Aynı derste bu sıra zaten kullanılmış');
      throw e;
    }
  }

  async beceriEkle(temaId: string, ad: string, sira: number, saatSuresi: number) {
    const tema = await this.prisma.tema.findUnique({ where: { id: temaId } });
    if (!tema) throw new Error('Belirtilen tema bulunamadı');
    try {
      return await this.prisma.beceri.create({ data: { temaId, ad, sira, saatSuresi } });
    } catch (e: any) {
      if (e.code === 'P2002') throw new Error('Bu temada aynı sıra zaten var');
      throw e;
    }
  }

  async kazanimEkle(temaId: string, ad: string, sira: number, saatSuresi: number) {
    const tema = await this.prisma.tema.findUnique({ where: { id: temaId } });
    if (!tema) throw new Error('Belirtilen tema bulunamadı');
    try {
      return await this.prisma.kazanim.create({ data: { temaId, ad, sira, saatSuresi } });
    } catch (e: any) {
      if (e.code === 'P2002') throw new Error('Bu temada aynı sıra zaten var');
      throw e;
    }
  }
}
