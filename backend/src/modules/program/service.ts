import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Program Şablonu servisi
export class ProgramSablonuService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Varsayılan program şablonlarını oluştur
   */
  async createDefaultSablonlar() {
    // İlkokul Programı
    const ilkokul = await this.prisma.programSablonu.upsert({
      where: { ad: 'İlkokul Program' },
      update: {},
      create: {
        ad: 'İlkokul Program',
        aciklama: '1-4. sınıflar için haftalık ders programı',
        kademeTipi: 'ILKOKUL',
        gunlukDersSayisi: 6
      }
    })

    // Ortaokul Programı  
    const ortaokul = await this.prisma.programSablonu.upsert({
      where: { ad: 'Ortaokul Program' },
      update: {},
      create: {
        ad: 'Ortaokul Program', 
        aciklama: '5-8. sınıflar için haftalık ders programı',
        kademeTipi: 'ORTAOKUL',
        gunlukDersSayisi: 7
      }
    })

    // Lise Programı
    const lise = await this.prisma.programSablonu.upsert({
      where: { ad: 'Lise Program' },
      update: {},
      create: {
        ad: 'Lise Program',
        aciklama: '9-12. sınıflar için haftalık ders programı', 
        kademeTipi: 'LISE',
        gunlukDersSayisi: 8
      }
    })

    // Program saatlerini oluştur
    await this.createProgramSaatleri(ilkokul.id, 6)
    await this.createProgramSaatleri(ortaokul.id, 7) 
    await this.createProgramSaatleri(lise.id, 8)

    return { ilkokul, ortaokul, lise }
  }

  /**
   * Program saatlerini oluştur
   */
  private async createProgramSaatleri(programSablonuId: string, dersSayisi: number) {
    const gunler = ['PAZARTESI', 'SALI', 'CARSAMBA', 'PERSEMBE', 'CUMA']
    const saatler = [
      { ders: 1, baslangic: '08:00', bitis: '08:40' },
      { ders: 2, baslangic: '08:50', bitis: '09:30' },
      { ders: 3, baslangic: '09:40', bitis: '10:20' },
      { ders: 4, baslangic: '10:40', bitis: '11:20' },
      { ders: 5, baslangic: '11:30', bitis: '12:10' },
      { ders: 6, baslangic: '13:00', bitis: '13:40' },
      { ders: 7, baslangic: '13:50', bitis: '14:30' },
      { ders: 8, baslangic: '14:40', bitis: '15:20' }
    ]

    for (const gun of gunler) {
      for (let i = 0; i < dersSayisi; i++) {
        const saat = saatler[i]
        await this.prisma.programSaati.upsert({
          where: {
            programSablonuId_gun_dersSirasi: {
              programSablonuId,
              gun,
              dersSirasi: saat.ders
            }
          },
          update: {},
          create: {
            programSablonuId,
            gun,
            dersSirasi: saat.ders,
            baslangic: saat.baslangic,
            bitis: saat.bitis
          }
        })
      }
    }
  }

  /**
   * Tüm program şablonlarını listele
   */
  async getAllSablonlar() {
    return await this.prisma.programSablonu.findMany({
      include: {
        programSaatleri: {
          orderBy: [{ gun: 'asc' }, { dersSirasi: 'asc' }]
        }
      }
    })
  }

  /**
   * Program şablonu detayı
   */
  async getSablonById(id: string) {
    return await this.prisma.programSablonu.findUnique({
      where: { id },
      include: {
        programSaatleri: {
          orderBy: [{ gun: 'asc' }, { dersSirasi: 'asc' }]
        }
      }
    })
  }
}
