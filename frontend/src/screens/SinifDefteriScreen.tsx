import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import axios from 'axios'

const API='http://localhost:3001/api'

export const SinifDefteriScreen=({ shared, go }:any)=>{
  const [planlar,setPlanlar]=useState<any[]>([])
  const [secili,setSecili]=useState<any>(null)
  const [kayitlar,setKayitlar]=useState<any[]>([])
  const [loading,setLoading]=useState(false)

  useEffect(()=>{ loadPlanlar() },[])
  const loadPlanlar=async()=>{
    const r=await axios.get(`${API}/planlar`,{ params:{ sinifId:shared.sinif?.id, dersId:shared.ders?.id } }).catch(()=>({data:{data:[]}}))
    setPlanlar(r.data.data||[])
  }
  const getir=async(p:any)=>{
    setSecili(p)
    const r=await axios.get(`${API}/planlar/${p.id}/sinif-defteri`).catch(()=>({data:{data:[]}}))
    setKayitlar(r.data.data||[])
  }
  const olustur=async()=>{
    if(!secili) return
    setLoading(true)
    await axios.post(`${API}/planlar/${secili.id}/sinif-defteri`).catch(()=>{})
    await getir(secili)
    setLoading(false)
  }

  return (
    <View>
      <Text style={s.h1}>Sınıf Defteri</Text>
      <View style={s.rowWrap}>
        {planlar.map(p=> (
          <TouchableOpacity key={p.id} onPress={()=>getir(p)} style={[s.chip, secili?.id===p.id && s.chipActive]}><Text style={[s.chipText, secili?.id===p.id && s.chipTextActive]}>{p.ad}</Text></TouchableOpacity>
        ))}
      </View>
      {secili && (
        <TouchableOpacity onPress={olustur} disabled={loading} style={[s.btn, loading&&s.btnDisabled]}>
          <Text style={s.btnText}>{loading?'Oluşturuluyor...':'Otomatik Oluştur'}</Text>
        </TouchableOpacity>
      )}
      <FlatList
        style={{marginTop:16}}
        data={kayitlar}
        keyExtractor={i=>i.id}
        renderItem={({item})=> (
          <View style={s.rowItem}>
            <Text style={s.rowTxt}>{item.dersProgrami?.gun} {item.dersProgrami?.dersSaat}.saat</Text>
            <Text style={s.rowTxt}>{item.kazanim?.kod || item.beceri?.ad}</Text>
            <Text style={s.rowTxt}>{item.tamamlandi?'✓':''}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{marginTop:20,color:'#666'}}>Kayıt yok.</Text>}
      />
      {secili && (
        <TouchableOpacity onPress={()=>go('gunluk')} style={[s.btnAlt]}><Text style={s.btnTextAlt}>Günlük Planlara Geç</Text></TouchableOpacity>
      )}
    </View>
  )
}

const s=StyleSheet.create({
  h1:{ fontSize:22,fontWeight:'700',marginBottom:12 },
  rowWrap:{ flexDirection:'row', flexWrap:'wrap' },
  chip:{ paddingHorizontal:12,paddingVertical:6, backgroundColor:'#eee', borderRadius:16, margin:4 },
  chipActive:{ backgroundColor:'#2563eb' },
  chipText:{ color:'#333' },
  chipTextActive:{ color:'#fff' },
  btn:{ backgroundColor:'#16a34a', padding:12, borderRadius:8, alignItems:'center', marginTop:12 },
  btnDisabled:{ opacity:0.5 },
  btnText:{ color:'#fff', fontWeight:'600' },
  rowItem:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderColor:'#eee' },
  rowTxt:{ flex:1, fontSize:12 },
  btnAlt:{ backgroundColor:'#9333ea', padding:12, borderRadius:8, alignItems:'center', marginTop:20 },
  btnTextAlt:{ color:'#fff', fontWeight:'600' }
})
