import unicodedata
import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
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
    from app import mysql
    
    # Verificação para Web
    if not request.is_json and ('logged_in' not in session or not checar_bloqueio()):
        return redirect(url_for('login_bp.login'))
        
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json() or {}
            tipo = data.get('acao_tipo')
            produto = padronizar_texto(data.get('produto'))
            area = data.get('area_uso', 'Geral')
            tipo_mov = data.get('tipo_movimentacao', 'entrada')
            qtd_input = abs(int(data.get('quantidade', 0)))
            preco_input = float(data.get('preco', 0))
            desc_input = padronizar_texto(data.get('descricao', ''))
            img_input = str(data.get('link_imagem', '')).strip()
            usuario_atual = data.get('usuario', 'AppMobile')
        else:
            tipo = request.form.get('acao_tipo')
            produto = padronizar_texto(request.form.get('produto'))
            area = request.form.get('area_uso')
            tipo_mov = request.form.get('tipo_movimentacao', 'entrada')
            qtd_input = abs(int(request.form.get('quantidade', 0)))
            preco_input = float(str(request.form.get('preco', 0)).replace(',', '.'))
            desc_input = padronizar_texto(request.form.get('descricao', ''))
            img_input = request.form.get('link_imagem', '').strip()
            usuario_atual = session.get('usuario', 'Anônimo')

        # Inserção / Entrada / Saída
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
                registrar_log(usuario_atual, f"Movimentação ({acao_log})", f"Item '{produto}' (ID: {item_existente['id']})")

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
                registrar_log(usuario_atual, 'Novo Cadastro', f"Item '{produto}' criado (ID: {novo_id}) com {qtd_input} unidades.")

                if request.is_json:
                    return jsonify({"sucesso": True, "mensagem": f"Item '{produto}' cadastrado com ID {novo_id}!"}), 201

            return redirect(url_for('home_bp.home'))

    cursor.execute("SELECT id, produto, quantidade FROM estoque ORDER BY id ASC")
    itens = cursor.fetchall()

    if request.is_json:
        return jsonify({"sucesso": True, "itens": itens}), 200

    return render_template('rotasURL/movimento.html', itens=itens, is_admin=session.get('is_admin', False))