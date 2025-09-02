import 'react-native-gesture-handler'
import { registerRootComponent } from 'expo'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AppNavigator from './src/navigation/AppNavigator'

function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  )
}

registerRootComponent(App)
