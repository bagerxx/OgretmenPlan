import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const CreateDersProgramiSablonuSchema = z.object({
  ad: z.string().min(1, 'Ad gereklidir'),
  aciklama: z.string().optional(),
  maxDersSaat: z.number().min(1, 'Maksimum ders saati en az 1 olmalıdır').max(10, 'Maksimum ders saati en fazla 10 olabilir')
})

export const CreateDersProgramiSchema = z.object({
  gun: z.enum(['PAZARTESI', 'SALI', 'CARSAMBA', 'PERSEMBE', 'CUMA']),
  dersSaat: z.number().min(1).max(10),
  sinifId: z.string(),
  dersId: z.string().optional(),
  sablonId: z.string()
})

export const UpdateDersProgramiSchema = z.object({
  dersId: z.string().optional().nullable()
})

export type CreateDersProgramiSablonuInput = z.infer<typeof CreateDersProgramiSablonuSchema>
export type CreateDersProgramiInput = z.infer<typeof CreateDersProgramiSchema>
export type UpdateDersProgramiInput = z.infer<typeof UpdateDersProgramiSchema>

export class DersProgramiService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Ders programı şablonu oluştur
   */
  async createSablon(data: CreateDersProgramiSablonuInput) {
    return await this.prisma.dersProgramiSablonu.create({
      data
    })
  }

  /**
   * Tüm şablonları listele
   */
  async getAllSablonlar() {
    return await this.prisma.dersProgramiSablonu.findMany({
      include: {
        dersProgramlari: {
          include: {
            sinif: {
              include: { kademe: true }
            },
            ders: true
          }
        }
      }
    })
  }

  /**
   * Şablon sil
   */
  async deleteSablon(id: string) {
    return await this.prisma.dersProgramiSablonu.delete({
      where: { id }
    })
  }

  /**
   * Ders programı oluştur
   */
  async createDersProgrami(data: CreateDersProgramiInput) {
    return await this.prisma.dersProgrami.create({
      data,
      include: {
        sinif: { include: { kademe: true } },
        ders: true,
        sablon: true
      }
    })
  }

  /**
   * Sınıf için ders programını getir
   */
  async getDersProgramiBysinif(sinifId: string, sablonId: string) {
    return await this.prisma.dersProgrami.findMany({
      where: {
        sinifId,
        sablonId
      },
      include: {
        ders: true,
        sablon: true
      },
      orderBy: [
        { gun: 'asc' },
        { dersSaat: 'asc' }
      ]
    })
  }

  /**
   * Ders programını güncelle
   */
  async updateDersProgrami(id: string, data: UpdateDersProgramiInput) {
    return await this.prisma.dersProgrami.update({
      where: { id },
      data,
      include: {
        sinif: { include: { kademe: true } },
        ders: true,
        sablon: true
      }
    })
  }

  /**
   * Ders programını sil
   */
  async deleteDersProgrami(id: string) {
    return await this.prisma.dersProgrami.delete({
      where: { id }
    })
  }

  /**
   * Şablon için boş program oluştur
   */
  async createEmptyProgram(sablonId: string, sinifId: string) {
    const sablon = await this.prisma.dersProgramiSablonu.findUnique({
      where: { id: sablonId }
    })

    if (!sablon) {
      throw new Error('Şablon bulunamadı')
    }

    const gunler = ['PAZARTESI', 'SALI', 'CARSAMBA', 'PERSEMBE', 'CUMA'] as const
    const programlar = []

    for (const gun of gunler) {
      for (let dersSaat = 1; dersSaat <= sablon.maxDersSaat; dersSaat++) {
        const program = await this.prisma.dersProgrami.upsert({
          where: {
            sinifId_sablonId_gun_dersSaat: {
              sinifId,
              sablonId,
              gun,
              dersSaat
            }
          },
          update: {},
          create: {
            gun,
            dersSaat,
            sinifId,
            sablonId
          },
          include: {
            sinif: { include: { kademe: true } },
            ders: true,
            sablon: true
          }
        })
        programlar.push(program)
      }
    }

    return programlar
  }

  /**
   * Haftalık program tablosu formatında getir
   */
  async getHaftalikTablo(sinifId: string, sablonId: string) {
    const programlar = await this.getDersProgramiBysinif(sinifId, sablonId)
    
    const tablo: Record<string, Record<number, any>> = {}
    const gunler = ['PAZARTESI', 'SALI', 'CARSAMBA', 'PERSEMBE', 'CUMA']

    // Boş tablo oluştur
    for (const gun of gunler) {
      tablo[gun] = {}
    }

    // Programları tabloya yerleştir
    for (const program of programlar) {
      if (!tablo[program.gun]) {
        tablo[program.gun] = {}
      }
      tablo[program.gun][program.dersSaat] = {
        id: program.id,
        ders: program.ders ? {
          id: program.ders.id,
          ad: program.ders.ad
        } : null
      }
    }

    return {
      sinifId,
      sablon: programlar[0]?.sablon,
      tablo
    }
  }
}
