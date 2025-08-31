import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const CreateKazanimSchema = z.object({
  kod: z.string().min(1, 'Kazanım kodu gereklidir').max(50, 'Kazanım kodu çok uzun'),
  icerik: z.string().min(1, 'Kazanım içeriği gereklidir'),
  aciklama: z.string().optional(),
  dersId: z.string().min(1, 'Ders ID gereklidir')
})

export const UpdateKazanimSchema = z.object({
  kod: z.string().min(1, 'Kazanım kodu gereklidir').max(50, 'Kazanım kodu çok uzun').optional(),
  icerik: z.string().min(1, 'Kazanım içeriği gereklidir').optional(),
  aciklama: z.string().optional(),
  dersId: z.string().min(1, 'Ders ID gereklidir').optional()
})

export const ImportKazanimlarSchema = z.object({
  dersId: z.string().min(1, 'Ders ID gereklidir'),
  kazanimlar: z.array(z.object({
    kod: z.string().min(1, 'Kazanım kodu gereklidir'),
    icerik: z.string().min(1, 'Kazanım içeriği gereklidir'),
    aciklama: z.string().optional()
  }))
})

export type CreateKazanimInput = z.infer<typeof CreateKazanimSchema>
export type UpdateKazanimInput = z.infer<typeof UpdateKazanimSchema>
export type ImportKazanimlarInput = z.infer<typeof ImportKazanimlarSchema>

export class KazanimService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Tüm kazanımları listele
   */
  async getAllKazanimlar(filters?: {
    dersId?: string
    search?: string
  }) {
    const where: any = {}

    if (filters?.dersId) {
      where.dersId = filters.dersId
    }

    if (filters?.search) {
      where.OR = [
        { kod: { contains: filters.search, mode: 'insensitive' } },
        { icerik: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return await this.prisma.kazanim.findMany({
      where,
      include: {
        ders: true,
        _count: {
          select: {
            planKazanimlari: true
          }
        }
      },
      orderBy: { kod: 'asc' }
    })
  }

  /**
   * ID ile kazanım getir
   */
  async getKazanimById(id: string) {
    const kazanim = await this.prisma.kazanim.findUnique({
      where: { id },
      include: {
        ders: true,
        planKazanimlari: {
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

    if (!kazanim) {
      throw new Error('Kazanım bulunamadı')
    }

    return kazanim
  }

  /**
   * Derse göre kazanımları getir
   */
  async getKazanimlarByDers(dersId: string) {
    const ders = await this.prisma.ders.findUnique({
      where: { id: dersId }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    return await this.prisma.kazanim.findMany({
      where: { dersId },
      include: {
        _count: {
          select: {
            planKazanimlari: true
          }
        }
      },
      orderBy: { kod: 'asc' }
    })
  }

  /**
   * Yeni kazanım oluştur
   */
  async createKazanim(data: CreateKazanimInput) {
    // Ders var mı kontrol et
    const ders = await this.prisma.ders.findUnique({
      where: { id: data.dersId }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    // Aynı kodda kazanım var mı kontrol et
    const existing = await this.prisma.kazanim.findUnique({
      where: { kod: data.kod }
    })

    if (existing) {
      throw new Error('Bu kodda bir kazanım zaten mevcut')
    }

    return await this.prisma.kazanim.create({
      data,
      include: {
        ders: true
      }
    })
  }

  /**
   * Kazanım güncelle
   */
  async updateKazanim(id: string, data: UpdateKazanimInput) {
    const existing = await this.prisma.kazanim.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new Error('Kazanım bulunamadı')
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

    // Kod değiştiriliyorsa, aynı kodda başka kazanım var mı kontrol et
    if (data.kod && data.kod !== existing.kod) {
      const duplicate = await this.prisma.kazanim.findUnique({
        where: { kod: data.kod }
      })

      if (duplicate) {
        throw new Error('Bu kodda bir kazanım zaten mevcut')
      }
    }

    return await this.prisma.kazanim.update({
      where: { id },
      data,
      include: {
        ders: true
      }
    })
  }

  /**
   * Kazanım sil
   */
  async deleteKazanim(id: string) {
    const existing = await this.prisma.kazanim.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            planKazanimlari: true
          }
        }
      }
    })

    if (!existing) {
      throw new Error('Kazanım bulunamadı')
    }

    // Bağlı planlar var mı kontrol et
    if (existing._count.planKazanimlari > 0) {
      throw new Error('Bu kazanıma bağlı planlar var. Önce planları silin.')
    }

    await this.prisma.kazanim.delete({
      where: { id }
    })

    return { message: 'Kazanım başarıyla silindi' }
  }

  /**
   * Toplu kazanım içe aktarma
   */
  async importKazanimlar(data: ImportKazanimlarInput) {
    const { dersId, kazanimlar } = data

    // Ders var mı kontrol et
    const ders = await this.prisma.ders.findUnique({
      where: { id: dersId }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    // Mevcut kodları kontrol et
    const mevcutKodlar = await this.prisma.kazanim.findMany({
      where: {
        kod: {
          in: kazanimlar.map(k => k.kod)
        }
      },
      select: { kod: true }
    })

    const mevcutKodlarSet = new Set(mevcutKodlar.map(k => k.kod))
    const yeniKazanimlar = kazanimlar.filter(k => !mevcutKodlarSet.has(k.kod))

    if (yeniKazanimlar.length === 0) {
      throw new Error('Tüm kazanımlar zaten mevcut')
    }

    // Toplu oluştur
    const result = await this.prisma.kazanim.createMany({
      data: yeniKazanimlar.map(k => ({
        ...k,
        dersId
      }))
    })

    return {
      message: `${result.count} kazanım başarıyla içe aktarıldı`,
      oluşturulan: result.count,
      atlanan: kazanimlar.length - result.count,
      atlanmaListesi: kazanimlar.filter(k => mevcutKodlarSet.has(k.kod)).map(k => k.kod)
    }
  }

  /**
   * Kazanım istatistikleri
   */
  async getKazanimStats(dersId?: string) {
    const where = dersId ? { dersId } : {}

    const toplam = await this.prisma.kazanim.count({ where })
    
    const planlanmis = await this.prisma.kazanim.count({
      where: {
        ...where,
        planKazanimlari: {
          some: {}
        }
      }
    })

    const tamamlanmis = await this.prisma.kazanim.count({
      where: {
        ...where,
        planKazanimlari: {
          some: {
            tamamlandi: true
          }
        }
      }
    })

    return {
      toplam,
      planlanmis,
      planlanmamis: toplam - planlanmis,
      tamamlanmis,
      devamEden: planlanmis - tamamlanmis,
      tamamlanmaOrani: planlanmis > 0 ? Math.round((tamamlanmis / planlanmis) * 100) : 0
    }
  }

  /**
   * Kazanım arama
   */
  async searchKazanimlar(query: string, dersId?: string) {
    const where: any = {
      OR: [
        { kod: { contains: query, mode: 'insensitive' } },
        { icerik: { contains: query, mode: 'insensitive' } },
        { aciklama: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (dersId) {
      where.dersId = dersId
    }

    return await this.prisma.kazanim.findMany({
      where,
      include: {
        ders: true,
        _count: {
          select: {
            planKazanimlari: true
          }
        }
      },
      orderBy: { kod: 'asc' },
      take: 50 // Maksimum 50 sonuç
    })
  }

  /**
   * Excel/CSV formatında kazanımları dışa aktar
   */
  async exportKazanimlar(dersId?: string) {
    const where = dersId ? { dersId } : {}

    const kazanimlar = await this.prisma.kazanim.findMany({
      where,
      include: {
        ders: true,
        _count: {
          select: {
            planKazanimlari: true
          }
        }
      },
      orderBy: { kod: 'asc' }
    })

    return kazanimlar.map(k => ({
      'Kazanım Kodu': k.kod,
      'İçerik': k.icerik,
      'Açıklama': k.aciklama || '',
      'Ders': k.ders.ad,
      'Plan Sayısı': k._count.planKazanimlari,
      'Oluşturma Tarihi': k.createdAt.toLocaleDateString('tr-TR'),
      'Güncelleme Tarihi': k.updatedAt.toLocaleDateString('tr-TR')
    }))
  }
}
