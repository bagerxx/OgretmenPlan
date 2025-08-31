import { PrismaClient, DersTipi } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const CreateDersSchema = z.object({
  ad: z.string().min(1, 'Ders adı gereklidir').max(100, 'Ders adı çok uzun'),
  aciklama: z.string().optional(),
  tip: z.nativeEnum(DersTipi).default(DersTipi.KAZANIM_BAZLI)
})

export const UpdateDersSchema = z.object({
  ad: z.string().min(1, 'Ders adı gereklidir').max(100, 'Ders adı çok uzun').optional(),
  aciklama: z.string().optional(),
  tip: z.nativeEnum(DersTipi).optional()
})

export const CreateDersSaatSchema = z.object({
  sinifId: z.string().min(1, 'Sınıf ID gereklidir'),
  haftalikSaat: z.number().min(1, 'Haftalık ders saati en az 1 olmalıdır').max(40, 'Haftalık ders saati en fazla 40 olabilir')
})

export type CreateDersInput = z.infer<typeof CreateDersSchema>
export type UpdateDersInput = z.infer<typeof UpdateDersSchema>
export type CreateDersSaatInput = z.infer<typeof CreateDersSaatSchema>

export class DersService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Tüm dersleri listele
   */
  async getAllDersler() {
    return await this.prisma.ders.findMany({
      include: {
        dersSaatleri: {
          include: {
            sinif: {
              include: {
                kademe: true
              }
            }
          }
        },
        _count: {
          select: {
            kazanimlar: true,
            beceriler: true,
            planlar: true
          }
        }
      },
      orderBy: { ad: 'asc' }
    })
  }

  /**
   * ID ile ders getir
   */
  async getDersById(id: string) {
    const ders = await this.prisma.ders.findUnique({
      where: { id },
      include: {
        dersSaatleri: {
          include: {
            sinif: {
              include: {
                kademe: true
              }
            }
          },
          orderBy: {
            sinif: {
              seviye: 'asc'
            }
          }
        },
        kazanimlar: {
          orderBy: { kod: 'asc' }
        },
        beceriler: {
          include: {
            tema: true
          },
          orderBy: { ad: 'asc' }
        },
        planlar: {
          include: {
            sinif: {
              include: {
                kademe: true
              }
            }
          }
        }
      }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    return ders
  }

  /**
   * Yeni ders oluştur
   */
  async createDers(data: CreateDersInput) {
    // Aynı isimde ders var mı kontrol et
    const existing = await this.prisma.ders.findUnique({
      where: { ad: data.ad }
    })

    if (existing) {
      throw new Error('Bu isimde bir ders zaten mevcut')
    }

    return await this.prisma.ders.create({
      data,
      include: {
        _count: {
          select: {
            kazanimlar: true,
            beceriler: true,
            planlar: true
          }
        }
      }
    })
  }

  /**
   * Ders güncelle
   */
  async updateDers(id: string, data: UpdateDersInput) {
    // Ders var mı kontrol et
    const existing = await this.prisma.ders.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new Error('Ders bulunamadı')
    }

    // İsim değiştiriliyorsa, aynı isimde başka ders var mı kontrol et
    if (data.ad && data.ad !== existing.ad) {
      const duplicate = await this.prisma.ders.findUnique({
        where: { ad: data.ad }
      })

      if (duplicate) {
        throw new Error('Bu isimde bir ders zaten mevcut')
      }
    }

    return await this.prisma.ders.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            kazanimlar: true,
            beceriler: true,
            planlar: true
          }
        }
      }
    })
  }

  /**
   * Ders sil
   */
  async deleteDers(id: string) {
    // Ders var mı kontrol et
    const existing = await this.prisma.ders.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            kazanimlar: true,
            beceriler: true,
            planlar: true,
            dersSaatleri: true
          }
        }
      }
    })

    if (!existing) {
      throw new Error('Ders bulunamadı')
    }

    // Bağlı veriler var mı kontrol et
    const { _count } = existing
    if (_count.kazanimlar > 0 || _count.beceriler > 0 || _count.planlar > 0 || _count.dersSaatleri > 0) {
      throw new Error('Bu derse bağlı veriler var. Önce bunları silin.')
    }

    await this.prisma.ders.delete({
      where: { id }
    })

    return { message: 'Ders başarıyla silindi' }
  }

  /**
   * Ders saati ekle/güncelle
   */
  async setDersSaati(dersId: string, data: CreateDersSaatInput) {
    // Ders var mı kontrol et
    const ders = await this.prisma.ders.findUnique({
      where: { id: dersId }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    // Sınıf var mı kontrol et
    const sinif = await this.prisma.sinif.findUnique({
      where: { id: data.sinifId }
    })

    if (!sinif) {
      throw new Error('Sınıf bulunamadı')
    }

    // Mevcut ders saati var mı kontrol et
    const existing = await this.prisma.dersSaat.findUnique({
      where: {
        dersId_sinifId: {
          dersId,
          sinifId: data.sinifId
        }
      }
    })

    if (existing) {
      // Güncelle
      return await this.prisma.dersSaat.update({
        where: {
          dersId_sinifId: {
            dersId,
            sinifId: data.sinifId
          }
        },
        data: {
          haftalikSaat: data.haftalikSaat
        },
        include: {
          ders: true,
          sinif: {
            include: {
              kademe: true
            }
          }
        }
      })
    } else {
      // Yeni oluştur
      return await this.prisma.dersSaat.create({
        data: {
          dersId,
          sinifId: data.sinifId,
          haftalikSaat: data.haftalikSaat
        },
        include: {
          ders: true,
          sinif: {
            include: {
              kademe: true
            }
          }
        }
      })
    }
  }

  /**
   * Ders saati sil
   */
  async deleteDersSaati(dersId: string, sinifId: string) {
    const existing = await this.prisma.dersSaat.findUnique({
      where: {
        dersId_sinifId: {
          dersId,
          sinifId
        }
      }
    })

    if (!existing) {
      throw new Error('Ders saati bulunamadı')
    }

    await this.prisma.dersSaat.delete({
      where: {
        dersId_sinifId: {
          dersId,
          sinifId
        }
      }
    })

    return { message: 'Ders saati başarıyla silindi' }
  }

  /**
   * Sınıfa göre ders saatlerini getir
   */
  async getDersSaatleriByKademe(kademeId: string) {
    const siniflar = await this.prisma.sinif.findMany({
      where: { kademeId },
      include: {
        dersSaatleri: {
          include: {
            ders: true
          },
          orderBy: {
            ders: { ad: 'asc' }
          }
        },
        kademe: true
      },
      orderBy: { seviye: 'asc' }
    })

    return siniflar
  }
}
