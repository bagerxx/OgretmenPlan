import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Günlük Plan servisi
export class GunlukPlanService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Günlük plan oluştur
   */
  async createGunlukPlan(data: {
    sinifDefteriId: string
    konu: string
    hedefler?: string
    yontemler?: string
    materyaller?: string
    etkinlikler?: string
    degerlendirme?: string
    odev?: string
  }) {
    return await this.prisma.gunlukPlan.create({
      data,
      include: {
        sinifDefteri: {
          include: {
            hafta: true,
            programSaati: true,
            kazanim: true,
            beceri: true,
            plan: {
              include: {
                sinif: { include: { kademe: true } },
                ders: true
              }
            }
          }
        }
      }
    })
  }

  /**
   * Sınıf defteri için günlük planları getir
   */
  async getGunlukPlanlar(sinifDefteriId: string) {
    return await this.prisma.gunlukPlan.findMany({
      where: { sinifDefteriId },
      include: {
        sinifDefteri: {
          include: {
            hafta: true,
            programSaati: true,
            kazanim: true,
            beceri: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Günlük plan güncelle
   */
  async updateGunlukPlan(id: string, data: {
    konu?: string
    hedefler?: string
    yontemler?: string
    materyaller?: string
    etkinlikler?: string
    degerlendirme?: string
    odev?: string
    tamamlandi?: boolean
    notlar?: string
  }) {
    return await this.prisma.gunlukPlan.update({
      where: { id },
      data,
      include: {
        sinifDefteri: {
          include: {
            hafta: true,
            programSaati: true,
            kazanim: true,
            beceri: true
          }
        }
      }
    })
  }

  /**
   * Günlük plan sil
   */
  async deleteGunlukPlan(id: string) {
    return await this.prisma.gunlukPlan.delete({
      where: { id }
    })
  }

  /**
   * Hafta için tüm günlük planları getir
   */
  async getHaftalikGunlukPlanlar(planId: string, haftaId: string) {
    return await this.prisma.gunlukPlan.findMany({
      where: {
        sinifDefteri: {
          planId,
          haftaId
        }
      },
      include: {
        sinifDefteri: {
          include: {
            hafta: true,
            programSaati: true,
            kazanim: true,
            beceri: true
          }
        }
      },
      orderBy: [
        { sinifDefteri: { programSaati: { gun: 'asc' } } },
        { sinifDefteri: { programSaati: { dersSirasi: 'asc' } } }
      ]
    })
  }

  /**
   * Günlük plan şablonu oluştur
   */
  async createGunlukPlanSablonu(sinifDefteriId: string) {
    const sinifDefteri = await this.prisma.sinifDefteri.findUnique({
      where: { id: sinifDefteriId },
      include: {
        kazanim: true,
        beceri: true,
        programSaati: true,
        hafta: true,
        plan: {
          include: {
            ders: true,
            sinif: true
          }
        }
      }
    })

    if (!sinifDefteri) {
      throw new Error('Sınıf defteri kaydı bulunamadı')
    }

    // Kazanım veya beceri bazında otomatik şablon oluştur
    let konu = ''
    let hedefler = ''

    if (sinifDefteri.kazanim) {
      konu = sinifDefteri.kazanim.icerik
      hedefler = `${sinifDefteri.kazanim.kod} kodlu kazanımın öğretilmesi`
    } else if (sinifDefteri.beceri) {
      konu = sinifDefteri.beceri.ad
      hedefler = `${sinifDefteri.beceri.ad} becerisinin geliştirilmesi`
    }

    const varsayilanPlan = {
      sinifDefteriId,
      konu,
      hedefler,
      yontemler: 'Anlatım, soru-cevap, etkinlik',
      materyaller: 'Ders kitabı, tahta, projeksiyon',
      etkinlikler: 'Sınıf içi uygulamalar ve alıştırmalar',
      degerlendirme: 'Sözlü değerlendirme ve gözlem',
      odev: 'Ders kitabı ilgili sayfa çalışması'
    }

    return await this.createGunlukPlan(varsayilanPlan)
  }
}
