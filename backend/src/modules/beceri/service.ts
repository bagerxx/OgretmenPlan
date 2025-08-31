import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const CreateTemaSchema = z.object({
  ad: z.string().min(1, 'Tema adı gereklidir').max(100, 'Tema adı çok uzun'),
  aciklama: z.string().optional()
})

export const UpdateTemaSchema = z.object({
  ad: z.string().min(1, 'Tema adı gereklidir').max(100, 'Tema adı çok uzun').optional(),
  aciklama: z.string().optional()
})

export const CreateBeceriSchema = z.object({
  ad: z.string().min(1, 'Beceri adı gereklidir').max(200, 'Beceri adı çok uzun'),
  aciklama: z.string().optional(),
  toplamOgrenmeS: z.number().min(1, 'Toplam öğrenme saati en az 1 olmalıdır').max(100, 'Toplam öğrenme saati en fazla 100 olabilir'),
  temaId: z.string().min(1, 'Tema ID gereklidir'),
  dersId: z.string().min(1, 'Ders ID gereklidir')
})

export const UpdateBeceriSchema = z.object({
  ad: z.string().min(1, 'Beceri adı gereklidir').max(200, 'Beceri adı çok uzun').optional(),
  aciklama: z.string().optional(),
  toplamOgrenmeS: z.number().min(1, 'Toplam öğrenme saati en az 1 olmalıdır').max(100, 'Toplam öğrenme saati en fazla 100 olabilir').optional(),
  temaId: z.string().min(1, 'Tema ID gereklidir').optional(),
  dersId: z.string().min(1, 'Ders ID gereklidir').optional()
})

export const ImportBecerilerSchema = z.object({
  dersId: z.string().min(1, 'Ders ID gereklidir'),
  temaId: z.string().min(1, 'Tema ID gereklidir'),
  beceriler: z.array(z.object({
    ad: z.string().min(1, 'Beceri adı gereklidir'),
    aciklama: z.string().optional(),
    toplamOgrenmeS: z.number().min(1, 'Toplam öğrenme saati gereklidir')
  }))
})

export type CreateTemaInput = z.infer<typeof CreateTemaSchema>
export type UpdateTemaInput = z.infer<typeof UpdateTemaSchema>
export type CreateBeceriInput = z.infer<typeof CreateBeceriSchema>
export type UpdateBeceriInput = z.infer<typeof UpdateBeceriSchema>
export type ImportBecerilerInput = z.infer<typeof ImportBecerilerSchema>

export class BeceriService {
  constructor(private prisma: PrismaClient) {}

  // =================== TEMA YÖNETİMİ ===================

  /**
   * Tüm temaları listele
   */
  async getAllTemalar() {
    return await this.prisma.tema.findMany({
      include: {
        beceriler: {
          include: {
            ders: true
          }
        },
        _count: {
          select: {
            beceriler: true
          }
        }
      },
      orderBy: { ad: 'asc' }
    })
  }

  /**
   * ID ile tema getir
   */
  async getTemaById(id: string) {
    const tema = await this.prisma.tema.findUnique({
      where: { id },
      include: {
        beceriler: {
          include: {
            ders: true,
            _count: {
              select: {
                planBecerileri: true
              }
            }
          },
          orderBy: { ad: 'asc' }
        }
      }
    })

    if (!tema) {
      throw new Error('Tema bulunamadı')
    }

    return tema
  }

  /**
   * Yeni tema oluştur
   */
  async createTema(data: CreateTemaInput) {
    // Aynı isimde tema var mı kontrol et
    const existing = await this.prisma.tema.findUnique({
      where: { ad: data.ad }
    })

    if (existing) {
      throw new Error('Bu isimde bir tema zaten mevcut')
    }

    return await this.prisma.tema.create({
      data,
      include: {
        _count: {
          select: {
            beceriler: true
          }
        }
      }
    })
  }

  /**
   * Tema güncelle
   */
  async updateTema(id: string, data: UpdateTemaInput) {
    const existing = await this.prisma.tema.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new Error('Tema bulunamadı')
    }

    // İsim değiştiriliyorsa, aynı isimde başka tema var mı kontrol et
    if (data.ad && data.ad !== existing.ad) {
      const duplicate = await this.prisma.tema.findUnique({
        where: { ad: data.ad }
      })

      if (duplicate) {
        throw new Error('Bu isimde bir tema zaten mevcut')
      }
    }

    return await this.prisma.tema.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            beceriler: true
          }
        }
      }
    })
  }

  /**
   * Tema sil
   */
  async deleteTema(id: string) {
    const existing = await this.prisma.tema.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            beceriler: true
          }
        }
      }
    })

    if (!existing) {
      throw new Error('Tema bulunamadı')
    }

    // Bağlı beceriler var mı kontrol et
    if (existing._count.beceriler > 0) {
      throw new Error('Bu temaya bağlı beceriler var. Önce becerileri silin.')
    }

    await this.prisma.tema.delete({
      where: { id }
    })

    return { message: 'Tema başarıyla silindi' }
  }

  // =================== BECERİ YÖNETİMİ ===================

  /**
   * Tüm becerileri listele
   */
  async getAllBeceriler(filters?: {
    dersId?: string
    temaId?: string
    search?: string
  }) {
    const where: any = {}

    if (filters?.dersId) {
      where.dersId = filters.dersId
    }

    if (filters?.temaId) {
      where.temaId = filters.temaId
    }

    if (filters?.search) {
      where.OR = [
        { ad: { contains: filters.search, mode: 'insensitive' } },
        { aciklama: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return await this.prisma.beceri.findMany({
      where,
      include: {
        tema: true,
        ders: true,
        _count: {
          select: {
            planBecerileri: true
          }
        }
      },
      orderBy: [
        { tema: { ad: 'asc' } },
        { ad: 'asc' }
      ]
    })
  }

  /**
   * ID ile beceri getir
   */
  async getBeceriById(id: string) {
    const beceri = await this.prisma.beceri.findUnique({
      where: { id },
      include: {
        tema: true,
        ders: true,
        planBecerileri: {
          include: {
            plan: {
              include: {
                sinif: {
                  include: {
                    kademe: true
                  }
                }
              }
            },
            hafta: true
          }
        }
      }
    })

    if (!beceri) {
      throw new Error('Beceri bulunamadı')
    }

    return beceri
  }

  /**
   * Derse göre becerileri getir
   */
  async getBecerilerByDers(dersId: string) {
    const ders = await this.prisma.ders.findUnique({
      where: { id: dersId }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    return await this.prisma.beceri.findMany({
      where: { dersId },
      include: {
        tema: true,
        _count: {
          select: {
            planBecerileri: true
          }
        }
      },
      orderBy: [
        { tema: { ad: 'asc' } },
        { ad: 'asc' }
      ]
    })
  }

  /**
   * Temaya göre becerileri getir
   */
  async getBecerilerByTema(temaId: string) {
    const tema = await this.prisma.tema.findUnique({
      where: { id: temaId }
    })

    if (!tema) {
      throw new Error('Tema bulunamadı')
    }

    return await this.prisma.beceri.findMany({
      where: { temaId },
      include: {
        ders: true,
        _count: {
          select: {
            planBecerileri: true
          }
        }
      },
      orderBy: { ad: 'asc' }
    })
  }

  /**
   * Yeni beceri oluştur
   */
  async createBeceri(data: CreateBeceriInput) {
    // Tema var mı kontrol et
    const tema = await this.prisma.tema.findUnique({
      where: { id: data.temaId }
    })

    if (!tema) {
      throw new Error('Tema bulunamadı')
    }

    // Ders var mı kontrol et
    const ders = await this.prisma.ders.findUnique({
      where: { id: data.dersId }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    // Aynı kombinasyonda beceri var mı kontrol et
    const existing = await this.prisma.beceri.findUnique({
      where: {
        ad_temaId_dersId: {
          ad: data.ad,
          temaId: data.temaId,
          dersId: data.dersId
        }
      }
    })

    if (existing) {
      throw new Error('Bu tema ve ders kombinasyonunda aynı isimde bir beceri zaten mevcut')
    }

    return await this.prisma.beceri.create({
      data,
      include: {
        tema: true,
        ders: true
      }
    })
  }

  /**
   * Beceri güncelle
   */
  async updateBeceri(id: string, data: UpdateBeceriInput) {
    const existing = await this.prisma.beceri.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new Error('Beceri bulunamadı')
    }

    // Tema değiştiriliyorsa kontrol et
    if (data.temaId && data.temaId !== existing.temaId) {
      const tema = await this.prisma.tema.findUnique({
        where: { id: data.temaId }
      })

      if (!tema) {
        throw new Error('Tema bulunamadı')
      }
    }

    // Ders değiştiriliyorsa kontrol et
    if (data.dersId && data.dersId !== existing.dersId) {
      const ders = await this.prisma.ders.findUnique({
        where: { id: data.dersId }
      })

      if (!ders) {
        throw new Error('Ders bulunamadı')
      }
    }

    // Unique constraint kontrolü
    const newAd = data.ad || existing.ad
    const newTemaId = data.temaId || existing.temaId
    const newDersId = data.dersId || existing.dersId

    if (newAd !== existing.ad || newTemaId !== existing.temaId || newDersId !== existing.dersId) {
      const duplicate = await this.prisma.beceri.findUnique({
        where: {
          ad_temaId_dersId: {
            ad: newAd,
            temaId: newTemaId,
            dersId: newDersId
          }
        }
      })

      if (duplicate && duplicate.id !== id) {
        throw new Error('Bu tema ve ders kombinasyonunda aynı isimde bir beceri zaten mevcut')
      }
    }

    return await this.prisma.beceri.update({
      where: { id },
      data,
      include: {
        tema: true,
        ders: true
      }
    })
  }

  /**
   * Beceri sil
   */
  async deleteBeceri(id: string) {
    const existing = await this.prisma.beceri.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            planBecerileri: true
          }
        }
      }
    })

    if (!existing) {
      throw new Error('Beceri bulunamadı')
    }

    // Bağlı planlar var mı kontrol et
    if (existing._count.planBecerileri > 0) {
      throw new Error('Bu beceriye bağlı planlar var. Önce planları silin.')
    }

    await this.prisma.beceri.delete({
      where: { id }
    })

    return { message: 'Beceri başarıyla silindi' }
  }

  /**
   * Toplu beceri içe aktarma
   */
  async importBeceriler(data: ImportBecerilerInput) {
    const { dersId, temaId, beceriler } = data

    // Ders ve tema var mı kontrol et
    const ders = await this.prisma.ders.findUnique({
      where: { id: dersId }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    const tema = await this.prisma.tema.findUnique({
      where: { id: temaId }
    })

    if (!tema) {
      throw new Error('Tema bulunamadı')
    }

    // Mevcut becerileri kontrol et
    const mevcutBeceriler = await this.prisma.beceri.findMany({
      where: {
        temaId,
        dersId,
        ad: {
          in: beceriler.map(b => b.ad)
        }
      },
      select: { ad: true }
    })

    const mevcutAdlar = new Set(mevcutBeceriler.map(b => b.ad))
    const yeniBeceriler = beceriler.filter(b => !mevcutAdlar.has(b.ad))

    if (yeniBeceriler.length === 0) {
      throw new Error('Tüm beceriler zaten mevcut')
    }

    // Toplu oluştur
    const result = await this.prisma.beceri.createMany({
      data: yeniBeceriler.map(b => ({
        ...b,
        temaId,
        dersId
      }))
    })

    return {
      message: `${result.count} beceri başarıyla içe aktarıldı`,
      oluşturulan: result.count,
      atlanan: beceriler.length - result.count,
      atlanmaListesi: beceriler.filter(b => mevcutAdlar.has(b.ad)).map(b => b.ad)
    }
  }

  /**
   * Beceri istatistikleri
   */
  async getBeceriStats(dersId?: string, temaId?: string) {
    const where: any = {}
    
    if (dersId) where.dersId = dersId
    if (temaId) where.temaId = temaId

    const toplam = await this.prisma.beceri.count({ where })
    
    const planlanmis = await this.prisma.beceri.count({
      where: {
        ...where,
        planBecerileri: {
          some: {}
        }
      }
    })

    const tamamlanmis = await this.prisma.beceri.count({
      where: {
        ...where,
        planBecerileri: {
          some: {
            tamamlandi: true
          }
        }
      }
    })

    // Toplam öğrenme saati hesapla
    const beceriler = await this.prisma.beceri.findMany({
      where,
      select: { toplamOgrenmeS: true }
    })

    const toplamOgrenmeS = beceriler.reduce((sum, b) => sum + b.toplamOgrenmeS, 0)

    return {
      toplam,
      planlanmis,
      planlanmamis: toplam - planlanmis,
      tamamlanmis,
      devamEden: planlanmis - tamamlanmis,
      tamamlanmaOrani: planlanmis > 0 ? Math.round((tamamlanmis / planlanmis) * 100) : 0,
      toplamOgrenmeS,
      ortalamaBeceriSaati: toplam > 0 ? Math.round(toplamOgrenmeS / toplam) : 0
    }
  }

  /**
   * Beceri arama
   */
  async searchBeceriler(query: string, dersId?: string, temaId?: string) {
    const where: any = {
      OR: [
        { ad: { contains: query, mode: 'insensitive' } },
        { aciklama: { contains: query, mode: 'insensitive' } },
        { tema: { ad: { contains: query, mode: 'insensitive' } } }
      ]
    }

    if (dersId) where.dersId = dersId
    if (temaId) where.temaId = temaId

    return await this.prisma.beceri.findMany({
      where,
      include: {
        tema: true,
        ders: true,
        _count: {
          select: {
            planBecerileri: true
          }
        }
      },
      orderBy: [
        { tema: { ad: 'asc' } },
        { ad: 'asc' }
      ],
      take: 50 // Maksimum 50 sonuç
    })
  }
}
