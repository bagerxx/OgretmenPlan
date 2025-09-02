import { PrismaClient, HaftaTipi } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * TEST VERİLERİ OLUŞTURMA SCRIPT'İ
 * Bu script ile temel test verilerini oluşturabiliriz
 */
export class TestDataCreator {
  
  async createTestData() {
    console.log('🎯 Test verileri oluşturuluyor...');
    
    try {
      // 1. Yıl oluştur
      const yil = await prisma.yil.create({
        data: {
          yil: 2025,
          aciklama: '2025-2026 Eğitim Öğretim Yılı',
          baslamaTarihi: new Date('2025-09-01'),
          bitisTarihi: new Date('2026-06-30')
        }
      });
      
      console.log('✅ Yıl oluşturuldu:', yil.aciklama);
      
      // 2. Haftalar oluştur (40 hafta)
      const haftalar = [];
      for (let i = 1; i <= 40; i++) {
        const baslama = new Date('2025-09-01');
        baslama.setDate(baslama.getDate() + ((i - 1) * 7));
        
        const bitis = new Date(baslama);
        bitis.setDate(bitis.getDate() + 6);
        
        const hafta = await prisma.hafta.create({
          data: {
            haftaNo: i,
            baslamaTarihi: baslama,
            bitisTarihi: bitis,
            tip: i <= 35 ? HaftaTipi.DERS : HaftaTipi.TATIL, // İlk 35 hafta ders, son 5 hafta tatil
            aciklama: `${i}. Hafta`,
            yilId: yil.id
          }
        });
        
        haftalar.push(hafta);
      }
      
      console.log('✅ 40 hafta oluşturuldu');
      
      // 3. Sınıf seviyeleri oluştur
  const siniflar: { id: string; seviye: number; aciklama: string }[] = [];
      for (let i = 1; i <= 4; i++) {
        const sinif = await prisma.sinif.create({
          data: {
            seviye: i,
            aciklama: `${i}. Sınıf`
          }
        });
        siniflar.push(sinif);
      }
      
      console.log('✅ 4 sınıf seviyesi oluşturuldu');
      
      // 4. Dersler oluştur
      const dersAdlari = ['Matematik', 'Türkçe', 'Fen Bilgisi', 'Sosyal Bilgiler'];
      const dersler = [];
      
      for (const sinif of siniflar) {
        for (const dersAdi of dersAdlari) {
          const ders = await prisma.ders.create({
            data: {
              ad: dersAdi,
              haftalikSaat: dersAdi === 'Matematik' ? 5 : dersAdi === 'Türkçe' ? 6 : 3,
              sinifId: sinif.id
            }
          });
          dersler.push(ders);
        }
      }
      
      console.log('✅ 16 ders oluşturuldu (4 sınıf × 4 ders)');
      
      // 5. Örnek tema ve beceriler oluştur (sadece 1. sınıf matematik için)
      const birinciSinifMatematik = dersler.find(d => 
        d.ad === 'Matematik' && siniflar.find(s => s.id === d.sinifId)?.seviye === 1
      );
      
      if (birinciSinifMatematik) {
        const tema = await prisma.tema.create({
          data: {
            ad: 'Sayılar',
            sira: 1,
            dersId: birinciSinifMatematik.id
          }
        });
        
        // Beceriler (Yeni Program)
        const beceriler = [
          { ad: 'Sayıları tanır ve okur', saatSuresi: 10, sira: 1 },
          { ad: 'Sayıları karşılaştırır', saatSuresi: 10, sira: 2 },
          { ad: 'Sayıları sıralar', saatSuresi: 10, sira: 3 }
        ];
        
        for (const beceriData of beceriler) {
          await prisma.beceri.create({
            data: {
              ...beceriData,
              temaId: tema.id
            }
          });
        }
        
        // Kazanımlar (Eski Program)
        const kazanimlar = [
          { ad: 'M.1.1.1.1 Doğal sayıları okur', saatSuresi: 15, sira: 1 },
          { ad: 'M.1.1.1.2 Doğal sayıları karşılaştırır', saatSuresi: 15, sira: 2 }
        ];
        
        for (const kazanimData of kazanimlar) {
          await prisma.kazanim.create({
            data: {
              ...kazanimData,
              temaId: tema.id
            }
          });
        }
        
        console.log('✅ 1. Sınıf Matematik için örnek tema, beceri ve kazanımlar oluşturuldu');
      }
      
      // 6. Günler oluştur
      const gunler = [
        { ad: 'Pazartesi', sira: 1 },
        { ad: 'Salı', sira: 2 },
        { ad: 'Çarşamba', sira: 3 },
        { ad: 'Perşembe', sira: 4 },
        { ad: 'Cuma', sira: 5 }
      ];
      
      for (const gunData of gunler) {
        await prisma.gun.create({ data: gunData });
      }
      
      console.log('✅ 5 gün oluşturuldu');
      
      // 7. Ders saatleri oluştur
      const dersSaatleri = [
        { saat: 1, baslamaSaati: '08:00', bitisSaati: '08:40' },
        { saat: 2, baslamaSaati: '08:50', bitisSaati: '09:30' },
        { saat: 3, baslamaSaati: '09:40', bitisSaati: '10:20' },
        { saat: 4, baslamaSaati: '10:40', bitisSaati: '11:20' },
        { saat: 5, baslamaSaati: '11:30', bitisSaati: '12:10' },
        { saat: 6, baslamaSaati: '13:00', bitisSaati: '13:40' }
      ];
      
      for (const saatData of dersSaatleri) {
        await prisma.dersSaati.create({ data: saatData });
      }
      
      console.log('✅ 6 ders saati oluşturuldu');
      
      console.log('🎉 Test verileri başarıyla oluşturuldu!');
      
      return {
        yil,
        haftaSayisi: haftalar.length,
        sinifSayisi: siniflar.length,
        dersSayisi: dersler.length
      };
      
    } catch (error) {
      console.error('❌ Test verileri oluşturma hatası:', error);
      throw error;
    }
  }
}

export const testDataCreator = new TestDataCreator();
