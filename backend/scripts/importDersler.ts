import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const filePath = process.argv[2] || path.join(__dirname, '..', 'prisma', 'ders_paket.json')
  if (!fs.existsSync(filePath)) {
    console.error('JSON dosyası bulunamadı:', filePath)
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const paket: Array<{ ad: string; haftalikSaat: number; seviye: number }> = JSON.parse(raw)

  console.log(`🔁 ${paket.length} kayıt içe aktarılıyor...`)

  for (const item of paket) {
    // Ensure Ders
    let ders = await prisma.ders.findUnique({ where: { ad: item.ad } }).catch(() => null)
    if (!ders) {
      ders = await prisma.ders.create({ data: { ad: item.ad } })
      console.log('Oluşturulan ders:', item.ad)
    }

    // Ensure Sinif for seviye
    let sinif = await prisma.sinif.findFirst({ where: { seviye: item.seviye } }).catch(() => null)
    if (!sinif) {
      // find or create kademe
      let kademe = await prisma.kademe.findFirst().catch(() => null)
      if (!kademe) {
        kademe = await prisma.kademe.create({ data: { ad: 'Varsayılan Kademe' } })
      }
      sinif = await prisma.sinif.create({ data: { seviye: item.seviye, kademeId: kademe.id } })
      console.log(`Oluşturulan sınıf seviye=${item.seviye} (id=${sinif.id})`)
    }

    // DersSaat: upsert by unique compound (dersId_sinifId)
    const existing = await prisma.dersSaat.findUnique({ where: { dersId_sinifId: { dersId: ders.id, sinifId: sinif.id } } }).catch(() => null)
    if (!existing) {
      await prisma.dersSaat.create({ data: { dersId: ders.id, sinifId: sinif.id, haftalikSaat: item.haftalikSaat } })
      console.log(`DersSaat eklendi: ${item.ad} - seviye ${item.seviye} = ${item.haftalikSaat}`)
    } else if (existing.haftalikSaat !== item.haftalikSaat) {
      await prisma.dersSaat.update({ where: { id: existing.id }, data: { haftalikSaat: item.haftalikSaat } })
      console.log(`DersSaat güncellendi: ${item.ad} - seviye ${item.seviye} = ${item.haftalikSaat}`)
    }

    // SinifDers relation upsert
    await prisma.sinifDers.upsert({
      where: { sinifId_dersId: { sinifId: sinif.id, dersId: ders.id } },
      create: { sinifId: sinif.id, dersId: ders.id },
      update: {},
    }).catch(() => null)
  }

  console.log('✅ İçe aktarma tamamlandı')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
