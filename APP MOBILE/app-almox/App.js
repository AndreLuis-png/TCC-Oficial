import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

// Importe as telas separadas dos seus respectivos arquivos
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MovimentoScreen from './src/screens/MovimentoScreen';
import AdminScreen from './src/screens/AdminScreen';
import CadastroUsuarioScreen from './src/screens/CadastroUsuarioScreen';

export default function App() {
  // Define qual tela será exibida primeiro (ex: 'Login')
  const [telaAtual, setTelaAtual] = useState('Login');

  // Objeto simples para simular a navegação nativa
  const navigationSimulada = {
    navigate: (nomeTela) => setTelaAtual(nomeTela),
    goBack: () => setTelaAtual('Home'),
  };

  return (
    <SafeAreaView style={styles.container}>
      {telaAtual === 'Login' && <LoginScreen navigation={navigationSimulada} />}
      {telaAtual === 'Home' && <HomeScreen navigation={navigationSimulada} />}
      {telaAtual === 'Movimento' && <MovimentoScreen navigation={navigationSimulada} />}
      {telaAtual === 'Admin' && <AdminScreen navigation={navigationSimulada} />}
      {telaAtual === 'Cadastro' && <CadastroUsuarioScreen navigation={navigationSimulada} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
});