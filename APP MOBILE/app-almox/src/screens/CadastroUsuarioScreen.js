import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { API_URL } from '../services/api.js';

export default function CadastroUsuarioScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleCadastrar = async () => {
    if (!usuario.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Preencha o nome de usuário e a senha.');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/cadastrar_usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuario,
          senha: senha,
          is_admin: isAdmin ? 'on' : ''
        })
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || `Usuário ${usuario} cadastrado!`);
        navigation.navigate('Admin');
      } else {
        Alert.alert('Erro', data.mensagem || 'Não foi possível cadastrar o usuário.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastrar Novo Usuário</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome de Usuário (Login)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: joao.silva" 
          value={usuario} 
          onChangeText={setUsuario} 
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha Inicial</Text>
        <TextInput 
          style={styles.input} 
          placeholder="********" 
          secureTextEntry 
          value={senha} 
          onChangeText={setSenha} 
        />

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setIsAdmin(!isAdmin)}
        >
          <View style={[styles.checkbox, isAdmin && styles.checkboxChecado]}>
            {isAdmin && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Conceder permissões de Administrador</Text>
        </TouchableOpacity>

        <View style={styles.botoesContainer}>
          <TouchableOpacity style={styles.btnCancelar} onPress={() => navigation.navigate('Admin')}>
            <Text style={styles.txtCancelar}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnSalvar} 
            onPress={handleCadastrar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.txtSalvar}>Salvar Usuário</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#192A6B', marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, elevation: 2 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 10, backgroundColor: '#FFF' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 15 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#374151', borderRadius: 4, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecado: { backgroundColor: '#192A6B', borderColor: '#192A6B' },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 13, color: '#374151' },
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnCancelar: { flex: 1, padding: 12, backgroundColor: '#E5E7EB', borderRadius: 6, alignItems: 'center' },
  txtCancelar: { color: '#374151', fontWeight: 'bold' },
  btnSalvar: { flex: 1, padding: 12, backgroundColor: '#10B981', borderRadius: 6, alignItems: 'center' },
  txtSalvar: { color: '#FFF', fontWeight: 'bold' },
});