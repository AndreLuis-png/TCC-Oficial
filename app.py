from flask import Flask
from flask_mysqldb import MySQL

app = Flask(__name__, template_folder='templates')
app.secret_key = 'chave_secreta_almoxarifado'

# Configurações de conexão para a extensão Flask-MySQLdb
app.config['MYSQL_HOST'] = 'db'               # Nome do serviço no docker-compose
app.config['MYSQL_USER'] = 'root'             # Usuário root definido no MySQL
app.config['MYSQL_PASSWORD'] = 'mysql_root'   # Senha definida no docker-compose
app.config['MYSQL_DB'] = 'almoxarifado_db'   # Mesmo nome do banco no dataB.sql e docker-compose
app.config['MYSQL_PORT'] = 3306

mysql = MySQL(app)

# Função utilitária para obter a conexão via Flask-MySQLdb (se necessário nos endpoints)
def conectar_banco():
    return mysql.connection

# Importação e registro das Blueprints
from templates.rotasAPI.login import login_bp
from templates.rotasAPI.home import home_bp
from templates.rotasAPI.movimento import movimento_bp
from templates.rotasAPI.admin import admin_bp

app.register_blueprint(login_bp)
app.register_blueprint(home_bp)
app.register_blueprint(movimento_bp)
app.register_blueprint(admin_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)