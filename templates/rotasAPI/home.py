import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify

# Cria o Blueprint para as rotas da página inicial e estoque
home_bp = Blueprint('home_bp', __name__)

def checar_bloqueio():
    """Verifica se o usuário logado continua com status 'ativo' no banco de dados."""
    from app import mysql
    if 'logged_in' in session and session.get('usuario'):
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT status FROM usuarios WHERE login = %s", (session['usuario'],))
        usr = cursor.fetchone()
        if usr and usr.get('status') != 'ativo':
            session.clear()
            flash("Sua conta encontra-se suspensa/bloqueada.", "error")
            return False
    return True

@home_bp.route('/api/estoque', methods=['GET'])
@home_bp.route('/home', methods=['GET'])
@home_bp.route('/home/<categoria>', methods=['GET'])
def home(categoria='Todos'):
    """Exibe o estoque de produtos, suportando filtros por categoria, termos de pesquisa e requisições via API."""
    from app import mysql
    
    # 1. LEITURA OBRIGATÓRIA DA QUERY STRING PARA O APP MOBILE (?categoria=...)
    categoria_query = request.args.get('categoria')
    if categoria_query:
        categoria = categoria_query

    # Se não for API, valida se o usuário está logado e se a conta está ativa
    if not request.is_json and not request.path.startswith('/api/'):
        if 'logged_in' not in session or not checar_bloqueio():
            return redirect(url_for('login_bp.login'))
        
    termo = request.args.get('pesquisa', '').strip()
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    # Montagem da consulta SQL base (com ID formatado em 5 dígitos usando LPAD)
    query = "SELECT LPAD(id, 5, '0') AS id, produto, area_uso, quantidade, preco, descricao, link_imagem FROM estoque WHERE 1=1"
    params = []
    
    # Aplica filtro por categoria se não for 'Todos'
    if categoria != 'Todos':
        query += " AND area_uso = %s"
        params.append(categoria)
        
    # Aplica filtro de pesquisa por nome ou ID
    if termo:
        query += " AND (produto LIKE %s OR id LIKE %s)"
        params.append('%' + termo + '%')
        params.append('%' + termo + '%')
        
    query += " ORDER BY id ASC"
        
    cursor.execute(query, tuple(params))
    itens = cursor.fetchall()

    # Converte os preços para float para evitar erros de formatação
    for item in itens:
        item['preco'] = float(item['preco']) if item['preco'] is not None else 0.0

    # Retorna em formato JSON se for requisição de API
    if request.is_json or request.path.startswith('/api/'):
        return jsonify({"sucesso": True, "estoque": itens}), 200

    # Renderiza a página web tradicional enviando os dados do estoque
    return render_template(
        'rotasURL/home.html', 
        estoque=itens, 
        categoria_atual=categoria, 
        termo_pesquisa=termo,
        is_admin=session.get('is_admin', False)
    )

@home_bp.route('/segredinho', methods=['GET'])
def segredinho():
    """Rota protegida que redireciona para uma página HTML estática especial."""
    if 'logged_in' not in session or not checar_bloqueio():
        return redirect(url_for('login_bp.login'))
    
    return redirect(url_for('static', filename='Cantinho do castigo/segredinho.html'))
