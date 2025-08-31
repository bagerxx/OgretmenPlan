import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { KademeService } from '../modules/kademe/service'
import { DersService } from '../modules/ders/service'
import { PlanService } from '../modules/plan/service'
import { HaftaService } from '../modules/hafta/service'
import { KazanimService } from '../modules/kazanim/service'
import { BeceriService } from '../modules/beceri/service'
import { ExportService } from '../modules/export/service'
import { ProgramSablonuService } from '../modules/program/service'
import { DersProgramiService, CreateDersProgramiSchema, CreateDersProgramiSablonuSchema, UpdateDersProgramiSchema } from '../modules/dersProgrami/service'
import { EmailService } from '../modules/email/service'
import { SinifDefteriService } from '../modules/sinifDefteri/service'
import { GunlukPlanService } from '../modules/gunlukPlan/service'
import prisma from '../db/client'
import { ResponseUtils } from '../utils'

// Zod schemas
const CreateKademeSchema = z.object({
  ad: z.string(),
  aciklama: z.string().optional()
})

const UpdateKademeSchema = z.object({
  ad: z.string().optional(),
  aciklama: z.string().optional()
})

const CreateDersSchema = z.object({
  ad: z.string(),
  tip: z.enum(['KAZANIM_BAZLI', 'BECERI_BAZLI']),
  aciklama: z.string().optional()
})

const UpdateDersSchema = z.object({
  ad: z.string().optional(),
  tip: z.enum(['KAZANIM_BAZLI', 'BECERI_BAZLI']).optional(),
  aciklama: z.string().optional()
})

const SetDersSaatiSchema = z.object({
  sinifId: z.string(),
  haftalikSaat: z.number()
})

const CreatePlanSchema = z.object({
  sinifId: z.string(),
  dersId: z.string(),
  egitiYili: z.string(),
  planAdi: z.string().optional()
})

const PlanQuerySchema = z.object({
  kademeId: z.string().optional(),
  sinifId: z.string().optional(),
  dersId: z.string().optional(),
  egitiYili: z.string().optional()
})

const UpdatePlanItemSchema = z.object({
  sure: z.number().optional(),
  tamamlandi: z.boolean().optional(),
  notlar: z.string().optional()
})

// Service instances
const kademeService = new KademeService(prisma)
const dersService = new DersService(prisma)
const planService = new PlanService(prisma)
const exportService = new ExportService(prisma)
const programSablonuService = new ProgramSablonuService(prisma)
const dersProgramiService = new DersProgramiService(prisma)
const sinifDefteriService = new SinifDefteriService(prisma)
const gunlukPlanService = new GunlukPlanService(prisma)
const emailService = new EmailService(prisma)

// Generic error handler
async function handleError(reply: FastifyReply, error: any) {
  console.error(error)
  const message = error.message || 'Bir hata oluştu'
  return reply.status(500).send(ResponseUtils.error(message))
}

export default async function routes(fastify: FastifyInstance) {
  
  // =================== KADEME ROUTES ===================
  
  // GET /api/kademeler - Tüm kademeleri listele
  fastify.get('/api/kademeler', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const kademeler = await kademeService.getAllKademeler()
      return ResponseUtils.success(kademeler)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/kademeler/:id - Kademe detayı
  fastify.get<{ Params: { id: string } }>('/api/kademeler/:id', async (request, reply) => {
    try {
      const kademe = await kademeService.getKademeById(request.params.id)
      return ResponseUtils.success(kademe)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/kademeler - Yeni kademe oluştur
  fastify.post<{ Body: z.infer<typeof CreateKademeSchema> }>('/api/kademeler', async (request, reply) => {
    try {
      const validatedBody = CreateKademeSchema.parse(request.body)
      const kademe = await kademeService.createKademe(validatedBody)
      return ResponseUtils.success(kademe, 'Kademe başarıyla oluşturuldu')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // PUT /api/kademeler/:id - Kademe güncelle
  fastify.put<{ Params: { id: string }, Body: z.infer<typeof UpdateKademeSchema> }>('/api/kademeler/:id', async (request, reply) => {
    try {
      const validatedBody = UpdateKademeSchema.parse(request.body)
      const kademe = await kademeService.updateKademe(request.params.id, validatedBody)
      return ResponseUtils.success(kademe, 'Kademe başarıyla güncellendi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // DELETE /api/kademeler/:id - Kademe sil
  fastify.delete<{ Params: { id: string } }>('/api/kademeler/:id', async (request, reply) => {
    try {
      const result = await kademeService.deleteKademe(request.params.id)
      return ResponseUtils.success(result)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/kademeler/:id/siniflar - Kademeye sınıf ekle
  fastify.post<{ Params: { id: string }, Body: { seviye: number } }>('/api/kademeler/:id/siniflar', async (request, reply) => {
    try {
      const sinif = await kademeService.addSinifToKademe(request.params.id, request.body.seviye)
      return ResponseUtils.success(sinif, 'Sınıf başarıyla eklendi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // =================== DERS ROUTES ===================
  
  // GET /api/dersler - Tüm dersleri listele
  fastify.get('/api/dersler', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dersler = await dersService.getAllDersler()
      return ResponseUtils.success(dersler)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/dersler/:id - Ders detayı
  fastify.get<{ Params: { id: string } }>('/api/dersler/:id', async (request, reply) => {
    try {
      const ders = await dersService.getDersById(request.params.id)
      return ResponseUtils.success(ders)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/dersler - Yeni ders oluştur
  fastify.post<{ Body: z.infer<typeof CreateDersSchema> }>('/api/dersler', async (request, reply) => {
    try {
      const validatedBody = CreateDersSchema.parse(request.body)
      const ders = await dersService.createDers(validatedBody)
      return ResponseUtils.success(ders, 'Ders başarıyla oluşturuldu')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // PUT /api/dersler/:id - Ders güncelle
  fastify.put<{ Params: { id: string }, Body: z.infer<typeof UpdateDersSchema> }>('/api/dersler/:id', async (request, reply) => {
    try {
      const validatedBody = UpdateDersSchema.parse(request.body)
      const ders = await dersService.updateDers(request.params.id, validatedBody)
      return ResponseUtils.success(ders, 'Ders başarıyla güncellendi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // DELETE /api/dersler/:id - Ders sil
  fastify.delete<{ Params: { id: string } }>('/api/dersler/:id', async (request, reply) => {
    try {
      const result = await dersService.deleteDers(request.params.id)
      return ResponseUtils.success(result)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/dersler/:id/saatler - Ders saati ekle/güncelle
  fastify.post<{ Params: { id: string }, Body: z.infer<typeof SetDersSaatiSchema> }>('/api/dersler/:id/saatler', async (request, reply) => {
    try {
      const validatedBody = SetDersSaatiSchema.parse(request.body)
      const dersSaat = await dersService.setDersSaati(request.params.id, validatedBody)
      return ResponseUtils.success(dersSaat, 'Ders saati başarıyla ayarlandı')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // DELETE /api/dersler/:dersId/saatler/:sinifId - Ders saati sil
  fastify.delete<{ Params: { dersId: string, sinifId: string } }>('/api/dersler/:dersId/saatler/:sinifId', async (request, reply) => {
    try {
      const result = await dersService.deleteDersSaati(request.params.dersId, request.params.sinifId)
      return ResponseUtils.success(result)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/kademeler/:id/ders-saatleri - Kademeye göre ders saatleri
  fastify.get<{ Params: { id: string } }>('/api/kademeler/:id/ders-saatleri', async (request, reply) => {
    try {
      const dersSaatleri = await dersService.getDersSaatleriByKademe(request.params.id)
      return ResponseUtils.success(dersSaatleri)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // =================== PLAN ROUTES ===================
  
  // GET /api/planlar - Tüm planları listele
  fastify.get<{ Querystring: z.infer<typeof PlanQuerySchema> }>('/api/planlar', async (request, reply) => {
    try {
      const validatedQuery = PlanQuerySchema.parse(request.query || {})
      const planlar = await planService.getAllPlanlar(validatedQuery)
      return ResponseUtils.success(planlar)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/planlar/:id - Plan detayı
  fastify.get<{ Params: { id: string } }>('/api/planlar/:id', async (request, reply) => {
    try {
      const plan = await planService.getPlanById(request.params.id)
      return ResponseUtils.success(plan)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/planlar - Yeni plan oluştur
  fastify.post<{ Body: z.infer<typeof CreatePlanSchema> }>('/api/planlar', async (request, reply) => {
    try {
      const validatedBody = CreatePlanSchema.parse(request.body)
      const plan = await planService.createPlan(validatedBody)
      return ResponseUtils.success(plan, 'Plan başarıyla oluşturuldu')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // DELETE /api/planlar/:id - Plan sil
  fastify.delete<{ Params: { id: string } }>('/api/planlar/:id', async (request, reply) => {
    try {
      const result = await planService.deletePlan(request.params.id)
      return ResponseUtils.success(result)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/planlar/:id/haftalik-tablo - Haftalık plan tablosu
  fastify.get<{ Params: { id: string } }>('/api/planlar/:id/haftalik-tablo', async (request, reply) => {
    try {
      const tablo = await planService.getWeeklyTable(request.params.id)
      return ResponseUtils.success(tablo)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/planlar/:id/istatistikler - Plan istatistikleri
  fastify.get<{ Params: { id: string } }>('/api/planlar/:id/istatistikler', async (request, reply) => {
    try {
      const stats = await planService.getPlanStats(request.params.id)
      return ResponseUtils.success(stats)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/planlar/:id/kopyala - Plan kopyala
  fastify.post<{ Params: { id: string }, Body: { yeniEgitiYili: string, yeniPlanAdi?: string } }>('/api/planlar/:id/kopyala', async (request, reply) => {
    try {
      const plan = await planService.copyPlan(request.params.id, request.body.yeniEgitiYili, request.body.yeniPlanAdi)
      return ResponseUtils.success(plan, 'Plan başarıyla kopyalandı')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // PUT /api/planlar/:planId/kazanimlar/:kazanimId/haftalar/:haftaId - Plan kazanımını güncelle
  fastify.put<{ Params: { planId: string, kazanimId: string, haftaId: string }, Body: z.infer<typeof UpdatePlanItemSchema> }>('/api/planlar/:planId/kazanimlar/:kazanimId/haftalar/:haftaId', async (request, reply) => {
    try {
      const validatedBody = UpdatePlanItemSchema.parse(request.body)
      const result = await planService.updatePlanKazanim(request.params.planId, request.params.kazanimId, request.params.haftaId, validatedBody)
      return ResponseUtils.success(result, 'Plan kazanımı başarıyla güncellendi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // PUT /api/planlar/:planId/beceriler/:beceriId/haftalar/:haftaId - Plan becerisini güncelle
  fastify.put<{ Params: { planId: string, beceriId: string, haftaId: string }, Body: z.infer<typeof UpdatePlanItemSchema> }>('/api/planlar/:planId/beceriler/:beceriId/haftalar/:haftaId', async (request, reply) => {
    try {
      const validatedBody = UpdatePlanItemSchema.parse(request.body)
      const result = await planService.updatePlanBeceri(request.params.planId, request.params.beceriId, request.params.haftaId, validatedBody)
      return ResponseUtils.success(result, 'Plan becerisi başarıyla güncellendi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // =================== PROGRAM ŞABLONU ROUTES ===================
  
  // POST /api/program-sablonlari/default - Varsayılan şablonları oluştur
  fastify.post('/api/program-sablonlari/default', async (request, reply) => {
    try {
  const result = await programSablonuService.ensureDefaultSablonlar()
  return ResponseUtils.success(result, 'Varsayılan program şablonları hazır')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/program-sablonlari - Tüm program şablonları
  fastify.get('/api/program-sablonlari', async (request, reply) => {
    try {
  const sablonlar = await programSablonuService.listSablonlar()
      return ResponseUtils.success(sablonlar)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/program-sablonlari/:id - Program şablonu detayı
  fastify.get<{ Params: { id: string } }>('/api/program-sablonlari/:id', async (request, reply) => {
    try {
  const sablon = await programSablonuService.getSablon(request.params.id)
      return ResponseUtils.success(sablon)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // =================== SINIF DEFTERİ ROUTES ===================
  
  // POST /api/planlar/:planId/sinif-defteri - Sınıf defteri oluştur (otomatik)
  fastify.post<{ Params: { planId: string } }>('/api/planlar/:planId/sinif-defteri', async (request, reply) => {
    try {
      const result = await sinifDefteriService.createSinifDefteri(request.params.planId)
      return ResponseUtils.success(result, 'Sınıf defteri otomatik oluşturuldu')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/planlar/:planId/sinif-defteri - Sınıf defterini getir
  fastify.get<{ Params: { planId: string } }>('/api/planlar/:planId/sinif-defteri', async (request, reply) => {
    try {
      const defteri = await sinifDefteriService.getSinifDefteri(request.params.planId)
      return ResponseUtils.success(defteri)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // =================== DERS PROGRAMI ROUTES ===================

  // POST /api/ders-programi-sablonlari - Yeni şablon
  fastify.post<{ Body: any }>('/api/ders-programi-sablonlari', async (request, reply) => {
    try {
      const body = CreateDersProgramiSablonuSchema.parse(request.body)
      const sablon = await dersProgramiService.createSablon(body)
      return ResponseUtils.success(sablon, 'Şablon oluşturuldu')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/ders-programi-sablonlari
  fastify.get('/api/ders-programi-sablonlari', async (request, reply) => {
    try {
      const sablonlar = await dersProgramiService.getAllSablonlar()
      return ResponseUtils.success(sablonlar)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // DELETE /api/ders-programi-sablonlari/:id
  fastify.delete<{ Params: { id: string } }>('/api/ders-programi-sablonlari/:id', async (request, reply) => {
    try {
      const result = await dersProgramiService.deleteSablon(request.params.id)
      return ResponseUtils.success(result)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/ders-programi - Ders programı slot oluştur
  fastify.post<{ Body: any }>('/api/ders-programi', async (request, reply) => {
    try {
      const body = CreateDersProgramiSchema.parse(request.body)
      const program = await dersProgramiService.createDersProgrami(body)
      return ResponseUtils.success(program, 'Ders programı kaydı oluşturuldu')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/ders-programi/empty - Sınıf için boş tablo üret
  fastify.post<{ Body: { sablonId: string, sinifId: string } }>('/api/ders-programi/empty', async (request, reply) => {
    try {
      const { sablonId, sinifId } = request.body
      const program = await dersProgramiService.createEmptyProgram(sablonId, sinifId)
      return ResponseUtils.success(program, 'Boş ders programı üretildi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/ders-programi/:sinifId/:sablonId - Haftalık tablo
  fastify.get<{ Params: { sinifId: string, sablonId: string } }>('/api/ders-programi/:sinifId/:sablonId', async (request, reply) => {
    try {
      const tablo = await dersProgramiService.getHaftalikTablo(request.params.sinifId, request.params.sablonId)
      return ResponseUtils.success(tablo)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // PUT /api/ders-programi/:id - Slot güncelle
  fastify.put<{ Params: { id: string }, Body: any }>('/api/ders-programi/:id', async (request, reply) => {
    try {
      const body = UpdateDersProgramiSchema.parse(request.body)
      const program = await dersProgramiService.updateDersProgrami(request.params.id, body)
      return ResponseUtils.success(program, 'Ders programı güncellendi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // DELETE /api/ders-programi/:id - Slot sil
  fastify.delete<{ Params: { id: string } }>('/api/ders-programi/:id', async (request, reply) => {
    try {
      const result = await dersProgramiService.deleteDersProgrami(request.params.id)
      return ResponseUtils.success(result)
    } catch (error) {
      return handleError(reply, error)
    }
  })
  // PUT /api/sinif-defteri/:id - Sınıf defteri kaydını güncelle
  fastify.put<{ 
    Params: { id: string }, 
    Body: { tamamlandi?: boolean; notlar?: string } 
  }>('/api/sinif-defteri/:id', async (request, reply) => {
    try {
      const kayit = await sinifDefteriService.updateSinifDefteriKaydi(
        request.params.id, 
        request.body
      )
      return ResponseUtils.success(kayit, 'Sınıf defteri kaydı güncellendi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // =================== GÜNLÜK PLAN ROUTES ===================
  
  // POST /api/sinif-defteri/:id/gunluk-plan - Günlük plan oluştur
  fastify.post<{ 
    Params: { id: string }, 
    Body: {
      konu: string
      hedefler?: string
      yontemler?: string
      materyaller?: string
      etkinlikler?: string
      degerlendirme?: string
      odev?: string
    }
  }>('/api/sinif-defteri/:id/gunluk-plan', async (request, reply) => {
    try {
      const plan = await gunlukPlanService.createGunlukPlan({
        sinifDefteriId: request.params.id,
        ...request.body
      })
      return ResponseUtils.success(plan, 'Günlük plan oluşturuldu')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/sinif-defteri/:id/gunluk-plan/sablon - Otomatik günlük plan şablonu
  fastify.post<{ Params: { id: string } }>('/api/sinif-defteri/:id/gunluk-plan/sablon', async (request, reply) => {
    try {
      const plan = await gunlukPlanService.createGunlukPlanSablonu(request.params.id)
      return ResponseUtils.success(plan, 'Günlük plan şablonu oluşturuldu')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/sinif-defteri/:id/gunluk-planlar - Günlük planları getir
  fastify.get<{ Params: { id: string } }>('/api/sinif-defteri/:id/gunluk-planlar', async (request, reply) => {
    try {
      const planlar = await gunlukPlanService.getGunlukPlanlar(request.params.id)
      return ResponseUtils.success(planlar)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/planlar/:planId/haftalar/:haftaId/gunluk-planlar - Haftalık günlük planlar
  fastify.get<{ 
    Params: { planId: string, haftaId: string } 
  }>('/api/planlar/:planId/haftalar/:haftaId/gunluk-planlar', async (request, reply) => {
    try {
      const planlar = await gunlukPlanService.getHaftalikGunlukPlanlar(
        request.params.planId, 
        request.params.haftaId
      )
      return ResponseUtils.success(planlar)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // PUT /api/gunluk-plan/:id - Günlük plan güncelle
  fastify.put<{ 
    Params: { id: string }, 
    Body: {
      konu?: string
      hedefler?: string
      yontemler?: string
      materyaller?: string
      etkinlikler?: string
      degerlendirme?: string
      odev?: string
      tamamlandi?: boolean
      notlar?: string
    }
  }>('/api/gunluk-plan/:id', async (request, reply) => {
    try {
      const plan = await gunlukPlanService.updateGunlukPlan(request.params.id, request.body)
      return ResponseUtils.success(plan, 'Günlük plan güncellendi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // DELETE /api/gunluk-plan/:id - Günlük plan sil
  fastify.delete<{ Params: { id: string } }>('/api/gunluk-plan/:id', async (request, reply) => {
    try {
      await gunlukPlanService.deleteGunlukPlan(request.params.id)
      return ResponseUtils.success(null, 'Günlük plan silindi')
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // =================== EXPORT ROUTES ===================
  
  // GET /api/planlar/:id/export/html - Plan HTML çıktısı
  fastify.get<{ Params: { id: string } }>('/api/planlar/:id/export/html', async (request, reply) => {
    try {
      const html = await exportService.generateHTMLPlan(request.params.id)
      reply.type('text/html')
      return html
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/planlar/:id/export/pdf - Plan PDF
  fastify.get<{ Params: { id: string } }>('/api/planlar/:id/export/pdf', async (request, reply) => {
    try {
      const pdf = await exportService.generatePDF(request.params.id)
      reply.type('application/pdf')
      reply.header('Content-Disposition', `attachment; filename=plan-${request.params.id}.pdf`)
      return pdf
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/planlar/:id/export/excel - Plan Excel
  fastify.get<{ Params: { id: string } }>('/api/planlar/:id/export/excel', async (request, reply) => {
    try {
      const xls = await exportService.generateExcel(request.params.id)
      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      reply.header('Content-Disposition', `attachment; filename=plan-${request.params.id}.xlsx`)
      return xls
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // GET /api/planlar/:id/export/data - Plan verisi (PDF için)
  fastify.get<{ Params: { id: string } }>('/api/planlar/:id/export/data', async (request, reply) => {
    try {
      const data = await exportService.getYillikPlanData(request.params.id)
      return ResponseUtils.success(data)
    } catch (error) {
      return handleError(reply, error)
    }
  })

  // POST /api/planlar/:id/email - Plan e-posta gönder
  fastify.post<{ Params: { id: string }, Body: { to: string, format: 'pdf'|'excel'|'html' } }>(
    '/api/planlar/:id/email',
    async (request, reply) => {
      try {
        const { to, format } = request.body
        const result = await emailService.sendPlanEmail(request.params.id, to, format)
        return ResponseUtils.success(result, 'E-posta gönderildi')
      } catch (error) {
        return handleError(reply, error)
      }
    }
  )

  // =================== HEALTH CHECK ===================
  
  // GET /api/health - Sağlık kontrolü
  fastify.get('/api/health', async () => {
    return ResponseUtils.success({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  })
}
