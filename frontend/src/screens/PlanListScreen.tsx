import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native'
import axios from 'axios'

const API='http://localhost:3001/api'

export const PlanListScreen = ({ shared, selectPlan, go }: any) => {
  const [items,setItems]=useState<any[]>([])
  const [loading,setLoading]=useState(false)

  const load=async()=>{
    setLoading(true)
    try{
      const r=await axios.get(`${API}/planlar`,{ params:{ sinifId: shared.sinif?.id, dersId: shared.ders?.id }})
      setItems(r.data.data || [])
    }catch(e){ console.warn(e) }
    setLoading(false)
  }

  useEffect(()=>{ if(shared.sinif && shared.ders) load() },[shared.sinif, shared.ders])

  const renderItem=({item}:any)=> (
    <TouchableOpacity style={s.card} onPress={()=>selectPlan(item)}>
      <Text style={s.title}>{item.ad || item.planAdi || 'Plan'}</Text>
      <Text style={s.meta}>{item.egitiYili}</Text>
      <Text style={s.meta}>Kazanım: {item._count?.planKazanimlar ?? '-'} | Beceri: {item._count?.planBeceriler ?? '-'}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={{flex:1}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <Text style={s.h1}>Planlar</Text>
        <TouchableOpacity onPress={load} style={s.reload}><Text style={s.reloadText}>Yenile</Text></TouchableOpacity>
      </View>
      {loading && <ActivityIndicator />}
      {!loading && items.length===0 && <Text>Plan yok.</Text>}
      <FlatList data={items} keyExtractor={(it)=>String(it.id)} renderItem={renderItem} />
      <TouchableOpacity style={s.fab} onPress={()=>go('plan')}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const s=StyleSheet.create({
  h1:{ fontSize:22,fontWeight:'700'},
  card:{ backgroundColor:'#fff', padding:12, borderRadius:10, marginBottom:10, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:4, elevation:2 },
  title:{ fontWeight:'600', fontSize:16 },
  meta:{ color:'#555', marginTop:2, fontSize:12 },
  reload:{ paddingHorizontal:12, paddingVertical:6, backgroundColor:'#2563eb', borderRadius:8 },
  reloadText:{ color:'#fff', fontWeight:'600' },
  fab:{ position:'absolute', right:16, bottom:16, width:56, height:56, borderRadius:28, backgroundColor:'#16a34a', alignItems:'center', justifyContent:'center' },
  fabText:{ color:'#fff', fontSize:28, lineHeight:30 }
})
