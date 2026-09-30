/*--Página Home*/ 

import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  Image 
} from 'react-native';

export default function HomeScreen() {
  const [pesquisa, setPesquisa] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Todos');
  const [imagemModal, setImagemModal] = useState(null);

  // Exemplo de lista de produtos do estoque
  const estoque = [
    { id: '1', produto: 'Alicate', area_uso: 'Geral', quantidade: 10, preco: '20.00', descricao: 'Alicate universal', link_imagem: 'https://via.placeholder.com/150' },
    { id: '2', produto: 'Chave philips', area_uso: 'Geral', quantidade: 7, preco: '10.00', descricao: 'Chave de fenda em X', link_imagem: null }
  ];

  const renderItem = ({ item }) => (
    <View style={styles.linhaTabela}>
      <Text style={[styles.celula, { flex: 0.8 }]}>{item.id}</Text>
      <Text style={[styles.celula, { flex: 2, fontWeight: 'bold' }]}>{item.produto}</Text>
      <Text style={styles.celula}>{item.area_uso}</Text>
      <Text style={styles.celula}>{item.quantidade}</Text>
      <Text style={styles.celula}>R$ {item.preco}</Text>
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
      <Text style={styles.tituloPagina}>Estoque</Text>
      <Text style={styles.subtituloPagina}>Lista de todos os itens cadastrados</Text>

      {/* Caixa de Pesquisa */}
      <TextInput
        style={styles.inputPesquisa}
        placeholder="Pesquise..."
        value={pesquisa}
        onChangeText={setPesquisa}
      />

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

      <FlatList
        data={estoque}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

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
  tituloPagina: { fontSize: 24, fontWeight: 'bold', color: '#192A6B' },
  subtituloPagina: { fontSize: 13, color: '#6B7280', marginBottom: 15 },
  inputPesquisa: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, backgroundColor: '#FFF', marginBottom: 10 },
  grupoFiltros: { flexDirection: 'row', gap: 5, marginBottom: 15 },
  btnFiltro: { flex: 1, paddingVertical: 8, backgroundColor: '#E5E7EB', borderRadius: 6, alignItems: 'center' },
  btnFiltroAtivo: { backgroundColor: '#192A6B' },
  txtFiltro: { color: '#374151', fontSize: 12 },
  txtFiltroAtivo: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  cabecalhoTabela: { flexDirection: 'row', backgroundColor: '#192A6B', padding: 10, borderRadius: 6 },
  celulaCabecalho: { flex: 1, color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  linhaTabela: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  celula: { flex: 1, fontSize: 12, textAlign: 'center', color: '#374151' },
  btnAcaoTabela: { flex: 1, backgroundColor: '#0284C7', paddingVertical: 4, borderRadius: 4, alignItems: 'center' },
  txtBtnAcao: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  containerModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  conteudoModal: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, alignItems: 'center', width: '80%' },
  tituloModal: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#192A6B' },
  imagemModal: { width: 200, height: 200, borderRadius: 8, marginBottom: 15 },
  btnFecharModal: { backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
});