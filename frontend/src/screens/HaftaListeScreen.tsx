import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { getHaftalarByYil } from '../api/api'

interface HaftaRow {
  haftaNo: number
  ad: string
  tip: string
  donem?: string | null
}

export default function HaftaListeScreen({ yil = new Date().getFullYear() }: { yil?: number }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<HaftaRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await getHaftalarByYil(yil)
        if (mounted) setData(res.haftalar)
      } catch (e: any) {
        setError(e?.message || 'Hata')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [yil])

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}> 
      <Text style={[styles.cell, styles.headerCell, {flex:0.4}]}>No</Text>
      <Text style={[styles.cell, styles.headerCell, {flex:1.2}]}>Hafta</Text>
      <Text style={[styles.cell, styles.headerCell, {flex:0.8}]}>Tip</Text>
      <Text style={[styles.cell, styles.headerCell, {flex:0.9}]}>Dönem</Text>
    </View>
  )

  const renderItem = ({ item }: { item: HaftaRow }) => (
    <View style={styles.row}> 
      <Text style={[styles.cell, {flex:0.4}]}>{item.haftaNo}</Text>
      <Text style={[styles.cell, {flex:1.2}]}>{item.ad}</Text>
      <Text style={[styles.cell, {flex:0.8}, item.tip === 'TATIL' && styles.tatil]}>{item.tip}</Text>
      <Text style={[styles.cell, {flex:0.9}]}>{item.donem || '-'}</Text>
    </View>
  )

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>
  }
  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{yil} Haftaları</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{minWidth: Dimensions.get('window').width}}>
          {renderHeader()}
          <FlatList
            data={data}
            keyExtractor={(item) => item.haftaNo.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f8fafc', padding:16 },
  title:{ fontSize:20, fontWeight:'600', marginBottom:12, color:'#1f2937' },
  row:{ flexDirection:'row', borderBottomWidth:1, borderColor:'#e5e7eb', backgroundColor:'#fff' },
  headerRow:{ backgroundColor:'#2563eb' },
  cell:{ paddingVertical:10, paddingHorizontal:8, fontSize:14, color:'#111827' },
  headerCell:{ color:'#fff', fontWeight:'600' },
  tatil:{ color:'#dc2626', fontWeight:'600' },
  center:{ flex:1, justifyContent:'center', alignItems:'center' },
  error:{ color:'#dc2626', fontSize:16 },
})
