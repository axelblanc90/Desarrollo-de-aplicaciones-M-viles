import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AgroProvider } from './src/context/AgroContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AgroProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </AgroProvider>
    </AuthProvider>
  );
}
