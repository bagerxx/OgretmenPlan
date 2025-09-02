import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const CreateDersSchema = z.object({
  ad: z.string().min(1, 'Ders adı gereklidir').max(100, 'Ders adı çok uzun'),
  haftalikSaat: z.number().min(1, 'Haftalık saat gereklidir').max(10, 'Haftalık saat çok fazla'),
  sinifId: z.string().min(1, 'Sınıf ID gereklidir')
})

export const UpdateDersSchema = z.object({
  ad: z.string().min(1, 'Ders adı gereklidir').max(100, 'Ders adı çok uzun').optional(),
  haftalikSaat: z.number().min(1).max(10).optional(),
  sinifId: z.string().optional()
})

export type CreateDersInput = z.infer<typeof CreateDersSchema>
export type UpdateDersInput = z.infer<typeof UpdateDersSchema>

export class DersService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateDersInput) {
    return await this.prisma.ders.create({
      data,
      include: {
        sinif: true,
        temalar: {
          include: {
            beceriler: true,
            kazanimlar: true
          }
        }
      }
    })
  }

  async findAll() {
    return await this.prisma.ders.findMany({
      include: {
        sinif: true,
        temalar: {
          include: {
            beceriler: true,
            kazanimlar: true
          }
        }
      },
      orderBy: [
        { sinif: { seviye: 'asc' } },
        { ad: 'asc' }
      ]
    })
  }

  async findById(id: string) {
    return await this.prisma.ders.findUnique({
      where: { id },
      include: {
        sinif: true,
        temalar: {
          include: {
            beceriler: true,
            kazanimlar: true
          }
        }
      }
    })
  }

  async update(id: string, data: UpdateDersInput) {
    return await this.prisma.ders.update({
      where: { id },
      data,
      include: {
        sinif: true,
        temalar: {
          include: {
            beceriler: true,
            kazanimlar: true
          }
        }
      }
    })
  }

  async delete(id: string) {
    return await this.prisma.ders.delete({
      where: { id }
    })
  }

  async findBySinif(sinifId: string) {
    return await this.prisma.ders.findMany({
      where: { sinifId },
      include: {
        sinif: true,
        temalar: {
          include: {
            beceriler: true,
            kazanimlar: true
          }
        }
      },
      orderBy: { ad: 'asc' }
    })
  }
}
