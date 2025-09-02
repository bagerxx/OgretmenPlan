import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HaftaTipi, DonemTipi } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const CreateHaftalarSchema = z.object({
  yilId: z.string().min(1, 'Yıl ID gereklidir'),
  baslangicTarihi: z.string().pipe(z.coerce.date()),
  bitisTarihi: z.string().pipe(z.coerce.date()),
  donemAyirici: z.string().pipe(z.coerce.date()).optional(), // Dönem ayırıcı tarih (default: 31 Ocak)
  // Tatil dönemleri (tarih aralıkları)
  birinciaraTatil: z.object({
    baslangic: z.string().pipe(z.coerce.date()),
    bitis: z.string().pipe(z.coerce.date())
  }).optional(),
  ikinciAraTatil: z.object({
    baslangic: z.string().pipe(z.coerce.date()),
    bitis: z.string().pipe(z.coerce.date())
  }).optional(),
  somestrTatil: z.object({
    baslangic: z.string().pipe(z.coerce.date()),
    bitis: z.string().pipe(z.coerce.date())
  }).optional()
})

export const UpdateHaftaSchema = z.object({
  tip: z.enum(['DERS', 'TATIL', 'SINAV']).optional(),
  donem: z.enum(['BIRINCI_DONEM', 'IKINCI_DONEM']).optional(),
  aciklama: z.string().optional()
})

export type CreateHaftalarInput = z.infer<typeof CreateHaftalarSchema>
export type UpdateHaftaInput = z.infer<typeof UpdateHaftaSchema>

export interface HaftaData {
  haftaNo: number
  baslamaTarihi: Date
  bitisTarihi: Date
  tip: HaftaTipi
  donem: DonemTipi
  aciklama?: string
  yilId: string
}

@Injectable()
export class HaftaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Yıla göre tüm haftaları listele
   */
  async getHaftalarByYil(yilId: string, filters?: {
    tip?: HaftaTipi
    donem?: DonemTipi
  }) {
    const where: any = { yilId }

    if (filters?.tip) {
      where.tip = filters.tip
    }

    if (filters?.donem) {
      where.donem = filters.donem
    }

    return await this.prisma.hafta.findMany({
      where,
      orderBy: { haftaNo: 'asc' },
      include: {
        yil: true
      }
    })
  }

  /**
   * ID ile hafta getir
   */
  async getHaftaById(id: string) {
    const hafta = await this.prisma.hafta.findUnique({
      where: { id },
      include: {
        yil: true
      }
    })

    if (!hafta) {
      throw new Error('Hafta bulunamadı')
    }

    return hafta
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
            planDetaylari: true,
            planSablonlari: true
          }
        }
      }
    })

    if (!existing) {
      throw new Error('Hafta bulunamadı')
    }

    // Bağlı planlar var mı kontrol et
    if (existing._count.planDetaylari > 0 || existing._count.planSablonlari > 0) {
      throw new Error('Bu haftaya bağlı planlar var. Önce planları silin.')
    }

    await this.prisma.hafta.delete({
      where: { id }
    })

    return { message: 'Hafta başarıyla silindi' }
  }

  /**
   * Verilen tarih aralığındaki haftaları otomatik oluştur
   * Sadece hafta içi günleri dikkate alır (Pazartesi-Cuma)
   * Tatil haftaları parametrelere göre işaretlenir
   */
  async generateHaftalar(data: CreateHaftalarInput) {
    const { 
      yilId, 
      baslangicTarihi, 
      bitisTarihi, 
      donemAyirici,
      birinciaraTatil,
      ikinciAraTatil,
      somestrTatil
    } = data

    // Başlangıç tarihinin Pazartesi olmasını sağla
    const baslangic = this.getNextMonday(baslangicTarihi)
    
    // Bitiş tarihinin Cuma olmasını sağla
    const bitis = this.getPreviousFriday(bitisTarihi)
    
    // Dönem ayırıcı (varsayılan: 31 Ocak)
    const donemAyiriciTarih = donemAyirici || new Date(baslangic.getFullYear() + 1, 0, 31) // 31 Ocak

    // Mevcut haftaları sil
    await this.prisma.hafta.deleteMany({
      where: { yilId }
    })

    const haftalar: HaftaData[] = []
    let currentDate = new Date(baslangic)
    let haftaNo = 1

    while (currentDate <= bitis) {
      const haftaBaslangic = new Date(currentDate)
      const haftaBitis = this.getFridayOfWeek(currentDate) // Haftanın Cuma günü
      
      // Eğer hafta sonu geçmiş ise döngüyü kır
      if (haftaBitis > bitis) {
        break
      }

      // Hafta tipini belirle (tarih aralığına göre)
      const haftaTipi = this.getHaftaTipiByDate(haftaBaslangic, haftaBitis, {
        birinciaraTatil,
        ikinciAraTatil,
        somestrTatil
      })

      // Hafta verisi oluştur
      haftalar.push(this.createHaftaDataWithTip(
        haftaNo, 
        haftaBaslangic, 
        haftaBitis, 
        yilId, 
        donemAyiriciTarih,
        haftaTipi,
        somestrTatil || undefined
      ))

      // Bir sonraki haftaya geç (7 gün sonra)
      currentDate.setDate(currentDate.getDate() + 7)
      haftaNo++
    }

    // Toplu olarak oluştur
    await this.prisma.hafta.createMany({
      data: haftalar
    })

    // Gün hesaplama
    const gunSayilari = this.calculateWorkingDays(haftalar)

    return {
      message: `${haftalar.length} hafta başarıyla oluşturuldu`,
      oluşturulanHaftaSayisi: haftalar.length,
      dersHaftaSayisi: haftalar.filter(h => h.tip === 'DERS').length,
      tatilHaftaSayisi: haftalar.filter(h => h.tip === 'TATIL').length,
      sinavHaftaSayisi: haftalar.filter(h => h.tip === 'SINAV').length,
      birinciDonemHaftaSayisi: haftalar.filter(h => h.donem === 'BIRINCI_DONEM').length,
      ikinciDonemHaftaSayisi: haftalar.filter(h => h.donem === 'IKINCI_DONEM').length,
      gunSayilari
    }
  }

  /**
   * Eğitim yılı istatistikleri
   */
  async getEgitiYiliStats(yilId: string) {
    const haftalar = await this.prisma.hafta.findMany({
      where: { yilId }
    })

    const gunSayilari = this.calculateWorkingDays(haftalar)

    const stats = {
      toplam: haftalar.length,
      ders: haftalar.filter(h => h.tip === 'DERS').length,
      tatil: haftalar.filter(h => h.tip === 'TATIL').length,
      sinav: haftalar.filter(h => h.tip === 'SINAV').length,
      birinciDonem: haftalar.filter(h => h.donem === 'BIRINCI_DONEM').length,
      ikinciDonem: haftalar.filter(h => h.donem === 'IKINCI_DONEM').length,
      gunSayilari
    }

    const ilkHafta = haftalar.sort((a, b) => a.haftaNo - b.haftaNo)[0]
    const sonHafta = haftalar.sort((a, b) => b.haftaNo - a.haftaNo)[0]

    return {
      stats,
      donem: ilkHafta && sonHafta ? {
        baslangic: this.formatTurkish(ilkHafta.baslamaTarihi),
        bitis: this.formatTurkish(sonHafta.bitisTarihi)
      } : null
    }
  }

  /**
   * Haftalardaki çalışma günlerini hesaplar
   */
  private calculateWorkingDays(haftalar: any[]) {
    let toplamDersGunu = 0
    let toplamTatilGunu = 0
    let toplamSinavGunu = 0
    let birinciDonemGunu = 0
    let ikinciDonemGunu = 0

    for (const hafta of haftalar) {
      const gunSayisi = this.getWorkingDaysInRange(hafta.baslamaTarihi, hafta.bitisTarihi)
      
      // Tip bazında sayım
      switch (hafta.tip) {
        case 'DERS':
          toplamDersGunu += gunSayisi
          break
        case 'TATIL':
          toplamTatilGunu += gunSayisi
          break
        case 'SINAV':
          toplamSinavGunu += gunSayisi
          break
      }

      // Dönem bazında sayım
      if (hafta.donem === 'BIRINCI_DONEM') {
        birinciDonemGunu += gunSayisi
      } else {
        ikinciDonemGunu += gunSayisi
      }
    }

    return {
      toplamCalısmaGunu: toplamDersGunu + toplamSinavGunu,
      toplamDersGunu,
      toplamTatilGunu,
      toplamSinavGunu,
      birinciDonemGunu,
      ikinciDonemGunu,
      toplamGun: toplamDersGunu + toplamTatilGunu + toplamSinavGunu
    }
  }

  /**
   * Verilen tarih aralığındaki çalışma günlerini sayar (Pazartesi-Cuma)
   */
  private getWorkingDaysInRange(startDate: Date, endDate: Date): number {
    let count = 0
    const current = new Date(startDate)
    
    while (current <= endDate) {
      if (this.isWeekday(current)) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return count
  }

  // Yardımcı fonksiyonlar

  /**
   * Verilen tarihin en yakın Pazartesi gününü bulur
   */
  private getNextMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Pazartesi = 1
    d.setDate(diff)
    return d
  }

  /**
   * Verilen haftanın Cuma gününü bulur
   */
  private getFridayOfWeek(monday: Date): Date {
    const friday = new Date(monday)
    friday.setDate(friday.getDate() + 4) // Pazartesi + 4 = Cuma
    return friday
  }

  /**
   * Verilen tarihin en yakın önceki Cuma gününü bulur
   */
  private getPreviousFriday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -2 : (day === 6 ? -1 : (5 - day)) // Cuma = 5
    d.setDate(d.getDate() + diff)
    return d
  }

  /**
   * Verilen tarihin hafta içi olup olmadığını kontrol eder
   */
  private isWeekday(date: Date): boolean {
    const day = date.getDay()
    return day >= 1 && day <= 5 // Pazartesi(1) - Cuma(5)
  }

  /**
   * Hafta tipini tarih aralığına göre belirler
   */
  private getHaftaTipiByDate(haftaBaslangic: Date, haftaBitis: Date, tatilParams: {
    birinciaraTatil?: { baslangic: Date, bitis: Date },
    ikinciAraTatil?: { baslangic: Date, bitis: Date },
    somestrTatil?: { baslangic: Date, bitis: Date }
  }): HaftaTipi {
    const { birinciaraTatil, ikinciAraTatil, somestrTatil } = tatilParams

    // Birinci ara tatil kontrol
    if (birinciaraTatil && this.isWeekInRange(haftaBaslangic, haftaBitis, birinciaraTatil.baslangic, birinciaraTatil.bitis)) {
      return 'TATIL'
    }

    // İkinci ara tatil kontrol
    if (ikinciAraTatil && this.isWeekInRange(haftaBaslangic, haftaBitis, ikinciAraTatil.baslangic, ikinciAraTatil.bitis)) {
      return 'TATIL'
    }

    // Sömestr tatili kontrol
    if (somestrTatil && this.isWeekInRange(haftaBaslangic, haftaBitis, somestrTatil.baslangic, somestrTatil.bitis)) {
      return 'TATIL'
    }

    return 'DERS'
  }

  /**
   * Haftanın belirtilen tarih aralığında olup olmadığını kontrol eder
   */
  private isWeekInRange(haftaBaslangic: Date, haftaBitis: Date, tatilBaslangic: Date, tatilBitis: Date): boolean {
    // Hafta, tatil aralığıyla kesişiyor mu?
    return (haftaBaslangic <= tatilBitis && haftaBitis >= tatilBaslangic)
  }

  /**
   * Hafta tipini belirler (hafta numarasına göre - eski metod)
   */
  private getHaftaTipi(haftaNo: number, tatilParams: {
    birinciaraTatilHaftasi?: number,
    ikinciAraTatilHaftasi?: number,
    somestrTatilBaslangicHaftasi?: number
  }): HaftaTipi {
    const { birinciaraTatilHaftasi, ikinciAraTatilHaftasi, somestrTatilBaslangicHaftasi } = tatilParams

    // Birinci ara tatil kontrol
    if (birinciaraTatilHaftasi && haftaNo === birinciaraTatilHaftasi) {
      return 'TATIL'
    }

    // İkinci ara tatil kontrol
    if (ikinciAraTatilHaftasi && haftaNo === ikinciAraTatilHaftasi) {
      return 'TATIL'
    }

    // Sömestr tatili kontrol (2 hafta)
    if (somestrTatilBaslangicHaftasi && 
        (haftaNo === somestrTatilBaslangicHaftasi || haftaNo === somestrTatilBaslangicHaftasi + 1)) {
      return 'TATIL'
    }

    return 'DERS'
  }

  /**
   * Hafta verisi oluşturur - Tip parametresi ile
   */
  private createHaftaDataWithTip(
    haftaNo: number,
    baslangic: Date,
    bitis: Date,
    yilId: string,
    donemAyirici: Date,
    tip: HaftaTipi,
    somestrTatil?: { baslangic: Date, bitis: Date }
  ): HaftaData {
    // Yeni kural: Eğer sömestr tatili verildiyse dönem ayırıcı olarak tatilin başlangıcı kullanılır.
    let donem: DonemTipi
    if (somestrTatil) {
      // 1. dönem haftaları sömestr tatili başlangıcından önce başlayan haftalar
      donem = baslangic < somestrTatil.baslangic ? 'BIRINCI_DONEM' : 'IKINCI_DONEM'
    } else {
      // Geriye dönük uyumluluk: donemAyirici üzerinden hesapla
      donem = baslangic <= donemAyirici ? 'BIRINCI_DONEM' : 'IKINCI_DONEM'
    }
    
    // Açıklama tipine göre belirlenir
    let aciklama = `${haftaNo}. Hafta (${this.formatDateRange(baslangic, bitis)})`
    
    if (tip === 'TATIL') {
      aciklama += ' - Tatil Haftası'
    }

    return {
      haftaNo,
      baslamaTarihi: baslangic,
      bitisTarihi: bitis,
      tip,
      donem,
      aciklama,
      yilId
    }
  }

  /**
   * Hafta verisi oluşturur - Tüm haftalar DERS haftası olarak oluşturulur
   */
  private createHaftaData(
    haftaNo: number,
    baslangic: Date,
    bitis: Date,
    yilId: string,
    donemAyirici: Date,
    somestrTatil?: { baslangic: Date, bitis: Date }
  ): HaftaData {
    // Dönem belirleme (aynı mantık)
    let donem: DonemTipi
    if (somestrTatil) {
      donem = baslangic < somestrTatil.baslangic ? 'BIRINCI_DONEM' : 'IKINCI_DONEM'
    } else {
      donem = baslangic <= donemAyirici ? 'BIRINCI_DONEM' : 'IKINCI_DONEM'
    }

    const tip: HaftaTipi = 'DERS'
    const aciklama = `${haftaNo}. Hafta (${this.formatDateRange(baslangic, bitis)})`
    return { haftaNo, baslamaTarihi: baslangic, bitisTarihi: bitis, tip, donem, aciklama, yilId }
  }

  /**
   * Tarih aralığını formatlar
   */
  private formatDateRange(start: Date, end: Date): string {
    const startStr = `${start.getDate()} ${this.getMonthName(start.getMonth())}`
    const endStr = `${end.getDate()} ${this.getMonthName(end.getMonth())}`
    return `${startStr} - ${endStr}`
  }

  /**
   * Tarihi Türkçe formatlar
   */
  private formatTurkish(date: Date): string {
    return `${date.getDate()} ${this.getMonthName(date.getMonth())} ${date.getFullYear()}`
  }

    /**
   * Ay adını döndürür
   */
  private getMonthName(month: number): string {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]
    return months[month]
  }
}

