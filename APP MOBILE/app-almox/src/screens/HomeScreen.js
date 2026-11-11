import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  Image,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { API_URL } from '../services/api.js';

export default function HomeScreen({ navigation, route }) {
  // --- ESTADOS DA TELA ---
  const [pesquisa, setPesquisa] = useState('');         // Armazena o termo digitado na barra de pesquisa
  const [categoriaSel, setCategoriaSel] = useState('Todos'); // Armazena a categoria selecionada para filtro ('Todos', 'Geral', 'Mecanica', 'Eletrica')
  const [imagemModal, setImagemModal] = useState(null); // Armazena os dados da imagem e produto a serem exibidos no modal
  const [estoque, setEstoque] = useState([]);           // Lista de itens do estoque retornados pela API
  const [carregando, setCarregando] = useState(false);  // Controla o indicador visual de carregamento (loading)
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false); // Controla a abertura do menu flutuante de perfil

  // Obtém parâmetros passados pela rota (com valores padrão caso estejam vazios)
  const isAdmin = route?.params?.isAdmin || false;
  const usuarioLogado = route?.params?.usuario || 'andre';

  // --- FUNÇÃO PARA BUSCAR ESTOQUE NO BACKEND ---
  const buscarEstoque = async (categoria = 'Todos', termo = '') => {
    setCarregando(true);
    try {
      // Constrói a URL com os parâmetros de pesquisa e categoria
      let url = `${API_URL}/api/estoque?pesquisa=${encodeURIComponent(termo)}`;
      
      if (categoria !== 'Todos') {
        url += `&categoria=${encodeURIComponent(categoria)}`;
      }

      // Faz a requisição GET para a API Flask
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();

      // Se a resposta for bem-sucedida, atualiza o estado do estoque
      if (response.ok && data.sucesso) {
        setEstoque(data.estoque || []);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar o estoque.');
      }
    } catch (error) {
      // Trata erros de conexão com o servidor
      Alert.alert('Erro de Conexão', 'Falha ao buscar dados do servidor.');
    } finally {
      setCarregando(false); // Desativa o indicador de carregamento
    }
  };

  // Executa a busca sempre que a categoria selecionada mudar
  useEffect(() => {
    buscarEstoque(categoriaSel, pesquisa);
  }, [categoriaSel]);

  // Função disparada ao alterar o filtro de categoria
  const handleAlterarFiltro = (novaCategoria) => {
    setCategoriaSel(novaCategoria);
    buscarEstoque(novaCategoria, pesquisa);
  };

  // Função que renderiza cada linha individualmente dentro da FlatList
  const renderItem = ({ item }) => {
    return (
      <View style={styles.linhaTabela}>
        <Text style={[styles.celula, { flex: 0.8 }]}>{item.id}</Text>
        <Text style={[styles.celula, { flex: 2, fontWeight: 'bold' }]}>{item.produto}</Text>
        <Text style={styles.celula}>{item.area_uso}</Text>
        <Text style={styles.celula}>{item.quantidade}</Text>
        <Text style={styles.celula}>R$ {Number(item.preco).toFixed(2)}</Text>
        {/* Botão para abrir o modal de imagem caso o produto possua link */}
        <TouchableOpacity 
          style={styles.btnAcaoTabela}
          onPress={() => item.link_imagem && setImagemModal({ url: item.link_imagem, produto: item.produto })}
        >
          <Text style={styles.txtBtnAcao}>{item.link_imagem ? 'Ver Imagem' : 'Sem Imagem'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* 1. CABEÇALHO AZUL PRINCIPAL */}
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoSenai}>SENAI</Text>
          <Text style={styles.logoSub}> Almoxarifado</Text>
        </View>
        
        {/* Botão do Perfil (abre o menu suspenso) */}
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

      {/* 2. LISTA PRINCIPAL (FlatList com ListHeaderComponent para otimizar rolagem) */}
      <FlatList
        data={estoque}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.conteudoScroll}
        ListHeaderComponent={
          <View>
            <Text style={styles.tituloPagina}>Estoque</Text>
            <Text style={styles.subtituloPagina}>Lista de todos os itens cadastrados</Text>

            {/* Barra de Navegação entre Telas */}
            <View style={styles.navBar}>
              <TouchableOpacity style={styles.navBtnAtivo} onPress={() => navigation.navigate('Home', { usuario: usuarioLogado, isAdmin })}>
                <Text style={styles.navTxtAtivo}>Estoque</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Movimento', { usuario: usuarioLogado, isAdmin })}>
                <Text style={styles.navTxt}>Movimentação</Text>
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Admin', { usuario: usuarioLogado, isAdmin })}>
                  <Text style={styles.navTxt}>Gerenciamento</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Caixa de Pesquisa */}
            <View style={styles.pesquisaContainer}>
              <TextInput
