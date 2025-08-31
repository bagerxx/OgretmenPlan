import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { DateUtils } from '../../utils'

// Validation schemas
export const CreateHaftaSchema = z.object({
  numara: z.number().min(1, 'Hafta numarası en az 1 olmalıdır').max(52, 'Hafta numarası en fazla 52 olabilir'),
  baslangic: z.string().pipe(z.coerce.date()),
  bitis: z.string().pipe(z.coerce.date()),
  durum: z.enum(['LESSON', 'HOLIDAY', 'EXAM', 'WORK']).default('LESSON'),
  aciklama: z.string().optional()
})

export const UpdateHaftaSchema = z.object({
  baslangic: z.string().pipe(z.coerce.date()).optional(),
  bitis: z.string().pipe(z.coerce.date()).optional(),
  durum: z.enum(['LESSON', 'HOLIDAY', 'EXAM', 'WORK']).optional(),
  aciklama: z.string().optional()
})

export const GenerateHaftalarSchema = z.object({
  egitiYili: z.string().min(1, 'Eğitim yılı gereklidir'),
  baslangicTarihi: z.string().pipe(z.coerce.date()),
  bitisTarihi: z.string().pipe(z.coerce.date()),
  tatilDonemleri: z.array(z.object({
    baslangic: z.string().pipe(z.coerce.date()),
    bitis: z.string().pipe(z.coerce.date()),
    aciklama: z.string()
  })).optional(),
  sinavDonemleri: z.array(z.object({
    baslangic: z.string().pipe(z.coerce.date()),
    bitis: z.string().pipe(z.coerce.date()),
    aciklama: z.string()
  })).optional()
})

export type CreateHaftaInput = z.infer<typeof CreateHaftaSchema>
export type UpdateHaftaInput = z.infer<typeof UpdateHaftaSchema>
export type GenerateHaftalarInput = z.infer<typeof GenerateHaftalarSchema>

export class HaftaService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Tüm haftaları listele
   */
  async getAllHaftalar(filters?: {
    durum?: string
    yil?: number
  }) {
    const where: any = {}

    if (filters?.durum) {
      where.durum = filters.durum
    }

    if (filters?.yil) {
      const yilBaslangic = new Date(filters.yil, 0, 1)
      const yilBitis = new Date(filters.yil, 11, 31)
      
      where.baslangic = {
        gte: yilBaslangic,
        lte: yilBitis
      }
    }

    return await this.prisma.hafta.findMany({
      where,
      orderBy: { numara: 'asc' }
    })
  }

  /**
   * ID ile hafta getir
   */
  async getHaftaById(id: string) {
    const hafta = await this.prisma.hafta.findUnique({
      where: { id }
    })

    if (!hafta) {
      throw new Error('Hafta bulunamadı')
    }

    return hafta
  }

  /**
   * Hafta numarasına göre hafta getir
   */
  async getHaftaByNumara(numara: number) {
    const hafta = await this.prisma.hafta.findUnique({
      where: { numara }
    })

    if (!hafta) {
      throw new Error('Hafta bulunamadı')
    }

    return hafta
  }

  /**
   * Yeni hafta oluştur
   */
  async createHafta(data: CreateHaftaInput) {
    // Aynı numarada hafta var mı kontrol et
    const existing = await this.prisma.hafta.findUnique({
      where: { numara: data.numara }
    })

    if (existing) {
      throw new Error('Bu numarada bir hafta zaten mevcut')
    }

    // Başlangıç bitiş tarihi kontrolü
    if (data.baslangic >= data.bitis) {
      throw new Error('Başlangıç tarihi bitiş tarihinden önce olmalıdır')
    }

    return await this.prisma.hafta.create({
      data
    })
  }

  /**
   * Hafta güncelle
   */
  async updateHafta(id: string, data: UpdateHaftaInput) {
    const existing = await this.prisma.hafta.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new Error('Hafta bulunamadı')
    }

    // Tarih kontrolü
    const newBaslangic = data.baslangic || existing.baslangic
    const newBitis = data.bitis || existing.bitis

    if (newBaslangic >= newBitis) {
      throw new Error('Başlangıç tarihi bitiş tarihinden önce olmalıdır')
    }

    return await this.prisma.hafta.update({
      where: { id },
      data
    })
  }

  /**
   * Hafta sil
   */
  async deleteHafta(id: string) {
    const existing = await this.prisma.hafta.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            planKazanimlari: true,
            planBecerileri: true
          }
        }
      }
    })

    if (!existing) {
      throw new Error('Hafta bulunamadı')
    }

    // Bağlı planlar var mı kontrol et
    if (existing._count.planKazanimlari > 0 || existing._count.planBecerileri > 0) {
      throw new Error('Bu haftaya bağlı planlar var. Önce planları silin.')
    }

    await this.prisma.hafta.delete({
      where: { id }
    })

    return { message: 'Hafta başarıyla silindi' }
  }

  /**
   * Eğitim yılı haftalarını otomatik oluştur
   */
  async generateHaftalar(data: GenerateHaftalarInput) {
    const { egitiYili, baslangicTarihi, bitisTarihi, tatilDonemleri = [], sinavDonemleri = [] } = data

    // Mevcut haftaları temizle
    await this.prisma.hafta.deleteMany({})

    const haftalar: any[] = []
    let currentDate = new Date(baslangicTarihi)
    let haftaNumarasi = 1

    while (currentDate <= bitisTarihi) {
      const haftaBaslangic = new Date(currentDate)
      const haftaBitis = new Date(currentDate)
      haftaBitis.setDate(haftaBitis.getDate() + 6)

      // Hafta durumunu belirle
      let durum = 'LESSON'
      let aciklama = undefined

      // Tatil dönemi kontrolü
      for (const tatil of tatilDonemleri) {
        if (this.isDateInRange(haftaBaslangic, tatil.baslangic, tatil.bitis) ||
            this.isDateInRange(haftaBitis, tatil.baslangic, tatil.bitis)) {
          durum = 'HOLIDAY'
          aciklama = tatil.aciklama
          break
        }
      }

      // Sınav dönemi kontrolü (tatilden öncelikli)
      if (durum === 'LESSON') {
        for (const sinav of sinavDonemleri) {
          if (this.isDateInRange(haftaBaslangic, sinav.baslangic, sinav.bitis) ||
              this.isDateInRange(haftaBitis, sinav.baslangic, sinav.bitis)) {
            durum = 'EXAM'
            aciklama = sinav.aciklama
            break
          }
        }
      }

      haftalar.push({
        numara: haftaNumarasi,
        baslangic: haftaBaslangic,
        bitis: haftaBitis > bitisTarihi ? bitisTarihi : haftaBitis,
        durum,
        aciklama
      })

      // Bir sonraki haftaya geç
      currentDate.setDate(currentDate.getDate() + 7)
      haftaNumarasi++
    }

    // Toplu olarak oluştur
    await this.prisma.hafta.createMany({
      data: haftalar
    })

    return {
      message: `${haftalar.length} hafta başarıyla oluşturuldu`,
      oluşturulanHaftaSayisi: haftalar.length,
      dersHaftaSayisi: haftalar.filter(h => h.durum === 'LESSON').length,
      tatilHaftaSayisi: haftalar.filter(h => h.durum === 'HOLIDAY').length,
      sinavHaftaSayisi: haftalar.filter(h => h.durum === 'EXAM').length
    }
  }

  /**
   * Eğitim yılı istatistikleri
   */
  async getEgitiYiliStats() {
    const haftalar = await this.prisma.hafta.findMany()

    const stats = {
      toplam: haftalar.length,
      ders: haftalar.filter(h => h.durum === 'LESSON').length,
      tatil: haftalar.filter(h => h.durum === 'HOLIDAY').length,
      sinav: haftalar.filter(h => h.durum === 'EXAM').length,
      is: haftalar.filter(h => h.durum === 'WORK').length
    }

    const ilkHafta = haftalar.sort((a, b) => a.numara - b.numara)[0]
    const sonHafta = haftalar.sort((a, b) => b.numara - a.numara)[0]

    return {
      stats,
      donem: ilkHafta && sonHafta ? {
        baslangic: DateUtils.formatTurkish(ilkHafta.baslangic),
        bitis: DateUtils.formatTurkish(sonHafta.bitis)
      } : null
    }
  }

  /**
   * Tarih aralığı kontrolü
   */
  private isDateInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end
  }

  /**
   * Varsayılan eğitim yılı haftalarını oluştur
   */
  async createDefaultEducationYear(year: string) {
    const startYear = parseInt(year.split('-')[0])
    
    // Eğitim yılı tarihleri (15 Eylül - 15 Haziran)
    const baslangic = new Date(startYear, 8, 15) // 15 Eylül
    const bitis = new Date(startYear + 1, 5, 15) // 15 Haziran

    // Varsayılan tatil dönemleri
    const tatilDonemleri = [
      {
        baslangic: new Date(startYear, 10, 23), // 23 Kasım
        bitis: new Date(startYear, 10, 23),     // 23 Kasım (Okullar Tatil)
        aciklama: 'Okullar Tatil'
      },
      {
        baslangic: new Date(startYear + 1, 0, 1), // 1 Ocak
        bitis: new Date(startYear + 1, 0, 14),    // 14 Ocak (Yarıyıl Tatili)
        aciklama: 'Yarıyıl Tatili'
      },
      {
        baslangic: new Date(startYear + 1, 3, 23), // 23 Nisan
        bitis: new Date(startYear + 1, 3, 23),     // 23 Nisan (Ulusal Egemenlik ve Çocuk Bayramı)
        aciklama: 'Ulusal Egemenlik ve Çocuk Bayramı'
      },
      {
        baslangic: new Date(startYear + 1, 4, 1), // 1 Mayıs
        bitis: new Date(startYear + 1, 4, 1),     // 1 Mayıs (İşçi Bayramı)
        aciklama: 'İşçi Bayramı'
      }
    ]

    // Varsayılan sınav dönemleri
    const sinavDonemleri = [
      {
        baslangic: new Date(startYear + 1, 0, 15), // 15 Ocak
        bitis: new Date(startYear + 1, 0, 31),     // 31 Ocak (1. Dönem Sınavları)
        aciklama: '1. Dönem Sınavları'
      },
      {
        baslangic: new Date(startYear + 1, 5, 1), // 1 Haziran
        bitis: new Date(startYear + 1, 5, 15),    // 15 Haziran (2. Dönem Sınavları)
        aciklama: '2. Dönem Sınavları'
      }
    ]

    return await this.generateHaftalar({
      egitiYili: year,
      baslangicTarihi: baslangic,
      bitisTarihi: bitis,
      tatilDonemleri,
      sinavDonemleri
    })
  }
}
