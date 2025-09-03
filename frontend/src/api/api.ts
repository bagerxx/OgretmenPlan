import axios from 'axios';
import Constants from 'expo-constants';

// Tek nokta: app.json (expoConfig.extra.backendUrl) > localhost fallback
function baseURL(): string {
  const apiUrl = Constants.expoConfig?.extra?.backendUrl;
  console.log('[DEBUG] Constants.expoConfig:', Constants.expoConfig);
  console.log('[DEBUG] apiUrl:', apiUrl);
  return apiUrl
}
console.log('[API] baseURL=', baseURL());
export const api = axios.create({
  baseURL: baseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.response.use(r => r, (error) => {
  if (error.message === 'Network Error') {
    console.log('[API] Network Error. baseURL=', api.defaults.baseURL);
  }
  return Promise.reject(error);
});

// Kullanılan minimal endpoint fonksiyonları

// Tek endpoint - yıl oluştur ve haftaları üret
export async function generateHaftalar(payload: { 
  yil: number; 
  aciklama: string; 
  baslangicTarihi: string; 
  bitisTarihi: string; 
  birinciaraTatil?: any; 
  ikinciAraTatil?: any; 
  somestrTatil?: any; 
}) {
  // NestJS backend uses a global prefix '/api' (see backend/src/main.ts)
  const { data } = await api.post('/api/hafta/generate', payload)
  return data
}

export async function getHaftalarByYil(yil: number) {
  const { data } = await api.get(`/api/hafta/${yil}`)
  return data as { yil: number; haftalar: { haftaNo: number; ad: string; tip: string; donem?: string | null }[] }
}

export const getApiBase = () => api.defaults.baseURL;