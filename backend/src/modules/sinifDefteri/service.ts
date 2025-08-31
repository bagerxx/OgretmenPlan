import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Sınıf Defteri servisi - Haftalık program + kazanım eşleştirme
export class SinifDefteriService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Plan için sınıf defteri oluştur
   */
  async createSinifDefteri(planId: string, programSablonuId: string) {
    // Plan bilgilerini al
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        sinif: { include: { kademe: true } },
        ders: true,
        planKazanimlari: {
          include: { kazanim: true, hafta: true },
          where: { hafta: { durum: 'LESSON' } },
          orderBy: { hafta: { numara: 'asc' } }
        },
        planBecerileri: {
          include: { beceri: true, hafta: true },
          where: { hafta: { durum: 'LESSON' } },
          orderBy: { hafta: { numara: 'asc' } }
        }
      }
    })

    if (!plan) {
      throw new Error('Plan bulunamadı')
    }

    // Program şablonunu al
    const programSablonu = await this.prisma.programSablonu.findUnique({
      where: { id: programSablonuId },
      include: { programSaatleri: true }
    })

    if (!programSablonu) {
      throw new Error('Program şablonu bulunamadı')
    }

    // Ders saatini al
    const dersSaat = await this.prisma.dersSaat.findUnique({
      where: {
        dersId_sinifId: {
          dersId: plan.dersId,
          sinifId: plan.sinifId
        }
      }
    })

    if (!dersSaat) {
      throw new Error('Bu sınıf için ders saati tanımlanmamış')
    }

    // Plan kazanım/becerilerini haftalara göre grupla
    const haftalikIcerik = new Map()
    
    // Kazanımları ekle
    for (const planKazanim of plan.planKazanimlari) {
      const haftaId = planKazanim.haftaId
      if (!haftalikIcerik.has(haftaId)) {
        haftalikIcerik.set(haftaId, [])
      }
      haftalikIcerik.get(haftaId).push({
        tip: 'kazanim',
        id: planKazanim.kazanimId,
        icerik: planKazanim.kazanim,
        sure: planKazanim.sure
      })
    }

    // Becerileri ekle
    for (const planBeceri of plan.planBecerileri) {
      const haftaId = planBeceri.haftaId
      if (!haftalikIcerik.has(haftaId)) {
        haftalikIcerik.set(haftaId, [])
      }
      haftalikIcerik.get(haftaId).push({
        tip: 'beceri',
        id: planBeceri.beceriId,
        icerik: planBeceri.beceri,
        sure: planBeceri.sure
      })
    }

    // Her hafta için program saatlerine yerleştir
    const sinifDefteriKayitlari = []

    for (const [haftaId, icerikler] of haftalikIcerik) {
      let icerikIndex = 0
      let haftalikToplamSaat = icerikler.reduce((total: number, i: any) => total + i.sure, 0)
      
      // Bu haftada kaç ders saati olması gerekiyor
      const hedefSaat = dersSaat.haftalikSaat
      
      // Program saatlerini kullanarak dağıt
      for (const programSaati of programSablonu.programSaatleri) {
        if (icerikIndex < icerikler.length && haftalikToplamSaat > 0) {
          const icerik = icerikler[icerikIndex]
          
          const sinifDefteriKaydi = await this.prisma.sinifDefteri.create({
            data: {
              planId: planId,
              haftaId: haftaId,
              programSaatiId: programSaati.id,
              kazanimId: icerik.tip === 'kazanim' ? icerik.id : null,
              beceriId: icerik.tip === 'beceri' ? icerik.id : null
            }
          })

          sinifDefteriKayitlari.push(sinifDefteriKaydi)
          
          // Bir sonraki içeriğe geç
          icerikIndex++
          haftalikToplamSaat--
        }
      }
    }

    return {
      message: 'Sınıf defteri başarıyla oluşturuldu',
      kayitSayisi: sinifDefteriKayitlari.length,
      plan: plan.ad
    }
  }

  /**
   * Plan için sınıf defterini getir
   */
  async getSinifDefteri(planId: string) {
    const defterKayitlari = await this.prisma.sinifDefteri.findMany({
      where: { planId },
      include: {
        hafta: true,
        programSaati: true,
        kazanim: true,
        beceri: true,
        plan: {
          include: {
            sinif: { include: { kademe: true } },
            ders: true
          }
        }
      },
      orderBy: [
        { hafta: { numara: 'asc' } },
        { programSaati: { gun: 'asc' } },
        { programSaati: { dersSirasi: 'asc' } }
      ]
    })

    // Haftalara göre grupla
    const haftalarGrouped = defterKayitlari.reduce((acc: any, kayit) => {
      const haftaKey = kayit.hafta.numara
      if (!acc[haftaKey]) {
        acc[haftaKey] = {
          hafta: kayit.hafta,
          dersler: []
        }
      }
      acc[haftaKey].dersler.push(kayit)
      return acc
    }, {})

    return {
      plan: defterKayitlari[0]?.plan,
      haftalar: Object.values(haftalarGrouped)
    }
  }

  /**
   * Sınıf defteri kaydını güncelle
   */
  async updateSinifDefteriKaydi(id: string, data: { tamamlandi?: boolean; notlar?: string }) {
    return await this.prisma.sinifDefteri.update({
      where: { id },
      data
    })
  }
}
