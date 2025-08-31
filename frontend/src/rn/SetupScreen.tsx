import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import axios from 'axios'

const API = 'http://localhost:3001/api'

export const SetupScreen = ({ shared, setShared, go }: any) => {
  const [kademeler,setKademeler]=useState<any[]>([])
  const [siniflar,setSiniflar]=useState<any[]>([])
  const [dersler,setDersler]=useState<any[]>([])

  useEffect(()=>{ load() },[])
  const load=async()=>{
    const [k,d]=await Promise.all([
      axios.get(`${API}/kademeler`).catch(()=>({data:{data:[]}})),
      axios.get(`${API}/dersler`).catch(()=>({data:{data:[]}}))
    ])
    setKademeler(k.data.data||[])
    setDersler(d.data.data||[])
  }
  const loadSinif=async(id:string)=>{
    const r=await axios.get(`${API}/kademeler/${id}/siniflar`).catch(()=>({data:{data:[]}}))
    setSiniflar(r.data.data||[])
  }

  return (
    <View>
      <Text style={s.h1}>Kurulum</Text>
      <Text style={s.label}>Kademe</Text>
      <View style={s.rowWrap}>
        {kademeler.map(k=>(
          <TouchableOpacity key={k.id} style={[s.chip, shared.kademe?.id===k.id && s.chipActive]} onPress={()=>{setShared({...shared, kademe:k, sinif:null}); loadSinif(k.id)}}>
            <Text style={[s.chipText, shared.kademe?.id===k.id && s.chipTextActive]}>{k.ad}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {shared.kademe && (
        <>
          <Text style={s.label}>Sınıf</Text>
          <View style={s.rowWrap}>
            {siniflar.map(sin=>(
              <TouchableOpacity key={sin.id} style={[s.chip, shared.sinif?.id===sin.id && s.chipActive]} onPress={()=>setShared({...shared, sinif:sin})}>
                <Text style={[s.chipText, shared.sinif?.id===sin.id && s.chipTextActive]}>{sin.seviye}. Sınıf</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      <Text style={s.label}>Ders</Text>
      <View style={s.rowWrap}>
        {dersler.map(d=>(
          <TouchableOpacity key={d.id} style={[s.chip, shared.ders?.id===d.id && s.chipActive]} onPress={()=>setShared({...shared, ders:d})}>
            <Text style={[s.chipText, shared.ders?.id===d.id && s.chipTextActive]}>{d.ad}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.label}>Eğitim Yılı</Text>
      <TextInput value={shared.egitiYili} onChangeText={(t)=>setShared({...shared, egitiYili:t})} style={s.input} />
      <TouchableOpacity disabled={!shared.kademe||!shared.sinif||!shared.ders} onPress={()=>go('plan')} style={[s.btn, (!shared.kademe||!shared.sinif||!shared.ders)&&s.btnDisabled]}>
        <Text style={s.btnText}>Yıllık Plan</Text>
      </TouchableOpacity>
    </View>
  )
}

const s=StyleSheet.create({
  h1:{ fontSize:22, fontWeight:'700', marginBottom:12 },
  label:{ marginTop:16, fontWeight:'600', color:'#333' },
  rowWrap:{ flexDirection:'row', flexWrap:'wrap', marginTop:8 },
  chip:{ paddingHorizontal:12, paddingVertical:6, backgroundColor:'#eee', borderRadius:16, margin:4 },
  chipActive:{ backgroundColor:'#2563eb' },
  chipText:{ color:'#333' },
  chipTextActive:{ color:'#fff' },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginTop:8 },
  btn:{ backgroundColor:'#16a34a', padding:14, borderRadius:10, alignItems:'center', marginTop:24 },
  btnDisabled:{ opacity:0.4 },
  btnText:{ color:'#fff', fontWeight:'600' }
})
