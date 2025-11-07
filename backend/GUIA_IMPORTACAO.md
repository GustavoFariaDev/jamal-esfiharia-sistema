# 📦 Guia de Importação de Produtos e Imagens
## Sistema Jamal Esfiharia

Este guia explica como importar os **495 produtos** e **574 imagens** no sistema Jamal Esfiharia.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de que:

1. ✅ O servidor backend está **parado** (não execute durante a importação)
2. ✅ Você tem acesso ao terminal/SSH do servidor
3. ✅ Os arquivos de exportação estão disponíveis:
   - `produtos.json` ou `produtos.sql`
   - Pasta `imagens/` com as 574 imagens

---

## 🚀 Método 1: Importação via JSON (Recomendado)

Este método usa o arquivo JSON e é mais seguro, pois valida os dados antes de importar.

### Passo 1: Navegar até o diretório do backend

```bash
cd /caminho/para/jamal-esfiharia-sistema/backend
```

### Passo 2: Executar o script de importação

```bash
python3 importar_produtos_completo.py /caminho/para/produtos.json /caminho/para/imagens
```

**Exemplo:**
```bash
python3 importar_produtos_completo.py /home/ubuntu/upload/jamal_export/produtos.json /home/ubuntu/upload/jamal_export/imagens
```

### Passo 3: Responder às perguntas

O script perguntará se você deseja limpar os produtos existentes:

- Digite **`s`** para limpar o banco e importar do zero (recomendado)
- Digite **`n`** para manter produtos existentes e adicionar novos

### Passo 4: Aguardar conclusão

O script irá:
1. ✅ Limpar o banco de dados (se solicitado)
2. ✅ Importar os 495 produtos
3. ✅ Copiar as 574 imagens para `static/uploads/`
4. ✅ Verificar a integridade dos dados

### Passo 5: Reiniciar o servidor

```bash
# Se estiver usando systemd
sudo systemctl restart jamal-backend

# Ou se estiver rodando manualmente
python3 app.py
```

---

## ⚡ Método 2: Importação via SQL (Mais Rápido)

Este método executa comandos SQL diretamente no banco, sendo **muito mais rápido** para grandes volumes de dados.

### Passo 1: Navegar até o diretório do backend

```bash
cd /caminho/para/jamal-esfiharia-sistema/backend
```

### Passo 2: Executar o script SQL

```bash
python3 importar_produtos_sql.py /caminho/para/produtos.sql /caminho/para/imagens
```

**Exemplo:**
```bash
python3 importar_produtos_sql.py /home/ubuntu/upload/jamal_export/produtos.sql /home/ubuntu/upload/jamal_export/imagens
```

### Passo 3: Responder às perguntas

O script perguntará se você deseja limpar os produtos existentes:

- Digite **`s`** para limpar o banco e importar do zero (recomendado)
- Digite **`n`** para manter produtos existentes e adicionar novos

### Passo 4: Aguardar conclusão

O script irá:
1. ✅ Limpar a tabela esfiha (se solicitado)
2. ✅ Executar comandos SQL de inserção
3. ✅ Copiar as 574 imagens para `static/uploads/`
4. ✅ Verificar a integridade dos dados

### Passo 5: Reiniciar o servidor

```bash
# Se estiver usando systemd
sudo systemctl restart jamal-backend

# Ou se estiver rodando manualmente
python3 app.py
```

---

## 🔍 Verificação Pós-Importação

Após a importação, verifique se tudo está correto:

### 1. Acessar o Painel Administrativo

Abra o navegador e acesse:
```
https://jamal-esfiharia.onrender.com/admin
```

### 2. Verificar Produtos

- Clique em **"Produtos"** no menu
- Verifique se os 495 produtos estão listados
- Confirme se as imagens estão aparecendo

### 3. Verificar Categorias

As seguintes categorias devem estar disponíveis:
- PIZZAS SALGADAS
- PIZZAS DOCES
- BEBIDAS
- (e outras conforme o export)

### 4. Testar Disponibilidade

- Verifique se os produtos marcados como "disponíveis" aparecem no cardápio
- Teste adicionar produtos ao carrinho

---

## 📊 Estrutura de Dados

### Campos dos Produtos

Cada produto contém:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Integer | Identificador único |
| `nome` | String | Nome do produto |
| `descricao` | Text | Descrição detalhada |
| `categoria` | String | Categoria (ex: PIZZAS SALGADAS) |
| `preco_broto` | Float | Preço tamanho broto |
| `preco_media` | Float | Preço tamanho médio |
| `preco_grande` | Float | Preço tamanho grande |
| `disponivel` | Boolean | Disponibilidade (true/false) |
| `imagem_url` | String | Caminho da imagem |
| `data_criacao` | DateTime | Data de criação |
| `data_atualizacao` | DateTime | Data de atualização |

### Estrutura de Pastas

Após a importação, as imagens estarão em:
```
jamal-esfiharia-sistema/
└── backend/
    └── static/
        └── uploads/
            ├── prod_1_alho_i.jpg
            ├── prod_2_alho_ii.jpg
            ├── prod_3_aliche_i.jpg
            └── ... (574 imagens)
```

---

## 🛠️ Solução de Problemas

### Erro: "Arquivo não encontrado"

**Causa:** O caminho para o arquivo JSON/SQL ou pasta de imagens está incorreto.

**Solução:**
```bash
# Verificar se os arquivos existem
ls -la /caminho/para/produtos.json
ls -la /caminho/para/imagens/
```

### Erro: "Permission denied"

**Causa:** O script não tem permissão de execução.

**Solução:**
```bash
chmod +x importar_produtos_completo.py
chmod +x importar_produtos_sql.py
```

### Erro: "Module not found"

**Causa:** Dependências não instaladas.

**Solução:**
```bash
pip3 install -r requirements.txt
```

### Imagens não aparecem no frontend

**Causa:** As imagens não foram copiadas para o local correto.

**Solução:**
```bash
# Verificar se as imagens estão na pasta correta
ls -la backend/static/uploads/

# Se necessário, copiar manualmente
cp -r /caminho/para/imagens/* backend/static/uploads/
```

### Produtos duplicados

**Causa:** O script foi executado múltiplas vezes sem limpar o banco.

**Solução:**
```bash
# Limpar produtos duplicados
python3 -c "
from app import create_app
from src.models.user import db
from src.models.esfiha import Esfiha

app = create_app()
with app.app_context():
    # Remover todos os produtos
    Esfiha.query.delete()
    db.session.commit()
    print('✅ Produtos removidos. Execute o script novamente.')
"
```

---

## 📝 Notas Importantes

1. **Backup:** Sempre faça backup do banco de dados antes de importar:
   ```bash
   cp backend/instance/jamal.db backend/instance/jamal.db.backup
   ```

2. **Servidor Parado:** Certifique-se de que o servidor está parado durante a importação para evitar conflitos.

3. **Espaço em Disco:** Verifique se há espaço suficiente para as 574 imagens (~78MB).

4. **Encoding:** Os scripts usam UTF-8 para suportar caracteres especiais (acentos, ç, etc.).

5. **Imagens Extras:** Algumas imagens podem não ter correspondência direta com produtos (variações/extras).

---

## 🎯 Resumo dos Comandos

### Importação via JSON
```bash
cd /home/ubuntu/jamal-esfiharia-sistema/backend
python3 importar_produtos_completo.py /home/ubuntu/upload/jamal_export/produtos.json /home/ubuntu/upload/jamal_export/imagens
```

### Importação via SQL (mais rápido)
```bash
cd /home/ubuntu/jamal-esfiharia-sistema/backend
python3 importar_produtos_sql.py /home/ubuntu/upload/jamal_export/produtos.sql /home/ubuntu/upload/jamal_export/imagens
```

### Verificar importação
```bash
python3 -c "
from app import create_app
from src.models.esfiha import Esfiha

app = create_app()
with app.app_context():
    print(f'Total de produtos: {Esfiha.query.count()}')
"
```

---

## 📞 Suporte

Se encontrar problemas durante a importação:

1. Verifique os logs do script para mensagens de erro
2. Consulte a seção "Solução de Problemas" acima
3. Verifique se todas as dependências estão instaladas
4. Confirme que o banco de dados está acessível

---

**Data de criação:** 07/11/2025  
**Versão:** 1.0  
**Sistema:** Jamal Esfiharia
