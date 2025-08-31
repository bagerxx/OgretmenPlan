import React, { useState } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SetupScreen } from './SetupScreen'
import { PlanScreen } from './PlanScreen'
import { PlanListScreen } from './PlanListScreen'
import { SinifDefteriScreen } from './SinifDefteriScreen'
import { GunlukPlanScreen } from './GunlukPlanScreen'

type Step = 'setup'|'planList'|'plan'|'sinifDefteri'|'gunluk'
export const AppNavigator = () => {
  const [step, setStep] = useState<Step>('setup')
  const [shared, setShared] = useState<any>({ egitiYili: '2024-2025', plan:null })

  const render = (): any => {
    switch(step){
      case 'setup': return <SetupScreen shared={shared} setShared={setShared} go={(s:Step)=>setStep(s)} />
      case 'planList': return <PlanListScreen shared={shared} selectPlan={(p:any)=>{ setShared({...shared, plan:p}); setStep('plan') }} go={(s:Step)=>setStep(s)} />
      case 'plan': return <PlanScreen shared={shared} setShared={setShared} go={(s:Step)=>setStep(s)} />
      case 'sinifDefteri': return <SinifDefteriScreen shared={shared} go={(s:Step)=>setStep(s)} />
      case 'gunluk': return <GunlukPlanScreen shared={shared} go={(s:Step)=>setStep(s)} />
    }
    return null
  }

  const steps = [
    { key: 'setup', label: 'Kurulum' },
    { key: 'planList', label: 'Planlar' },
    { key: 'plan', label: 'Yıllık Plan' },
    { key: 'sinifDefteri', label: 'Sınıf Defteri' },
    { key: 'gunluk', label: 'Günlük Plan' }
  ]

  return (
    <SafeAreaView style={{ flex:1 }}>
      <View style={styles.tabBar}>
        {steps.map(s => (
          <TouchableOpacity key={s.key} style={[styles.tab, step===s.key && styles.tabActive]} onPress={()=>setStep(s.key as any)}>
            <Text style={[styles.tabText, step===s.key && styles.tabTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding:16, flexGrow:1 }}>
        {render()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  tabBar:{ flexDirection:'row', backgroundColor:'#eee' },
  tab:{ flex:1, padding:10, alignItems:'center' },
  tabActive:{ backgroundColor:'#2563eb' },
  tabText:{ color:'#444', fontWeight:'500' },
  tabTextActive:{ color:'#fff' }
})
