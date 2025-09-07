import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HaftaTipi, DonemTipi } from '@prisma/client'
import { z } from 'zod'

// Sadeleştirilmiş şema - yıl bilgileri de dahil
export const CreateHaftalarSchema = z.object({
  // Yıl bilgileri
  yil: z.number().int().min(2020).max(2030),
  aciklama: z.string().min(1, 'Açıklama gereklidir'),
  // Tarih aralıkları
  baslangicTarihi: z.string().pipe(z.coerce.date()),
  bitisTarihi: z.string().pipe(z.coerce.date()),
  // Tatil dönemleri
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
  ,
  // Dini bayramlar (sadece başlangıç tarihi; arife dahil)
  ramazanBaslangic: z.string().pipe(z.coerce.date()).optional(),
  kurbanBaslangic: z.string().pipe(z.coerce.date()).optional()
})

export type CreateHaftalarInput = z.infer<typeof CreateHaftalarSchema>

export interface HaftaData {
  haftaNo: number
  baslamaTarihi: Date
  bitisTarihi: Date
  tip: HaftaTipi
  donem?: DonemTipi
  ad: string
  yilId: string
}

@Injectable()
export class HaftaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Yıl oluştur ve haftalarını otomatik üret
   * Tek endpoint - hem yıl hem hafta oluşturur
   */
  async generateHaftalar(data: CreateHaftalarInput) {
    const { 
      yil,
      aciklama,
  baslangicTarihi, 
  bitisTarihi, 
      birinciaraTatil,
      ikinciAraTatil,
  somestrTatil,
  ramazanBaslangic,
  kurbanBaslangic
    } = data

    // Gelen payload tarihlerini Date objesine çevir (controller genellikle string gönderir)
    const toDate = (v: any) => (v instanceof Date ? v : new Date(v))

  const baslangicDate = toDate(baslangicTarihi)
  const bitisDate = toDate(bitisTarihi)
    
    const birinciaraTatilDate = birinciaraTatil
      ? { baslangic: toDate(birinciaraTatil.baslangic), bitis: toDate(birinciaraTatil.bitis) }
      : undefined
    const ikinciAraTatilDate = ikinciAraTatil
      ? { baslangic: toDate(ikinciAraTatil.baslangic), bitis: toDate(ikinciAraTatil.bitis) }
      : undefined
    const somestrTatilDate = somestrTatil
      ? { baslangic: toDate(somestrTatil.baslangic), bitis: toDate(somestrTatil.bitis) }
      : undefined

    // Dini bayram aralıklarını oluştur (arife dahil: Ramazan 4 gün, Kurban 5 gün)
    const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
    const ramazanRange = ramazanBaslangic ? {
      baslangic: toDate(ramazanBaslangic),
      bitis: addDays(toDate(ramazanBaslangic), 3) // 4 gün (0..3)
    } : undefined
    const kurbanRange = kurbanBaslangic ? {
      baslangic: toDate(kurbanBaslangic),
      bitis: addDays(toDate(kurbanBaslangic), 4) // 5 gün (0..4)
    } : undefined

    console.log('[HaftaService] Başlangıç parametreleri:', {
      baslangicTarihi: baslangicDate.toLocaleDateString('tr-TR'),
      bitisTarihi: bitisDate.toLocaleDateString('tr-TR'),
      birinciaraTatil: birinciaraTatilDate,
      ikinciAraTatil: ikinciAraTatilDate,
      somestrTatil: somestrTatilDate
    })

    // Yıl zaten varsa güncelle veya yeni oluştur (unique constraint önleme)
  // UTC gün başına normalize et (00:00:00Z) – frontend toISOString offset kaymasını önler
  const toUtcDateOnly = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const yilData = await this.prisma.yil.upsert({
      where: { yil },
      update: {
    aciklama,
    baslamaTarihi: toUtcDateOnly(baslangicDate),
    bitisTarihi: toUtcDateOnly(bitisDate)
      },
      create: {
        yil,
        aciklama,
    baslamaTarihi: toUtcDateOnly(baslangicDate),
    bitisTarihi: toUtcDateOnly(bitisDate)
      }
    })

    // Eğer yıl zaten varsa eski haftaları temizle (ör: yeniden oluşturma durumunda)
    await this.prisma.hafta.deleteMany({ where: { yilId: yilData.id } })

    // Başlangıç tarihi Pazartesi'ye ayarla, bitiş tarihi Cuma'ya ayarla
    const baslangic = this.getNextMonday(baslangicDate)
    const bitis = this.getPreviousFriday(bitisDate)

    console.log('[HaftaService] Hesaplanan hafta aralığı:', {
      baslangic: baslangic.toLocaleDateString('tr-TR'),
      bitis: bitis.toLocaleDateString('tr-TR')
    })

  const haftalar: HaftaData[] = []
  let currentDate = new Date(baslangic)
  let haftaNo = 1
  let tatilHaftaSayisiCounter = 0

    // Başlangıçtan bitişe kadar tüm haftaları oluştur
    while (currentDate <= bitis) {
      const haftaBaslangic = new Date(currentDate) // Pazartesi
      const haftaBitis = this.getFridayOfWeek(currentDate) // Cuma
      
      // Eğer hafta sonu bitiş tarihini aşıyorsa dur
      if (haftaBitis > bitis) break

      // 1. Hafta tipini belirle (DERS veya TATIL)
      const haftaTipi = this.belirleHaftaTipi(haftaBaslangic, haftaBitis, {
        birinciaraTatil: birinciaraTatilDate,
        ikinciAraTatil: ikinciAraTatilDate,
        somestrTatil: somestrTatilDate,
        ramazan: ramazanRange,
        kurban: kurbanRange
      })

      // Tatil haftalarını hiç oluşturma (DB'ye de gitmeyecek), hafta numarasını artırma
      if (haftaTipi === 'TATIL') {
        tatilHaftaSayisiCounter++
      } else {
        // 2. Dönem tipini belirle (sömestr tatili baz alınarak)
        const donemTipi = this.belirleDonemTipi(haftaBaslangic, somestrTatilDate)

        // Hafta verisini oluştur
        haftalar.push({
          haftaNo,
          baslamaTarihi: toUtcDateOnly(haftaBaslangic),
          bitisTarihi: toUtcDateOnly(haftaBitis),
          tip: haftaTipi,
          donem: donemTipi,
          ad: this.createHaftaAd(haftaBaslangic, haftaBitis),
          yilId: yilData.id
        })

        console.log(`[HaftaService] ${haftaNo}. hafta: ${haftaBaslangic.toLocaleDateString('tr-TR')} - ${haftaBitis.toLocaleDateString('tr-TR')} | Tip: ${haftaTipi}`)

        haftaNo++
      }

      // Bir sonraki haftaya geç (7 gün)
      currentDate.setDate(currentDate.getDate() + 7)
    }

    // Haftaları toplu oluştur (donem optional olabilir -> null gönder)
    await this.prisma.hafta.createMany({
      // cast to any because Prisma client types may need regeneration after schema change
      data: haftalar.map(h => ({
        haftaNo: h.haftaNo,
        baslamaTarihi: h.baslamaTarihi,
        bitisTarihi: h.bitisTarihi,
        tip: h.tip,
        donem: (h.donem ?? null) as any,
        ad: h.ad,
        yilId: h.yilId
      })) as any
    })

    const gunSayilari = this.calculateWorkingDays(haftalar)

    console.log('[HaftaService] Sonuç özeti:', {
      toplamHafta: haftalar.length + tatilHaftaSayisiCounter,
      dersHaftasi: haftalar.filter(h => h.tip === 'DERS').length,
      tatilHaftasi: tatilHaftaSayisiCounter,
      birinciDonem: haftalar.filter(h => h.donem === 'BIRINCI_DONEM').length,
      ikinciDonem: haftalar.filter(h => h.donem === 'IKINCI_DONEM').length
    })

    return {
  message: `${haftalar.length} hafta (tatiller hariç) başarıyla oluşturuldu`,
  oluşturulanHaftaSayisi: haftalar.length + tatilHaftaSayisiCounter,
  kaydedilenHaftaSayisi: haftalar.length,
      dersHaftaSayisi: haftalar.filter(h => h.tip === 'DERS').length,
  tatilHaftaSayisi: tatilHaftaSayisiCounter,
      sinavHaftaSayisi: haftalar.filter(h => h.tip === 'SINAV').length,
      birinciDonemHaftaSayisi: haftalar.filter(h => h.donem === 'BIRINCI_DONEM').length,
      ikinciDonemHaftaSayisi: haftalar.filter(h => h.donem === 'IKINCI_DONEM').length,
      gunSayilari,
      yilId: yilData.id
    }
  }  /**
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

  /** Belirli bir yılın haftalarını listele (haftaNo, ad, tip, donem) */
  async getHaftalarByYil(yil: number) {
    const yilKaydi = await this.prisma.yil.findUnique({ where: { yil } })
    if (!yilKaydi) return { yil, haftalar: [] }
    const haftalar = await this.prisma.hafta.findMany({
      where: { yilId: yilKaydi.id },
      orderBy: { haftaNo: 'asc' },
      select: { haftaNo: true, ad: true, tip: true, donem: true }
    })
    return { yil, haftalar }
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
   * Hafta tipini belirler (DERS veya TATIL)
   */
  private belirleHaftaTipi(haftaBaslangic: Date, haftaBitis: Date, tatilParams: {
    birinciaraTatil?: { baslangic: Date, bitis: Date },
    ikinciAraTatil?: { baslangic: Date, bitis: Date },
  somestrTatil?: { baslangic: Date, bitis: Date },
  ramazan?: { baslangic: Date, bitis: Date },
  kurban?: { baslangic: Date, bitis: Date }
  }): HaftaTipi {
  const { birinciaraTatil, ikinciAraTatil, somestrTatil, ramazan, kurban } = tatilParams

    // Birinci ara tatil kontrolü
    if (birinciaraTatil && this.haftaTatilIleKesisiyorMu(haftaBaslangic, haftaBitis, birinciaraTatil.baslangic, birinciaraTatil.bitis)) {
      return 'TATIL'
    }

    // İkinci ara tatil kontrolü
    if (ikinciAraTatil && this.haftaTatilIleKesisiyorMu(haftaBaslangic, haftaBitis, ikinciAraTatil.baslangic, ikinciAraTatil.bitis)) {
      return 'TATIL'
    }

    // Sömestr tatili kontrolü
    if (somestrTatil && this.haftaTatilIleKesisiyorMu(haftaBaslangic, haftaBitis, somestrTatil.baslangic, somestrTatil.bitis)) {
      return 'TATIL'
    }

    // Dini bayramlar (yalnızca hafta içi 2 günden fazla ise tatil say)
    const weekdayOverlap = (range?: { baslangic: Date, bitis: Date }) => {
      if (!range) return 0
      return this.countWeekdayOverlap(haftaBaslangic, haftaBitis, range.baslangic, range.bitis)
    }

    const ramazanWeekdays = weekdayOverlap(ramazan)
    const kurbanWeekdays = weekdayOverlap(kurban)
    // mevcut resmi tatillerle çakışan kısımları düş
    const coveredByExisting = (range?: { baslangic: Date, bitis: Date }) => {
      if (!range) return 0
      const a = this.countWeekdayOverlap(haftaBaslangic, haftaBitis, range.baslangic, range.bitis)
      const b = birinciaraTatil ? this.countWeekdayOverlap(range.baslangic, range.bitis, birinciaraTatil.baslangic, birinciaraTatil.bitis) : 0
      const c = ikinciAraTatil ? this.countWeekdayOverlap(range.baslangic, range.bitis, ikinciAraTatil.baslangic, ikinciAraTatil.bitis) : 0
      const d = somestrTatil ? this.countWeekdayOverlap(range.baslangic, range.bitis, somestrTatil.baslangic, somestrTatil.bitis) : 0
      // sadece bu hafta içi kesişen kısmın, mevcut tatillerle kesişen hafta içi günlerini düş
      // aşırı düşmeyi engellemek için min al
      return Math.min(a, b + c + d)
    }
    const ramazanResidual = ramazanWeekdays - coveredByExisting(ramazan)
    const kurbanResidual = kurbanWeekdays - coveredByExisting(kurban)
    if (ramazanResidual > 2 || kurbanResidual > 2) {
      return 'TATIL'
    }

    // Diğer durumlarda DERS
    return 'DERS'
  }

  /** İki tarih aralığı arasında (Pzt-Cuma) çakışan gün sayısını döndürür */
  private countWeekdayOverlap(weekStart: Date, weekEnd: Date, rangeStart: Date, rangeEnd: Date): number {
    // normalize to date-only
    const norm = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
    let start = norm(weekStart)
    let end = norm(weekEnd)
    const rs = norm(rangeStart)
    const re = norm(rangeEnd)
    // intersect [start,end] with [rs,re]
    const is = start > rs ? start : rs
    const ie = end < re ? end : re
    if (is > ie) return 0
    let count = 0
    const cur = new Date(is)
    while (cur <= ie) {
      const day = cur.getDay()
      if (day >= 1 && day <= 5) count++
      cur.setDate(cur.getDate() + 1)
    }
    return count
  }

  /**
   * Dönem tipini belirler (sömestr tatili baz alınarak)
   */
  private belirleDonemTipi(haftaBaslangic: Date, somestrTatil?: { baslangic: Date, bitis: Date }): DonemTipi {
    if (!somestrTatil) {
      // Sömestr tatili belirtilmemişse default olarak birinci dönem
      return 'BIRINCI_DONEM'
    }

    // Hafta sömestr tatili başlangıcından önce mi?
    if (haftaBaslangic < somestrTatil.baslangic) {
      return 'BIRINCI_DONEM'
    } else {
      return 'IKINCI_DONEM'
    }
  }

  /**
   * Hafta ile tatil aralığının kesişip kesişmediğini kontrol eder
   */
  private haftaTatilIleKesisiyorMu(haftaBaslangic: Date, haftaBitis: Date, tatilBaslangic: Date, tatilBitis: Date): boolean {
    // Sadece tarih kısmını karşılaştır (saat bilgisini yok say)
    const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
    
    const hb = normalizeDate(haftaBaslangic)
    const he = normalizeDate(haftaBitis)
    const tb = normalizeDate(tatilBaslangic)
    const te = normalizeDate(tatilBitis)

    // Hafta aralığı ile tatil aralığı kesişiyor mu?
    return hb <= te && he >= tb
  }

  /** Hafta adını oluşturur: 8-12 Eylül (tip bağımsız) */
  private createHaftaAd(baslangic: Date, bitis: Date): string {
    const gun = (d: Date) => d.getDate()
    const ayAd = (d: Date) => this.getMonthName(d.getMonth())
    // Ay aynıysa 8-12 Eylül, değilse 29 Eylül - 3 Ekim gibi
    if (baslangic.getMonth() === bitis.getMonth()) {
      return `${gun(baslangic)}-${gun(bitis)} ${ayAd(baslangic)}`
    }
    return `${gun(baslangic)} ${ayAd(baslangic)} - ${gun(bitis)} ${ayAd(bitis)}`
  }

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
   * Tarih aralığını formatlar
   */
  private formatDateRange(start: Date, end: Date): string {
    const startStr = `${start.getDate()} ${this.getMonthName(start.getMonth())}`
    const endStr = `${end.getDate()} ${this.getMonthName(end.getMonth())}`
    return `${startStr} - ${endStr}`
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