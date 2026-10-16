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

export default function MovimentoScreen({ navigation, route }) {
  const [tipoMovimentacao, setTipoMovimentacao] = useState('entrada');
  const [produto, setProduto] = useState('');
  const [areaUso, setAreaUso] = useState('Geral');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [preco, setPreco] = useState('');
  const [linkImagem, setLinkImagem] = useState('');
  
  // Estados para a exclusão de registro
  const [itemExcluir, setItemExcluir] = useState('');
  
  const [carregando, setCarregando] = useState(false);
  const [carregandoExclusao, setCarregandoExclusao] = useState(false);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);

  const usuarioLogado = route?.params?.usuario || 'andre';
  const isAdmin = route?.params?.isAdmin || true;

  const handleSalvarMovimento = async () => {
    if (!produto.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do item.');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/movimento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao_tipo: 'inserir',
          produto: produto,
          area_uso: areaUso,
          tipo_movimentacao: tipoMovimentacao,
          quantidade: quantidade,
          preco: preco || 0,
          descricao: descricao,
          link_imagem: linkImagem,
          usuario: usuarioLogado // Envia o operador logado para registrar no log do servidor
        })
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || 'Movimentação realizada!');
        navigation.navigate('Home');
      } else {
        Alert.alert('Atenção', data.mensagem || 'Não foi possível salvar a movimentação.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirEstoque = async () => {
    if (!itemExcluir.trim()) {
      Alert.alert('Atenção', 'Informe o identificador ou ID do item a ser excluído.');
      return;
    }

    setCarregandoExclusao(true);
    try {
      const response = await fetch(`${API_URL}/movimento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao_tipo: 'deletar',
          produto: itemExcluir,
          usuario: usuarioLogado // Envia o operador logado para registrar no log
        })
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || 'Registro excluído do estoque!');
        setItemExcluir('');
      } else {
        Alert.alert('Erro', data.mensagem || 'Falha ao excluir registro.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregandoExclusao(false);
    }
  };

  return (
    <View style={styles.containerPrincipal}>
      
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

      {/* Conteúdo com Scroll */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* 2. TÍTULO E SUBTÍTULO LARANJA */}
        <Text style={styles.tituloPagina}>Movimentação de estoque</Text>
        <Text style={styles.subtituloPagina}>Registre entradas, saídas e alterações nos itens do estoque</Text>

        {/* 3. NAV BAR SUPERIOR */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.navTxt}>Estoque</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtnAtivo} onPress={() => navigation.navigate('Movimento')}>
            <Text style={styles.navTxtAtivo}>Movimentação</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Admin')}>
              <Text style={styles.navTxt}>Gerenciamento</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. PAINEL 1: DADOS DA MOVIMENTAÇÃO */}
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de Movimentação</Text>
          <View style={styles.pickerSimulado}>
            <TouchableOpacity 
              style={[styles.btnOpcao, tipoMovimentacao === 'entrada' && styles.btnAtivo]} 
              onPress={() => setTipoMovimentacao('entrada')}
            >
              <Text style={tipoMovimentacao === 'entrada' ? styles.txtAtivo : styles.txtInativo}>Entrada (+)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btnOpcao, tipoMovimentacao === 'saida' && styles.btnAtivo]} 
              onPress={() => setTipoMovimentacao('saida')}
            >
              <Text style={tipoMovimentacao === 'saida' ? styles.txtAtivo : styles.txtInativo}>Saída (-)</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nome do Item (Identificador)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Chave de fenda" 
            value={produto} 
            onChangeText={setProduto} 
          />

          <Text style={styles.label}>Área de Uso</Text>
          <View style={styles.pickerSimulado}>
            {['Geral', 'Mecanica', 'Eletrica'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.btnOpcao, areaUso === item && styles.btnAtivo]} 
                onPress={() => setAreaUso(item)}
              >
                <Text style={areaUso === item ? styles.txtAtivo : styles.txtInativo}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Descrição (Atualizará apenas se alterada)</Text>
          <TextInput 
            style={[styles.input, { height: 70, textAlignVertical: 'top' }]} 
            multiline 
            placeholder="Observações do item..." 
            value={descricao} 
            onChangeText={setDescricao} 
          />
        </View>

        {/* 5. PAINEL 2: QUANTIDADE, PREÇO E BOTÕES */}
        <View style={styles.card}>
          <Text style={styles.label}>Quantidade</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric" 
            value={quantidade} 
            onChangeText={setQuantidade} 
          />

          <Text style={styles.label}>Preço Unitário (R$)</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="decimal-pad" 
            placeholder="0.00" 
            value={preco} 
            onChangeText={setPreco} 
          />

          <Text style={styles.label}>Link da Imagem (Opcional)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="https://..." 
            value={linkImagem} 
            onChangeText={setLinkImagem} 
          />

          <View style={styles.botoesContainer}>
            <TouchableOpacity style={styles.btnCancelar} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.txtCancelar}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnConfirmar} 
              onPress={handleSalvarMovimento}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.txtConfirmar}>Confirmar Movimentação</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. PAINEL 3: EXCLUIR REGISTRO (Disponível para Admin) */}
        {isAdmin && (
          <View style={styles.card}>
            <Text style={styles.labelExcluirTitulo}>Excluir Registro de Estoque (Apenas Admin)</Text>
            <Text style={styles.label}>Selecione ou Informe o Item para Excluir:</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o ID ou Nome do Item..." 
              value={itemExcluir} 
              onChangeText={setItemExcluir} 
            />

            <TouchableOpacity 
              style={styles.btnExcluir} 
              onPress={handleExcluirEstoque}
              disabled={carregandoExclusao}
            >
              {carregandoExclusao ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.txtExcluir}>Excluir do Estoque</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerPrincipal: { 
    flex: 1, 
    backgroundColor: '#F4F6F9' 
  },
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
  scrollContainer: { 
    paddingHorizontal: 15, 
    paddingTop: 20, 
    paddingBottom: 40 
  },
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
  label: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 5 },
  labelExcluirTitulo: { fontSize: 13, fontWeight: 'bold', color: '#EF4444', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#FFF', fontSize: 13 },
  pickerSimulado: { flexDirection: 'row', gap: 6, marginBottom: 5 },
  btnOpcao: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, alignItems: 'center', backgroundColor: '#FFF' },
  btnAtivo: { backgroundColor: '#192A6B', borderColor: '#192A6B' },
  txtAtivo: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  txtInativo: { color: '#374151', fontSize: 11 },
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnCancelar: { flex: 1, padding: 12, backgroundColor: '#D1D5DB', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  txtCancelar: { color: '#374151', fontWeight: 'bold', fontSize: 13 },
  btnConfirmar: { flex: 1.5, padding: 12, backgroundColor: '#F28C00', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  txtConfirmar: { color: '#FFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  btnExcluir: { backgroundColor: '#EF4444', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  txtExcluir: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});