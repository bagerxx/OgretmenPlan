import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed işlemi başlatıldı...')
  
  // Buraya gerektiğinde manuel seed veriler eklenebilir
  // Şu anda mock veri yok, temiz başlangıç
  
  console.log('✅ Seed işlemi tamamlandı (mock veri yok)')
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi başarısız:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
