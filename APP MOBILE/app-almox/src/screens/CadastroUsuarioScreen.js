/*--Página de cadastro*/ 

import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView 
} from 'react-native';

export default function CadastroUsuarioScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleCadastrar = () => {
    if (!usuario || !senha) {
      Alert.alert('Erro', 'Preencha o nome de usuário e a senha.');
      return;
    }
    Alert.alert('Sucesso', `Usuário ${usuario} cadastrado!`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastrar Novo Usuário</Text>
      <Text style={styles.subtitle}>Crie um acesso para um novo operador ou administrador do sistema</Text>

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

        {/* Checkbox Simulado usando componentes nativos */}
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setIsAdmin(!isAdmin)}
        >
          <View style={[styles.checkbox, isAdmin && styles.checkboxChecado]}>
            {isAdmin && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Conceder permissões de Administrador</Text>
        </TouchableOpacity>

        {/* Botões de Ação */}
        <View style={styles.botoesContainer}>
          <TouchableOpacity style={styles.btnCancelar} onPress={() => navigation.goBack()}>
            <Text style={styles.txtCancelar}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSalvar} onPress={handleCadastrar}>
            <Text style={styles.txtSalvar}>Salvar Usuário</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#192A6B' },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 15 },
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