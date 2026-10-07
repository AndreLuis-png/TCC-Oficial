import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MovimentoScreen from './src/screens/MovimentoScreen';
import AdminScreen from './src/screens/AdminScreen';
import CadastroUsuarioScreen from './src/screens/CadastroUsuarioScreen';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('Login');
  const [dadosSessao, setDadosSessao] = useState({});

  const navigationSimulada = {
    navigate: (nomeTela, parametros = {}) => {
      if (Object.keys(parametros).length > 0) {
        setDadosSessao((prev) => ({ ...prev, ...parametros }));
      }
      setTelaAtual(nomeTela);
    },
    goBack: () => setTelaAtual('Home'),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#192A6B" />
      {telaAtual === 'Login' && <LoginScreen navigation={navigationSimulada} />}
      {telaAtual === 'Home' && <HomeScreen navigation={navigationSimulada} route={{ params: dadosSessao }} />}
      {telaAtual === 'Movimento' && <MovimentoScreen navigation={navigationSimulada} route={{ params: dadosSessao }} />}
      {telaAtual === 'Admin' && <AdminScreen navigation={navigationSimulada} route={{ params: dadosSessao }} />}
      {telaAtual === 'Cadastro' && <CadastroUsuarioScreen navigation={navigationSimulada} route={{ params: dadosSessao }} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
});