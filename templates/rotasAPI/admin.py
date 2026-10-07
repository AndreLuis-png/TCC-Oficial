import MySQLdb.cursors
import bcrypt
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify

admin_bp = Blueprint('admin_bp', __name__)

def registrar_log(usuario, acao, detalhe):
    from app import mysql
    try:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(
            "INSERT INTO historico_logs (usuario, acao, detalhe) VALUES (%s, %s, %s)",
            (usuario, acao, detalhe)
        )
        mysql.connection.commit()
    except Exception as e:
        print(f"Erro ao registrar log: {e}")

@admin_bp.route('/admin', methods=['GET', 'POST'])
def admin():
    from app import mysql

    if not request.is_json:
        if 'logged_in' not in session or not session.get('is_admin'):
            flash("Acesso restrito a administradores!", "error")
            return redirect(url_for('home_bp.home'))

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    if request.method == 'POST':
        if request.is_json:
            data = request.get_json() or {}
            usuario_alvo = data.get('usuario_alvo', '').strip()
            chave_mestra_informada = data.get('chave_mestra', '')
            acao = data.get('action')
            usuario_solicitante = data.get('usuario', 'AdminApp')
        else:
            usuario_alvo = request.form.get('usuario_alvo')
            chave_mestra_informada = request.form.get('chave_mestra', '')
            acao = request.form.get('action')
            usuario_solicitante = session.get('usuario', 'Admin')

        cursor.execute("SELECT chave_mestra FROM config_admin LIMIT 1")
        config = cursor.fetchone()

        if not config or not config.get('chave_mestra'):
            msg = "Erro de configuração: Chave mestra não cadastrada no banco!"
            if request.is_json: return jsonify({"sucesso": False, "mensagem": msg}), 500
            flash(msg, "error")
            return redirect(url_for('admin_bp.admin'))

        try:
            chave_valida = bcrypt.checkpw(chave_mestra_informada.encode('utf-8'), config['chave_mestra'].encode('utf-8'))
        except Exception:
            chave_valida = False

        if not chave_valida:
            msg = "Chave Mestra incorreta!"
            if request.is_json: return jsonify({"sucesso": False, "mensagem": msg}), 401
            flash(msg, "error")
            return redirect(url_for('admin_bp.admin'))

        try:
            if acao == 'bloquear':
                cursor.execute("UPDATE usuarios SET status = 'bloqueado' WHERE login = %s", (usuario_alvo,))
                mysql.connection.commit()
                if cursor.rowcount > 0:
                    registrar_log(usuario_solicitante, 'Bloqueio de Usuário', f"Bloqueou '{usuario_alvo}'")
                    msg = f"Usuário '{usuario_alvo}' foi bloqueado com sucesso!"
                    if request.is_json: return jsonify({"sucesso": True, "mensagem": msg}), 200
                    flash(msg, "success")
                else:
                    msg = f"Usuário '{usuario_alvo}' não encontrado."
                    if request.is_json: return jsonify({"sucesso": False, "mensagem": msg}), 404
                    flash(msg, "error")

            elif acao == 'desbloquear':
                cursor.execute("UPDATE usuarios SET status = 'ativo' WHERE login = %s", (usuario_alvo,))
                mysql.connection.commit()
                if cursor.rowcount > 0:
                    registrar_log(usuario_solicitante, 'Desbloqueio de Usuário', f"Desbloqueou '{usuario_alvo}'")
                    msg = f"Usuário '{usuario_alvo}' foi desbloqueado com sucesso!"
                    if request.is_json: return jsonify({"sucesso": True, "mensagem": msg}), 200
                    flash(msg, "success")
                else:
                    msg = f"Usuário '{usuario_alvo}' não encontrado."
                    if request.is_json: return jsonify({"sucesso": False, "mensagem": msg}), 404
                    flash(msg, "error")

            elif acao == 'deletar_usuario':
                cursor.execute("DELETE FROM usuarios WHERE login = %s", (usuario_alvo,))
                mysql.connection.commit()
                if cursor.rowcount > 0:
                    registrar_log(usuario_solicitante, 'Exclusão de Usuário', f"Excluiu '{usuario_alvo}'")
                    msg = f"Usuário '{usuario_alvo}' removido do sistema!"
                    if request.is_json: return jsonify({"sucesso": True, "mensagem": msg}), 200
                    flash(msg, "success")
                else:
                    msg = f"Usuário '{usuario_alvo}' não encontrado."
                    if request.is_json: return jsonify({"sucesso": False, "mensagem": msg}), 404
                    flash(msg, "error")

        except Exception as err:
            mysql.connection.rollback()
            if request.is_json: return jsonify({"sucesso": False, "mensagem": f"Erro no banco: {err}"}), 500
            flash(f"Erro ao atualizar banco de dados: {err}", "error")

        return redirect(url_for('admin_bp.admin'))

    filtro_usuario = request.args.get('filtro_usuario', '').strip()
    if filtro_usuario:
        cursor.execute("SELECT * FROM historico_logs WHERE usuario LIKE %s ORDER BY id DESC", (f"%{filtro_usuario}%",))
    else:
        cursor.execute("SELECT * FROM historico_logs ORDER BY id DESC")
    logs = cursor.fetchall()

    cursor.execute("SELECT login, status, role FROM usuarios ORDER BY login ASC")
    usuarios = cursor.fetchall()

    if request.is_json:
        return jsonify({"sucesso": True, "logs": logs, "usuarios": usuarios}), 200

    return render_template('rotasURL/admin.html', logs=logs, usuarios=usuarios, is_admin=True)


@admin_bp.route('/cadastrar_usuario', methods=['GET', 'POST'])
def cadastrar_usuario():
    from app import mysql

    if not request.is_json:
        if 'logged_in' not in session or not session.get('is_admin'):
            flash("Acesso restrito a administradores!", "error")
            return redirect(url_for('home_bp.home'))

    if request.method == 'POST':
        if request.is_json:
            data = request.get_json() or {}
            novo_usuario = data.get('usuario', '').strip()
            senha = data.get('senha', '')
            role = 'admin' if data.get('is_admin') == 'on' else 'user'
        else:
            novo_usuario = request.form.get('usuario', '').strip()
            senha = request.form.get('senha', '')
            role = 'admin' if request.form.get('is_admin') == 'on' else 'user'

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM usuarios WHERE login = %s", (novo_usuario,))
        
        if cursor.fetchone():
            msg = "Nome de usuário já cadastrado no sistema!"
            if request.is_json: return jsonify({"sucesso": False, "mensagem": msg}), 400
            flash(msg, "error")
            return redirect(url_for('admin_bp.cadastrar_usuario'))

        salt = bcrypt.gensalt(12)
        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), salt).decode('utf-8')

        cursor.execute(
            "INSERT INTO usuarios (login, senha, role, status) VALUES (%s, %s, %s, 'ativo')",
            (novo_usuario, senha_hash, role)
        )
        mysql.connection.commit()

        usuario_criador = session.get('usuario', 'AdminApp')
        registrar_log(usuario_criador, 'Novo Usuário', f"Cadastrou o usuário '{novo_usuario}' (Role: {role})")

        msg = f"Usuário '{novo_usuario}' cadastrado com sucesso!"
        if request.is_json: return jsonify({"sucesso": True, "mensagem": msg}), 201

        flash(msg, "success")
        return redirect(url_for('admin_bp.admin'))

    return render_template('rotasURL/cadastro.html', is_admin=True)