import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { API_URL } from '../services/api';

export default function AdminScreen({ navigation, route }) {
  const [chaveMestra, setChaveMestra] = useState('');
  const [usuarioAlvo, setUsuarioAlvo] = useState('');
  const [carregando, setCarregando] = useState(false);

  const usuarioLogado = route?.params?.usuario || 'admin';

  const handleAcaoUser = async (tipoAcao) => {
    if (!usuarioAlvo.trim()) {
      Alert.alert('Atenção', 'Informe o nome do usuário alvo.');
      return;
    }
    if (!chaveMestra.trim()) {
      Alert.alert('Atenção', 'Informe a chave mestra de confirmação.');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: tipoAcao,
          usuario_alvo: usuarioAlvo,
          chave_mestra: chaveMestra,
          usuario: usuarioLogado
        })
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || `Ação ${tipoAcao} concluída!`);
        setUsuarioAlvo('');
        setChaveMestra('');
      } else {
        Alert.alert('Erro', data.mensagem || 'Falha ao executar a ação.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Menu Superior Simulado */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navTxt}>Estoque</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Movimento')}>
          <Text style={styles.navTxt}>Movimento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtnAtivo} onPress={() => navigation.navigate('Admin')}>
          <Text style={styles.navTxtAtivo}>Admin</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Gerenciamento de usuários</Text>
      <Text style={styles.subtitle}>Gerencie os acessos do sistema</Text>

      {/* Painel de Ações do Administrador */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gerenciar Usuário</Text>

        <Text style={styles.label}>Usuário Alvo</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: joao.silva" 
          value={usuarioAlvo} 
          onChangeText={setUsuarioAlvo} 
          autoCapitalize="none"
        />

        <Text style={styles.label}>Chave Mestra de Confirmação</Text>
        <TextInput 
          style={styles.input} 
          secureTextEntry 
          placeholder="Digite a chave mestra" 
          value={chaveMestra} 
          onChangeText={setChaveMestra} 
        />

        <View style={styles.botoesLinha}>
          <TouchableOpacity 
            style={[styles.btnAcao, { backgroundColor: '#F59E0B' }]} 
            onPress={() => handleAcaoUser('bloquear')}
            disabled={carregando}
          >
            <Text style={styles.txtBtn}>Bloquear</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnAcao, { backgroundColor: '#10B981' }]} 
            onPress={() => handleAcaoUser('desbloquear')}
            disabled={carregando}
          >
            <Text style={styles.txtBtn}>Desbloquear</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.btnAcao, { backgroundColor: '#EF4444', marginTop: 10 }]} 
          onPress={() => handleAcaoUser('deletar_usuario')}
          disabled={carregando}
        >
          <Text style={styles.txtBtn}>Excluir Usuário</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnAcao, { backgroundColor: '#192A6B', marginTop: 15 }]} 
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.txtBtn}>+ Cadastrar Novo Usuário</Text>
        </TouchableOpacity>

        {carregando && <ActivityIndicator size="small" color="#192A6B" style={{ marginTop: 10 }} />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 15 },
  navBar: { flexDirection: 'row', backgroundColor: '#192A6B', borderRadius: 8, marginBottom: 15, padding: 5 },
  navBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  navBtnAtivo: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#0284C7', borderRadius: 6 },
  navTxt: { color: '#FFF', fontSize: 11 },
  navTxtAtivo: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#192A6B' },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#192A6B', marginBottom: 10 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 8, marginBottom: 10 },
  botoesLinha: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnAcao: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
  txtBtn: { color: '#FFF', fontWeight: 'bold' },
});