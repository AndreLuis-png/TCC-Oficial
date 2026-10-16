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
import { API_URL } from '../services/api.js';

export default function AdminScreen({ navigation, route }) {
  const [chaveMestra, setChaveMestra] = useState('');
  const [usuarioAlvo, setUsuarioAlvo] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  // Lista local para registrar as alterações/ações salvas nesta sessão
  const [historicoLocal, setHistoricoLocal] = useState([]);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);

  const usuarioLogado = route?.params?.usuario || 'andre';
  const isAdmin = route?.params?.isAdmin || true;

  // Função central para enviar e salvar as alterações feitas no admin
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
        Alert.alert('Sucesso', data.mensagem || `Alteração (${tipoAcao}) salva com sucesso!`);
        
        // Formata a data/hora atual para exibir na tabela de alterações salvas
        const agora = new Date().toLocaleString('pt-BR');
        const novaAcao = {
          data_hora: agora,
          acao: tipoAcao.toUpperCase(),
          usuario: usuarioAlvo
        };

        // Adiciona a alteração salva no topo da tabela local
        setHistoricoLocal([novaAcao, ...historicoLocal]);

        // Limpa os campos após salvar
        setUsuarioAlvo('');
        setChaveMestra('');
      } else {
        Alert.alert('Erro', data.mensagem || 'Falha ao salvar alterações.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 1. CABEÇALHO AZUL PRINCIPAL (Padronizado) */}
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

      <ScrollView contentContainerStyle={styles.conteudoScroll}>
        
        {/* 2. TÍTULO PRINCIPAL E LEGENDA */}
        <Text style={styles.tituloPagina}>Gerenciamento de usuários</Text>
        <Text style={styles.subtituloPagina}>Visualize e salve as alterações de acesso do sistema</Text>

        {/* 3. NAV BAR */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.navTxt}>Estoque</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Movimento')}>
            <Text style={styles.navTxt}>Movimentação</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={styles.navBtnAtivo} onPress={() => navigation.navigate('Admin')}>
              <Text style={styles.navTxtAtivo}>Gerenciamento</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. CARD: GERENCIAR E SALVAR ALTERAÇÕES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gerenciar Usuário</Text>

          <Text style={styles.label}>Usuário Alvo:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Digite o nome do usuário..." 
            value={usuarioAlvo} 
            onChangeText={setUsuarioAlvo} 
            autoCapitalize="none"
          />

          <Text style={styles.label}>Chave Mestra de Confirmação:</Text>
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
            style={[styles.btnAcaoUnica, { backgroundColor: '#EF4444', marginTop: 10 }]} 
            onPress={() => handleAcaoUser('deletar_usuario')}
            disabled={carregando}
          >
            <Text style={styles.txtBtn}>Excluir Usuário</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnAcaoUnica, { backgroundColor: '#192A6B', marginTop: 15 }]} 
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={styles.txtBtn}>+ Cadastrar Novo Usuário</Text>
          </TouchableOpacity>

          {carregando && <ActivityIndicator size="small" color="#192A6B" style={{ marginTop: 10 }} />}
        </View>

        {/* 5. CARD: TABELA DE ALTERAÇÕES SALVAS RECENTEMENTE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alterações Salvas na Sessão</Text>
          <Text style={styles.label}>Histórico de modificações aplicadas:</Text>

          {/* Cabeçalho da Tabela */}
          <View style={styles.cabecalhoTabela}>
            <Text style={[styles.celulaCabecalho, { flex: 1.2 }]}>Data/Hora</Text>
            <Text style={[styles.celulaCabecalho, { flex: 1.2 }]}>Ação Salva</Text>
            <Text style={[styles.celulaCabecalho, { flex: 1 }]}>Usuário</Text>
          </View>

          {historicoLocal.length > 0 ? (
            historicoLocal.map((item, index) => (
              <View key={index} style={styles.linhaTabela}>
                <Text style={[styles.celula, { flex: 1.2 }]}>{item.data_hora}</Text>
                <Text style={[styles.celula, { flex: 1.2, fontWeight: 'bold', color: '#192A6B' }]}>{item.acao}</Text>
                <Text style={[styles.celula, { flex: 1 }]}>{item.usuario}</Text>
              </View>
            ))
          ) : (
            <View style={styles.linhaTabelaVazia}>
              <Text style={styles.textoVazio}>Nenhuma alteração salva nesta sessão ainda.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  headerTop: { 
    height: 85, 
    backgroundColor: '#192A6B', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    paddingTop: 30, 
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
  conteudoScroll: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 40 },
  tituloPagina: { fontSize: 26, fontWeight: 'bold', color: '#192A6B' },
  subtituloPagina: { fontSize: 12, color: '#F28C00', fontWeight: '500', marginBottom: 20 },
  navBar: { flexDirection: 'row', gap: 15, marginBottom: 20, borderBottomWidth: 1, borderColor: '#E5E7EB', paddingBottom: 5 },
  navBtn: { paddingVertical: 4 },
  navBtnAtivo: { paddingVertical: 4, borderBottomWidth: 2, borderColor: '#F28C00' },
  navTxt: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
  navTxtAtivo: { color: '#192A6B', fontSize: 13, fontWeight: 'bold' },
  card: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 20, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#192A6B', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#FFF', marginBottom: 10, fontSize: 13 },
  botoesLinha: { flexDirection: 'row', gap: 10, marginTop: 5 },
  btnAcao: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 40 },
  btnAcaoUnica: { width: '100%', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 40 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  cabecalhoTabela: { flexDirection: 'row', backgroundColor: '#192A6B', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 6, marginBottom: 2, marginTop: 5 },
  celulaCabecalho: { color: '#FFF', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
  linhaTabela: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 5, borderBottomWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#FFF' },
  celula: { fontSize: 11, textAlign: 'center', color: '#374151' },
  linhaTabelaVazia: { paddingVertical: 15, alignItems: 'center' },
  textoVazio: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
});