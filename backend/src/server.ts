import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import routes from './routes'
import prisma from './db/client'

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
})

// CORS ayarları
fastify.register(cors, {
  origin: true, // Development için, production'da spesifik domain'ler belirtin
  credentials: true
})

// Swagger documentation
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Öğretmen Planları API',
      description: 'Öğretmen planları backend sistemi API dokümantasyonu',
      version: '1.0.0'
    },
    host: 'localhost:3001',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Kademeler', description: 'Kademe yönetimi' },
      { name: 'Dersler', description: 'Ders yönetimi' },
      { name: 'Planlar', description: 'Plan yönetimi' },
      { name: 'Haftalar', description: 'Hafta yönetimi' },
      { name: 'Kazanımlar', description: 'Kazanım yönetimi' },
      { name: 'Beceriler', description: 'Beceri yönetimi' },
      { name: 'Temalar', description: 'Tema yönetimi' }
    ]
  }
})

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  uiHooks: {
    onRequest: function (request, reply, next) { next() },
    preHandler: function (request, reply, next) { next() }
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
  transformSpecificationClone: true
})

// Routes
fastify.register(routes)

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Uygulama kapatılıyor...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  fastify.log.info('Uygulama kapatılıyor...')
  await prisma.$disconnect()
  process.exit(0)
})

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error)
  
  if (error.validation) {
    reply.status(400).send({
      success: false,
      message: 'Validation hatası',
      details: error.validation
    })
    return
  }

  reply.status(500).send({
    success: false,
    message: error.message || 'Sunucu hatası'
  })
})

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    success: false,
    message: 'Endpoint bulunamadı',
    path: request.url
  })
})

// Server başlatma
const start = async () => {
  try {
    // Veritabanı bağlantısını test et
    await prisma.$connect()
    fastify.log.info('Veritabanı bağlantısı başarılı')

    // Sunucuyu başlat
    const port = parseInt(process.env.PORT || '3001')
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })
    
    fastify.log.info(`🚀 Server çalışıyor: http://localhost:${port}`)
    fastify.log.info(`📖 API Dokümantasyonu: http://localhost:${port}/docs`)
    
  } catch (err) {
    fastify.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
