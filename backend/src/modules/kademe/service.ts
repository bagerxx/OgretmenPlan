import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const CreateKademeSchema = z.object({
  ad: z.string().min(1, 'Kademe adı gereklidir').max(100, 'Kademe adı çok uzun'),
  aciklama: z.string().optional()
})

export const UpdateKademeSchema = z.object({
  ad: z.string().min(1, 'Kademe adı gereklidir').max(100, 'Kademe adı çok uzun').optional(),
  aciklama: z.string().optional()
})

export type CreateKademeInput = z.infer<typeof CreateKademeSchema>
export type UpdateKademeInput = z.infer<typeof UpdateKademeSchema>

export class KademeService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Tüm kademeleri listele
   */
  async getAllKademeler() {
    return await this.prisma.kademe.findMany({
      include: {
        siniflar: {
          orderBy: { seviye: 'asc' }
        },
        _count: {
          select: { siniflar: true }
        }
      },
      orderBy: { ad: 'asc' }
    })
  }

  /**
   * ID ile kademe getir
   */
  async getKademeById(id: string) {
    const kademe = await this.prisma.kademe.findUnique({
      where: { id },
      include: {
        siniflar: {
          orderBy: { seviye: 'asc' },
          include: {
            dersSaatleri: {
              include: {
                ders: true
              }
            }
          }
        }
      }
    })

    if (!kademe) {
      throw new Error('Kademe bulunamadı')
    }

    return kademe
  }

  /**
   * Yeni kademe oluştur
   */
  async createKademe(data: CreateKademeInput) {
    // Aynı isimde kademe var mı kontrol et
    const existing = await this.prisma.kademe.findUnique({
      where: { ad: data.ad }
    })

    if (existing) {
      throw new Error('Bu isimde bir kademe zaten mevcut')
    }

    return await this.prisma.kademe.create({
      data,
      include: {
        siniflar: true,
        _count: {
          select: { siniflar: true }
        }
      }
    })
  }

  /**
   * Kademe güncelle
   */
  async updateKademe(id: string, data: UpdateKademeInput) {
    // Kademe var mı kontrol et
    const existing = await this.prisma.kademe.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new Error('Kademe bulunamadı')
    }

    // İsim değiştiriliyorsa, aynı isimde başka kademe var mı kontrol et
    if (data.ad && data.ad !== existing.ad) {
      const duplicate = await this.prisma.kademe.findUnique({
        where: { ad: data.ad }
      })

      if (duplicate) {
        throw new Error('Bu isimde bir kademe zaten mevcut')
      }
    }

    return await this.prisma.kademe.update({
      where: { id },
      data,
      include: {
        siniflar: true,
        _count: {
          select: { siniflar: true }
        }
      }
    })
  }

  /**
   * Kademe sil
   */
  async deleteKademe(id: string) {
    // Kademe var mı kontrol et
    const existing = await this.prisma.kademe.findUnique({
      where: { id },
      include: {
        _count: {
          select: { siniflar: true }
        }
      }
    })

    if (!existing) {
      throw new Error('Kademe bulunamadı')
    }

    // Bağlı sınıflar var mı kontrol et
    if (existing._count.siniflar > 0) {
      throw new Error('Bu kademeye bağlı sınıflar var. Önce sınıfları silin.')
    }

    await this.prisma.kademe.delete({
      where: { id }
    })

    return { message: 'Kademe başarıyla silindi' }
  }

  /**
   * Kademeye sınıf ekle
   */
  async addSinifToKademe(kademeId: string, seviye: number) {
    // Kademe var mı kontrol et
    const kademe = await this.prisma.kademe.findUnique({
      where: { id: kademeId }
    })

    if (!kademe) {
      throw new Error('Kademe bulunamadı')
    }

    // Seviye geçerli mi kontrol et
    if (seviye < 1 || seviye > 12) {
      throw new Error('Sınıf seviyesi 1-12 arasında olmalıdır')
    }

    // Aynı seviyede sınıf var mı kontrol et
    const existing = await this.prisma.sinif.findUnique({
      where: {
        seviye_kademeId: {
          seviye,
          kademeId
        }
      }
    })

    if (existing) {
      throw new Error('Bu kademede bu seviyede bir sınıf zaten mevcut')
    }

    return await this.prisma.sinif.create({
      data: {
        seviye,
        kademeId
      },
      include: {
        kademe: true
      }
    })
  }
}
