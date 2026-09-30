/*--Página de Movimentação--*/
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';

export default function MovimentoScreen({ navigation }) {
  const [tipoMovimentacao, setTipoMovimentacao] = useState('entrada');
  const [produto, setProduto] = useState('');
  const [areaUso, setAreaUso] = useState('Geral');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [preco, setPreco] = useState('');
  const [linkImagem, setLinkImagem] = useState('');

  const handleSalvar = () => {
    if (!produto) {
      Alert.alert('Erro', 'Por favor, informe o nome do item.');
      return;
    }
    Alert.alert('Sucesso', 'Movimentação registrada com sucesso!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Movimentação de estoque</Text>
      <Text style={styles.subtitle}>Registre entradas, saídas e alterações nos itens do estoque</Text>

      {/* Painel 1: Identificação */}
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

        <Text style={styles.label}>Descrição</Text>
        <TextInput 
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]} 
          multiline 
          placeholder="Observações do item..." 
          value={descricao} 
          onChangeText={setDescricao} 
        />
      </View>

      {/* Painel 2: Quantidades e Preço */}
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
          <TouchableOpacity style={styles.btnCancelar} onPress={() => navigation.goBack()}>
            <Text style={styles.txtCancelar}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnConfirmar} onPress={handleSalvar}>
            <Text style={styles.txtConfirmar}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#192A6B' },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 8, backgroundColor: '#FFF' },
  pickerSimulado: { flexDirection: 'row', gap: 5, marginBottom: 5 },
  btnOpcao: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, alignItems: 'center' },
  btnAtivo: { backgroundColor: '#192A6B', borderColor: '#192A6B' },
  txtAtivo: { color: '#FFF', fontWeight: 'bold' },
  txtInativo: { color: '#374151' },
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 15 },
  btnCancelar: { flex: 1, padding: 12, backgroundColor: '#E5E7EB', borderRadius: 6, alignItems: 'center' },
  txtCancelar: { color: '#374151', fontWeight: 'bold' },
  btnConfirmar: { flex: 1, padding: 12, backgroundColor: '#10B981', borderRadius: 6, alignItems: 'center' },
  txtConfirmar: { color: '#FFF', fontWeight: 'bold' },
});