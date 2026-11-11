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
  // --- ESTADOS DA TELA ---
  const [tipoMovimentacao, setTipoMovimentacao] = useState('entrada'); // Define se é 'entrada' ou 'saida'
  const [produto, setProduto] = useState('');           // Nome/identificador do item
  const [areaUso, setAreaUso] = useState('Geral');      // Área de uso do produto ('Geral', 'Mecanica', 'Eletrica')
  const [descricao, setDescricao] = useState('');       // Descrição ou observações do item
  const [quantidade, setQuantidade] = useState('1');    // Quantidade movimentada
  const [preco, setPreco] = useState('');               // Preço unitário do produto
  const [linkImagem, setLinkImagem] = useState('');     // Link opcional de imagem
  
  const [itemExcluir, setItemExcluir] = useState('');   // ID do item a ser excluído (área restrita para admin)
  
  const [carregando, setCarregando] = useState(false);              // Indicador de carregamento para salvar movimentação
  const [carregandoExclusao, setCarregandoExclusao] = useState(false); // Indicador de carregamento para exclusão
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);     // Controla a abertura do menu de perfil

  // Obtém parâmetros passados pela rota (com valores padrão caso estejam vazios)
  const usuarioLogado = route?.params?.usuario || 'andre';
  const isAdmin = route?.params?.isAdmin || true;

  // --- FUNÇÃO PARA SALVAR MOVIMENTAÇÃO (Entrada ou Saída / Inserção) ---
  const handleSalvarMovimento = async () => {
    // Validação: Garante que o nome do item foi preenchido
    if (!produto.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome do item.');
      return;
    }

    setCarregando(true);
    try {
      // Faz uma requisição POST para a rota /movimento do servidor Flask
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
          usuario: usuarioLogado
        })
      });

      const data = await response.json();

      // Verifica se a operação foi bem-sucedida
      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || 'Movimentação realizada!');
        // Retorna para a tela de Estoque (Home) atualizando os parâmetros
        navigation.navigate('Home', { usuario: usuarioLogado, isAdmin });
      } else {
        Alert.alert('Atenção', data.mensagem || 'Não foi possível salvar a movimentação.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  // --- FUNÇÃO PARA EXCLUIR ITEM DO ESTOQUE (Exclusiva para Administradores) ---
  const handleExcluirEstoque = async () => {
    // Validação: Garante que o ID do item foi informado
    if (!itemExcluir.trim()) {
      Alert.alert('Atenção', 'Informe o identificador ou ID do item a ser excluído.');
      return;
    }

    setCarregandoExclusao(true);
    try {
      // Faz uma requisição POST enviando a ação de deletar
      const response = await fetch(`${API_URL}/movimento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao_tipo: 'deletar',
          id: itemExcluir, // ID ou produto verificado pelo backend
          usuario: usuarioLogado
        })
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', data.mensagem || 'Registro excluído do estoque!');
        setItemExcluir(''); // Limpa o campo de exclusão
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
      
      {/* 1. CABEÇALHO AZUL PRINCIPAL */}
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoSenai}>SENAI</Text>
          <Text style={styles.logoSub}> Almoxarifado</Text>
        </View>
        
        {/* Botão de Perfil */}
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

      {/* Menu Dropdown de Perfil */}
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
        
        {/* 2. TÍTULO E SUBTÍTULO */}
        <Text style={styles.tituloPagina}>Movimentação de estoque</Text>
        <Text style={styles.subtituloPagina}>Registre entradas, saídas e alterações nos itens do estoque</Text>

        {/* 3. BARRA DE NAVEGAÇÃO ENTRE TELAS */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Home', { usuario: usuarioLogado, isAdmin })}>
            <Text style={styles.navTxt}>Estoque</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtnAtivo} onPress={() => navigation.navigate('Movimento', { usuario: usuarioLogado, isAdmin })}>
            <Text style={styles.navTxtAtivo}>Movimentação</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Admin', { usuario: usuarioLogado, isAdmin })}>
              <Text style={styles.navTxt}>Gerenciamento</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 4. CARD 1: FORMULÁRIO DE MOVIMENTAÇÃO */}
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

        {/* 5. CARD 2: DETALHES DE QUANTIDADE, PREÇO E BOTÕES DE AÇÃO */}
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
            <TouchableOpacity style={styles.btnCancelar} onPress={() => navigation.navigate('Home', { usuario: usuarioLogado, isAdmin })}>
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

        {/* 6. CARD 3: ÁREA EXCLUSIVA DE EXCLUSÃO (Se usuário for Administrador) */}
        {isAdmin && (
          <View style={styles.card}>
            <Text style={styles.labelExcluirTitulo}>Excluir Registro de Estoque (Apenas Admin)</Text>
            <Text style={styles.label}>Selecione ou Informe o ID do Item:</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite o ID do Item..." 
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

// --- ESTILIZAÇÃO DA TELA (CSS-in-JS via React Native StyleSheet) ---
const styles = StyleSheet.create({
  containerPrincipal: { flex: 1, backgroundColor: '#F4F6F9' },
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
  scrollContainer: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 40 },
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
