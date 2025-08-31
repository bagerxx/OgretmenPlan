import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import axios from 'axios'

const API='http://localhost:3001/api'

export const PlanScreen=({ shared, setShared, go }:any)=>{
  const [plan,setPlan]=useState<any>(shared.plan||null)
  const [loading,setLoading]=useState(false)
  useEffect(()=>{ if(shared.plan) setPlan(shared.plan) },[shared.plan])

  const create=async()=>{
    setLoading(true)
    try{
      const r=await axios.post(`${API}/planlar`,{ sinifId:shared.sinif.id, dersId:shared.ders.id, egitiYili:shared.egitiYili, planAdi:`${shared.sinif.seviye}. Sınıf ${shared.ders.ad}`})
      setPlan(r.data.data)
    }catch(e){ console.warn(e) }
    setLoading(false)
  }
  const backToList=()=>{ setShared({...shared, plan:null}); go('planList') }

  return (
    <View>
      <Text style={s.h1}>Yıllık Plan</Text>
      <Text>{shared.sinif?.seviye}. Sınıf {shared.ders?.ad} - {shared.egitiYili}</Text>
  <TouchableOpacity onPress={backToList} style={[s.smallBtn,{backgroundColor:'#6b7280', alignSelf:'flex-start'}]}><Text style={s.smallText}>Planlar</Text></TouchableOpacity>
  {!plan?(
        <TouchableOpacity onPress={create} disabled={loading} style={[s.btn, loading&&s.btnDisabled]}><Text style={s.btnText}>{loading?'Oluşturuluyor...':'Oluştur'}</Text></TouchableOpacity>
      ):(
        <View style={{marginTop:16}}>
          <Text style={{fontWeight:'600'}}>Plan ID: {plan.id}</Text>
          <View style={{flexDirection:'row', flexWrap:'wrap', marginTop:12}}>
            <TouchableOpacity onPress={()=>go('sinifDefteri')} style={[s.smallBtn,{backgroundColor:'#2563eb'}]}><Text style={s.smallText}>Sınıf Defteri</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>{ /* Mobilde dosya indirme entegrasyonu eklenebilir */ }} style={[s.smallBtn,{backgroundColor:'#dc2626'}]}><Text style={s.smallText}>PDF</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

const s=StyleSheet.create({
  h1:{ fontSize:22,fontWeight:'700',marginBottom:8 },
  btn:{ backgroundColor:'#16a34a', padding:12, borderRadius:8, marginTop:20, alignItems:'center' },
  btnDisabled:{ opacity:0.5 },
  btnText:{ color:'#fff', fontWeight:'600' },
  label:{ fontWeight:'600', marginTop:12 },
  smallBtn:{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, marginRight:8, marginBottom:8 },
  smallText:{ color:'#fff', fontWeight:'500' },
  chip:{ backgroundColor:'#eee', paddingHorizontal:10, paddingVertical:6, borderRadius:14, marginRight:6 },
  chipActive:{ backgroundColor:'#2563eb' },
  chipText:{ color:'#333' },
  chipTextActive:{ color:'#fff' }
})
