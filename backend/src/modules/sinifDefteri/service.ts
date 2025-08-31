import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const CreateSinifDefteriSchema = z.object({
  planId: z.string(),
  haftaId: z.string(),
  dersProgramiId: z.string(),
  kazanimId: z.string().optional(),
  beceriId: z.string().optional(),
  notlar: z.string().optional()
})

export const UpdateSinifDefteriSchema = z.object({
  kazanimId: z.string().optional().nullable(),
  beceriId: z.string().optional().nullable(),
  tamamlandi: z.boolean().optional(),
  notlar: z.string().optional()
})

export type CreateSinifDefteriInput = z.infer<typeof CreateSinifDefteriSchema>
export type UpdateSinifDefteriInput = z.infer<typeof UpdateSinifDefteriSchema>

export class SinifDefteriService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Sınıf defteri kaydı oluştur
   */
  async createKayit(data: CreateSinifDefteriInput) {
    // Aynı kayıt var mı kontrol et
    const existing = await this.prisma.sinifDefteri.findUnique({
      where: {
        planId_haftaId_dersProgramiId: {
          planId: data.planId,
          haftaId: data.haftaId,
          dersProgramiId: data.dersProgramiId
        }
      }
    })

    if (existing) {
      throw new Error('Bu plan, hafta ve ders programı için kayıt zaten mevcut')
    }

    return await this.prisma.sinifDefteri.create({
      data,
      include: {
        plan: {
          include: {
            sinif: { include: { kademe: true } },
            ders: true
          }
        },
        hafta: true,
        dersProgrami: {
          include: {
            ders: true
          }
        },
        kazanim: true,
        beceri: {
          include: { tema: true }
        }
      }
    })
  }

  /**
   * Plan ve hafta için tüm kayıtları getir
   */
  async getKayitlarByPlanVeHafta(planId: string, haftaId: string) {
    return await this.prisma.sinifDefteri.findMany({
      where: {
        planId,
        haftaId
      },
      include: {
        dersProgrami: {
          include: {
            ders: true
          }
        },
        kazanim: true,
        beceri: {
          include: { tema: true }
        }
      },
      orderBy: [
        { dersProgrami: { gun: 'asc' } },
        { dersProgrami: { dersSaat: 'asc' } }
      ]
    })
  }

  /**
   * Plan için tüm kayıtları getir (haftalık görünüm)
   */
  async getKayitlarByPlan(planId: string) {
    return await this.prisma.sinifDefteri.findMany({
      where: { planId },
      include: {
        hafta: true,
        dersProgrami: {
          include: {
            ders: true
          }
        },
        kazanim: true,
        beceri: {
          include: { tema: true }
        }
      },
      orderBy: [
        { hafta: { numara: 'asc' } },
        { dersProgrami: { gun: 'asc' } },
        { dersProgrami: { dersSaat: 'asc' } }
      ]
    })
  }

  /**
   * Sınıf defteri kaydını güncelle
   */
  async updateKayit(id: string, data: UpdateSinifDefteriInput) {
    return await this.prisma.sinifDefteri.update({
      where: { id },
      data,
      include: {
        plan: {
          include: {
            sinif: { include: { kademe: true } },
            ders: true
          }
        },
        hafta: true,
        dersProgrami: {
          include: {
            ders: true
          }
        },
        kazanim: true,
        beceri: {
          include: { tema: true }
        }
      }
    })
  }

  /**
   * Sınıf defteri kaydını sil
   */
  async deleteKayit(id: string) {
    return await this.prisma.sinifDefteri.delete({
      where: { id }
    })
  }

  /**
   * Otomatik sınıf defteri oluştur
   * Plan'daki yıllık planın kazanım/becerilerini ders programına göre dağıt
   */
  async createOtomatikSinifDefteri(planId: string) {
    // Plan ve ilgili verileri getir
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        sinif: true,
        ders: true,
        planKazanimlari: {
          include: {
            kazanim: true,
            hafta: true
          },
          where: {
            hafta: { durum: 'LESSON' }
          },
          orderBy: {
            hafta: { numara: 'asc' }
          }
        },
        planBecerileri: {
          include: {
            beceri: true,
            hafta: true
          },
          where: {
            hafta: { durum: 'LESSON' }
          },
          orderBy: {
            hafta: { numara: 'asc' }
          }
        }
      }
    })

    if (!plan) {
      throw new Error('Plan bulunamadı')
    }

    // Sınıf için ders programını getir (varsayılan şablon kullanarak)
    const dersProgramlari = await this.prisma.dersProgrami.findMany({
      where: {
        sinifId: plan.sinifId,
        dersId: plan.dersId
      },
      orderBy: [
        { gun: 'asc' },
        { dersSaat: 'asc' }
      ]
    })

    const createdRecords = []

    // Kazanım bazlı dersler için
    if (plan.ders.tip === 'KAZANIM_BAZLI') {
      let programIndex = 0
      
      for (const planKazanim of plan.planKazanimlari) {
        // Eğer programda ders yoksa atla
        if (dersProgramlari.length === 0) continue
        
        // Döngüsel olarak ders programlarını kullan
        const dersProgrami = dersProgramlari[programIndex % dersProgramlari.length]
        
        const record = await this.prisma.sinifDefteri.upsert({
          where: {
            planId_haftaId_dersProgramiId: {
              planId: plan.id,
              haftaId: planKazanim.haftaId,
              dersProgramiId: dersProgrami.id
            }
          },
          update: {
            kazanimId: planKazanim.kazanimId
          },
          create: {
            planId: plan.id,
            haftaId: planKazanim.haftaId,
            dersProgramiId: dersProgrami.id,
            kazanimId: planKazanim.kazanimId
          }
        })
        
        createdRecords.push(record)
        programIndex++
      }
    }

    // Beceri bazlı dersler için
    if (plan.ders.tip === 'BECERI_BAZLI') {
      let programIndex = 0
      
      for (const planBeceri of plan.planBecerileri) {
        // Eğer programda ders yoksa atla
        if (dersProgramlari.length === 0) continue
        
        // Döngüsel olarak ders programlarını kullan
        const dersProgrami = dersProgramlari[programIndex % dersProgramlari.length]
        
        const record = await this.prisma.sinifDefteri.upsert({
          where: {
            planId_haftaId_dersProgramiId: {
              planId: plan.id,
              haftaId: planBeceri.haftaId,
              dersProgramiId: dersProgrami.id
            }
          },
          update: {
            beceriId: planBeceri.beceriId
          },
          create: {
            planId: plan.id,
            haftaId: planBeceri.haftaId,
            dersProgramiId: dersProgrami.id,
            beceriId: planBeceri.beceriId
          }
        })
        
        createdRecords.push(record)
        programIndex++
      }
    }

    return {
      message: `${createdRecords.length} sınıf defteri kaydı oluşturuldu`,
      records: createdRecords.length
    }
  }

  /**
   * Haftalık sınıf defteri tablosu getir
   */
  async getHaftalikTablo(planId: string, haftaId: string) {
    // Plan bilgisini getir
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        sinif: { include: { kademe: true } },
        ders: true
      }
    })

    if (!plan) {
      throw new Error('Plan bulunamadı')
    }

    // Hafta bilgisini getir
    const hafta = await this.prisma.hafta.findUnique({
      where: { id: haftaId }
    })

    if (!hafta) {
      throw new Error('Hafta bulunamadı')
    }

    // O hafta için sınıf defteri kayıtlarını getir
    const kayitlar = await this.getKayitlarByPlanVeHafta(planId, haftaId)

    // Tablo formatında organize et
    const tablo: Record<string, Record<number, any>> = {}
    const gunler = ['PAZARTESI', 'SALI', 'CARSAMBA', 'PERSEMBE', 'CUMA']

    // Boş tablo oluştur
    for (const gun of gunler) {
      tablo[gun] = {}
    }

    // Kayıtları tabloya yerleştir
    for (const kayit of kayitlar) {
      const gun = kayit.dersProgrami.gun
      const dersSaat = kayit.dersProgrami.dersSaat

      if (!tablo[gun]) {
        tablo[gun] = {}
      }

      tablo[gun][dersSaat] = {
        id: kayit.id,
        ders: kayit.dersProgrami.ders,
        kazanim: kayit.kazanim,
        beceri: kayit.beceri,
        tamamlandi: kayit.tamamlandi,
        notlar: kayit.notlar
      }
    }

    return {
      plan,
      hafta,
      tablo
    }
  }

  // ========== Route Wrapper Metodları ==========
  /**
   * Route uyumluluğu için: sınıf defteri oluştur (otomatik)
   */
  async createSinifDefteri(planId: string) {
    return this.createOtomatikSinifDefteri(planId)
  }

  /**
   * Route uyumluluğu: planın tüm sınıf defteri kayıtları
   */
  async getSinifDefteri(planId: string) {
    return this.getKayitlarByPlan(planId)
  }

  /**
   * Route uyumluluğu: tek kayıt güncelle
   */
  async updateSinifDefteriKaydi(id: string, data: UpdateSinifDefteriInput) {
    return this.updateKayit(id, data)
  }
}
