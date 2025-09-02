import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed işlemi başlatıldı...')
  console.log('Prisma delegeleri:', Object.keys(prisma).filter(k => typeof (prisma as any)[k] === 'object'))
  console.log('Hastersaat:', typeof (prisma as any).dersSaat, 'HasSinifDers:', typeof (prisma as any).sinifDers)
  
  // Kullanıcının gönderdiği paket
  const paket = [
  {
    "ad": "Türkçe",
    "haftalikSaat": 6,
    "seviye": 4
  },
  {
    "ad": "Matematik",
    "haftalikSaat": 5,
    "seviye": 4
  },
  {
    "ad": "Fen Bilimleri",
    "haftalikSaat": 3,
    "seviye": 4
  },
  {
    "ad": "Sosyal Bilgiler",
    "haftalikSaat": 3,
    "seviye": 4
  },
  {
    "ad": "İngilizce",
    "haftalikSaat": 2,
    "seviye": 4
  },
  {
    "ad": "Din Kültürü ve Ahlak Bilgisi",
    "haftalikSaat": 2,
    "seviye": 4
  },
  {
    "ad": "Görsel Sanatlar",
    "haftalikSaat": 1,
    "seviye": 4
  },
  {
    "ad": "Müzik",
    "haftalikSaat": 1,
    "seviye": 4
  },
  {
    "ad": "Beden Eğitimi ve Oyun",
    "haftalikSaat": 2,
    "seviye": 4
  },
  {
    "ad": "Serbest Etkinlikler",
    "haftalikSaat": 2,
    "seviye": 4
  },
  {
    "ad": "Türkçe",
    "haftalikSaat": 6,
    "seviye": 5
  },
  {
    "ad": "Matematik",
    "haftalikSaat": 5,
    "seviye": 5
  },
  {
    "ad": "Fen Bilimleri",
    "haftalikSaat": 4,
    "seviye": 5
  },
  {
    "ad": "Sosyal Bilgiler",
    "haftalikSaat": 3,
    "seviye": 5
  },
  {
    "ad": "İngilizce",
    "haftalikSaat": 3,
    "seviye": 5
  },
  {
    "ad": "Din Kültürü ve Ahlak Bilgisi",
    "haftalikSaat": 2,
    "seviye": 5
  },
  {
    "ad": "Görsel Sanatlar",
    "haftalikSaat": 1,
    "seviye": 5
  },
  {
    "ad": "Müzik",
    "haftalikSaat": 1,
    "seviye": 5
  },
  {
    "ad": "Beden Eğitimi ve Spor",
    "haftalikSaat": 2,
    "seviye": 5
  },
  {
    "ad": "Teknoloji ve Tasarım",
    "haftalikSaat": 2,
    "seviye": 5
  },
  {
    "ad": "Türkçe",
    "haftalikSaat": 5,
    "seviye": 6
  },
  {
    "ad": "Matematik",
    "haftalikSaat": 5,
    "seviye": 6
  },
  {
    "ad": "Fen Bilimleri",
    "haftalikSaat": 4,
    "seviye": 6
  },
  {
    "ad": "Sosyal Bilgiler",
    "haftalikSaat": 3,
    "seviye": 6
  },
  {
    "ad": "İngilizce",
    "haftalikSaat": 4,
    "seviye": 6
  },
  {
    "ad": "Din Kültürü ve Ahlak Bilgisi",
    "haftalikSaat": 2,
    "seviye": 6
  },
  {
    "ad": "Görsel Sanatlar",
    "haftalikSaat": 1,
    "seviye": 6
  },
  {
    "ad": "Müzik",
    "haftalikSaat": 1,
    "seviye": 6
  },
  {
    "ad": "Beden Eğitimi ve Spor",
    "haftalikSaat": 2,
    "seviye": 6
  },
  {
    "ad": "Teknoloji ve Tasarım",
    "haftalikSaat": 2,
    "seviye": 6
  },
  {
    "ad": "Türkçe",
    "haftalikSaat": 5,
    "seviye": 7
  },
  {
    "ad": "Matematik",
    "haftalikSaat": 5,
    "seviye": 7
  },
  {
    "ad": "Fen Bilimleri",
    "haftalikSaat": 4,
    "seviye": 7
  },
  {
    "ad": "Sosyal Bilgiler",
    "haftalikSaat": 3,
    "seviye": 7
  },
  {
    "ad": "İngilizce",
    "haftalikSaat": 4,
    "seviye": 7
  },
  {
    "ad": "Din Kültürü ve Ahlak Bilgisi",
    "haftalikSaat": 2,
    "seviye": 7
  },
  {
    "ad": "Görsel Sanatlar",
    "haftalikSaat": 1,
    "seviye": 7
  },
  {
    "ad": "Müzik",
    "haftalikSaat": 1,
    "seviye": 7
  },
  {
    "ad": "Beden Eğitimi ve Spor",
    "haftalikSaat": 2,
    "seviye": 7
  },
  {
    "ad": "Teknoloji ve Tasarım",
    "haftalikSaat": 2,
    "seviye": 7
  },
  {
    "ad": "Türkçe",
    "haftalikSaat": 5,
    "seviye": 8
  },
  {
    "ad": "Matematik",
    "haftalikSaat": 5,
    "seviye": 8
  },
  {
    "ad": "Fen Bilimleri",
    "haftalikSaat": 4,
    "seviye": 8
  },
  {
    "ad": "T.C. İnkılap Tarihi ve Atatürkçülük",
    "haftalikSaat": 2,
    "seviye": 8
  },
  {
    "ad": "İngilizce",
    "haftalikSaat": 4,
    "seviye": 8
  },
  {
    "ad": "Din Kültürü ve Ahlak Bilgisi",
    "haftalikSaat": 2,
    "seviye": 8
  },
  {
    "ad": "Görsel Sanatlar",
    "haftalikSaat": 1,
    "seviye": 8
  },
  {
    "ad": "Müzik",
    "haftalikSaat": 1,
    "seviye": 8
  },
  {
    "ad": "Beden Eğitimi ve Spor",
    "haftalikSaat": 2,
    "seviye": 8
  },
  {
    "ad": "Teknoloji ve Tasarım",
    "haftalikSaat": 2,
    "seviye": 8
  }
]

  for (const item of paket) {
    // 1) Ders varsa al, yoksa oluştur (findFirst kullanıyoruz çünkü unique by id değil)
    let ders = await prisma.ders.findFirst({ where: { ad: item.ad } })
    if (!ders) {
      ders = await prisma.ders.create({ data: { ad: item.ad } })
    }

    // 2) Seviye için kademe ve sinif bulunmalı. Burada basitçe ilk uygun kademe ve sinif oluşturulur.
    // Varsayım: seviye -> bir Kademe altında unique olan Sinif.seviye
    // Önce kademe bul (ör: ilkokul için ad 'İlkokul' veya mevcut ilk kademe alınabilir)
    let sinif = await prisma.sinif.findFirst({ where: { seviye: item.seviye } })
    if (!sinif) {
      // Eğer sınıf yoksa, var olan bir kademe al ya da yeni kademe oluştur
      let kademe = await prisma.kademe.findFirst()
      if (!kademe) {
        kademe = await prisma.kademe.create({ data: { ad: 'Varsayılan Kademe' } })
      }
      sinif = await prisma.sinif.create({ data: { seviye: item.seviye, kademeId: kademe.id } })
    }

    // 3) DersSaat tablosuna haftalikSaat ekle (unique [dersId, sinifId])
    const existing = await prisma.dersSaat.findFirst({ where: { dersId: ders.id, sinifId: sinif.id } }).catch(() => null)
    if (!existing) {
      await prisma.dersSaat.create({ data: { dersId: ders.id, sinifId: sinif.id, haftalikSaat: item.haftalikSaat } })
    } else {
      // Güncelleme: haftalikSaat farklıysa güncelle
      if (existing.haftalikSaat !== item.haftalikSaat) {
        await prisma.dersSaat.update({ where: { id: existing.id }, data: { haftalikSaat: item.haftalikSaat } })
      }
    }

    // 4) Ayrıca SinifDers (many-to-many) bağlantısını sağlamayı deneyelim
    // SinifDers ilişkisinin unique compound alanını doğrudan sorgulamak bazen client tipleri gerektirir;
    // burada önce varsa kontrol edip yoksa oluşturuyoruz.
    const sd = await prisma.sinifDers.findFirst({ where: { sinifId: sinif.id, dersId: ders.id } }).catch(() => null)
    if (!sd) {
      await prisma.sinifDers.create({ data: { sinifId: sinif.id, dersId: ders.id } }).catch(() => null)
    }
  }

  console.log('✅ Seed işlemi tamamlandı: paket işlendi')
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi başarısız:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
