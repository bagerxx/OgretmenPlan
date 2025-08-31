# Öğretmen Planları Backend API

Öğretmen planları sisteminin backend API'si. Bu sistem, eğitim kurumlarında öğretmenlerin ders planlarını oluşturmasına, yönetmesine ve takip etmesine olanak tanır.

## 🎯 Özellikler

### Ana Modüller
- **Kademe Yönetimi**: İlkokul, ortaokul, lise kademelerinin yönetimi
- **Sınıf Yönetimi**: 1-12 arası sınıf seviyelerinin yönetimi  
- **Ders Yönetimi**: Derslerin ve haftalık ders saatlerinin yönetimi
- **Kazanım Yönetimi**: Eski müfredat için kazanım tabanlı planlar
- **Beceri Yönetimi**: Yeni müfredat için beceri tabanlı planlar (temalara bağlı)
- **Hafta Yönetimi**: Eğitim yılı boyunca hafta durumları (DERS | TATIL | SINAV | İŞ)
- **Plan Motoru**: Otomatik plan oluşturma ve dağıtım algoritması

### Plan Motoru Algoritması
- **Kazanım Bazlı**: Kazanımları eşit olarak iş haftalarına dağıtır
- **Beceri Bazlı**: Becerileri toplam öğrenme saatine göre orantılı dağıtır
- **Akıllı Dağıtım**: Tatil ve sınav haftalarını otomatik hesaba katar

### API Özellikleri
- RESTful API tasarımı
- Swagger/OpenAPI dokümantasyonu
- Zod ile validation
- TypeScript desteği
- CORS yapılandırması
- Error handling

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 12+ (veya Docker)
- npm veya yarn

### PostgreSQL Kurulumu

**Seçenek 1: Docker ile (Önerilen)**
```bash
# Docker kurulu ise
npm run docker:up
```

**Seçenek 2: Manuel PostgreSQL Kurulumu**
1. PostgreSQL'i sisteminize kurun
2. `ogretmen_plan` adında bir veritabanı oluşturun
3. `.env` dosyasındaki `DATABASE_URL`'i güncelleyin

**macOS:**
```bash
brew install postgresql
brew services start postgresql
createdb ogretmen_plan
```

**Windows:**
PostgreSQL'i resmi siteden indirin ve kurun.

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb ogretmen_plan
```

### Kurulum Adımları

1. **Bağımlılıkları yükleyin:**
```bash
cd backend
npm install
```

2. **Environment dosyasını ayarlayın:**
```bash
# .env dosyasındaki DATABASE_URL'i PostgreSQL bağlantınıza göre ayarlayın
```

3. **Veritabanını hazırlayın:**
```bash
# Veritabanı kurulumu
npm run setup:db
```

4. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

Sunucu `http://localhost:3001` adresinde çalışacaktır.

## 📖 API Dokümantasyonu

Sunucu çalıştıktan sonra şu adreslerden erişebilirsiniz:
- **API**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/docs
- **PostgreSQL**: localhost:5432 (ogretmen_plan/ogretmen_plan_password)
- **PgAdmin**: http://localhost:8080 (admin@ogretmenplan.com/admin123)

## 🗄️ Veritabanı Şeması

### Ana Tablolar

**Kademeler** (`kademeler`)
- İlkokul, Ortaokul, Lise

**Sınıflar** (`siniflar`)
- 1-12 arası seviyeler, kademelere bağlı

**Dersler** (`dersler`)
- Ders adı, tipi (KAZANIM_BAZLI | BECERI_BAZLI)

**Ders Saatleri** (`ders_saatleri`)
- Her sınıf için haftalık ders saati

**Kazanımlar** (`kazanimlar`)
- Kazanım kodu, içerik, derse bağlı

**Temalar** (`temalar`)
- Beceriler için tema grupları

**Beceriler** (`beceriler`)
- Beceri adı, toplam öğrenme saati, tema ve derse bağlı

**Haftalar** (`haftalar`)
- Hafta numarası, tarih aralığı, durum

**Planlar** (`planlar`)
- Ana plan kayıtları (sınıf + ders + eğitim yılı)

**Plan Detayları**
- `plan_kazanimlari`: Haftalık kazanım dağılımı
- `plan_becerileri`: Haftalık beceri dağılımı

## 🛠️ Kullanılan Teknolojiler

- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript
- **Containerization**: Docker

## 📂 Klasör Yapısı

```
backend/
├── src/
│   ├── modules/           # Domain modülleri
│   │   ├── kademe/       # Kademe servisi
│   │   ├── ders/         # Ders servisi
│   │   ├── plan/         # Plan servisi
│   │   ├── hafta/        # Hafta servisi
│   │   ├── kazanim/      # Kazanım servisi
│   │   └── beceri/       # Beceri servisi
│   ├── core/             # Çekirdek fonksiyonlar
│   │   └── planEngine.ts # Plan oluşturma motoru
│   ├── db/               # Veritabanı
│   │   └── client.ts     # Prisma client
│   ├── routes/           # API rotaları
│   │   └── index.ts      # Ana rotalar
│   ├── utils/            # Yardımcı fonksiyonlar
│   │   └── index.ts      # Tarih, dağıtım, validation utils
│   └── server.ts         # Ana sunucu dosyası
├── prisma/
│   ├── schema.prisma     # Veritabanı şeması
│   └── seed.ts           # Örnek veriler
├── package.json
├── tsconfig.json
└── .env
```

## 🎮 Ana API Endpoints

### Kademeler
- `GET /api/kademeler` - Tüm kademeleri listele
- `POST /api/kademeler` - Yeni kademe oluştur
- `GET /api/kademeler/:id` - Kademe detayı
- `PUT /api/kademeler/:id` - Kademe güncelle
- `DELETE /api/kademeler/:id` - Kademe sil
- `POST /api/kademeler/:id/siniflar` - Kademeye sınıf ekle

### Dersler
- `GET /api/dersler` - Tüm dersleri listele
- `POST /api/dersler` - Yeni ders oluştur
- `GET /api/dersler/:id` - Ders detayı
- `PUT /api/dersler/:id` - Ders güncelle
- `DELETE /api/dersler/:id` - Ders sil
- `POST /api/dersler/:id/saatler` - Ders saati ayarla

### Planlar
- `GET /api/planlar` - Tüm planları listele
- `POST /api/planlar` - Yeni plan oluştur (otomatik dağıtım)
- `GET /api/planlar/:id` - Plan detayı
- `DELETE /api/planlar/:id` - Plan sil
- `GET /api/planlar/:id/haftalik-tablo` - Haftalık plan tablosu
- `GET /api/planlar/:id/istatistikler` - Plan istatistikleri
- `POST /api/planlar/:id/kopyala` - Plan kopyala

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucusu
npm run start

# Docker komutları
npm run docker:up        # PostgreSQL container'ı başlat
npm run docker:down      # PostgreSQL container'ı durdur
npm run docker:logs      # Container loglarını izle
npm run setup            # Tam kurulum (docker + migrate + seed)

# Veritabanı komutları
npm run db:generate     # Prisma client oluştur
npm run db:migrate      # Migration çalıştır
npm run db:seed         # Örnek verileri yükle
npm run db:studio       # Prisma Studio aç
npm run db:reset        # Veritabanını sıfırla
npm run db:deploy       # Production migration

# Linting
npm run lint

# Test
npm run test
```

## 📊 Örnek Veri Yapısı

Sistem şu örnek verilerle gelir:

### Kademeler
- İlkokul (1-4. sınıflar)
- Ortaokul (5-8. sınıflar)  
- Lise (9-12. sınıflar)

### Dersler
- **Kazanım Bazlı**: Türkçe, Matematik, Fen Bilimleri, Sosyal Bilgiler
- **Beceri Bazlı**: İngilizce, Beden Eğitimi, Resim, Müzik, Bilişim Teknolojileri

### Eğitim Yılı
- 2024-2025 eğitim yılı haftaları
- Otomatik tatil dönemleri
- Sınav dönemleri

## 🔄 Plan Oluşturma Süreci

1. **Plan Talebı**: Sınıf + Ders + Eğitim Yılı
2. **Validasyon**: Mevcut plan kontrolü, ders saati kontrolü
3. **Hafta Analizi**: İş haftalarını belirleme
4. **Dağıtım Algoritması**:
   - Kazanım bazlı → Eşit dağıtım
   - Beceri bazlı → Orantılı dağıtım
5. **Plan Kayıt**: Haftalık dağılımı veritabanına kaydet

## 🎯 Kullanım Senaryoları

### Senaryo 1: 5. Sınıf Türkçe Planı
```http
POST /api/planlar
{
  "sinifId": "...",
  "dersId": "turkce-id",
  "egitiYili": "2024-2025",
  "planAdi": "5. Sınıf Türkçe Yıllık Planı"
}
```

### Senaryo 2: Plan Kopyalama
```http
POST /api/planlar/{id}/kopyala
{
  "yeniEgitiYili": "2025-2026",
  "yeniPlanAdi": "5. Sınıf Türkçe Yıllık Planı - 2025-2026"
}
```

### Senaryo 3: Haftalık Tablo Alma
```http
GET /api/planlar/{id}/haftalik-tablo
```

## 🛡️ Güvenlik

- Input validation (Zod)
- SQL injection protection (Prisma ORM)
- CORS configuration
- Error handling
- Type safety (TypeScript)

## 📈 Performans

- Database indexing
- Efficient queries (Prisma)
- Lazy loading
- Pagination support
- Background processes

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için issue açabilir veya doğrudan iletişime geçebilirsiniz.

## 🎉 Başarılı Kurulum Sonrası

Backend sisteminiz artık tamamen hazır! Şu özelliklere sahipsiniz:

### ✅ Tamamlanan Özellikler
- **PostgreSQL Veritabanı**: Ölçeklenebilir, güvenilir veritabanı
- **RESTful API**: 50+ endpoint ile tam CRUD işlemleri
- **Plan Motoru**: Otomatik kazanım/beceri dağıtım algoritması
- **Swagger Dokümantasyonu**: Interaktif API dokümantasyonu
- **TypeScript**: Tip güvenliği ve geliştirici deneyimi
- **Prisma ORM**: Type-safe veritabanı işlemleri
- **Zod Validation**: Güçlü input validasyonu
- **Docker Support**: Kolay deployment
- **Seed Data**: Hazır örnek veriler

### 🚀 Hızlı Test

API'nin çalışıp çalışmadığını test edin:

```bash
# Sunucu çalışıyor mu?
curl http://localhost:3001/api/health

# Kademeleri listele
curl http://localhost:3001/api/kademeler

# Swagger UI'ya git
open http://localhost:3001/docs
```

### 📊 Örnek API Kullanımları

**Yeni Plan Oluştur:**
```bash
curl -X POST http://localhost:3001/api/planlar \
  -H "Content-Type: application/json" \
  -d '{
    "sinifId": "sinif_id_buraya",
    "dersId": "ders_id_buraya", 
    "egitiYili": "2024-2025"
  }'
```

**Haftalık Plan Tablosu Al:**
```bash
curl http://localhost:3001/api/planlar/{plan_id}/haftalik-tablo
```

---

**Öğretmen Planları Backend API** - Eğitimde teknoloji, planda kolaylık! 🎓✨
