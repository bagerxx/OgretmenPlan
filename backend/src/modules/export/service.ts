import { PrismaClient } from '@prisma/client'
import { PlanService } from '../plan/service'

export interface YillikPlanData {
  plan: {
    id: string
    ad: string
    egitiYili: string
    sinif: { seviye: number, kademe: { ad: string } }
    ders: { ad: string }
  }
  haftalar: Array<{
    numara: number
    baslangic: Date
    bitis: Date
    durum: string
    kazanimlar: Array<{
      kod: string
      icerik: string
      sure: number
    }>
  }>
  ozet: {
    toplamHafta: number
    dersHaftasi: number
    tatilHaftasi: number
    toplamSaat: number
  }
}

export class ExportService {
  constructor(private prisma: PrismaClient) {}

  async getYillikPlanData(planId: string): Promise<YillikPlanData> {
    const planService = new PlanService(this.prisma)
    
    // Plan detaylarını getir
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
          orderBy: {
            hafta: { numara: 'asc' }
          }
        }
      }
    })

    if (!plan) {
      throw new Error('Plan bulunamadı')
    }

    // Hafta verilerini grupla
    const haftaMap = new Map<string, any>()
    
    for (const planKazanim of plan.planKazanimlari) {
      const haftaKey = planKazanim.hafta.id
      
      if (!haftaMap.has(haftaKey)) {
        haftaMap.set(haftaKey, {
          numara: planKazanim.hafta.numara,
          baslangic: planKazanim.hafta.baslangic,
          bitis: planKazanim.hafta.bitis,
          durum: planKazanim.hafta.durum,
          kazanimlar: []
        })
      }
      
      haftaMap.get(haftaKey)!.kazanimlar.push({
        kod: planKazanim.kazanim.kod,
        icerik: planKazanim.kazanim.icerik,
        sure: planKazanim.sure
      })
    }

    const haftalar = Array.from(haftaMap.values()).sort((a, b) => a.numara - b.numara)

    // Özet bilgileri hesapla
    const toplamHafta = haftalar.length
    const dersHaftasi = haftalar.filter(h => h.durum === 'LESSON').length
    const tatilHaftasi = haftalar.filter(h => h.durum === 'HOLIDAY').length
    const toplamSaat = haftalar.reduce((total, hafta) => {
      return total + hafta.kazanimlar.reduce((haftaTotal: number, kazanim: any) => 
        haftaTotal + kazanim.sure, 0)
    }, 0)

    return {
      plan: {
        id: plan.id,
        ad: plan.ad,
        egitiYili: plan.egitiYili,
        sinif: {
          seviye: plan.sinif.seviye,
          kademe: { ad: plan.sinif.kademe.ad }
        },
        ders: { ad: plan.ders.ad }
      },
      haftalar,
      ozet: {
        toplamHafta,
        dersHaftasi,
        tatilHaftasi,
        toplamSaat
      }
    }
  }

  async generateHTMLPlan(planId: string): Promise<string> {
    const data = await this.getYillikPlanData(planId)
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.plan.egitiYili} Yıllık Planı</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .tatil { background-color: #ffebee; }
        .sinav { background-color: #fff3e0; }
        .ozet { margin-top: 20px; background-color: #f5f5f5; padding: 15px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.plan.egitiYili} EĞİTİM-ÖĞRETİM YILI YILLIK PLANI</h1>
        <h2>${data.plan.sinif.kademe.ad} ${data.plan.sinif.seviye}. Sınıf - ${data.plan.ders.ad}</h2>
    </div>
    
    <div class="info">
        <p><strong>Plan Adı:</strong> ${data.plan.ad}</p>
        <p><strong>Oluşturulma Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Hafta</th>
                <th>Tarih Aralığı</th>
                <th>Durum</th>
                <th>Kazanımlar</th>
                <th>Süre (Saat)</th>
            </tr>
        </thead>
        <tbody>
            ${data.haftalar.map(hafta => `
                <tr class="${hafta.durum === 'HOLIDAY' ? 'tatil' : hafta.durum === 'EXAM' ? 'sinav' : ''}">
                    <td>${hafta.numara}</td>
                    <td>${new Date(hafta.baslangic).toLocaleDateString('tr-TR')} - ${new Date(hafta.bitis).toLocaleDateString('tr-TR')}</td>
                    <td>${hafta.durum === 'LESSON' ? 'Ders' : hafta.durum === 'HOLIDAY' ? 'Tatil' : hafta.durum === 'EXAM' ? 'Sınav' : 'İş'}</td>
                    <td>
                        ${hafta.kazanimlar.map(k => `<div><strong>${k.kod}:</strong> ${k.icerik}</div>`).join('')}
                    </td>
                    <td>${hafta.kazanimlar.reduce((total: number, k: any) => total + k.sure, 0)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="ozet">
        <h3>ÖZET BİLGİLER</h3>
        <p><strong>Toplam Hafta:</strong> ${data.ozet.toplamHafta}</p>
        <p><strong>Ders Haftası:</strong> ${data.ozet.dersHaftasi}</p>
        <p><strong>Tatil Haftası:</strong> ${data.ozet.tatilHaftasi}</p>
        <p><strong>Toplam Ders Saati:</strong> ${data.ozet.toplamSaat}</p>
    </div>
</body>
</html>
    `
  }
}
