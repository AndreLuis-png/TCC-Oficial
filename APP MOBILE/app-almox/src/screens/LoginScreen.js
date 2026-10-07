import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { API_URL } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert('Atenção', 'Preencha o usuário e a senha.');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || 'Login efetuado!');
        navigation.navigate('Home', { usuario: data.usuario, isAdmin: data.is_admin });
      } else {
        Alert.alert('Erro no Login', data.mensagem || 'Usuário ou senha inválidos.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.campo}>
          <Text style={styles.label}>Usuário:</Text>
          <TextInput
            style={styles.input}
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.botaoEntrar} 
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.textoBotao}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#192A6B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 25,
    elevation: 5,
  },
  title: {
    fontSize: 48,
    color: '#f28c00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  campo: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  botaoEntrar: {
    backgroundColor: '#192A6B',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});