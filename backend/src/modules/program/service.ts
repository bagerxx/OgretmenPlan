import { PrismaClient, DersGunu } from '@prisma/client'

// Yeni Ders Programı Şablon Servisi
export class DersProgramiSablonuService {
  constructor(private prisma: PrismaClient) {}

  private defaultSaatler = [
    { dersSaat: 1 },
    { dersSaat: 2 },
    { dersSaat: 3 },
    { dersSaat: 4 },
    { dersSaat: 5 },
    { dersSaat: 6 },
    { dersSaat: 7 },
    { dersSaat: 8 }
  ]

  private gunler: DersGunu[] = ['PAZARTESI','SALI','CARSAMBA','PERSEMBE','CUMA']

  async ensureDefaultSablonlar() {
    const ilkokul = await this.prisma.dersProgramiSablonu.upsert({
      where: { ad: 'İlkokul' },
      update: {},
      create: { ad: 'İlkokul', aciklama: 'İlkokul haftalık ders programı', maxDersSaat: 6 }
    })
    const ortaokul = await this.prisma.dersProgramiSablonu.upsert({
      where: { ad: 'Ortaokul' },
      update: {},
      create: { ad: 'Ortaokul', aciklama: 'Ortaokul haftalık ders programı', maxDersSaat: 7 }
    })
    const lise = await this.prisma.dersProgramiSablonu.upsert({
      where: { ad: 'Lise' },
      update: {},
      create: { ad: 'Lise', aciklama: 'Lise haftalık ders programı', maxDersSaat: 8 }
    })

    await Promise.all([
      this.generateProgram(ilkokul.id, ilkokul.maxDersSaat),
      this.generateProgram(ortaokul.id, ortaokul.maxDersSaat),
      this.generateProgram(lise.id, lise.maxDersSaat)
    ])

    return { ilkokul, ortaokul, lise }
  }

  private async generateProgram(sablonId: string, maxSaat: number) {
    for (const gun of this.gunler) {
      for (let i = 1; i <= maxSaat; i++) {
        await this.prisma.dersProgrami.upsert({
          where: {
            sinifId_sablonId_gun_dersSaat: {
              sinifId: 'PLACEHOLDER', // Sinif bağlanınca güncellenecek
              sablonId,
              gun,
              dersSaat: i
            }
          },
          update: {},
          create: {
            sinifId: 'PLACEHOLDER',
            sablonId,
            gun,
            dersSaat: i
          }
        })
      }
    }
  }

  async listSablonlar() {
    return this.prisma.dersProgramiSablonu.findMany({
      include: { dersProgramlari: { orderBy: [{ gun: 'asc' }, { dersSaat: 'asc' }] } }
    })
  }

  async getSablon(id: string) {
    return this.prisma.dersProgramiSablonu.findUnique({
      where: { id },
      include: { dersProgramlari: { orderBy: [{ gun: 'asc' }, { dersSaat: 'asc' }] } }
    })
  }
}

// Geriye dönük uyumluluk için eski sınıf adı
export class ProgramSablonuService extends DersProgramiSablonuService {}
