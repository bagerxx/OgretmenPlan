import { PrismaClient, ProgramTipi, HaftaTipi } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * YIL BAŞI OTOMASYON MOTORU
 * Bu buton ile tüm dersler için plan şablonları oluşturulur
 */
export class PlanOtomasyonMotoru {
  
  /**
   * ANA OTOMASYON FONKSİYONU
   * Tüm derslerin plan şablonlarını oluşturur
   */
  async yilBasiOtomasyonuCalistir(yilId: string) {
    console.log('🚀 YIL BAŞI OTOMASYONU BAŞLADI...');
    
    try {
      // 1. Önceki plan şablonlarını temizle
      await this.oncekiPlanlariTemizle(yilId);
      
      // 2. Tüm dersleri getir
      const dersler = await this.tumDersleriGetir();
      
      // 3. Her ders için plan şablonu oluştur
      for (const ders of dersler) {
        console.log(`📚 ${ders.sinif.aciklama} - ${ders.ad} işleniyor...`);
        
        // Yeni program (beceri bazlı)
        await this.dersPlanSablonuOlustur(ders.id, yilId, ProgramTipi.YENI_PROGRAM);
        
        // Eski program (kazanım bazlı)  
        await this.dersPlanSablonuOlustur(ders.id, yilId, ProgramTipi.ESKI_PROGRAM);
      }
      
      console.log('✅ YIL BAŞI OTOMASYONU TAMAMLANDI!');
      
      // 4. Oluşturulan plan sayısını raporla
      const planSayisi = await prisma.planSablonu.count({
        where: { yilId }
      });
      
      console.log(`📊 Toplam ${planSayisi} plan şablonu oluşturuldu.`);
      
      return {
        success: true,
        planSayisi,
        message: 'Yıl başı otomasyonu başarıyla tamamlandı!'
      };
      
    } catch (error) {
      console.error('❌ OTOMASYON HATASI:', error);
      throw error;
    }
  }
  
  /**
   * Önceki yılın plan şablonlarını temizle
   */
  private async oncekiPlanlariTemizle(yilId: string) {
    console.log('🧹 Önceki plan şablonları temizleniyor...');
    
    await prisma.planSablonu.deleteMany({
      where: { yilId }
    });
  }
  
  /**
   * Tüm dersleri sinif bilgileri ile getir
   */
  private async tumDersleriGetir() {
    return await prisma.ders.findMany({
      include: {
        sinif: true,
        temalar: {
          include: {
            beceriler: true,
            kazanimlar: true
          }
        }
      }
    });
  }
  
  /**
   * Tek bir ders için plan şablonu oluştur
   */
  private async dersPlanSablonuOlustur(dersId: string, yilId: string, programTipi: ProgramTipi) {
    
    // 1. Ders bilgilerini getir
    const ders = await prisma.ders.findUniqueOrThrow({
      where: { id: dersId },
      include: {
        temalar: {
          include: {
            beceriler: true,
            kazanimlar: true
          }
        }
      }
    });
    
    // 2. DERS haftalarını getir (TATIL ve SINAV hariç)
    const dersHaftalari = await prisma.hafta.findMany({
      where: {
        yilId,
        tip: HaftaTipi.DERS
      },
      orderBy: { haftaNo: 'asc' }
    });
    
    if (dersHaftalari.length === 0) {
      console.log(`⚠️  ${ders.ad} için ders haftası bulunamadı!`);
      return;
    }
    
    // 3. Beceri/kazanım listesini hazırla
    const icerikListesi = this.icerikListesiHazirla(ders.temalar, programTipi);
    
    if (icerikListesi.length === 0) {
      console.log(`⚠️  ${ders.ad} için ${programTipi} içeriği bulunamadı!`);
      return;
    }
    
    // 4. Plan dağıtım algoritmasını çalıştır
    const dagitimPlani = this.planDagitimAlgoritmasi(
      icerikListesi,
      dersHaftalari,
      ders.haftalikSaat
    );
    
    // 5. Plan şablonunu veritabanına kaydet
    await this.planSablonunuKaydet(dersId, yilId, programTipi, dagitimPlani);
  }
  
  /**
   * Beceri/kazanım listesini hazırla
   */
  private icerikListesiHazirla(temalar: any[], programTipi: ProgramTipi) {
    const icerikListesi: any[] = [];
    
    temalar.forEach(tema => {
      if (programTipi === ProgramTipi.YENI_PROGRAM) {
        // Beceri bazlı (yeni program)
        tema.beceriler.forEach((beceri: any) => {
          icerikListesi.push({
            id: beceri.id,
            ad: beceri.ad,
            saatSuresi: beceri.saatSuresi,
            sira: beceri.sira,
            tip: 'beceri'
          });
        });
      } else {
        // Kazanım bazlı (eski program)
        tema.kazanimlar.forEach((kazanim: any) => {
          icerikListesi.push({
            id: kazanim.id,
            ad: kazanim.ad,
            saatSuresi: kazanim.saatSuresi,
            sira: kazanim.sira,
            tip: 'kazanim'
          });
        });
      }
    });
    
    // Sıraya göre sırala
    return icerikListesi.sort((a, b) => a.sira - b.sira);
  }
  
  /**
   * PLAN DAĞITIM ALGORİTMASI
   * Becerileri/kazanımları haftalara eşit dağıtır
   */
  private planDagitimAlgoritmasi(icerikListesi: any[], dersHaftalari: any[], haftalikSaat: number) {
    const dagitimPlani: any[] = [];
    let mevcutHaftaIndex = 0;
    
    icerikListesi.forEach((icerik, icerikIndex) => {
      const kalanSaat = icerik.saatSuresi;
      let islenenSaat = 0;
      
      while (islenenSaat < kalanSaat && mevcutHaftaIndex < dersHaftalari.length) {
        const mevcutHafta = dersHaftalari[mevcutHaftaIndex];
        const haftadaVerilebilecekSaat = Math.min(haftalikSaat, kalanSaat - islenenSaat);
        
        // Bu haftaya bu kadar saat ata
        dagitimPlani.push({
          icerikId: icerik.id,
          icerikTipi: icerik.tip,
          haftaId: mevcutHafta.id,
          saat: haftadaVerilebilecekSaat,
          sira: icerikIndex + 1
        });
        
        islenenSaat += haftadaVerilebilecekSaat;
        
        // Eğer bu içerik tamamlandıysa sonraki haftaya geç
        if (islenenSaat >= kalanSaat) {
          mevcutHaftaIndex++;
        }
      }
    });
    
    return dagitimPlani;
  }
  
  /**
   * Plan şablonunu veritabanına kaydet
   */
  private async planSablonunuKaydet(dersId: string, yilId: string, programTipi: ProgramTipi, dagitimPlani: any[]) {
    
    const planSablonlari = dagitimPlani.map(plan => ({
      dersId,
      yilId,
      programTipi,
      beceriId: plan.icerikTipi === 'beceri' ? plan.icerikId : null,
      kazanimId: plan.icerikTipi === 'kazanim' ? plan.icerikId : null,
      haftaId: plan.haftaId,
      saat: plan.saat,
      sira: plan.sira
    }));
    
    await prisma.planSablonu.createMany({
      data: planSablonlari
    });
    
    console.log(`   ✅ ${planSablonlari.length} plan şablonu kaydedildi.`);
  }
  
  /**
   * KULLANICI PLANI OLUŞTUR
   * Şablondan kullanıcıya özel plan kopyalar
   */
  async kullaniciPlaniOlustur(kullaniciId: string, dersId: string, yilId: string, programTipi: ProgramTipi) {
    console.log('👤 Kullanıcı planı oluşturuluyor...');
    
    // 1. Önce kullanıcı için ana plan kaydı oluştur
    const plan = await prisma.plan.create({
      data: {
        ad: `${new Date().getFullYear()} Yıllık Plan`,
        tip: 'YILLIK' as any,
        dersId,
        yilId,
        kullaniciId,
        aktif: true
      }
    });
    
    // 2. Plan şablonundan kopyala
    const planSablonlari = await prisma.planSablonu.findMany({
      where: {
        dersId,
        yilId,
        programTipi
      }
    });
    
    // 3. Kullanıcıya özel plan detayları oluştur
    const planDetaylari = planSablonlari.map(sablon => ({
      planId: plan.id,
      beceriId: sablon.beceriId,
      kazanimId: sablon.kazanimId,
      haftaId: sablon.haftaId,
      saat: sablon.saat,
      tamamlandi: false
    }));
    
    await prisma.planDetay.createMany({
      data: planDetaylari
    });
    
    console.log(`✅ ${planDetaylari.length} plan detayı kullanıcıya kopyalandı.`);
    
    return plan;
  }
}

// Export instance
export const planOtomasyonu = new PlanOtomasyonMotoru();
