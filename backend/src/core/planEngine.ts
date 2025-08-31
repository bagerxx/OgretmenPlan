import { PrismaClient } from '@prisma/client'

export interface PlanGenerationRequest {
  sinifId: string
  dersId: string
  egitiYili: string
  planAdi?: string
}

export interface PlanDistribution {
  haftaId: string
  sure: number
  icerik: string
  tip: 'kazanim' | 'beceri'
  itemId: string
}

export class PlanEngine {
  constructor(private prisma: PrismaClient) {}

  /**
   * Plan oluşturma ana metodu
   */
  async generatePlan(request: PlanGenerationRequest): Promise<string> {
    const { sinifId, dersId, egitiYili, planAdi } = request

    // Mevcut planı kontrol et
    const existingPlan = await this.prisma.plan.findUnique({
      where: {
        sinifId_dersId_egitiYili: {
          sinifId,
          dersId,
          egitiYili
        }
      }
    })

    if (existingPlan) {
      throw new Error('Bu sınıf, ders ve eğitim yılı için zaten bir plan mevcut')
    }

    // Ders ve sınıf bilgilerini al
    const ders = await this.prisma.ders.findUnique({
      where: { id: dersId },
      include: {
        kazanimlar: true,
        beceriler: {
          include: { tema: true }
        }
      }
    })

    if (!ders) {
      throw new Error('Ders bulunamadı')
    }

    const dersSaat = await this.prisma.dersSaat.findUnique({
      where: {
        dersId_sinifId: {
          dersId,
          sinifId
        }
      }
    })

    if (!dersSaat) {
      throw new Error('Bu sınıf için ders saati tanımlanmamış')
    }

    // İş haftalarını al
    const isHaftalari = await this.prisma.hafta.findMany({
      where: { durum: 'LESSON' },
      orderBy: { numara: 'asc' }
    })

    if (isHaftalari.length === 0) {
      throw new Error('İş haftası bulunamadı')
    }

    // Toplam iş saatini hesapla
    const toplamIsSaati = isHaftalari.length * dersSaat.haftalikSaat

    // Planı oluştur
    const plan = await this.prisma.plan.create({
      data: {
        ad: planAdi || `${ders.ad} - ${egitiYili}`,
        aciklama: `${ders.ad} dersi için otomatik oluşturulan plan`,
        egitiYili,
        sinifId,
        dersId
      }
    })

    // Ders tipine göre dağılım yap
    if (ders.tip === 'KAZANIM_BAZLI') {
      await this.distributeKazanimlar(plan.id, ders.kazanimlar, isHaftalari, toplamIsSaati)
    } else {
      await this.distributeBeceriler(plan.id, ders.beceriler, isHaftalari, toplamIsSaati)
    }

    return plan.id
  }

  /**
   * Kazanımları haftalara dağıt
   */
  private async distributeKazanimlar(
    planId: string,
    kazanimlar: any[],
    isHaftalari: any[],
    toplamIsSaati: number
  ) {
    if (kazanimlar.length === 0) return

    // Her kazanıma eşit süre ver
    const kazanimBasinaSaat = Math.floor(toplamIsSaati / kazanimlar.length)
    const kalanSaat = toplamIsSaati % kazanimlar.length

    let currentHaftaIndex = 0
    let currentHaftaSaat = 0
    const haftaBasinaSaat = isHaftalari.length > 0 ? 
      Math.floor(toplamIsSaati / isHaftalari.length) : 0

    for (let i = 0; i < kazanimlar.length; i++) {
      const kazanim = kazanimlar[i]
      let kazanimSuresi = kazanimBasinaSaat + (i < kalanSaat ? 1 : 0)

      while (kazanimSuresi > 0 && currentHaftaIndex < isHaftalari.length) {
        const currentHafta = isHaftalari[currentHaftaIndex]
        const haftadaKalanSaat = haftaBasinaSaat - currentHaftaSaat

        if (haftadaKalanSaat <= 0) {
          currentHaftaIndex++
          currentHaftaSaat = 0
          continue
        }

        const haftayaVerilecekSure = Math.min(kazanimSuresi, haftadaKalanSaat)

        await this.prisma.planKazanim.create({
          data: {
            planId,
            kazanimId: kazanim.id,
            haftaId: currentHafta.id,
            sure: haftayaVerilecekSure
          }
        })

        kazanimSuresi -= haftayaVerilecekSure
        currentHaftaSaat += haftayaVerilecekSure

        if (currentHaftaSaat >= haftaBasinaSaat) {
          currentHaftaIndex++
          currentHaftaSaat = 0
        }
      }
    }
  }

  /**
   * Becerileri haftalara dağıt
   */
  private async distributeBeceriler(
    planId: string,
    beceriler: any[],
    isHaftalari: any[],
    toplamIsSaati: number
  ) {
    if (beceriler.length === 0) return

    // Toplam beceri saatini hesapla
    const toplamBeceriSaati = beceriler.reduce((sum, beceri) => sum + beceri.toplamOgrenmeS, 0)

    if (toplamBeceriSaati === 0) return

    let currentHaftaIndex = 0
    let currentHaftaSaat = 0
    const haftaBasinaSaat = isHaftalari.length > 0 ? 
      Math.floor(toplamIsSaati / isHaftalari.length) : 0

    for (const beceri of beceriler) {
      // Becerinin toplam ders saatine oranını hesapla
      const beceriOrani = beceri.toplamOgrenmeS / toplamBeceriSaati
      let beceriSuresi = Math.round(toplamIsSaati * beceriOrani)

      while (beceriSuresi > 0 && currentHaftaIndex < isHaftalari.length) {
        const currentHafta = isHaftalari[currentHaftaIndex]
        const haftadaKalanSaat = haftaBasinaSaat - currentHaftaSaat

        if (haftadaKalanSaat <= 0) {
          currentHaftaIndex++
          currentHaftaSaat = 0
          continue
        }

        const haftayaVerilecekSure = Math.min(beceriSuresi, haftadaKalanSaat)

        await this.prisma.planBeceri.create({
          data: {
            planId,
            beceriId: beceri.id,
            haftaId: currentHafta.id,
            sure: haftayaVerilecekSure
          }
        })

        beceriSuresi -= haftayaVerilecekSure
        currentHaftaSaat += haftayaVerilecekSure

        if (currentHaftaSaat >= haftaBasinaSaat) {
          currentHaftaIndex++
          currentHaftaSaat = 0
        }
      }
    }
  }

  /**
   * Plan detaylarını getir
   */
  async getPlanDetails(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        sinif: {
          include: { kademe: true }
        },
        ders: true,
        planKazanimlari: {
          include: {
            kazanim: true,
            hafta: true
          },
          orderBy: { hafta: { numara: 'asc' } }
        },
        planBecerileri: {
          include: {
            beceri: {
              include: { tema: true }
            },
            hafta: true
          },
          orderBy: { hafta: { numara: 'asc' } }
        }
      }
    })

    if (!plan) {
      throw new Error('Plan bulunamadı')
    }

    return plan
  }

  /**
   * Haftalık plan tablosu oluştur
   */
  async generateWeeklyTable(planId: string) {
    const plan = await this.getPlanDetails(planId)
    const haftalar = await this.prisma.hafta.findMany({
      orderBy: { numara: 'asc' }
    })

    const table = haftalar.map(hafta => {
      const kazanimlar = plan.planKazanimlari
        .filter(pk => pk.haftaId === hafta.id)
        .map(pk => ({
          tip: 'kazanim' as const,
          kod: pk.kazanim.kod,
          icerik: pk.kazanim.icerik,
          sure: pk.sure,
          tamamlandi: pk.tamamlandi
        }))

      const beceriler = plan.planBecerileri
        .filter(pb => pb.haftaId === hafta.id)
        .map(pb => ({
          tip: 'beceri' as const,
          kod: pb.beceri.id,
          icerik: `${pb.beceri.tema.ad} - ${pb.beceri.ad}`,
          sure: pb.sure,
          tamamlandi: pb.tamamlandi
        }))

      return {
        hafta: {
          numara: hafta.numara,
          baslangic: hafta.baslangic,
          bitis: hafta.bitis,
          durum: hafta.durum,
          aciklama: hafta.aciklama
        },
        icerikler: [...kazanimlar, ...beceriler]
      }
    })

    return {
      plan: {
        id: plan.id,
        ad: plan.ad,
        egitiYili: plan.egitiYili,
        sinif: `${plan.sinif.kademe.ad} - ${plan.sinif.seviye}. Sınıf`,
        ders: plan.ders.ad
      },
      haftalikTablo: table
    }
  }
}
