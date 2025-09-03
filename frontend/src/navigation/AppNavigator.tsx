import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../screens/HomeScreen'
import HaftaOlusturScreen from '../screens/HaftaOlusturScreen'
import HaftaListeScreen from '../screens/HaftaListeScreen'

export type RootStackParamList = {
  Home: undefined
  HaftaOlustur: undefined
  HaftaListe: { yil?: number } | undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ekleme Menüsü' }} />
        <Stack.Screen name="HaftaOlustur" component={HaftaOlusturScreen} options={{ title: 'Hafta Oluştur' }} />
  <Stack.Screen name="HaftaListe" component={HaftaListeScreen} options={{ title: 'Hafta Listesi' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

