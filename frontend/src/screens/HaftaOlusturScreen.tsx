import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { generateHaftalar } from '../api/api'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'

// Base URL artık tek api dosyasında yönetiliyor; burada gereksiz.

interface HaftaOlusturmaForm {
  yilAciklama: string
  baslangicTarihi: Date | undefined
  bitisTarihi: Date | undefined
  birinciaraTatil: TatilDonemi
  ikinciAraTatil: TatilDonemi
  somestrTatil: TatilDonemi
  ramazanBaslangic?: Date | undefined
  kurbanBaslangic?: Date | undefined
}

interface TatilDonemi {
  baslangic: Date | undefined
  bitis: Date | undefined
}

export default function HaftaOlusturmaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [form, setForm] = useState<HaftaOlusturmaForm>({
    yilAciklama: '2025-2026 Eğitim Öğretim Yılı',
  baslangicTarihi: new Date(2025, 8, 8), // 8 Eylül 2025 (ay index 0'dan başlar)
  bitisTarihi: new Date(2026, 5, 26), // 26 Haziran 2026
    birinciaraTatil: { 
      baslangic: new Date(2025, 10, 10), // 10 Kasım 2025
      bitis: new Date(2025, 10, 14) // 14 Kasım 2025
    },
    ikinciAraTatil: { 
      baslangic: new Date(2026, 2, 16), // 20 Mart 2026
      bitis: new Date(2026, 2, 20) // 26 Mart 2026
    },
  somestrTatil: { 
      baslangic: new Date(2026, 0, 19), // 19 Ocak 2026
      bitis: new Date(2026, 0, 30) // 30 Ocak 2026
  },
  ramazanBaslangic: new Date(2026, 2, 19),
  kurbanBaslangic: new Date(2026, 4, 26)
  })

  const [showDatePicker, setShowDatePicker] = useState<{
    show: boolean
    field: string
    type: 'date' | 'time'
  }>({
    show: false,
    field: '',
    type: 'date'
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Tarih seçin'
    return date.toLocaleDateString('tr-TR')
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker({ show: false, field: '', type: 'date' })
    
    if (selectedDate && showDatePicker.field) {
      const field = showDatePicker.field
      
      if (field.includes('.')) {
        // Nested field (tatil dönemleri)
        const [parent, child] = field.split('.')
        setForm(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev] as TatilDonemi,
            [child]: selectedDate
          }
        }))
      } else {
        // Top level field
        setForm(prev => ({
          ...prev,
          [field]: selectedDate
        }))
      }
    }
  }

  const showDatePickerFor = (field: string) => {
    setShowDatePicker({
      show: true,
      field,
      type: 'date'
    })
  }

  const validateForm = (): boolean => {
    if (!form.yilAciklama.trim()) {
      Alert.alert('Hata', 'Yıl açıklaması gereklidir')
      return false
    }
    if (!form.baslangicTarihi) {
      Alert.alert('Hata', 'Başlangıç tarihi gereklidir')
      return false
    }
    if (!form.bitisTarihi) {
      Alert.alert('Hata', 'Bitiş tarihi gereklidir')
      return false
    }
    if (form.baslangicTarihi >= form.bitisTarihi) {
      Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    setResult(null)

    try {
      // Tek çağrıda hem yıl hem hafta oluştur
      const result = await generateHaftalar({
        yil: form.baslangicTarihi!.getFullYear(),
        aciklama: form.yilAciklama,
        baslangicTarihi: form.baslangicTarihi!.toISOString(),
        bitisTarihi: form.bitisTarihi!.toISOString(),
      // donemAyirici kaldırıldı; dönem ayrımı sömestr tatiline göre yapılıyor
        birinciaraTatil: form.birinciaraTatil.baslangic && form.birinciaraTatil.bitis ? {
          baslangic: form.birinciaraTatil.baslangic.toISOString(),
          bitis: form.birinciaraTatil.bitis.toISOString()
        } : undefined,
        ikinciAraTatil: form.ikinciAraTatil.baslangic && form.ikinciAraTatil.bitis ? {
          baslangic: form.ikinciAraTatil.baslangic.toISOString(),
          bitis: form.ikinciAraTatil.bitis.toISOString()
        } : undefined,
  somestrTatil: form.somestrTatil.baslangic && form.somestrTatil.bitis ? {
          baslangic: form.somestrTatil.baslangic.toISOString(),
          bitis: form.somestrTatil.bitis.toISOString()
  } : undefined,
  ramazanBaslangic: form.ramazanBaslangic ? form.ramazanBaslangic.toISOString() : undefined,
  kurbanBaslangic: form.kurbanBaslangic ? form.kurbanBaslangic.toISOString() : undefined
      })

      setResult(result)
      Alert.alert('Başarılı', `${result.oluşturulanHaftaSayisi} hafta başarıyla oluşturuldu!`)
    } catch (error) {
      console.error('Hata:', error)
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      yilAciklama: '2025-2026 Eğitim Öğretim Yılı',
      baslangicTarihi: new Date(2025, 8, 8), // 8 Eylül 2025
      bitisTarihi: new Date(2026, 5, 26), // 26 Haziran 2026
    // donemAyirici kaldırıldı
      birinciaraTatil: { 
        baslangic: new Date(2025, 10, 10), // 10 Kasım 2025
        bitis: new Date(2025, 10, 14) // 14 Kasım 2025
      },
      ikinciAraTatil: { 
        baslangic: new Date(2026, 2, 20), // 20 Mart 2026
        bitis: new Date(2026, 2, 26) // 26 Mart 2026
      },
  somestrTatil: { 
        baslangic: new Date(2026, 0, 19), // 19 Ocak 2026
        bitis: new Date(2026, 0, 30) // 30 Ocak 2026
  },
  ramazanBaslangic: undefined,
  kurbanBaslangic: undefined
    })
    setResult(null)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Eğitim Yılı ve Hafta Oluşturma</Text>
        
        {/* Yıl Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eğitim Yılı Bilgileri</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yıl Açıklaması *</Text>
            <TextInput
              style={styles.textInput}
              value={form.yilAciklama}
              onChangeText={(text) => setForm(prev => ({ ...prev, yilAciklama: text }))}
              placeholder="Örn: 2024-2025 Eğitim Öğretim Yılı"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Başlangıç Tarihi *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePickerFor('baslangicTarihi')}
            >
              <Text style={styles.dateButtonText}>
                {formatDate(form.baslangicTarihi)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bitiş Tarihi *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePickerFor('bitisTarihi')}
            >
              <Text style={styles.dateButtonText}>
                {formatDate(form.bitisTarihi)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dönem ayırıcı kaldırıldı — dönem ayrımı sömestr tatiline göre yapılır */}
        </View>

        {/* Tatil Dönemleri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tatil Dönemleri (Opsiyonel)</Text>
          
          {/* Birinci Ara Tatil */}
          <View style={styles.tatilGroup}>
            <Text style={styles.tatilTitle}>Birinci Ara Tatil</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateButton, styles.halfWidth]}
                onPress={() => showDatePickerFor('birinciaraTatil.baslangic')}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(form.birinciaraTatil.baslangic)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, styles.halfWidth]}
                onPress={() => showDatePickerFor('birinciaraTatil.bitis')}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(form.birinciaraTatil.bitis)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* İkinci Ara Tatil */}
          <View style={styles.tatilGroup}>
            <Text style={styles.tatilTitle}>İkinci Ara Tatil</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateButton, styles.halfWidth]}
                onPress={() => showDatePickerFor('ikinciAraTatil.baslangic')}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(form.ikinciAraTatil.baslangic)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, styles.halfWidth]}
                onPress={() => showDatePickerFor('ikinciAraTatil.bitis')}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(form.ikinciAraTatil.bitis)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sömestr Tatil */}
          <View style={styles.tatilGroup}>
            <Text style={styles.tatilTitle}>Sömestr Tatili</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateButton, styles.halfWidth]}
                onPress={() => showDatePickerFor('somestrTatil.baslangic')}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(form.somestrTatil.baslangic)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateButton, styles.halfWidth]}
                onPress={() => showDatePickerFor('somestrTatil.bitis')}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(form.somestrTatil.bitis)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dini Bayramlar (sadece başlangıç) */}
          <View style={styles.tatilGroup}>
            <Text style={styles.tatilTitle}>Ramazan Bayramı Başlangıcı (Arife dahil)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePickerFor('ramazanBaslangic')}
            >
              <Text style={styles.dateButtonText}>
                {formatDate(form.ramazanBaslangic)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tatilGroup}>
            <Text style={styles.tatilTitle}>Kurban Bayramı Başlangıcı (Arife dahil)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePickerFor('kurbanBaslangic')}
            >
              <Text style={styles.dateButtonText}>
                {formatDate(form.kurbanBaslangic)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetForm}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>Temizle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Haftaları Oluştur</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.navListButton]}
          onPress={() => navigation.navigate('HaftaListe', { yil: form.baslangicTarihi?.getFullYear() || new Date().getFullYear() })}
          disabled={loading}
        >
          <Text style={styles.navListButtonText}>Hafta Listesini Gör</Text>
        </TouchableOpacity>

        {/* Sonuç */}
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Sonuç</Text>
            <Text style={styles.resultText}>
              {result.message}
            </Text>
            <Text style={styles.resultDetail}>
              Ders Haftası: {result.dersHaftaSayisi}
            </Text>
            <Text style={styles.resultDetail}>
              Tatil Haftası: {result.tatilHaftaSayisi}
            </Text>
            <Text style={styles.resultDetail}>
              Birinci Dönem: {result.birinciDonemHaftaSayisi} hafta
            </Text>
            <Text style={styles.resultDetail}>
              İkinci Dönem: {result.ikinciDonemHaftaSayisi} hafta
            </Text>
          </View>
        )}

        {/* Date Picker */}
        {showDatePicker.show && (
          <DateTimePicker
            value={new Date()}
            mode={showDatePicker.type}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2563eb',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  tatilGroup: {
    marginBottom: 20,
  },
  tatilTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#6b7280',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#6b7280',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#166534',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#166534',
  },
  resultDetail: {
    fontSize: 14,
    color: '#15803d',
    marginLeft: 10,
  },
  navListButton:{
    marginTop:16,
    backgroundColor:'#0d9488',
    padding:14,
    borderRadius:8,
    alignItems:'center'
  },
  navListButtonText:{
    color:'#fff',
    fontSize:16,
    fontWeight:'600'
  }
})
