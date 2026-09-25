import unicodedata
import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from templates.rotasAPI.home import checar_bloqueio

movimento_bp = Blueprint('movimento_bp', __name__)

def padronizar_texto(texto):
    if not texto:
        return ""
    nfkd = unicodedata.normalize('NFKD', texto)
    limpo = "".join([c for c in nfkd if not unicodedata.combining(c)]).strip().lower()
    return limpo.capitalize()

def registrar_log(usuario, acao, detalhe):
    from app import mysql
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
        "INSERT INTO historico_logs (usuario, acao, detalhe) VALUES (%s, %s, %s)",
        (usuario, acao, detalhe)
    )
    mysql.connection.commit()

def gerar_proximo_id(cursor, area_uso):
    faixas = {'Geral': 1, 'Mecanica': 10001, 'Eletrica': 20001}
    inicio_faixa = faixas.get(area_uso, 1)
    fim_faixa = inicio_faixa + 10000

    # Busca todos os IDs atualmente cadastrados na faixa da área
    cursor.execute("""
        SELECT id FROM estoque 
        WHERE id >= %s AND id < %s 
        ORDER BY id ASC
    """, (inicio_faixa, fim_faixa))
    
    resultados = cursor.fetchall()
    # Armazena os IDs existentes em um conjunto para busca rápida
    ids_existentes = {int(row['id']) for row in resultados}

    # Procura o menor ID disponível (reaproveita buracos deixados por exclusões)
    proximo_id = inicio_faixa
    while proximo_id in ids_existentes:
        proximo_id += 1

    return proximo_id

@movimento_bp.route('/movimento', methods=['GET', 'POST'])
def movimento():
    from app import mysql
    
    if 'logged_in' not in session or not checar_bloqueio():
        return redirect(url_for('login_bp.login'))
        
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    if request.method == 'POST':
        tipo = request.form.get('acao_tipo')
        
        # INSERÇÃO OU ALTERAÇÃO PELO NOME DO PRODUTO
        if tipo == 'inserir':
            produto = padronizar_texto(request.form.get('produto'))
            area = request.form.get('area_uso')
            tipo_mov = request.form.get('tipo_movimentacao', 'entrada') # Entrada ou Saida
            
            try:
                qtd_input = abs(int(request.form.get('quantidade', 0))) # Impede valores negativos
            except ValueError:
                qtd_input = 0
                
            try:
                preco_input = float(str(request.form.get('preco', 0)).replace(',', '.'))
            except ValueError:
                preco_input = 0.0
                
            desc_input = padronizar_texto(request.form.get('descricao', ''))
            img_input = request.form.get('link_imagem', '').strip()

            # Busca se o produto já existe pelo nome
            cursor.execute("SELECT * FROM estoque WHERE LOWER(produto) = LOWER(%s)", (produto,))
            item_existente = cursor.fetchone()

            if item_existente:
                # Produto já existe: atualiza a quantidade e metadados se alterados
                qtd_atual = item_existente['quantidade']
                if tipo_mov == 'saida':
                    nova_qtd = max(0, qtd_atual - qtd_input)
                else:
                    nova_qtd = qtd_atual + qtd_input

                # Atualiza campos se novos valores válidos foram informados
                novo_preco = preco_input if preco_input > 0 and preco_input != item_existente['preco'] else item_existente['preco']
                nova_desc = desc_input if desc_input and desc_input != item_existente['descricao'] else item_existente['descricao']
                nova_img = img_input if img_input and img_input != item_existente['link_imagem'] else item_existente['link_imagem']

                cursor.execute("""
                    UPDATE estoque 
                    SET quantidade = %s, preco = %s, descricao = %s, link_imagem = %s
                    WHERE id = %s
                """, (nova_qtd, novo_preco, nova_desc, nova_img, item_existente['id']))

                # =========================================================
                # ALTERAÇÃO REALIZADA AQUI (Substituição da Opção 2)
                # =========================================================
                acao_log = 'Saída' if tipo_mov == 'saida' else 'Entrada'
                
                registrar_log(
                    session['usuario'], 
                    f"Movimentação ({acao_log})", 
                    f"Item '{produto}' (ID: {item_existente['id']}) - Qtd: {qtd_atual} -> {nova_qtd}"
                )
                
                flash(f"Sucesso: {acao_log} de estoque registrada para o item '{produto}'!", "success")
                # =========================================================

            else:
                # Produto não existe: cadastra novo item (impede saída se não existir)
                if tipo_mov == 'saida':
                    flash(f"Erro: O produto '{produto}' não existe no estoque para registrar saída.", "error")
                    return redirect(url_for('movimento_bp.movimento'))

                novo_id = gerar_proximo_id(cursor, area)
                cursor.execute("""
                    INSERT INTO estoque (id, produto, area_uso, quantidade, preco, descricao, link_imagem)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (novo_id, produto, area, qtd_input, preco_input, desc_input, img_input if img_input else None))

                registrar_log(session['usuario'], 'Novo Cadastro', f"Item '{produto}' criado (ID: {novo_id}) com {qtd_input} unidades.")
                flash(f"Item '{produto}' cadastrado com o ID {novo_id}!", "success")

            mysql.connection.commit()
            return redirect(url_for('home_bp.home'))

        # EXCLUSÃO RESTRITA AO ADMINISTRADOR
        elif tipo == 'deletar':
            if not session.get('is_admin'):
                flash("Apenas administradores podem excluir itens do estoque!", "error")
                return redirect(url_for('movimento_bp.movimento'))

            id_item = request.form.get('id')
            cursor.execute("SELECT produto FROM estoque WHERE id = %s", (id_item,))
            item = cursor.fetchone()

            if item:
                cursor.execute("DELETE FROM estoque WHERE id = %s", (id_item,))
                registrar_log(session['usuario'], 'Exclusão Estoque', f"Excluiu '{item['produto']}' (ID: {id_item})")
                mysql.connection.commit()
                flash("Item removido do estoque!", "success")

            return redirect(url_for('home_bp.home'))

    cursor.execute("SELECT id, produto, quantidade FROM estoque ORDER BY id ASC")
    itens = cursor.fetchall()
    return render_template('rotasURL/movimento.html', itens=itens, is_admin=session.get('is_admin', False))

