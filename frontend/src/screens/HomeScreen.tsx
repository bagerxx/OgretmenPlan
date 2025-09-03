import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/AppNavigator'

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ekleme Menüsü</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HaftaOlustur')}>
        <Text style={styles.buttonText}>Hafta Oluştur</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => navigation.navigate('HaftaListe', { yil: new Date().getFullYear() })}>
        <Text style={styles.buttonText}>Hafta Listesi</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, gap:24, backgroundColor:'#fff' },
  title:{ fontSize:22, fontWeight:'700', color:'#111', marginTop:12 },
  button:{ backgroundColor:'#2563eb', paddingVertical:14, paddingHorizontal:18, borderRadius:8 },
  secondary:{ backgroundColor:'#0d9488' },
  buttonText:{ color:'#fff', fontSize:16, fontWeight:'600', textAlign:'center' }
})
