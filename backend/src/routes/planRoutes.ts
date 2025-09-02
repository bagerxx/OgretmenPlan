import { FastifyInstance } from 'fastify';
import { planOtomasyonu } from '../core/planOtomasyonu';
import { testDataCreator } from '../core/testDataCreator';

export default async function planRoutes(fastify: FastifyInstance) {
  
  /**
   * TEST VERİLERİ OLUŞTUR
   * POST /api/plan/test-verileri-olustur
   */
  fastify.post('/test-verileri-olustur', async (request, reply) => {
    try {
      console.log('🎯 Test verileri oluşturuluyor...');
      
      const sonuc = await testDataCreator.createTestData();
      
      return reply.send({
        success: true,
        ...sonuc,
        message: 'Test verileri başarıyla oluşturuldu!'
      });
      
    } catch (error) {
      console.error('❌ Test verileri oluşturma hatası:', error);
      return reply.status(500).send({
        error: 'Test verileri oluşturulurken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  });
  
  /**
   * YIL BAŞI OTOMASYONU BUTONU
   * POST /api/plan/yil-basi-otomasyonu
   */
  fastify.post('/yil-basi-otomasyonu', async (request, reply) => {
    try {
      const { yilId } = request.body as { yilId: string };
      
      if (!yilId) {
        return reply.status(400).send({
          error: 'yilId parametresi gerekli!'
        });
      }
      
      console.log('🚀 YIL BAŞI OTOMASYONU TETİKLENDİ:', yilId);
      
      const sonuc = await planOtomasyonu.yilBasiOtomasyonuCalistir(yilId);
      
      return reply.send(sonuc);
      
    } catch (error) {
      console.error('❌ Otomasyon hatası:', error);
      return reply.status(500).send({
        error: 'Otomasyon çalıştırılırken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  });
  
  /**
   * KULLANICI PLANI OLUŞTUR
   * POST /api/plan/kullanici-plani-olustur
   */
  fastify.post('/kullanici-plani-olustur', async (request, reply) => {
    try {
      const { kullaniciId, dersId, yilId, programTipi } = request.body as {
        kullaniciId: string;
        dersId: string;
        yilId: string;
        programTipi: 'YENI_PROGRAM' | 'ESKI_PROGRAM';
      };
      
      if (!kullaniciId || !dersId || !yilId || !programTipi) {
        return reply.status(400).send({
          error: 'Tüm parametreler gerekli! (kullaniciId, dersId, yilId, programTipi)'
        });
      }
      
      console.log('👤 KULLANICI PLANI OLUŞTURULUYOR:', { kullaniciId, dersId, programTipi });
      
      const plan = await planOtomasyonu.kullaniciPlaniOlustur(
        kullaniciId, 
        dersId, 
        yilId, 
        programTipi as any
      );
      
      return reply.send({
        success: true,
        plan,
        message: 'Kullanıcı planı başarıyla oluşturuldu!'
      });
      
    } catch (error) {
      console.error('❌ Kullanıcı planı oluşturma hatası:', error);
      return reply.status(500).send({
        error: 'Kullanıcı planı oluşturulurken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  });
  
  /**
   * PLAN ŞABLONLARINI GÖRÜNTÜLE
   * GET /api/plan/sablonlar/:yilId/:dersId/:programTipi
   */
  fastify.get('/sablonlar/:yilId/:dersId/:programTipi', async (request, reply) => {
    try {
      const { yilId, dersId, programTipi } = request.params as {
        yilId: string;
        dersId: string;
        programTipi: 'YENI_PROGRAM' | 'ESKI_PROGRAM';
      };
      
      const { default: { PrismaClient } } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const planSablonlari = await prisma.planSablonu.findMany({
        where: {
          yilId,
          dersId,
          programTipi: programTipi as any
        },
        include: {
          hafta: true,
          beceri: true,
          kazanim: true
        },
        orderBy: { sira: 'asc' }
      });
      
      return reply.send({
        success: true,
        planSablonlari,
        toplam: planSablonlari.length
      });
      
    } catch (error) {
      console.error('❌ Plan şablonları getirme hatası:', error);
      return reply.status(500).send({
        error: 'Plan şablonları getirilirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  });
  
  /**
   * OTOMASYON DURUMU KONTROL
   * GET /api/plan/otomasyon-durumu/:yilId
   */
  fastify.get('/otomasyon-durumu/:yilId', async (request, reply) => {
    try {
      const { yilId } = request.params as { yilId: string };
      
      const { default: { PrismaClient } } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const toplamPlanSayisi = await prisma.planSablonu.count({
        where: { yilId }
      });
      
      const derslerSayisi = await prisma.ders.count();
      const beklenenPlanSayisi = derslerSayisi * 2; // Her ders için 2 program tipi
      
      const tamamlanmisOrani = derslerSayisi > 0 ? (toplamPlanSayisi / beklenenPlanSayisi) * 100 : 0;
      
      return reply.send({
        success: true,
        durum: {
          toplamPlanSayisi,
          derslerSayisi,
          beklenenPlanSayisi,
          tamamlanmisOrani: Math.round(tamamlanmisOrani),
          otomasyonTamamlandi: tamamlanmisOrani >= 100
        }
      });
      
    } catch (error) {
      console.error('❌ Otomasyon durumu kontrol hatası:', error);
      return reply.status(500).send({
        error: 'Otomasyon durumu kontrol edilirken hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  });
}
