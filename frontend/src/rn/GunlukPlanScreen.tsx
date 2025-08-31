import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native'
import axios from 'axios'

const API='http://localhost:3001/api'

export const GunlukPlanScreen=({ shared }:any)=>{
  const [planlar,setPlanlar]=useState<any[]>([])
  const [secili,setSecili]=useState<any>(null)
  const [hafta,setHafta]=useState<string>('')
  const [sinifDefteriKayitlari,setSdk]=useState<any[]>([])
  const [gunlukler,setGunlukler]=useState<any[]>([])
  const [selectedSd,setSelectedSd]=useState<string>('')
  const [form,setForm]=useState<any>({ konu:'', hedefler:'', yontemler:'', materyaller:'', etkinlikler:'', degerlendirme:'', odev:'' })

  useEffect(()=>{ loadPlanlar() },[])
  const loadPlanlar=async()=>{
    const r=await axios.get(`${API}/planlar`, { params:{ sinifId:shared.sinif?.id, dersId:shared.ders?.id } }).catch(()=>({data:{data:[]}}))
    setPlanlar(r.data.data||[])
  }
  const loadSd=async(p:any)=>{
    setSecili(p)
    const r=await axios.get(`${API}/planlar/${p.id}/sinif-defteri`).catch(()=>({data:{data:[]}}))
    setSdk(r.data.data||[])
  }
  const loadGunluk=async()=>{
    if(!secili||!hafta) return
    const r=await axios.get(`${API}/planlar/${secili.id}/haftalar/${hafta}/gunluk-planlar`).catch(()=>({data:{data:[]}}))
    setGunlukler(r.data.data||[])
  }
  const submit=async()=>{
    if(!selectedSd) return
    await axios.post(`${API}/sinif-defteri/${selectedSd}/gunluk-plan`, form).catch(()=>{})
    await loadGunluk()
    setForm({ konu:'', hedefler:'', yontemler:'', materyaller:'', etkinlikler:'', degerlendirme:'', odev:'' })
  }

  const haftalar=Array.from(new Set(sinifDefteriKayitlari.map(k=>k.haftaId)))
  const filterSd=sinifDefteriKayitlari.filter(k=>!hafta||k.haftaId===hafta)

  return (
    <View>
      <Text style={s.h1}>Günlük Plan</Text>
      <View style={s.rowWrap}>
        {planlar.map(p=>(
          <TouchableOpacity key={p.id} style={[s.chip, secili?.id===p.id && s.chipActive]} onPress={()=>loadSd(p)}><Text style={[s.chipText, secili?.id===p.id && s.chipTextActive]}>{p.ad}</Text></TouchableOpacity>
        ))}
      </View>
      {secili && (
        <View style={{marginTop:12}}>
          <Text style={s.label}>Hafta ID</Text>
          <View style={s.rowWrap}>
            {haftalar.map(h=>(
              <TouchableOpacity key={h} style={[s.chip, hafta===h && s.chipActive]} onPress={()=>{setHafta(h); setTimeout(loadGunluk,50)}}>
                <Text style={[s.chipText, hafta===h && s.chipTextActive]}>{h.substring(0,4)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <View style={{marginTop:16}}>
        <Text style={s.label}>Sınıf Defteri Kayıtları</Text>
        <FlatList style={{maxHeight:160}} data={filterSd} keyExtractor={i=>i.id} renderItem={({item})=> (
          <TouchableOpacity onPress={()=>setSelectedSd(item.id)} style={[s.rowItem, selectedSd===item.id && {backgroundColor:'#e0f2fe'}]}>
            <Text style={s.rowTxt}>{item.dersProgrami?.gun} {item.dersProgrami?.dersSaat}</Text>
            <Text style={s.rowTxt}>{item.kazanim?.kod || item.beceri?.ad}</Text>
          </TouchableOpacity>
        )} ListEmptyComponent={<Text style={{color:'#666'}}>Yok</Text>} />
      </View>
      <View style={{marginTop:20}}>
        <Text style={s.label}>Yeni Günlük Plan</Text>
        {Object.keys(form).map(k=>(
          <TextInput key={k} placeholder={k} value={form[k]} onChangeText={(t)=>setForm({...form,[k]:t})} style={s.input} multiline />
        ))}
        <TouchableOpacity onPress={submit} disabled={!selectedSd} style={[s.btn, !selectedSd&&s.btnDisabled]}><Text style={s.btnText}>Kaydet</Text></TouchableOpacity>
      </View>
      <View style={{marginTop:24}}>
        <Text style={s.label}>Günlük Planlar</Text>
        <FlatList style={{maxHeight:160}} data={gunlukler} keyExtractor={i=>i.id} renderItem={({item})=> (
          <View style={s.rowItem}><Text style={s.rowTxt}>{item.konu}</Text><Text style={s.rowTxt}>{item.tamamlandi?'✓':''}</Text></View>
        )} ListEmptyComponent={<Text style={{color:'#666'}}>Yok</Text>} />
      </View>
    </View>
  )
}

const s=StyleSheet.create({
  h1:{ fontSize:22,fontWeight:'700',marginBottom:12 },
  rowWrap:{ flexDirection:'row', flexWrap:'wrap' },
  chip:{ paddingHorizontal:10,paddingVertical:6, backgroundColor:'#eee', borderRadius:14, margin:4 },
  chipActive:{ backgroundColor:'#2563eb' },
  chipText:{ color:'#333' },
  chipTextActive:{ color:'#fff' },
  label:{ fontWeight:'600', marginTop:12 },
  rowItem:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:6, borderBottomWidth:1, borderColor:'#eee' },
  rowTxt:{ flex:1, fontSize:12 },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginTop:6, minHeight:40 },
  btn:{ backgroundColor:'#16a34a', padding:12, borderRadius:8, alignItems:'center', marginTop:12 },
  btnDisabled:{ opacity:0.5 },
  btnText:{ color:'#fff', fontWeight:'600' }
})
