@admin_bp.route('/cadastrar_usuario', methods=['GET', 'POST'])
def cadastrar_usuario():
    from app import mysql

    if request.method == 'POST':
        if request.is_json:
            data = request.get_json() or {}
            novo_usuario = data.get('usuario', '').strip()
            senha = data.get('senha', '')
            role = 'admin' if data.get('is_admin') == 'on' else 'user'
            usuario_criador = data.get('usuario_criador', 'Admin') # Recebe quem realizou a ação vindo do app/web
        else:
            novo_usuario = request.form.get('usuario', '').strip()
            senha = request.form.get('senha', '')
            role = 'admin' if request.form.get('is_admin') == 'on' else 'user'
            usuario_criador = session.get('usuario', 'Admin')

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

        # Regista corretamente quem executou a ação no histórico de logs
        registrar_log(usuario_criador, 'Novo Usuário', f"Cadastrou o usuário '{novo_usuario}' (Role: {role})")

        msg = f"Usuário '{novo_usuario}' cadastrado com sucesso!"
        if request.is_json: return jsonify({"sucesso": True, "mensagem": msg}), 201

        flash(msg, "success")
        return redirect(url_for('admin_bp.admin'))

    return render_template('rotasURL/cadastro.html', is_admin=True)