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
import { createYil, generateHaftalar } from '../api/api'

// Base URL artık tek api dosyasında yönetiliyor; burada gereksiz.

interface TatilDonemi {
  baslangic: Date | undefined
  bitis: Date | undefined
}

interface HaftaOlusturmaForm {
  yilAciklama: string
  baslangicTarihi: Date | undefined
  bitisTarihi: Date | undefined
  donemAyirici: Date | undefined
  birinciaraTatil: TatilDonemi
  ikinciAraTatil: TatilDonemi
  somestrTatil: TatilDonemi
}

export default function HaftaOlusturmaScreen() {
  const [form, setForm] = useState<HaftaOlusturmaForm>({
    yilAciklama: '',
    baslangicTarihi: undefined,
    bitisTarihi: undefined,
    donemAyirici: undefined,
    birinciaraTatil: { baslangic: undefined, bitis: undefined },
    ikinciAraTatil: { baslangic: undefined, bitis: undefined },
    somestrTatil: { baslangic: undefined, bitis: undefined }
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
      // Önce yıl oluştur (API wrapper)
      const yilData = await createYil({
        yil: form.baslangicTarihi!.getFullYear(),
        aciklama: form.yilAciklama,
        baslamaTarihi: form.baslangicTarihi!.toISOString(),
        bitisTarihi: form.bitisTarihi!.toISOString()
      })

      // Hafta payload
      const haftaData: any = {
        yilId: yilData.id,
        baslangicTarihi: form.baslangicTarihi!.toISOString(),
        bitisTarihi: form.bitisTarihi!.toISOString()
      }
      if (form.donemAyirici) haftaData.donemAyirici = form.donemAyirici.toISOString()
      if (form.birinciaraTatil.baslangic && form.birinciaraTatil.bitis) {
        haftaData.birinciaraTatil = {
          baslangic: form.birinciaraTatil.baslangic.toISOString(),
          bitis: form.birinciaraTatil.bitis.toISOString()
        }
      }
      if (form.ikinciAraTatil.baslangic && form.ikinciAraTatil.bitis) {
        haftaData.ikinciAraTatil = {
          baslangic: form.ikinciAraTatil.baslangic.toISOString(),
          bitis: form.ikinciAraTatil.bitis.toISOString()
        }
      }
      if (form.somestrTatil.baslangic && form.somestrTatil.bitis) {
        haftaData.somestrTatil = {
          baslangic: form.somestrTatil.baslangic.toISOString(),
          bitis: form.somestrTatil.bitis.toISOString()
        }
      }

      const result = await generateHaftalar(haftaData)
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
      yilAciklama: '',
      baslangicTarihi: undefined,
      bitisTarihi: undefined,
      donemAyirici: undefined,
      birinciaraTatil: { baslangic: undefined, bitis: undefined },
      ikinciAraTatil: { baslangic: undefined, bitis: undefined },
      somestrTatil: { baslangic: undefined, bitis: undefined }
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dönem Ayırıcı Tarih (Opsiyonel)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePickerFor('donemAyirici')}
            >
              <Text style={styles.dateButtonText}>
                {formatDate(form.donemAyirici)}
              </Text>
            </TouchableOpacity>
          </View>
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
})
