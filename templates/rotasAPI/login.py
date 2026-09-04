import unicodedata
import bcrypt
import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash

login_bp = Blueprint('login_bp', __name__)

@login_bp.route('/', methods=['GET', 'POST'])
def login():
    # Importação local do mysql para evitar importação circular
    from app import mysql
    
    if request.method == 'POST':
        usuario = request.form.get('usuario', '').strip()
        senha = request.form.get('senha', '')
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM usuarios WHERE login = %s", (usuario,))
        account = cursor.fetchone()
        
        if account:
            senha_banco = account.get('senha', '')
            if senha_banco and bcrypt.checkpw(senha.encode('utf-8'), senha_banco.encode('utf-8')):
                if account.get('status') != 'ativo':
                    flash(f"Login suspenso. Status: {account.get('status')}.", "error")
                    return redirect(url_for('login_bp.login'))
                    
                session['logged_in'] = True
                session['usuario'] = account['login']
                session['is_admin'] = (account['role'] == 'admin')
                return redirect(url_for('home_bp.home'))
        
        flash("login inválido, tente novamente", "error")
            
    return render_template('rotasURL/login.html')

@login_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login_bp.login'))