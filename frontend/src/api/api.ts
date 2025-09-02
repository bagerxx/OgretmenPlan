import axios from 'axios';
import Constants from 'expo-constants';

// Tek nokta: app.json (expoConfig.extra.backendUrl) > localhost fallback
function baseURL(): string {
  const ApiUrl = Constants.expoConfig?.extra;
  return ApiUrl?.backendUrl;
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
export async function createYil(payload: { yil: number; aciklama: string; baslamaTarihi: string; bitisTarihi: string; }) {
  const { data } = await api.post('/api/yil', payload); return data;
}

export async function generateHaftalar(payload: { yilId: string; baslangicTarihi: string; bitisTarihi: string; donemAyirici?: string; birinciaraTatil?: any; ikinciAraTatil?: any; somestrTatil?: any; }) {
  const { data } = await api.post('/api/hafta/generate', payload); return data;
}

export const getApiBase = () => api.defaults.baseURL;