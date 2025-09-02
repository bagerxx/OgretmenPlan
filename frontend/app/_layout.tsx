import React from 'react'
import AppNavigator from '../src/navigation/AppNavigator'

export default function RootLayout() {
  // Hybrid: Expo Router entry exists, but we hand over control to React Navigation
  return <AppNavigator />
}
