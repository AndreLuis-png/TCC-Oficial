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

export default function CadastroUsuarioScreen({ navigation, route }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);

  const usuarioLogado = route?.params?.usuario || 'andre';
  const userIsAdmin = route?.params?.isAdmin || true;

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
    <View style={styles.containerPrincipal}>
      
      {/* 1. CABEÇALHO AZUL PRINCIPAL (Ajustado mais para baixo) */}
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoSenai}>SENAI</Text>
          <Text style={styles.logoSub}> Almoxarifado</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.btnPerfil} 
          onPress={() => setMenuPerfilAberto(!menuPerfilAberto)}
        >
          <View style={styles.iconePessoaCirculo}>
            <Text style={styles.iconePessoaTxt}>
              {usuarioLogado ? usuarioLogado.charAt(0).toUpperCase() : 'A'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Dropdown de Usuário / Sair */}
      {menuPerfilAberto && (
        <View style={styles.dropdownPerfil}>
          <Text style={styles.dropdownUsuarioNom}>{usuarioLogado}</Text>
          <TouchableOpacity 
            style={styles.dropdownBtnSair} 
            onPress={() => {
              setMenuPerfilAberto(false);
              navigation.navigate('Login');
            }}
          >
            <Text style={styles.dropdownTxtSair}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* 2. TÍTULO E SUBTÍTULO LARANJA */}
        <Text style={styles.tituloPagina}>Cadastrar Novo Usuário</Text>
        <Text style={styles.subtituloPagina}>Crie um acesso para um novo operador ou administrador do sistema</Text>

        {/* 3. NAV BAR COM ABA ATIVA DE CADASTRO */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.navTxt}>Estoque</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Movimento')}>
            <Text style={styles.navTxt}>Movimentação</Text>
          </TouchableOpacity>
          {userIsAdmin && (
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Admin')}>
              <Text style={styles.navTxt}>Gerenciamento</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.navBtnAtivo} onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.navTxtAtivo}>Cadastrar Usuário</Text>
          </TouchableOpacity>
        </View>

        {/* 4. CARD DE CADASTRO */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: { flex: 1, backgroundColor: '#F4F6F9' },
  headerTop: { 
    height: 85, // Altura ajustada para descer o cabeçalho
    backgroundColor: '#192A6B', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    paddingTop: 30, // Espaçamento superior maior para afastar da barra de status
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
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
    top: 85, // Posicionado logo abaixo do novo cabeçalho
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
  scrollContainer: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 40 },
  tituloPagina: { fontSize: 26, fontWeight: 'bold', color: '#192A6B' },
  subtituloPagina: { fontSize: 12, color: '#F28C00', fontWeight: '500', marginBottom: 20 },
  navBar: { flexDirection: 'row', gap: 12, marginBottom: 20, borderBottomWidth: 1, borderColor: '#E5E7EB', paddingBottom: 5 },
  navBtn: { paddingVertical: 4 },
  navBtnAtivo: { paddingVertical: 4, borderBottomWidth: 2, borderColor: '#F28C00' },
  navTxt: { color: '#6B7280', fontSize: 11, fontWeight: '500' },
  navTxtAtivo: { color: '#192A6B', fontSize: 11, fontWeight: 'bold' },
  card: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 12, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#FFF', fontSize: 13 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 15 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#374151', borderRadius: 4, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecado: { backgroundColor: '#192A6B', borderColor: '#192A6B' },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 12, color: '#374151', fontWeight: '500' },
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnCancelar: { flex: 1, padding: 12, backgroundColor: '#E5E7EB', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  txtCancelar: { color: '#374151', fontWeight: 'bold', fontSize: 13 },
  btnSalvar: { flex: 1.5, padding: 12, backgroundColor: '#F28C00', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  txtSalvar: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});