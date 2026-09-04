import bcrypt
import MySQLdb.cursors
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from rotasAPI.home import checar_bloqueio
from rotasAPI.movimento import registrar_log

admin_bp = Blueprint('admin_bp', __name__)

def verificar_chave_mestra(chave_digitada):
    from app import mysql
    if not chave_digitada:
        return False
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT chave_mestra FROM config_admin ORDER BY id ASC LIMIT 1")
    reg = cursor.fetchone()
    
    if not reg or not reg.get('chave_mestra'):
        return False
        
    try:
        return bcrypt.checkpw(chave_digitada.encode('utf-8'), reg['chave_mestra'].encode('utf-8'))
    except (ValueError, TypeError):
        return False

@admin_bp.route('/admin', methods=['GET', 'POST'])
def admin():
    from app import mysql
    
    if 'logged_in' not in session or not checar_bloqueio():
        return redirect(url_for('login_bp.login'))
    if not session.get('is_admin'):
        flash("Acesso restrito a administradores.", "error")
        return redirect(url_for('home_bp.home'))

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    
    if request.method == 'POST':
        chave = request.form.get('chave_mestra')
        action = request.form.get('action')
        
        if not verificar_chave_mestra(chave):
            flash("Erro: Chave mestra incorreta!", "error")
            return redirect(url_for('admin_bp.admin'))
            
        if action == 'create_user':
            novo_user = request.form.get('novo_usuario', '').strip()
            senha = request.form.get('nova_senha', '')
            role = request.form.get('role', 'user')
            
            cursor.execute("SELECT login FROM usuarios WHERE login = %s", (novo_user,))
            if cursor.fetchone():
                flash("Erro: Usuário já cadastrado!", "error")
            else:
                hashed = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
                cursor.execute("INSERT INTO usuarios (login, senha, status, role) VALUES (%s, %s, 'ativo', %s)", 
                               (novo_user, hashed, role))
                registrar_log(session['usuario'], 'Admin - Criar Usuário', f"Criou '{novo_user}'")
                mysql.connection.commit()
                flash(f"Usuário '{novo_user}' cadastrado!", "success")
                
        elif action in ['bloquear', 'desbloquear']:
            alvo = request.form.get('usuario_alvo')
            status = 'suspenso' if action == 'bloquear' else 'ativo'
            
            if alvo == 'admin':
                flash("Erro: O usuário master não pode ser bloqueado!", "error")
            else:
                cursor.execute("UPDATE usuarios SET status = %s WHERE login = %s", (status, alvo))
                registrar_log(session['usuario'], 'Admin - Status', f"'{alvo}' alterado para {status}")
                mysql.connection.commit()
                flash(f"Status de '{alvo}' alterado para {status}.", "success")
                
        elif action == 'deletar_usuario':
            alvo = request.form.get('usuario_alvo')
            if alvo == 'admin':
                flash("Erro: O usuário master não pode ser excluído!", "error")
            else:
                cursor.execute("DELETE FROM usuarios WHERE login = %s", (alvo,))
                registrar_log(session['usuario'], 'Admin - Deletar', f"Excluiu '{alvo}'")
                mysql.connection.commit()
                flash(f"Usuário '{alvo}' removido.", "success")
                
        elif action == 'alterar_senha':
            alvo = request.form.get('usuario_alvo')
            senha = request.form.get('nova_senha_usuario', '')
            if senha:
                hashed = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
                cursor.execute("UPDATE usuarios SET senha = %s WHERE login = %s", (hashed, alvo))
                registrar_log(session['usuario'], 'Admin - Senha', f"Alterou senha de '{alvo}'")
                mysql.connection.commit()
                flash(f"Senha de '{alvo}' alterada!", "success")

        return redirect(url_for('admin_bp.admin'))
        
    cursor.execute("SELECT login, status, role FROM usuarios WHERE login != %s", (session['usuario'],))
    usuarios = cursor.fetchall()
    
    cursor.execute("SELECT usuario, acao, detalhe, data_registro FROM historico_logs ORDER BY data_registro DESC LIMIT 100")
    logs = cursor.fetchall()
    
    return render_template('rotasURL/admin.html', usuarios=usuarios, logs=logs)

@admin_bp.route('/api/admin/logs', methods=['GET'])
def api_admin_logs():
    from app import mysql
    if 'logged_in' not in session or not checar_bloqueio() or not session.get('is_admin'):
        return jsonify({'error': 'Acesso negado'}), 403
        
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT id, usuario, acao, detalhe, data_registro FROM historico_logs ORDER BY data_registro DESC")
    logs = cursor.fetchall()
    return jsonify(logs)