# ==========================================
# IMPORTAÇÕES DE BIBLIOTECAS
# ==========================================
from flask import Flask
from flask_mysqldb import MySQL

# ==========================================
# INICIALIZAÇÃO E CONFIGURAÇÃO DO FLASK
# ==========================================
# Cria a instância principal do aplicativo web e define a pasta de templates HTML
app = Flask(__name__, template_folder='templates')

# Chave secreta usada pelo Flask para gerenciar sessões de forma segura (ex: logins)
app.secret_key = 'chave_secreta_almoxarifado'

# ==========================================
# CONFIGURAÇÕES DE CONEXÃO COM O BANCO (DOCKER)
# ==========================================
app.config['MYSQL_HOST'] = 'db'               # Nome do serviço do banco no Docker
app.config['MYSQL_USER'] = 'root'             # Usuário do MySQL
app.config['MYSQL_PASSWORD'] = 'mysql_root'   # Senha do usuário do MySQL
app.config['MYSQL_DB'] = 'almoxarifado_db'    # Nome do banco de dados
app.config['MYSQL_PORT'] = 3306               # Porta padrão do MySQL

# Inicializa a extensão MySQL passando as configurações do app
mysql = MySQL(app)

# ==========================================
# IMPORTAÇÃO DE BLUEPRINTS (MÓDULOS DE ROTAS)
# ==========================================
from templates.rotasAPI.login import login_bp
from templates.rotasAPI.home import home_bp
from templates.rotasAPI.movimento import movimento_bp
from templates.rotasAPI.admin import admin_bp

# ==========================================
# REGISTRO DOS BLUEPRINTS NA APLICAÇÃO
# ==========================================
app.register_blueprint(login_bp)
app.register_blueprint(home_bp)
app.register_blueprint(movimento_bp)
app.register_blueprint(admin_bp)

# ==========================================
# EXECUÇÃO DO SERVIDOR WEB
# ==========================================
if __name__ == '__main__':
    # Roda a aplicação no modo debug, acessível externamente na porta 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
