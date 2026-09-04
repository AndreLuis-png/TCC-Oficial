import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash

home_bp = Blueprint('home_bp', __name__)

def checar_bloqueio():
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

@home_bp.route('/home', methods=['GET'])
@home_bp.route('/home/<categoria>', methods=['GET'])
def home(categoria='Todos'):
    from app import mysql
    
    if 'logged_in' not in session or not checar_bloqueio():
        return redirect(url_for('login_bp.login'))
        
    termo = request.args.get('pesquisa', '').strip()
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    query = "SELECT id, produto, area_uso, quantidade, preco, descricao, link_imagem FROM estoque WHERE 1=1"
    params = []
    
    if categoria != 'Todos':
        query += " AND area_uso = %s"
        params.append(categoria)
        
    if termo:
        query += " AND (produto LIKE %s OR id LIKE %s)"
        params.append('%' + termo + '%')
        params.append('%' + termo + '%')
        
    query += " ORDER BY id ASC"
        
    cursor.execute(query, tuple(params))
    itens = cursor.fetchall()
    
    return render_template('rotasURL/home.html', 
                           estoque=itens, 
                           categoria_atual=categoria, 
                           termo_pesquisa=termo,
                           is_admin=session.get('is_admin', False))