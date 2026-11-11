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
  // --- ESTADOS DA TELA (Gerenciamento de dados locais) ---
  const [chaveMestra, setChaveMestra] = useState(''); // Armazena a chave mestra digitada
  const [usuarioAlvo, setUsuarioAlvo] = useState(''); // Armazena o nome do usuário que sofrerá a ação
  const [carregando, setCarregando] = useState(false);  // Controla o indicador de carregamento (loading)
  
  // Lista local para registrar as alterações/ações salvas nesta sessão
  const [historicoLocal, setHistoricoLocal] = useState([]);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false); // Controla a abertura do menu flutuante do perfil

  // Obtém parâmetros passados pela rota anterior (com valores padrão caso venham vazios)
  const usuarioLogado = route?.params?.usuario || 'andre';
  const isAdmin = route?.params?.isAdmin || true;

  // --- FUNÇÃO PRINCIPAL: Envia requisições de gerenciamento para o backend ---
  const handleAcaoUser = async (tipoAcao) => {
    // Validação: Garante que o campo de usuário alvo foi preenchido
    if (!usuarioAlvo.trim()) {
      Alert.alert('Atenção', 'Informe o nome do usuário alvo.');
      return;
    }
    // Validação: Garante que a chave mestra foi preenchida
    if (!chaveMestra.trim()) {
      Alert.alert('Atenção', 'Informe a chave mestra de confirmação.');
      return;
    }

    setCarregando(true); // Ativa o indicador de carregamento
    try {
      // Faz a requisição POST para a API do Flask
      const response = await fetch(`${API_URL}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: tipoAcao,         // Ex: 'bloquear', 'desbloquear', 'deletar_usuario'
          usuario_alvo: usuarioAlvo,
          chave_mestra: chaveMestra,
          usuario: usuarioLogado
        })
      });

      const data = await response.json();

      // Verifica se a resposta foi bem-sucedida
      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || `Alteração (${tipoAcao}) salva com sucesso!`);
  
        // Formata a data/hora atual para exibir na tabela de histórico local
        const agora = new Date().toLocaleString('pt-BR');
        const novaAcao = {
          data_hora: agora,
          acao: tipoAcao.toUpperCase(),
          usuario: usuarioAlvo
        };

        // Adiciona a nova ação no topo da lista do histórico local
        setHistoricoLocal([novaAcao, ...historicoLocal]);

        // Limpa os inputs do formulário
        setUsuarioAlvo('');
        setChaveMestra('');
      } else {
        // Exibe mensagem de erro retornada pelo servidor
        Alert.alert('Erro', data.mensagem || 'Falha ao salvar alterações.');
      }
    } catch (error) {
      // Trata erros de conexão com a rede ou servidor fora do ar
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setCarregando(false); // Desativa o indicador de carregamento independentemente do resultado
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 1. CABEÇALHO AZUL PRINCIPAL */}
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoSenai}>SENAI</Text>
          <Text style={styles.logoSub}> Almoxarifado</Text>
        </View>
        
        {/* Botão de Perfil que abre/fecha o menu dropdown */}
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

      {/* Dropdown de Usuário / Sair (Exibido condicionalmente) */}
      {menuPerfilAberto && (
        <View style={styles.dropdownPerfil}>
          <Text style={styles.dropdownUsuarioNom}>{usuarioLogado}</Text>
          <TouchableOpacity 
            style={styles.dropdownBtnSair} 
            onPress={() => {
              setMenuPerfilAberto(false);
              navigation.navigate('Login'); // Redireciona para a tela de login
            }}
          >
            <Text style={styles.dropdownTxtSair}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.conteudoScroll}>
        
        {/* 2. TÍTULO E SUBTÍTULO DA PÁGINA */}
        <Text style={styles.tituloPagina}>Gerenciamento de usuários</Text>
        <Text style={styles.subtituloPagina}>Visualize e salve as alterações de acesso do sistema</Text>

        {/* 3. BARRA DE NAVEGAÇÃO ENTRE TELAS */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.navTxt}>Estoque</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Movimento')}>
            <Text style={styles.navTxt}>Movimentação
