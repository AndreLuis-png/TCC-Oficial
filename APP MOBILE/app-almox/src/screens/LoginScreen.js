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
import { API_URL } from '../services/api.js';

export default function LoginScreen({ navigation }) {
  // --- ESTADOS DA TELA ---
  const [usuario, setUsuario] = useState('');       // Armazena o nome de usuário digitado
  const [senha, setSenha] = useState('');           // Armazena a senha digitada
  const [carregando, setCarregando] = useState(false); // Controla o indicador visual de carregamento (loading)

  // --- FUNÇÃO DE LOGIN ---
  const handleLogin = async () => {
    // Validação: Garante que os campos de usuário e senha não estejam vazios
    if (!usuario || !senha) {
      Alert.alert('Atenção', 'Preencha o usuário e a senha.');
      return;
    }

    setCarregando(true); // Ativa o indicador de carregamento
    try {
      // Faz a requisição POST para a raiz da API Flask (rota de autenticação)
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      // Verifica se o login foi bem-sucedido
      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || 'Login efetuado!');
        // Navega para a tela 'Home' passando parâmetros como o nome do usuário e se ele é admin
        navigation.navigate('Home', { usuario: data.usuario, isAdmin: data.is_admin });
      } else {
        // Exibe mensagem de erro retornada pelo servidor (ex: senha incorreta)
        Alert.alert('Erro no Login', data.mensagem || 'Usuário ou senha inválidos.');
      }
    } catch (error) {
      // Trata erros de conexão com a rede ou servidor Flask fora do ar
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setCarregando(false); // Desativa o indicador de carregamento independentemente do resultado
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Login</Text>

        {/* Campo de Entrada: Usuário */}
        <View style={styles.campo}>
          <Text style={styles.label}>Usuário:</Text>
          <TextInput
            style={styles.input}
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />
        </View>

        {/* Campo de Entrada: Senha */}
        <View style={styles.campo}>
          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        {/* Botão de Entrar (com indicador de progresso condicional) */}
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

// --- ESTILIZAÇÃO DA TELA (CSS-in-JS via React Native StyleSheet) ---
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
  logoSenai: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  logoSub: { color: '#FFF', fontSize: 13, fontWeight: '300' },
  btnPerfil: { padding: 5 },
  iconePessoaCirculo: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#0284C7',
  },
  iconePessoaTxt: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  dropdownPerfil: {
    position: 'absolute',
    top: 85,
    right: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    width: 160,
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownUsuarioNom: { fontSize: 15, fontWeight: 'bold', color: '#192A6B', marginBottom: 12 },
  dropdownBtnSair: { borderTopWidth: 1, borderColor: '#ECECEC', paddingTop: 8 },
  dropdownTxtSair: { color: '#EF4444', fontSize: 13, fontWeight: '500' },
  scrollContainer: { paddingHorizontal: 15, paddingTop
