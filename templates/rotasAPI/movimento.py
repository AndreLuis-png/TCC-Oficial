import unicodedata
import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify

# Cria o Blueprint para as rotas de movimentação e controle de estoque
movimento_bp = Blueprint('movimento_bp', __name__)

def padronizar_texto(texto):
    """Remove acentos, padroniza para minúsculas e capitaliza a primeira letra do texto."""
    if not texto:
        return ""
    nfkd = unicodedata.normalize('NFKD', texto)
    limpo = "".join([c for c in nfkd if not unicodedata.combining(c)]).strip().lower()
    return limpo.capitalize()

def registrar_log(usuario, acao, detalhe):
    """Registra logs de auditoria no banco de dados com fuso horário de Brasília."""
    from datetime import datetime
    import zoneinfo
    from app import mysql
    
    try:
        fuso_brasilia = zoneinfo.ZoneInfo("America/Sao_Paulo")
        horario_brasilia = datetime.now(fuso_brasilia).strftime('%Y-%m-%d %H:%M:%S')

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            "INSERT INTO historico_logs (usuario, acao, detalhe, data_registro) VALUES (%s, %s, %s, %s)",
            (usuario, acao, detalhe, horario_brasilia)
        )
        mysql.connection.commit()
    except Exception as e:
        print(f"Erro ao registrar log: {e}")

def gerar_proximo_id(cursor, area_uso):
    """Gera um ID sequencial baseado na faixa numérica de cada área de uso."""
    faixas = {'Geral': 1, 'Mecanica': 10001, 'Eletrica': 20001}
    inicio_faixa = faixas.get(area_uso, 1)
    fim_faixa = inicio_faixa + 10000

    cursor.execute("""
        SELECT id FROM estoque 
        WHERE id >= %s AND id < %s 
        ORDER BY id ASC
    """, (inicio_faixa, fim_faixa))
    
    resultados = cursor.fetchall()
    ids_existentes = {int(row['id']) for row in resultados}

    proximo_id = inicio_faixa
    while proximo_id in ids_existentes:
        proximo_id += 1

    return proximo_id

@movimento_bp.route('/movimento', methods=['GET', 'POST'])
def movimento():
    """Gerencia entradas, saídas, cadastros e exclusões de itens do estoque."""
    from app import mysql
    
    if not request.is_json and ('logged_in' not in session or not session.get('is_admin')):
        return redirect(url_for('login_bp.login'))
        
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    if request.method == 'POST':
        # Captura os dados dependendo se a requisição veio via JSON (API) ou Formulário Web
        if request.is_json:
            data = request.get_json() or {}
            tipo = data.get('acao_tipo')
            produto = padronizar_texto(data.get('produto'))
            area = data.get('area_uso', 'Geral')
            tipo_mov = data.get('tipo_movimentacao', 'entrada')
            
            try:
                qtd_input = abs(int(data.get('quantidade', 1)))
            except (ValueError, TypeError):
                qtd_input = 1
                
            preco_val = data.get('preco')
            try:
                preco_input = float(preco_val) if preco_val is not None and str(preco_val).strip() != '' else 0.0
            except (ValueError, TypeError):
                preco_input = 0.0

            desc_input = padronizar_texto(data.get('descricao', ''))
            img_input = str(data.get('link_imagem', '')).strip()
            usuario_atual = data.get('usuario', 'AppMobile')
        else:
            tipo = request.form.get('acao_tipo')
            produto = padronizar_texto(request.form.get('produto'))
            area = request.form.get('area_uso')
            tipo_mov = request.form.get('tipo_movimentacao', 'entrada')
            
            try:
                qtd_input = abs(int(request.form.get('quantidade', 1)))
            except (ValueError, TypeError):
                qtd_input = 1
                
            preco_str = str(request.form.get('preco', '0')).replace(',', '.')
            try:
                preco_input = float(preco_str) if preco_str.strip() != '' else 0.0
            except (ValueError, TypeError):
                preco_input = 0.0

            desc_input = padronizar_texto(request.form.get('descricao', ''))
            img_input = request.form.get('link_imagem', '').strip()
            usuario_atual = session.get('usuario', 'Anônimo')

        # Ação para Inserir / Atualizar / Registrar Entrada ou Saída
        if tipo == 'inserir':
            cursor.execute("SELECT * FROM estoque WHERE LOWER(produto) = LOWER(%s)", (produto,))
            item_existente = cursor.fetchone()

            if item_existente:
                qtd_atual = item_existente['quantidade']
                nova_qtd = max(0, qtd_atual - qtd_input) if tipo_mov == 'saida' else qtd_atual + qtd_input

                novo_preco = preco_input if preco_input > 0 else float(item_existente['preco'])
                nova_desc = desc_input if desc_input else item_existente['descricao']
                nova_img = img_input if img_input else item_existente['link_imagem']

                cursor.execute("""
                    UPDATE estoque 
                    SET quantidade = %s, preco = %s, descricao = %s, link_imagem = %s
                    WHERE id = %s
                """, (nova_qtd, novo_preco, nova_desc, nova_img, item_existente['id']))

                mysql.connection.commit()
                acao_log = 'Saída' if tipo_mov == 'saida' else 'Entrada'
                
                registrar_log(usuario_atual, f"Movimentação ({acao_log})", f"Item '{produto}' (ID: {item_existente['id']}) - Qtd: {qtd_input}")

                if request.is_json:
                    return jsonify({"sucesso": True, "mensagem": f"Movimentação de {acao_log} salva!"}), 200

            else:
                if tipo_mov == 'saida':
                    if request.is_json:
                        return jsonify({"sucesso": False, "mensagem": f"O produto '{produto}' não existe para dar saída."}), 400
                    flash(f"Erro: O produto '{produto}' não existe no estoque para registrar saída.", "error")
                    return redirect(url_for('movimento_bp.movimento'))

                novo_id = gerar_proximo_id(cursor, area)
                cursor.execute("""
                    INSERT INTO estoque (id, produto, area_uso, quantidade, preco, descricao, link_imagem)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (novo_id, produto, area, qtd_input, preco_input, desc_input, img_input if img_input else None))

                mysql.connection.commit()
                
                registrar_log(usuario_atual, 'Novo Cadastro de Item', f"Item '{produto}' criado (ID: {novo_id}) com {qtd_input} unidades.")

                if request.is_json:
                    return jsonify({"sucesso": True, "mensagem": f"Item '{produto}' cadastrado com ID {novo_id}!"}), 201

            return redirect(url_for('home_bp.home'))

        # Ação para Deletar Item
        elif tipo == 'deletar':
            identificador = data.get('id') or data.get('produto') if request.is_json else request.form.get('id') or request.form.get('produto')
            
            if not identificador:
                if request.is_json:
                    return jsonify({"sucesso": False, "mensagem": "Identificador do item não informado."}), 400
                flash("Erro: Nenhum item foi selecionado para exclusão.", "error")
                return redirect(url_for('movimento_bp.movimento'))

            cursor.execute("SELECT * FROM estoque WHERE id = %s OR LOWER(produto) = LOWER(%s)", (identificador, identificador))
            item_alvo = cursor.fetchone()

            if item_alvo:
                cursor.execute("DELETE FROM estoque WHERE id = %s", (item_alvo['id'],))
                mysql.connection.commit()
                
                registrar_log(usuario_atual, 'Exclusão de Item', f"Removeu o item '{item_alvo['produto']}' (ID: {item_alvo['id']}) do estoque.")

                if request.is_json:
                    return jsonify({"sucesso": True, "mensagem": f"Item '{item_alvo['produto']}' excluído com sucesso!"}), 200
                
                flash(f"Item '{item_alvo['produto']}' excluído com sucesso!", "success")
            else:
                if request.is_json:
                    return jsonify({"sucesso": False, "mensagem": "Item não encontrado no estoque."}), 404
                flash("Erro: Item não encontrado no estoque.", "error")

            return redirect(url_for('movimento_bp.movimento'))
        
    cursor.execute("SELECT id, produto, quantidade FROM estoque ORDER BY id ASC")
    itens = cursor.fetchall()

    if request.is_json:
        return jsonify({"sucesso": True, "itens": itens}), 200

    return render_template('rotasURL/movimento.html', itens=itens, is_admin=session.get('is_admin', False))
