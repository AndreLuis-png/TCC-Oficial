# TCC-Oficial --Definições gerais

ROTAS DE API E URL
    importar extensões

    conexão com o banco de dados

    definição das funções
        função de padronizar caracteres no registro de itens (remover acentos e colocar a primeira letra do cadastro maiúscula)
        função para pesquisar itens (por nome ou id)
        função para criar filtro de categoria (Geral, Mecanica ou Eletrica)
        função para ocultar a rota exclusiva a admin (url e api)
            se o usuário for admin exibe todas as rotas 
            se o usuário for user, oculta a rota admin.html e exibe as outras
        funções relacionadas ao admin
            com a inserção da chave do banco de dados:
                permite adição de usuário 
                permite bloquieo/desbloqueio de usuários
                permite exclusão de usuários
                permite a alteração de senhas de usuários 
        função de encriptação de senhas inseridas pelo banco de dados pelo bcrypt

    rota de login 
    compara as informações de acesso do banco de dados com o que foi inserido 
    se for compatível, permita com que ele acesse a rota home
    se não for compatível, execute a mensagem de erro "login inválido, tente novamente" como um 'flash'

    rota home 
    exibe os itens do banco de dados na tela
    exibe os filtros de itens
    exibe a caixa de pesquisa
    verifica a função para ocultar a rota exclusiva a admin (url e api) para exibir ou não todas as rotas

    rota movimento 
    adiciona novos itens ao banco de dados 
    deleta itens do banco de dados 
    altera a quantidade de itens ja presentes no banco de dados

    rota admin
    aparece apenas para usuarios com role = admin, segundo a mesma funçao da pagina home
    realiza as funções definidas anteriormente, mediante a confirmação por meio de uma chave mestre definida pelo banco de dados
    mostra o historico de movimentações no site 

BANCO DE DADOS
    gera as tabelas de usuários 
        nome 
        senha 
        funcao
        status (para ser ou não bloqueado)
    gera as tabelas de configurações do admin 
        usuario 
        chave mestra
    gera as tabelas de estoque 
        id
        produto 
        area de uso 
        quantidade 
        preco 
        descricao 
        link da imagem
    gera uma tabela de histórico de lançamentos para a página do admin
