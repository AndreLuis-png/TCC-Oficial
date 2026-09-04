import unicodedata
import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from rotasAPI.home import checar_bloqueio

movimento_bp = Blueprint('movimento_bp', __name__)

def padronizar_texto(texto):
    if not texto:
        return ""
    nfkd = unicodedata.normalize('NFKD', texto)
    limpo = "".join([c for c in nfkd if not unicodedata.combining(c)]).strip().lower()
    return limpo.capitalize()

def gerar_proximo_id(area_uso):
    from app import mysql
    prefixos = {'Geral': '0', 'Mecanica': '1', 'Eletrica': '2'}
    prefixo = prefixos.get(area_uso, '0')
    
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT id FROM estoque WHERE id LIKE %s ORDER BY id ASC", (prefixo + '%',))
    
    ids_existentes = set()
    for row in cursor.fetchall():
        try:
            ids_existentes.add(int(row['id']))
        except ValueError:
            continue
    
    proximo = int(prefixo + "0001")
    while proximo in ids_existentes:
        proximo += 1
        
    return f"{proximo:05d}"

def registrar_log(usuario, acao, detalhe):
    from app import mysql
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(
        "INSERT INTO historico_logs (usuario, acao, detalhe) VALUES (%s, %s, %s)",
        (usuario, acao, detalhe)
    )
    mysql.connection.commit()

@movimento_bp.route('/movimento', methods=['GET', 'POST'])
def movimento():
    from app import mysql
    
    if 'logged_in' not in session or not checar_bloqueio():
        return redirect(url_for('login_bp.login'))
        
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    if request.method == 'POST':
        tipo = request.form.get('acao_tipo')
        
        if tipo == 'inserir':
            produto = padronizar_texto(request.form.get('produto'))
            area = request.form.get('area_uso')
            try:
                qtd = int(request.form.get('quantidade', 0))
            except ValueError:
                qtd = 0
            try:
                preco = float(str(request.form.get('preco', 0)).replace(',', '.'))
            except ValueError:
                preco = 0.0
                
            desc = padronizar_texto(request.form.get('descricao', ''))
            img = request.form.get('link_imagem', '').strip()
            novo_id = gerar_proximo_id(area)
            
            cursor.execute("""
                INSERT INTO estoque (id, produto, area_uso, quantidade, preco, descricao, link_imagem)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (novo_id, produto, area, qtd, preco, desc, img if img else None))
            
            registrar_log(session['usuario'], 'Inserção', f"Item: {produto} (ID: {novo_id}) em {area}")
            mysql.connection.commit()
            flash(f"Item '{produto}' adicionado com o ID {novo_id}!", "success")
            
        elif tipo == 'alterar_qtd':
            id_item = request.form.get('id')
            operacao = request.form.get('operacao')
            try:
                qtd = int(request.form.get('quantidade', 0))
            except ValueError:
                qtd = 0
                
            cursor.execute("SELECT * FROM estoque WHERE id = %s", (id_item,))
            item = cursor.fetchone()
            
            if item:
                nova_qtd = item['quantidade'] + qtd if operacao == 'adicionar' else max(0, item['quantidade'] - qtd)
                cursor.execute("UPDATE estoque SET quantidade = %s WHERE id = %s", (nova_qtd, id_item))
                registrar_log(session['usuario'], 'Movimentação Qtd', f"ID {id_item}: de {item['quantidade']} para {nova_qtd}")
                mysql.connection.commit()
                flash("Quantidade atualizada!", "success")
                
        elif tipo == 'deletar':
            id_item = request.form.get('id')
            cursor.execute("SELECT produto FROM estoque WHERE id = %s", (id_item,))
            item = cursor.fetchone()
            
            if item:
                cursor.execute("DELETE FROM estoque WHERE id = %s", (id_item,))
                registrar_log(session['usuario'], 'Exclusão Item', f"ID {id_item}")
                mysql.connection.commit()
                flash("Item excluído!", "success")
                
        return redirect(url_for('home_bp.home'))

    cursor.execute("SELECT id, produto, quantidade FROM estoque ORDER BY id ASC")
    itens = cursor.fetchall()
    return render_template('rotasURL/movimento.html', itens=itens)