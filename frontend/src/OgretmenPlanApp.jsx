import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:3001/api'

// Ana component
const OgretmenPlanApp = () => {
  const [currentStep, setCurrentStep] = useState('setup')
  const [selectedData, setSelectedData] = useState({
    kademe: null,
    sinif: null,
    ders: null,
    egitiYili: '2024-2025'
  })

  const renderStep = () => {
    switch (currentStep) {
      case 'setup':
        return <SetupStep selectedData={selectedData} setSelectedData={setSelectedData} setCurrentStep={setCurrentStep} />
      case 'plan':
        return <PlanStep selectedData={selectedData} setCurrentStep={setCurrentStep} />
      case 'sinifDefteri':
        return <SinifDefteriStep selectedData={selectedData} setCurrentStep={setCurrentStep} />
      case 'gunlukPlan':
        return <GunlukPlanStep selectedData={selectedData} />
      default:
        return <SetupStep selectedData={selectedData} setSelectedData={setSelectedData} setCurrentStep={setCurrentStep} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Öğretmen Planları Sistemi
        </h1>
        
        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {['setup', 'plan', 'sinifDefteri', 'gunlukPlan'].map((step, index) => (
              <div
                key={step}
                className={`px-4 py-2 rounded-lg ${
                  currentStep === step
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}. {
                  step === 'setup' ? 'Kurulum' :
                  step === 'plan' ? 'Yıllık Plan' :
                  step === 'sinifDefteri' ? 'Sınıf Defteri' :
                  'Günlük Plan'
                }
              </div>
            ))}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  )
}

// Kurulum Adımı - İlk veri girişi
const SetupStep = ({ selectedData, setSelectedData, setCurrentStep }) => {
  const [kademeler, setKademeler] = useState([])
  const [siniflar, setSiniflar] = useState([])
  const [dersler, setDersler] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadKademeler()
    loadDersler()
  }, [])

  const loadKademeler = async () => {
    try {
      const response = await axios.get(`${API_BASE}/kademeler`)
      setKademeler(response.data.data || [])
    } catch (error) {
      console.error('Kademeler yüklenemedi:', error)
    }
  }

  const loadDersler = async () => {
    try {
      const response = await axios.get(`${API_BASE}/dersler`)
      setDersler(response.data.data || [])
    } catch (error) {
      console.error('Dersler yüklenemedi:', error)
    }
  }

  const loadSiniflar = async (kademeId) => {
    try {
      const response = await axios.get(`${API_BASE}/kademeler/${kademeId}/siniflar`)
      setSiniflar(response.data.data || [])
    } catch (error) {
      console.error('Sınıflar yüklenemedi:', error)
    }
  }

  const handleKademeChange = (kademe) => {
    setSelectedData({ ...selectedData, kademe, sinif: null })
    loadSiniflar(kademe.id)
  }

  const createInitialData = async () => {
    setLoading(true)
    try {
      // Eğer veri yoksa varsayılan verileri oluştur
      if (kademeler.length === 0) {
        // İlkokul oluştur
        await axios.post(`${API_BASE}/kademeler`, {
          ad: 'İlkokul',
          aciklama: '1-4. sınıflar için ilkokul kademesi'
        })
        
        // Ortaokul oluştur
        await axios.post(`${API_BASE}/kademeler`, {
          ad: 'Ortaokul', 
          aciklama: '5-8. sınıflar için ortaokul kademesi'
        })

        // Lise oluştur
        await axios.post(`${API_BASE}/kademeler`, {
          ad: 'Lise',
          aciklama: '9-12. sınıflar için lise kademesi'
        })

        loadKademeler()
      }

      if (dersler.length === 0) {
        // Temel dersleri oluştur
        const temelDersler = [
          { ad: 'Türkçe', tip: 'KAZANIM_BAZLI', aciklama: 'Türkçe dersi' },
          { ad: 'Matematik', tip: 'KAZANIM_BAZLI', aciklama: 'Matematik dersi' },
          { ad: 'Fen Bilimleri', tip: 'BECERI_BAZLI', aciklama: 'Fen Bilimleri dersi' },
          { ad: 'Sosyal Bilgiler', tip: 'BECERI_BAZLI', aciklama: 'Sosyal Bilgiler dersi' },
          { ad: 'Hayat Bilgisi', tip: 'KAZANIM_BAZLI', aciklama: 'Hayat Bilgisi dersi' }
        ]

        for (const ders of temelDersler) {
          await axios.post(`${API_BASE}/dersler`, ders)
        }

        loadDersler()
      }

      // Program şablonlarını oluştur
      await axios.post(`${API_BASE}/program-sablonlari/default`)

    } catch (error) {
      console.error('İlk veri oluşturma hatası:', error)
      alert('İlk veriler oluşturulurken hata oluştu!')
    }
    setLoading(false)
  }

  const canProceed = selectedData.kademe && selectedData.sinif && selectedData.ders

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">1. Sistem Kurulumu</h2>
        
        {(kademeler.length === 0 || dersler.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">İlk Kullanım</h3>
            <p className="text-yellow-700 mb-4">
              Sistem kurulumu için ilk verilerinizi oluşturalım.
            </p>
            <button
              onClick={createInitialData}
              disabled={loading}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? 'Oluşturuluyor...' : 'İlk Verileri Oluştur'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Kademe Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kademe Seçin
            </label>
            <select
              value={selectedData.kademe?.id || ''}
              onChange={(e) => {
                const kademe = kademeler.find(k => k.id === e.target.value)
                handleKademeChange(kademe)
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Kademe seçin</option>
              {kademeler.map(kademe => (
                <option key={kademe.id} value={kademe.id}>
                  {kademe.ad}
                </option>
              ))}
            </select>
          </div>

          {/* Sınıf Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sınıf Seçin
            </label>
            <select
              value={selectedData.sinif?.id || ''}
              onChange={(e) => {
                const sinif = siniflar.find(s => s.id === e.target.value)
                setSelectedData({ ...selectedData, sinif })
              }}
              disabled={!selectedData.kademe}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Sınıf seçin</option>
              {siniflar.map(sinif => (
                <option key={sinif.id} value={sinif.id}>
                  {sinif.seviye}. Sınıf
                </option>
              ))}
            </select>
          </div>

          {/* Ders Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ders Seçin
            </label>
            <select
              value={selectedData.ders?.id || ''}
              onChange={(e) => {
                const ders = dersler.find(d => d.id === e.target.value)
                setSelectedData({ ...selectedData, ders })
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Ders seçin</option>
              {dersler.map(ders => (
                <option key={ders.id} value={ders.id}>
                  {ders.ad} ({ders.tip === 'KAZANIM_BAZLI' ? 'Kazanım' : 'Beceri'})
                </option>
              ))}
            </select>
          </div>

          {/* Eğitim Yılı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eğitim Yılı
            </label>
            <input
              type="text"
              value={selectedData.egitiYili}
              onChange={(e) => setSelectedData({ ...selectedData, egitiYili: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="2024-2025"
            />
          </div>
        </div>

        {/* Seçilen Bilgiler */}
        {canProceed && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Seçilen Bilgiler:</h3>
            <p className="text-green-700">
              <strong>{selectedData.kademe.ad}</strong> - <strong>{selectedData.sinif.seviye}. Sınıf</strong> - 
              <strong> {selectedData.ders.ad}</strong> - <strong>{selectedData.egitiYili}</strong>
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setCurrentStep('plan')}
            disabled={!canProceed}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Yıllık Plan Oluştur
          </button>
        </div>
      </div>
    </div>
  )
}

// Yıllık Plan Adımı
const PlanStep = ({ selectedData, setCurrentStep }) => {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailFormat, setEmailFormat] = useState('pdf')
  const [sending, setSending] = useState(false)

  const createYillikPlan = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/planlar`, {
        sinifId: selectedData.sinif.id,
        dersId: selectedData.ders.id,
        egitiYili: selectedData.egitiYili,
        planAdi: `${selectedData.sinif.seviye}. Sınıf ${selectedData.ders.ad} Yıllık Planı`
      })
      setPlan(response.data.data)
      alert('Yıllık plan başarıyla oluşturuldu!')
    } catch (error) {
      console.error('Plan oluşturma hatası:', error)
      alert('Plan oluşturulurken hata oluştu!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">2. Yıllık Plan Oluşturma</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Plan Bilgileri:</h3>
          <p className="text-blue-700">
            <strong>Kademe:</strong> {selectedData.kademe.ad}<br/>
            <strong>Sınıf:</strong> {selectedData.sinif.seviye}. Sınıf<br/>
            <strong>Ders:</strong> {selectedData.ders.ad}<br/>
            <strong>Eğitim Yılı:</strong> {selectedData.egitiYili}
          </p>
        </div>

        {!plan ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Motoru çalıştırarak otomatik yıllık plan oluşturun.
              <br/>
              Motor, kazanımları/becerileri haftalara eşit dağıtacak.
            </p>
            <button
              onClick={createYillikPlan}
              disabled={loading}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Motor Çalışıyor...' : '🚀 Yıllık Plan Motoru Çalıştır'}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">✅ Plan Oluşturuldu!</h3>
              <p className="text-green-700">
                <strong>Plan ID:</strong> {plan.id}<br/>
                <strong>Plan Adı:</strong> {plan.ad}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setCurrentStep('sinifDefteri')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Sınıf Defteri Oluştur
              </button>
              
              <button
                onClick={() => window.open(`${API_BASE}/planlar/${plan.id}/export/html`, '_blank')}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
              >
                Plan Önizleme
              </button>

              <button
                onClick={() => window.open(`${API_BASE}/planlar/${plan.id}/export/pdf`, '_blank')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
              >
                PDF İndir
              </button>

              <button
                onClick={() => window.open(`${API_BASE}/planlar/${plan.id}/export/excel`, '_blank')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Excel İndir
              </button>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <select
                  value={emailFormat}
                  onChange={e => setEmailFormat(e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="html">HTML</option>
                </select>
                <button
                  onClick={async () => {
                    if (!email) return alert('E-posta gir')
                    setSending(true)
                    try {
                      await axios.post(`${API_BASE}/planlar/${plan.id}/email`, { to: email, format: emailFormat })
                      alert('E-posta gönderildi')
                    } catch (e) {
                      alert('E-posta gönderilemedi')
                    }
                    setSending(false)
                  }}
                  disabled={sending}
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
                >
                  {sending ? 'Gönderiliyor...' : 'Mail Gönder'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Sınıf Defteri Adımı
const SinifDefteriStep = ({ selectedData, setCurrentStep }) => {
  const [planlar, setPlanlar] = useState([])
  const [seciliPlan, setSeciliPlan] = useState(null)
  const [kayitlar, setKayitlar] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadPlanlar() }, [])

  const loadPlanlar = async () => {
    try {
      const res = await axios.get(`${API_BASE}/planlar`, { params: { sinifId: selectedData.sinif?.id, dersId: selectedData.ders?.id } })
      setPlanlar(res.data.data || [])
    } catch (e) { console.error(e) }
  }

  const olustur = async (planId) => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/planlar/${planId}/sinif-defteri`)
      await getir(planId)
      alert('Sınıf defteri oluşturuldu')
    } catch (e) { alert('Hata oluştururken') }
    setLoading(false)
  }

  const getir = async (planId) => {
    setSeciliPlan(planId)
    try {
      const res = await axios.get(`${API_BASE}/planlar/${planId}/sinif-defteri`)
      setKayitlar(res.data.data || [])
    } catch (e) { console.error(e) }
  }

  const gruplanmis = kayitlar.reduce((acc, k) => {
    const hafta = k.haftaId || k.hafta?.id || 'HAFTA'
    if (!acc[hafta]) acc[hafta] = []
    acc[hafta].push(k)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">3. Sınıf Defteri</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {planlar.map(p => (
            <button key={p.id} onClick={() => getir(p.id)} className={`px-3 py-1 rounded text-sm ${seciliPlan===p.id?'bg-blue-600 text-white':'bg-gray-200'}`}>{p.ad}</button>
          ))}
        </div>
        {seciliPlan && (
          <button onClick={() => olustur(seciliPlan)} disabled={loading} className="mb-4 bg-green-500 text-white px-4 py-2 rounded">{loading?'Oluşturuluyor...':'Otomatik Oluştur'}</button>
        )}
        {Object.keys(gruplanmis).length===0 && <p className="text-gray-500">Kayıt yok.</p>}
        {Object.entries(gruplanmis).map(([hafta, list]) => (
          <div key={hafta} className="mb-6">
            <h3 className="font-semibold mb-2">Hafta: {hafta}</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Gün</th>
                  <th className="p-2 border">Saat</th>
                  <th className="p-2 border">Kazanım/Beceri</th>
                  <th className="p-2 border">Tamamlandı</th>
                </tr>
              </thead>
              <tbody>
                {list.map(k => (
                  <tr key={k.id} className="border-b">
                    <td className="p-1 border">{k.dersProgrami?.gun}</td>
                    <td className="p-1 border">{k.dersProgrami?.dersSaat}</td>
                    <td className="p-1 border">{k.kazanim?.kod || k.beceri?.ad}</td>
                    <td className="p-1 border">{k.tamamlandi ? '✅':'❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <div className="mt-4">
          <button onClick={() => setCurrentStep('gunlukPlan')} className="bg-purple-500 text-white px-4 py-2 rounded">Günlük Planlara Geç</button>
        </div>
      </div>
    </div>
  )
}

// Günlük Plan Adımı
const GunlukPlanStep = ({ selectedData }) => {
  const [planlar, setPlanlar] = useState([])
  const [seciliPlan, setSeciliPlan] = useState(null)
  const [haftaId, setHaftaId] = useState('')
  const [gunluklar, setGunluklar] = useState([])
  const [sinifDefteriKayitlari, setSinifDefteriKayitlari] = useState([])
  const [form, setForm] = useState({ konu:'', hedefler:'', yontemler:'', materyaller:'', etkinlikler:'', degerlendirme:'', odev:'' })
  const [selectedSinifDefteriId, setSelectedSinifDefteriId] = useState('')

  useEffect(() => { loadPlanlar() }, [])

  const loadPlanlar = async () => {
    try {
      const res = await axios.get(`${API_BASE}/planlar`, { params: { sinifId: selectedData.sinif?.id, dersId: selectedData.ders?.id } })
      setPlanlar(res.data.data || [])
    } catch (e) { console.error(e) }
  }

  const loadSinifDefteri = async (planId) => {
    try {
      const res = await axios.get(`${API_BASE}/planlar/${planId}/sinif-defteri`)
      setSinifDefteriKayitlari(res.data.data || [])
    } catch (e) { console.error(e) }
  }

  const loadGunluk = async (planId, haftaId) => {
    try {
      const res = await axios.get(`${API_BASE}/planlar/${planId}/haftalar/${haftaId}/gunluk-planlar`)
      setGunluklar(res.data.data || [])
    } catch (e) { console.error(e) }
  }

  const submitGunluk = async () => {
    if (!selectedSinifDefteriId) return alert('Kayıt seç')
    try {
      await axios.post(`${API_BASE}/sinif-defteri/${selectedSinifDefteriId}/gunluk-plan`, form)
      await loadGunluk(seciliPlan, haftaId)
      alert('Günlük plan eklendi')
    } catch (e) { alert('Eklenemedi') }
  }

  const sinifDefteriHaftalar = Array.from(new Set(sinifDefteriKayitlari.map(k => k.haftaId)))
  const sinifDefteriFilt = sinifDefteriKayitlari.filter(k => !haftaId || k.haftaId === haftaId)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">4. Günlük Plan</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {planlar.map(p => (
            <button key={p.id} onClick={() => { setSeciliPlan(p.id); loadSinifDefteri(p.id) }} className={`px-3 py-1 rounded text-sm ${seciliPlan===p.id?'bg-blue-600 text-white':'bg-gray-200'}`}>{p.ad}</button>
          ))}
        </div>
        {seciliPlan && (
          <div className="mb-4 flex items-center gap-2">
            <select value={haftaId} onChange={e => { setHaftaId(e.target.value); if(e.target.value) loadGunluk(seciliPlan, e.target.value) }} className="border px-2 py-1 rounded">
              <option value="">Hafta seç</option>
              {sinifDefteriHaftalar.map(h => <option key={h} value={h}>{h.substring(0,8)}...</option>)}
            </select>
            <button onClick={() => haftaId && loadGunluk(seciliPlan, haftaId)} className="bg-gray-300 px-3 py-1 rounded">Günlükleri Getir</button>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Sınıf Defteri Kayıtları</h3>
            <div className="max-h-80 overflow-auto border rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-1">Seç</th><th className="p-1">Hafta</th><th className="p-1">Gün</th><th className="p-1">Saat</th><th className="p-1">K/B</th>
                  </tr>
                </thead>
                <tbody>
                  {sinifDefteriFilt.map(k => (
                    <tr key={k.id} className="border-b">
                      <td className="p-1"><input type="radio" name="sd" onChange={() => setSelectedSinifDefteriId(k.id)} /></td>
                      <td className="p-1">{k.haftaId?.substring(0,4)}</td>
                      <td className="p-1">{k.dersProgrami?.gun}</td>
                      <td className="p-1">{k.dersProgrami?.dersSaat}</td>
                      <td className="p-1">{k.kazanim?.kod || k.beceri?.ad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="font-semibold mt-4 mb-2">Seçili Haftanın Günlük Planları</h3>
            <ul className="text-sm list-disc ml-5 max-h-40 overflow-auto">
              {gunluklar.map(g => (
                <li key={g.id}><strong>{g.konu}</strong> - {g.tamamlandi? 'Tamamlandı':'Devam'}</li>
              ))}
              {gunluklar.length===0 && <li>Yok</li>}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Yeni Günlük Plan</h3>
            <div className="space-y-2">
              {Object.keys(form).map(k => (
                <div key={k}>
                  <label className="block text-xs font-medium capitalize">{k}</label>
                  <textarea value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} className="w-full border rounded p-1 text-sm" rows={k==='konu'?2:1} />
                </div>
              ))}
              <button onClick={submitGunluk} className="bg-blue-600 text-white px-4 py-2 rounded">Kaydet</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OgretmenPlanApp
