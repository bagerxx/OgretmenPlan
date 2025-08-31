import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { PlanEngine } from '../../core/planEngine'
import { ValidationUtils } from '../../utils'

// Validation schemas
export const CreatePlanSchema = z.object({
  sinifId: z.string().min(1, 'Sınıf ID gereklidir'),
  dersId: z.string().min(1, 'Ders ID gereklidir'),
  egitiYili: z.string().min(1, 'Eğitim yılı gereklidir').refine(
    (val) => ValidationUtils.isValidEducationYear(val),
    'Eğitim yılı formatı geçersiz (örn: 2024-2025)'
  ),
  planAdi: z.string().optional()
})

export const UpdatePlanItemSchema = z.object({
  sure: z.number().min(0, 'Süre negatif olamaz').optional(),
  tamamlandi: z.boolean().optional(),
  notlar: z.string().optional()
})

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>
export type UpdatePlanItemInput = z.infer<typeof UpdatePlanItemSchema>

export class PlanService {
  private planEngine: PlanEngine

  constructor(private prisma: PrismaClient) {
    this.planEngine = new PlanEngine(prisma)
  }

  /**
   * Tüm planları listele
   */
  async getAllPlanlar(filters?: {
    kademeId?: string
    sinifId?: string
    dersId?: string
    egitiYili?: string
  }) {
    const where: any = {}

    if (filters?.sinifId) {
      where.sinifId = filters.sinifId
    }

    if (filters?.dersId) {
      where.dersId = filters.dersId
    }

    if (filters?.egitiYili) {
      where.egitiYili = filters.egitiYili
    }

    if (filters?.kademeId) {
      where.sinif = {
        kademeId: filters.kademeId
      }
    }

    return await this.prisma.plan.findMany({
      where,
      include: {
        sinif: {
          include: {
            kademe: true
          }
        },
        ders: true,
        _count: {
          select: {
            planKazanimlari: true,
            planBecerileri: true
          }
        }
      },
      orderBy: [
        { egitiYili: 'desc' },
        { sinif: { seviye: 'asc' } },
        { ders: { ad: 'asc' } }
      ]
    })
  }

  /**
   * ID ile plan getir
   */
  async getPlanById(id: string) {
    return await this.planEngine.getPlanDetails(id)
  }

  /**
   * Yeni plan oluştur
   */
  async createPlan(data: CreatePlanInput) {
    const planId = await this.planEngine.generatePlan(data)
    return await this.getPlanById(planId)
  }

  /**
   * Plan sil
   */
  async deletePlan(id: string) {
    const existing = await this.prisma.plan.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new Error('Plan bulunamadı')
    }

    // Önce bağlı verileri sil
    await this.prisma.planKazanim.deleteMany({
      where: { planId: id }
    })

    await this.prisma.planBeceri.deleteMany({
      where: { planId: id }
    })

    // Sonra planı sil
    await this.prisma.plan.delete({
      where: { id }
    })

    return { message: 'Plan başarıyla silindi' }
  }

  /**
   * Haftalık plan tablosu getir
   */
  async getWeeklyTable(planId: string) {
    return await this.planEngine.generateWeeklyTable(planId)
  }

  /**
   * Plan kazanımını güncelle
   */
  async updatePlanKazanim(planId: string, kazanimId: string, haftaId: string, data: UpdatePlanItemInput) {
    const existing = await this.prisma.planKazanim.findUnique({
      where: {
        planId_kazanimId_haftaId: {
          planId,
          kazanimId,
          haftaId
        }
      }
    })

    if (!existing) {
      throw new Error('Plan kazanımı bulunamadı')
    }

    return await this.prisma.planKazanim.update({
      where: {
        planId_kazanimId_haftaId: {
          planId,
          kazanimId,
          haftaId
        }
      },
      data,
      include: {
        kazanim: true,
        hafta: true
      }
    })
  }

  /**
   * Plan becerisini güncelle
   */
  async updatePlanBeceri(planId: string, beceriId: string, haftaId: string, data: UpdatePlanItemInput) {
    const existing = await this.prisma.planBeceri.findUnique({
      where: {
        planId_beceriId_haftaId: {
          planId,
          beceriId,
          haftaId
        }
      }
    })

    if (!existing) {
      throw new Error('Plan becerisi bulunamadı')
    }

    return await this.prisma.planBeceri.update({
      where: {
        planId_beceriId_haftaId: {
          planId,
          beceriId,
          haftaId
        }
      },
      data,
      include: {
        beceri: {
          include: {
            tema: true
          }
        },
        hafta: true
      }
    })
  }

  /**
   * Plan istatistikleri
   */
  async getPlanStats(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        ders: true,
        sinif: true,
        planKazanimlari: {
          include: {
            hafta: true
          }
        },
        planBecerileri: {
          include: {
            hafta: true
          }
        }
      }
    })

    if (!plan) {
      throw new Error('Plan bulunamadı')
    }

    // İş haftalarını al
    const isHaftalari = await this.prisma.hafta.findMany({
      where: { durum: 'LESSON' }
    })

    // Ders saatini al
    const dersSaat = await this.prisma.dersSaat.findUnique({
      where: {
        dersId_sinifId: {
          dersId: plan.dersId,
          sinifId: plan.sinifId
        }
      }
    })

    const toplamSaat = dersSaat ? isHaftalari.length * dersSaat.haftalikSaat : 0

    // Kazanım istatistikleri
    const toplamKazanim = plan.planKazanimlari.length
    const tamamlananKazanim = plan.planKazanimlari.filter(pk => pk.tamamlandi).length
    const kazanimSaati = plan.planKazanimlari.reduce((sum, pk) => sum + pk.sure, 0)

    // Beceri istatistikleri
    const toplamBeceri = plan.planBecerileri.length
    const tamamlananBeceri = plan.planBecerileri.filter(pb => pb.tamamlandi).length
    const beceriSaati = plan.planBecerileri.reduce((sum, pb) => sum + pb.sure, 0)

    return {
      plan: {
        id: plan.id,
        ad: plan.ad,
        egitiYili: plan.egitiYili,
        dersTipi: plan.ders.tip
      },
      genel: {
        toplamSaat,
        kullanilanSaat: kazanimSaati + beceriSaati,
        kalanSaat: toplamSaat - (kazanimSaati + beceriSaati),
        tamamlanmaOrani: toplamSaat > 0 ? Math.round(((kazanimSaati + beceriSaati) / toplamSaat) * 100) : 0
      },
      kazanimlar: {
        toplam: toplamKazanim,
        tamamlanan: tamamlananKazanim,
        kalan: toplamKazanim - tamamlananKazanim,
        toplamSaat: kazanimSaati,
        tamamlanmaOrani: toplamKazanim > 0 ? Math.round((tamamlananKazanim / toplamKazanim) * 100) : 0
      },
      beceriler: {
        toplam: toplamBeceri,
        tamamlanan: tamamlananBeceri,
        kalan: toplamBeceri - tamamlananBeceri,
        toplamSaat: beceriSaati,
        tamamlanmaOrani: toplamBeceri > 0 ? Math.round((tamamlananBeceri / toplamBeceri) * 100) : 0
      }
    }
  }

  /**
   * Planı kopyala
   */
  async copyPlan(planId: string, yeniEgitiYili: string, yeniPlanAdi?: string) {
    const mevcutPlan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        ders: true,
        sinif: true,
        planKazanimlari: {
          include: {
            kazanim: true,
            hafta: true
          }
        },
        planBecerileri: {
          include: {
            beceri: true,
            hafta: true
          }
        }
      }
    })

    if (!mevcutPlan) {
      throw new Error('Kopyalanacak plan bulunamadı')
    }

    // Aynı kombinasyon için plan var mı kontrol et
    const existing = await this.prisma.plan.findUnique({
      where: {
        sinifId_dersId_egitiYili: {
          sinifId: mevcutPlan.sinifId,
          dersId: mevcutPlan.dersId,
          egitiYili: yeniEgitiYili
        }
      }
    })

    if (existing) {
      throw new Error('Bu kombinasyon için zaten bir plan mevcut')
    }

    // Yeni planı oluştur
    const yeniPlan = await this.prisma.plan.create({
      data: {
        ad: yeniPlanAdi || `${mevcutPlan.ad} (Kopya)`,
        aciklama: `${mevcutPlan.aciklama || ''} - ${mevcutPlan.egitiYili} yılından kopyalandı`,
        egitiYili: yeniEgitiYili,
        sinifId: mevcutPlan.sinifId,
        dersId: mevcutPlan.dersId
      }
    })

    // Yeni eğitim yılı haftalarını al
    const yeniHaftalar = await this.prisma.hafta.findMany({
      orderBy: { numara: 'asc' }
    })

    // Kazanımları kopyala
    for (const planKazanim of mevcutPlan.planKazanimlari) {
      const yeniHafta = yeniHaftalar.find(h => h.numara === planKazanim.hafta.numara)
      if (yeniHafta) {
        await this.prisma.planKazanim.create({
          data: {
            planId: yeniPlan.id,
            kazanimId: planKazanim.kazanimId,
            haftaId: yeniHafta.id,
            sure: planKazanim.sure,
            notlar: planKazanim.notlar
          }
        })
      }
    }

    // Becerileri kopyala
    for (const planBeceri of mevcutPlan.planBecerileri) {
      const yeniHafta = yeniHaftalar.find(h => h.numara === planBeceri.hafta.numara)
      if (yeniHafta) {
        await this.prisma.planBeceri.create({
          data: {
            planId: yeniPlan.id,
            beceriId: planBeceri.beceriId,
            haftaId: yeniHafta.id,
            sure: planBeceri.sure,
            notlar: planBeceri.notlar
          }
        })
      }
    }

    return await this.getPlanById(yeniPlan.id)
  }
}
