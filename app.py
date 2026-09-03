import unicodedata
from functools import wraps
from flask import session, redirect, url_for, flash
import bcrypt 


CATEGORIAS = {
    "Geral": "0",
    "Mecanica": "1",
    "Eletrica": "2"
}

def padronizar_texto(texto):
    if not texto:
        return texto

    texto = texto.strip()

    texto = unicodedata.normalize("NFKD", texto)
    texto = texto.encode("ascii", "ignore").decode("utf-8")

    return texto[:1].upper() + texto[1:]

def pesquisar_itens(conexao, termo):
    termo = padronizar_texto(termo)

    cursor = conexao.cursor()

    cursor.execute(
        """
        SELECT id, produto, area_uso, quantidade, preco, descricao, link_imagem
        FROM estoque
        WHERE produto LIKE %s OR id LIKE %s
        ORDER BY produto
        """,
        (f"%{termo}%", f"%{termo}%")
    )

    itens = cursor.fetchall()
    cursor.close()

    return itens

def pesquisar_itens(conexao, termo):
    termo = padronizar_texto(termo)

    cursor = conexao.cursor()

    cursor.execute(
        """
        SELECT id, produto, area_uso, quantidade, preco, descricao, link_imagem
        FROM estoque
        WHERE produto LIKE %s OR id LIKE %s
        ORDER BY produto
        """,
        (f"%{termo}%", f"%{termo}%")
    )

    itens = cursor.fetchall()
    cursor.close()

    return itens


def filtrar_categoria(conexao, categoria):
    if categoria not in CATEGORIAS:
        raise ValueError("Categoria inválida.")

    cursor = conexao.cursor()

    cursor.execute(
        """
        SELECT id, produto, area_uso, quantidade, preco, descricao, link_imagem
        FROM estoque
        WHERE area_uso = %s
        ORDER BY produto
        """,
        (categoria,)
    )

    itens = cursor.fetchall()
    cursor.close()

    return itens


def admin_required(funcao):
    @wraps(funcao)
    def decorada(*args, **kwargs):

        if "usuario" not in session:
            flash("Faça login para continuar.", "erro")
            return redirect(url_for("login"))

        if session.get("role") != "admin":
            flash("Acesso restrito ao administrador.", "erro")
            return redirect(url_for("home"))

        return funcao(*args, **kwargs)

    return decorada


def verificar_chave_mestra(conexao, chave):
    cursor = conexao.cursor()

    cursor.execute(
        """
        SELECT chave_mestra
        FROM config_admin
        LIMIT 1
        """
    )

    resultado = cursor.fetchone()
    cursor.close()

    if resultado is None:
        return False

    chave_hash = resultado[0]

    return bcrypt.checkpw(
        chave.encode("utf-8"),
        chave_hash.encode("utf-8")
    )


def criptografar_senha(senha):
    return bcrypt.hashpw(
        senha.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def adicionar_usuario(conexao, login, senha, role, chave_mestra):

    if not verificar_chave_mestra(conexao, chave_mestra):
        return False, "Chave mestra inválida."

    if role not in ("admin", "user"):
        return False, "Função de usuário inválida."

    senha_hash = criptografar_senha(senha)

    cursor = conexao.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO usuarios (login, senha, status, role)
            VALUES (%s, %s, 'ativo', %s)
            """,
            (login.strip(), senha_hash, role)
        )

        conexao.commit()

        return True, "Usuário adicionado com sucesso."

    except Exception:
        conexao.rollback()

        return False, "Não foi possível adicionar o usuário."

    finally:
        cursor.close()


def alterar_status_usuario(conexao, login, novo_status, chave_mestra):

    if not verificar_chave_mestra(conexao, chave_mestra):
        return False, "Chave mestra inválida."

    if novo_status not in ("ativo", "bloqueado"):
        return False, "Status inválido."

    cursor = conexao.cursor()

    try:
        cursor.execute(
            """
            UPDATE usuarios
            SET status = %s
            WHERE login = %s
            """,
            (novo_status, login)
        )

        if cursor.rowcount == 0:
            conexao.rollback()

            return False, "Usuário não encontrado."

        conexao.commit()

        return True, "Status alterado com sucesso."

    except Exception:
        conexao.rollback()

        return False, "Não foi possível alterar o status."

    finally:
        cursor.close()


def excluir_usuario(conexao, login, chave_mestra):

    if not verificar_chave_mestra(conexao, chave_mestra):
        return False, "Chave mestra inválida."

    cursor = conexao.cursor()

    try:
        cursor.execute(
            """
            DELETE FROM usuarios
            WHERE login = %s
            """,
            (login,)
        )

        if cursor.rowcount == 0:
            conexao.rollback()

            return False, "Usuário não encontrado."

        conexao.commit()

        return True, "Usuário excluído com sucesso."

    except Exception:
        conexao.rollback()

        return False, "Não foi possível excluir o usuário."

    finally:
        cursor.close()


def alterar_senha_usuario(conexao, login, nova_senha, chave_mestra):

    if not verificar_chave_mestra(conexao, chave_mestra):
        return False, "Chave mestra inválida."

    nova_senha_hash = criptografar_senha(nova_senha)

    cursor = conexao.cursor()

    try:
        cursor.execute(
            """
            UPDATE usuarios
            SET senha = %s
            WHERE login = %s
            """,
            (nova_senha_hash, login)
        )

        if cursor.rowcount == 0:
            conexao.rollback()

            return False, "Usuário não encontrado."

        conexao.commit()

        return True, "Senha alterada com sucesso."

    except Exception:
        conexao.rollback()

        return False, "Não foi possível alterar a senha."

    finally:
        cursor.close()


def gerar_proximo_id(conexao, categoria):

    if categoria not in CATEGORIAS:
        raise ValueError("Categoria inválida.")

    prefixo = CATEGORIAS[categoria]

    cursor = conexao.cursor()

    cursor.execute(
        """
        SELECT id
        FROM estoque
        WHERE id LIKE %s
        ORDER BY id
        """,
        (f"{prefixo}____",)
    )

    ids_existentes = {
        int(item[0][1:])
        for item in cursor.fetchall()
        if len(item[0]) == 5 and item[0].startswith(prefixo)
    }

    cursor.close()

    numero = 1

    while numero in ids_existentes:
        numero += 1

    if numero > 9999:
        raise ValueError("Limite de IDs da categoria atingido.")

    return f"{prefixo}{numero:04d}"


def inserir_item(
    conexao,
    produto,
    categoria,
    quantidade,
    preco,
    descricao=None,
    link_imagem=None
):

    if categoria not in CATEGORIAS:
        return False, "Categoria inválida.", None

    produto = padronizar_texto(produto)

    novo_id = gerar_proximo_id(
        conexao,
        categoria
    )

    cursor = conexao.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO estoque
            (
                id,
                produto,
                area_uso,
                quantidade,
                preco,
                descricao,
                link_imagem
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                novo_id,
                produto,
                categoria,
                quantidade,
                preco,
                descricao,
                link_imagem
            )
        )

        conexao.commit()

        return True, "Item inserido com sucesso.", novo_id

    except Exception:
        conexao.rollback()

        return False, "Não foi possível inserir o item.", None

    finally:
        cursor.close()
