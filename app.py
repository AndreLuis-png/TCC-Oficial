from flask import Flask
from flask_mysqldb import MySQL

app = Flask(__name__, template_folder='templates')
app.secret_key = 'chave_secreta_almoxarifado'

def conectar_banco():
return mysql.connector.connect(
host="db",
user="mysql_root",
password="mysql_root",
port=3306,
database="almox"
)

mysql = MySQL(app)

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
