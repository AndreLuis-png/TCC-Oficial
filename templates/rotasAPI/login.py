import bcrypt
import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify

login_bp = Blueprint('login_bp', __name__)

@login_bp.route('/', methods=['GET', 'POST'])
def login():
    from app import mysql
    
    # 1. Tratamento para requisições do App Mobile (JSON)
    if request.is_json:
        data = request.get_json() or {}
        usuario = data.get('usuario', '').strip()
        senha = data.get('senha', '')

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM usuarios WHERE login = %s", (usuario,))
        account = cursor.fetchone()

        if account and bcrypt.checkpw(senha.encode('utf-8'), account.get('senha', '').encode('utf-8')):
            if account.get('status') != 'ativo':
                return jsonify({"sucesso": False, "mensagem": "Conta suspensa ou bloqueada."}), 403

            session['logged_in'] = True
            session['usuario'] = account['login']
            session['is_admin'] = (account['role'] == 'admin')

            return jsonify({
                "sucesso": True,
                "mensagem": "Login realizado com sucesso!",
                "usuario": account['login'],
                "is_admin": (account['role'] == 'admin')
            }), 200

        return jsonify({"sucesso": False, "mensagem": "Usuário ou senha inválidos."}), 401

    # 2. Tratamento padrão para Web (Formulário HTML)
    if request.method == 'POST':
        usuario = request.form.get('usuario', '').strip()
        senha = request.form.get('senha', '')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM usuarios WHERE login = %s", (usuario,))
        account = cursor.fetchone()
        
        if account and bcrypt.checkpw(senha.encode('utf-8'), account.get('senha', '').encode('utf-8')):
            if account.get('status') != 'ativo':
                flash(f"Login suspenso. Status: {account.get('status')}.", "error")
                return redirect(url_for('login_bp.login'))
                
            session['logged_in'] = True
            session['usuario'] = account['login']
            session['is_admin'] = (account['role'] == 'admin')
            return redirect(url_for('home_bp.home'))
        
        flash("Login inválido, tente novamente", "error")
            
    return render_template('rotasURL/login.html')

@login_bp.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    if request.is_json:
        return jsonify({"sucesso": True, "mensagem": "Sessão encerrada com sucesso."}), 200
    return redirect(url_for('login_bp.login'))