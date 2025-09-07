import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
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
            konuCerceveleri: {
              orderBy: { id: 'asc' },
              include: {
                ogrenmeCiktilari: {
                  orderBy: { id: 'asc' },
                  // surecBileseni artık tekil string alanı; ekstra include gerekmiyor
                }
              }
            }
          }
        }
      }
    });
  }

  async temaEkle(dersId: string, ad: string, sira: number, saat?: number) {
    const ders = await this.prisma.ders.findUnique({ where: { id: dersId } });
    if (!ders) throw new Error('Belirtilen ders bulunamadı');
    try {
      // Eğer aynı derste aynı veya daha büyük sıralara sahip temalar varsa,
      // onların `sira` değerlerini 1 artırarak yeni tema için yer açalım.
      return await this.prisma.$transaction(async (tx) => {
        await tx.tema.updateMany({
          where: {
            dersId,
            sira: { gte: sira }
          },
          data: {
            sira: { increment: 1 }
          }
        });
        return tx.tema.create({ data: { dersId, ad, sira, saat } });
      });
    } catch (e: any) {
      // Eğer updateMany + create sırasında unique hatası alındıysa,
      // yoğun eşzamanlılık veya sıra index davranışı nedeniyle olabilir.
      // Fallback: aynı derste sira >= yeni sira olan kayıtları ters sırayla tek tek güncelleyip tekrar deneyelim.
      if (e.code === 'P2002') {
        try {
          return await this.prisma.$transaction(async (tx) => {
            const affected = await tx.tema.findMany({
              where: { dersId, sira: { gte: sira } },
              orderBy: { sira: 'desc' }
            });
            for (const t of affected) {
              await tx.tema.update({ where: { id: t.id }, data: { sira: t.sira + 1 } });
            }
            return tx.tema.create({ data: { dersId, ad, sira, saat } });
          });
        } catch (e2: any) {
          // Eğer yine hata olursa daha açıklayıcı döndürelim
          throw new Error(e2?.message || 'Tema eklenirken beklenmeyen bir hata oluştu');
        }
      }
      throw e;
    }
  }

  async temaGuncelle(temaId: string, data: {
    ad?: string,
    sira?: number,
    saat?: number | null,
    olcmeDegerlendirme?: string | null,
    sosyalDuygusalBeceriler?: string | null,
    degerler?: string | null,
    okurYazarlikBecerileri?: string | null,
  }) {
    const tema = await this.prisma.tema.findUnique({ where: { id: temaId } });
    if (!tema) throw new Error('Tema bulunamadı');
    return this.prisma.tema.update({
      where: { id: temaId },
      data: {
        ad: data.ad ?? undefined,
        sira: data.sira ?? undefined,
        saat: data.saat ?? undefined,
        olcmeDegerlendirme: data.olcmeDegerlendirme ?? undefined,
        sosyalDuygusalBeceriler: data.sosyalDuygusalBeceriler ?? undefined,
        degerler: data.degerler ?? undefined,
        okurYazarlikBecerileri: data.okurYazarlikBecerileri ?? undefined,
      }
    });
  }

  // Konu Çerçevesi işlemleri
  async konuCercevesiEkle(temaId: string, ad: string) {
    const tema = await this.prisma.tema.findUnique({ where: { id: temaId } });
    if (!tema) throw new Error('Belirtilen tema bulunamadı');
    try {
      return await this.prisma.konuCercevesi.create({ data: { temaId, ad } });
    } catch (e: any) {
      throw new Error('Konu çerçevesi eklenirken hata oluştu');
    }
  }

  async konuCercevesiById(id: string) {
    return this.prisma.konuCercevesi.findUnique({
      where: { id },
      include: {
        tema: true,
        ogrenmeCiktilari: {
          orderBy: { id: 'asc' },
          // surecBileseni tekil string alanı; include yok
        }
      }
    });
  }

  // Öğrenme Çıktısı işlemleri
  async ogrenmeCiktisiEkle(konuCercevesiId: string, ad: string) {
    const konuCercevesi = await this.prisma.konuCercevesi.findUnique({ where: { id: konuCercevesiId } });
    if (!konuCercevesi) throw new Error('Belirtilen konu çerçevesi bulunamadı');
    try {
      return await this.prisma.ogrenmeCiktisi.create({ data: { konuCercevesiId, ad } });
    } catch (e: any) {
      throw new Error('Öğrenme çıktısı eklenirken hata oluştu');
    }
  }

  // Süreç Bileşeni işlemleri
  async surecBileseniEkle(ogrenmeCiktisiId: string, ad: string) {
    const ogrenmeCiktisi = await this.prisma.ogrenmeCiktisi.findUnique({ where: { id: ogrenmeCiktisiId } });
    if (!ogrenmeCiktisi) throw new Error('Belirtilen öğrenme çıktısı bulunamadı');
    try {
      // Artık tekil string alanı olarak güncelliyoruz
      // Tipler migration/generate sonrası güncellenecek; şimdilik tür denetimini geçiyoruz
      return await (this.prisma as any).ogrenmeCiktisi.update({
        where: { id: ogrenmeCiktisiId },
        data: { surecBileseni: ad }
      });
    } catch (e: any) {
      throw new Error('Süreç bileşeni eklenirken hata oluştu');
    }
  }

}
