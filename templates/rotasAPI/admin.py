import MySQLdb.cursors
import bcrypt
from flask import Blueprint, render_template, request, redirect, url_for, session, flash

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

    if 'logged_in' not in session or not session.get('is_admin'):
        flash("Acesso restrito a administradores!", "error")
        return redirect(url_for('home_bp.home'))

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    if request.method == 'POST':
        usuario_alvo = request.form.get('usuario_alvo')
        chave_mestra_informada = request.form.get('chave_mestra', '')
        acao = request.form.get('action')

        # 1. Verifica Chave Mestra
        cursor.execute("SELECT chave_mestra FROM config_admin LIMIT 1")
        config = cursor.fetchone()

        if not config or not config.get('chave_mestra'):
            flash("Erro de configuração: Chave mestra não cadastrada no banco!", "error")
            return redirect(url_for('admin_bp.admin'))

        # Valida a senha da chave mestra usando bcrypt
        try:
            chave_valida = bcrypt.checkpw(chave_mestra_informada.encode('utf-8'), config['chave_mestra'].encode('utf-8'))
        except Exception:
            chave_valida = False

        if not chave_valida:
            flash("Chave Mestra incorreta!", "error")
            return redirect(url_for('admin_bp.admin'))

        # 2. Executa a Ação Solicitada
        try:
            if acao == 'bloquear':
                cursor.execute("UPDATE usuarios SET status = 'bloqueado' WHERE login = %s", (usuario_alvo,))
                mysql.connection.commit()
                
                if cursor.rowcount > 0:
                    registrar_log(session['usuario'], 'Bloqueio de Usuário', f"Bloqueou o usuário '{usuario_alvo}'")
                    flash(f"Usuário '{usuario_alvo}' foi bloqueado com sucesso!", "success")
                else:
                    flash(f"Usuário '{usuario_alvo}' não foi encontrado no banco de dados.", "error")

            elif acao == 'desbloquear':
                cursor.execute("UPDATE usuarios SET status = 'ativo' WHERE login = %s", (usuario_alvo,))
                mysql.connection.commit()

                if cursor.rowcount > 0:
                    registrar_log(session['usuario'], 'Desbloqueio de Usuário', f"Desbloqueou o usuário '{usuario_alvo}'")
                    flash(f"Usuário '{usuario_alvo}' foi desbloqueado com sucesso!", "success")
                else:
                    flash(f"Usuário '{usuario_alvo}' não foi encontrado no banco de dados.", "error")

            elif acao == 'deletar_usuario':
                if usuario_alvo == session['usuario']:
                    flash("Você não pode excluir sua própria conta enquanto estiver logado!", "error")
                    return redirect(url_for('admin_bp.admin'))

                cursor.execute("DELETE FROM usuarios WHERE login = %s", (usuario_alvo,))
                mysql.connection.commit()

                if cursor.rowcount > 0:
                    registrar_log(session['usuario'], 'Exclusão de Usuário', f"Excluiu o usuário '{usuario_alvo}'")
                    flash(f"Usuário '{usuario_alvo}' removido do sistema!", "success")
                else:
                    flash(f"Usuário '{usuario_alvo}' não foi encontrado no banco de dados.", "error")

        except Exception as err:
            mysql.connection.rollback()
            flash(f"Erro ao atualizar banco de dados: {err}", "error")

        return redirect(url_for('admin_bp.admin'))

    # Carrega a lista atualizada de histórico e usuários
    filtro_usuario = request.args.get('filtro_usuario', '').strip()
    if filtro_usuario:
        cursor.execute("SELECT * FROM historico_logs WHERE usuario LIKE %s ORDER BY id DESC", (f"%{filtro_usuario}%",))
    else:
        cursor.execute("SELECT * FROM historico_logs ORDER BY id DESC")
    logs = cursor.fetchall()

    cursor.execute("SELECT login, status, role FROM usuarios ORDER BY login ASC")
    usuarios = cursor.fetchall()

    return render_template('rotasURL/admin.html', logs=logs, usuarios=usuarios, is_admin=True)


@admin_bp.route('/cadastrar_usuario', methods=['GET', 'POST'])
def cadastrar_usuario():
    from app import mysql

    if 'logged_in' not in session or not session.get('is_admin'):
        flash("Acesso restrito a administradores!", "error")
        return redirect(url_for('home_bp.home'))

    if request.method == 'POST':
        novo_usuario = request.form.get('usuario', '').strip()
        senha = request.form.get('senha', '')
        role = 'admin' if request.form.get('is_admin') == 'on' else 'user'

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM usuarios WHERE login = %s", (novo_usuario,))
        
        if cursor.fetchone():
            flash("Nome de usuário já cadastrado no sistema!", "error")
            return redirect(url_for('admin_bp.cadastrar_usuario'))

        salt = bcrypt.gensalt(12)
        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), salt).decode('utf-8')

        cursor.execute(
            "INSERT INTO usuarios (login, senha, role, status) VALUES (%s, %s, %s, 'ativo')",
            (novo_usuario, senha_hash, role)
        )
        mysql.connection.commit()

        registrar_log(session['usuario'], 'Novo Usuário', f"Cadastrou o usuário '{novo_usuario}' (Role: {role})")
        flash(f"Usuário '{novo_usuario}' cadastrado com sucesso!", "success")
        return redirect(url_for('admin_bp.admin'))

    return render_template('rotasURL/cadastro.html', is_admin=True)