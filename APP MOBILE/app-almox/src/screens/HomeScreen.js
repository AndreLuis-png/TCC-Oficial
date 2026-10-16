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
  const [pesquisa, setPesquisa] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Todos');
  const [imagemModal, setImagemModal] = useState(null);
  const [estoque, setEstoque] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);

  const isAdmin = route?.params?.isAdmin || false;
  const usuarioLogado = route?.params?.usuario || 'andre';

  // Função que faz o fetch de dados na API segura do contêiner Docker
  const buscarEstoque = async (categoria = 'Todos', termo = '') => {
    setCarregando(true);
    try {
      let url = `${API_URL}/api/estoque?pesquisa=${encodeURIComponent(termo)}`;
      
      if (categoria !== 'Todos') {
        url += `&categoria=${encodeURIComponent(categoria)}`;
      }

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();

      if (response.ok && data.sucesso) {
        setEstoque(data.estoque || []);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar o estoque.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Falha ao buscar dados do servidor.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarEstoque(categoriaSel, pesquisa);
  }, [categoriaSel]);

  // CONSERTO DOS FILTROS: Essa função agora muda o botão na tela E busca no banco
  const handleAlterarFiltro = (novaCategoria) => {
    setCategoriaSel(novaCategoria);
    buscarEstoque(novaCategoria, pesquisa);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.linhaTabela}>
        <Text style={[styles.celula, { flex: 0.8 }]}>{item.id}</Text>
        <Text style={[styles.celula, { flex: 2, fontWeight: 'bold' }]}>{item.produto}</Text>
        <Text style={styles.celula}>{item.area_uso}</Text>
        <Text style={styles.celula}>{item.quantidade}</Text>
        <Text style={styles.celula}>R$ {Number(item.preco).toFixed(2)}</Text>
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

      {/* Lista com o Conteúdo de Layout */}
      <FlatList
        data={estoque}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.conteudoScroll}
        ListHeaderComponent={
          <View>
            {/* 2. TÍTULO PRINCIPAL E LEGENDA */}
            <Text style={styles.tituloPagina}>Estoque</Text>
            <Text style={styles.subtituloPagina}>Lista de todos os itens cadastrados</Text>

            {/* 3. NAV BAR LOGO ABAIXO DO TÍTULO */}
            <View style={styles.navBar}>
              <TouchableOpacity style={styles.navBtnAtivo} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.navTxtAtivo}>Estoque</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Movimento')}>
                <Text style={styles.navTxt}>Movimentação</Text>
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Admin')}>
                  <Text style={styles.navTxt}>Gerenciamento</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 4. BARRA DE PESQUISA */}
            <View style={styles.pesquisaContainer}>
              <TextInput
                style={styles.inputPesquisa}
                placeholder="Pesquise..."
                value={pesquisa}
                onChangeText={setPesquisa}
              />
              <TouchableOpacity style={styles.btnBuscar} onPress={() => buscarEstoque(categoriaSel, pesquisa)}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Buscar</Text>
              </TouchableOpacity>
            </View>

            {/* 5. BOTÕES DE FILTRO (Inativos em tom intermediário, ativo forte) */}
            <View style={styles.grupoFiltros}>
              {['Uso Geral', 'Mecânica', 'Elétrica', 'Todos'].map((cat) => {
                const catBanco = cat === 'Uso Geral' ? 'Geral' : cat === 'Mecânica' ? 'Mecanica' : cat === 'Elétrica' ? 'Eletrica' : 'Todos';
                const ativo = categoriaSel === catBanco;
                return (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.btnFiltro, ativo && styles.btnFiltroAtivo]}
                    onPress={() => handleAlterarFiltro(catBanco)}
                  >
                    <Text style={styles.txtFiltro}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 6. TABELA DE ITENS */}
            <View style={styles.cabecalhoTabela}>
              <Text style={[styles.celulaCabecalho, { flex: 0.8 }]}>Id</Text>
              <Text style={[styles.celulaCabecalho, { flex: 2 }]}>Produto</Text>
              <Text style={styles.celulaCabecalho}>Área de Uso</Text>
              <Text style={styles.celulaCabecalho}>Quantidade</Text>
              <Text style={styles.celulaCabecalho}>Preço</Text>
              <Text style={styles.celulaCabecalho}>Imagem</Text>
            </View>

            {carregando && <ActivityIndicator size="large" color="#192A6B" style={{ marginTop: 25 }} />}
          </View>
        }
      />

      {/* Modal Nativo de Imagem */}
      <Modal visible={!!imagemModal} transparent={true} animationType="fade">
        <View style={styles.containerModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>{imagemModal?.produto}</Text>
            {imagemModal?.url && <Image source={{ uri: imagemModal.url }} style={styles.imagemModal} />}
            <TouchableOpacity style={styles.btnFecharModal} onPress={() => setImagemModal(null)}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  tituloPagina: { fontSize: 28, fontWeight: 'bold', color: '#192A6B' },
  subtituloPagina: { fontSize: 12, color: '#f28c00', fontWeight: '500', marginBottom: 20 },
  navBar: { flexDirection: 'row', gap: 15, marginBottom: 20, borderBottomWidth: 1, borderColor: '#E5E7EB', paddingBottom: 5 },
  navBtn: { paddingVertical: 4 },
  navBtnAtivo: { paddingVertical: 4, borderBottomWidth: 2, borderColor: '#f28c00' },
  navTxt: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
  navTxtAtivo: { color: '#192A6B', fontSize: 13, fontWeight: 'bold' },
  pesquisaContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  inputPesquisa: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 42, backgroundColor: '#FFF' },
  btnBuscar: { backgroundColor: '#192A6B', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 8, height: 42 },
  grupoFiltros: { flexDirection: 'row', gap: 8, marginBottom: 25 },
  
  // Botões inativos em tom intermediário (equilibrado: nem muito claro, nem forte como o ativo)
  btnFiltro: { 
    flex: 1, 
    height: 38, 
    backgroundColor: '#F97316', 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    opacity: 0.75,
  },
  // Botão ativo com o laranja forte padrão totalmente opaco
  btnFiltroAtivo: { 
    backgroundColor: '#F28C00', 
    opacity: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },

  txtFiltro: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  cabecalhoTabela: { flexDirection: 'row', backgroundColor: '#192A6B', paddingVertical: 12, paddingHorizontal: 5, borderRadius: 6, marginBottom: 5 },
  celulaCabecalho: { flex: 1, color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  linhaTabela: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 5, borderBottomWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#FFF' },
  celula: { flex: 1, fontSize: 12, textAlign: 'center', color: '#374151' },
  btnAcaoTabela: { 
    flex: 1.2,
    backgroundColor: '#192A6B', 
    height: 32,
    borderRadius: 6, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtBtnAcao: { 
    color: '#FFF', 
    fontSize: 11,
    fontWeight: 'bold', 
    textAlign: 'center',
    width: '100%',
  },
  containerModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  conteudoModal: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, alignItems: 'center', width: '80%' },
  tituloModal: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#192A6B' },
  imagemModal: { width: 200, height: 200, borderRadius: 8, marginBottom: 15 },
  btnFecharModal: { backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
});