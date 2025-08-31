import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'

/**
 * Gmail OAuth2 ile mail gönderim servisi
 * Ortam değişkenleri:
 * GMAIL_CLIENT_ID
 * GMAIL_CLIENT_SECRET
 * GMAIL_REFRESH_TOKEN
 * GMAIL_SENDER (opsiyonel)
 */
export class EmailService {
  private prisma: PrismaClient
  private oauth2Client: any

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    const clientId = process.env.GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN
    if (!clientId || !clientSecret || !refreshToken) {
      console.warn('Gmail OAuth2 environment variables missing; email disabled.')
    }
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    )
    if (refreshToken) {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken })
    }
  }

  private async createTransport() {
    const accessToken = await this.oauth2Client.getAccessToken().catch(() => undefined)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_SENDER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken?.token
      }
    })
  }

  async sendPlanEmail(planId: string, to: string, format: 'pdf' | 'excel' | 'html') {
    // Planı al
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: { ders: true, sinif: true }
    })
    if (!plan) throw new Error('Plan bulunamadı')

    // İçerik üret
    let attachment: any
    let htmlBody = `<p>${plan.sinif.seviye}. Sınıf ${plan.ders.ad} yıllık planı ektedir.</p>`
    if (format === 'html') {
      const exportServiceModule = await import('../export/service')
      const exportService = new exportServiceModule.ExportService(this.prisma)
      const html = await exportService.generateHTMLPlan(planId)
      htmlBody = html
    } else if (format === 'pdf') {
      const exportServiceModule = await import('../export/service')
      const exportService = new exportServiceModule.ExportService(this.prisma)
      const pdfBuffer = await exportService.generatePDF(planId)
      attachment = [{ filename: `plan-${planId}.pdf`, content: pdfBuffer }]
    } else if (format === 'excel') {
      const exportServiceModule = await import('../export/service')
      const exportService = new exportServiceModule.ExportService(this.prisma)
      const xlsBuffer = await exportService.generateExcel(planId)
      attachment = [{ filename: `plan-${planId}.xlsx`, content: xlsBuffer }]
    }

    const transporter = await this.createTransport()
    const mail = await transporter.sendMail({
      from: process.env.GMAIL_SENDER,
      to,
      subject: `${plan.sinif.seviye}. Sınıf ${plan.ders.ad} Yıllık Planı`,
      html: htmlBody,
      attachments: attachment
    })
    return { messageId: mail.messageId }
  }
}
