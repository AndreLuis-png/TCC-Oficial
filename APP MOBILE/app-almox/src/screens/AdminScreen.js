/*--Página Admin--*/ 

import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';

export default function AdminScreen() {
  const [chaveMestra, setChaveMestra] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');

  // Exemplo de logs
  const logs = [
    { id: '1', data: '30/09/2026 14:00', acao: 'Login', usuario: 'admin' },
    { id: '2', data: '30/09/2026 14:05', acao: 'Saída Estoque', usuario: 'andre' },
  ];

  const handleAcaoUser = (tipo) => {
    if (!chaveMestra) {
      Alert.alert('Atenção', 'Informe a chave mestra de confirmação.');
      return;
    }
    Alert.alert('Ação realizada', `Ação: ${tipo}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gerenciamento de usuários</Text>
      <Text style={styles.subtitle}>Visualize o histórico e gerencie os acessos do sistema</Text>

      {/* Histórico de Ações */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Histórico de Ações</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Buscar histórico por nome..." 
          value={filtroUsuario} 
          onChangeText={setFiltroUsuario} 
        />

        <View style={styles.tabelaHeader}>
          <Text style={[styles.cellHeader, { flex: 2 }]}>Data/Hora</Text>
          <Text style={styles.cellHeader}>Ação</Text>
          <Text style={styles.cellHeader}>Usuário</Text>
        </View>

        {logs.map((log) => (
          <View key={log.id} style={styles.tabelaLinha}>
            <Text style={[styles.cell, { flex: 2 }]}>{log.data}</Text>
            <Text style={styles.cell}>{log.acao}</Text>
            <Text style={styles.cell}>{log.usuario}</Text>
          </View>
        ))}
      </View>

      {/* Painel de Ações do Administrador */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gerenciar Usuário</Text>

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
            onPress={() => handleAcaoUser('Bloquear')}
          >
            <Text style={styles.txtBtn}>Bloquear</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnAcao, { backgroundColor: '#10B981' }]} 
            onPress={() => handleAcaoUser('Desbloquear')}
          >
            <Text style={styles.txtBtn}>Desbloquear</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.btnAcao, { backgroundColor: '#EF4444', marginTop: 10 }]} 
          onPress={() => handleAcaoUser('Excluir')}
        >
          <Text style={styles.txtBtn}>Excluir Usuário</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#192A6B' },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#192A6B', marginBottom: 10 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 8, marginBottom: 10 },
  tabelaHeader: { flexDirection: 'row', backgroundColor: '#E5E7EB', padding: 8, borderRadius: 4, marginTop: 5 },
  cellHeader: { flex: 1, fontWeight: 'bold', fontSize: 12, color: '#374151' },
  tabelaLinha: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  cell: { flex: 1, fontSize: 11, color: '#4B5563' },
  botoesLinha: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnAcao: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
  txtBtn: { color: '#FFF', fontWeight: 'bold' },
});

