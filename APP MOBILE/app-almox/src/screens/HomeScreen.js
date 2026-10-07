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
import { API_URL } from '../services/api';

export default function HomeScreen({ navigation, route }) {
  const [pesquisa, setPesquisa] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Todos');
  const [imagemModal, setImagemModal] = useState(null);
  const [estoque, setEstoque] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const isAdmin = route?.params?.isAdmin || false;

  const buscarEstoque = async (categoria = 'Todos', termo = '') => {
    setCarregando(true);
    try {
      let url = `${API_URL}/api/estoque?pesquisa=${encodeURIComponent(termo)}`;
      if (categoria !== 'Todos') {
        url = `${API_URL}/home/${categoria}?pesquisa=${encodeURIComponent(termo)}`;
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

  const renderItem = ({ item }) => (
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
        <Text style={styles.txtBtnAcao}>{item.link_imagem ? 'Ver' : 'S/ Img'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Menu Superior Simulado */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtnAtivo} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navTxtAtivo}>Estoque</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Movimento')}>
          <Text style={styles.navTxt}>Movimento</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Admin')}>
            <Text style={styles.navTxt}>Admin</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.navTxt}>Sair</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tituloPagina}>Estoque</Text>

      <View style={styles.pesquisaContainer}>
        <TextInput
          style={styles.inputPesquisa}
          placeholder="Pesquise por produto ou ID..."
          value={pesquisa}
          onChangeText={setPesquisa}
        />
        <TouchableOpacity style={styles.btnBuscar} onPress={() => buscarEstoque(categoriaSel, pesquisa)}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Botões de Filtro */}
      <View style={styles.grupoFiltros}>
        {['Todos', 'Geral', 'Mecanica', 'Eletrica'].map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.btnFiltro, categoriaSel === cat && styles.btnFiltroAtivo]}
            onPress={() => setCategoriaSel(cat)}
          >
            <Text style={categoriaSel === cat ? styles.txtFiltroAtivo : styles.txtFiltro}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tabela de Estoque */}
      <View style={styles.cabecalhoTabela}>
        <Text style={[styles.celulaCabecalho, { flex: 0.8 }]}>ID</Text>
        <Text style={[styles.celulaCabecalho, { flex: 2 }]}>Produto</Text>
        <Text style={styles.celulaCabecalho}>Área</Text>
        <Text style={styles.celulaCabecalho}>Qtd</Text>
        <Text style={styles.celulaCabecalho}>Preço</Text>
        <Text style={styles.celulaCabecalho}>Foto</Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#192A6B" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={estoque}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
        />
      )}

      {/* Modal Nativo de Imagem */}
      <Modal visible={!!imagemModal} transparent animationType="fade">
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
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 15 },
  navBar: { flexDirection: 'row', backgroundColor: '#192A6B', borderRadius: 8, marginBottom: 15, padding: 5 },
  navBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  navBtnAtivo: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#0284C7', borderRadius: 6 },
  navTxt: { color: '#FFF', fontSize: 11 },
  navTxtAtivo: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  tituloPagina: { fontSize: 24, fontWeight: 'bold', color: '#192A6B', marginBottom: 10 },
  pesquisaContainer: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  inputPesquisa: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, backgroundColor: '#FFF' },
  btnBuscar: { backgroundColor: '#192A6B', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 8 },
  grupoFiltros: { flexDirection: 'row', gap: 5, marginBottom: 15 },
  btnFiltro: { flex: 1, paddingVertical: 8, backgroundColor: '#E5E7EB', borderRadius: 6, alignItems: 'center' },
  btnFiltroAtivo: { backgroundColor: '#192A6B' },
  txtFiltro: { color: '#374151', fontSize: 12 },
  txtFiltroAtivo: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  cabecalhoTabela: { flexDirection: 'row', backgroundColor: '#192A6B', padding: 10, borderRadius: 6 },
  celulaCabecalho: { flex: 1, color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  linhaTabela: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  celula: { flex: 1, fontSize: 11, textAlign: 'center', color: '#374151' },
  btnAcaoTabela: { flex: 1, backgroundColor: '#0284C7', paddingVertical: 4, borderRadius: 4, alignItems: 'center' },
  txtBtnAcao: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  containerModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  conteudoModal: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, alignItems: 'center', width: '80%' },
  tituloModal: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#192A6B' },
  imagemModal: { width: 200, height: 200, borderRadius: 8, marginBottom: 15 },
  btnFecharModal: { backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
});