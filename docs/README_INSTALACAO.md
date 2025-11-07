# 🍕 Sistema Jamal Esfiharia - Guia de Instalação e Uso

## 📦 Versão Corrigida - 03 de Novembro de 2025

---

## 🎯 O Que Foi Corrigido

Este sistema foi corrigido para resolver os seguintes problemas:

### ✅ Front-End (Cliente)
- **Seletor de tamanhos** agora aparece para todas as pizzas (Broto, Média, Grande)
- **Botão "Montar Pizza Meio a Meio"** agora aparece e funciona
- **Seletor de acréscimos** agora aparece e funciona corretamente
- Preços são calculados automaticamente conforme seleção

### ✅ Back-End (Gestão)
- Todos os **495 produtos** aparecem no painel administrativo
- Filtro por categoria funcionando
- Visualização em lista e agrupada por categoria
- Edição e exclusão de produtos funcionando

---

## 📋 Pré-requisitos

Antes de instalar, certifique-se de ter:

- **Python 3.11** ou superior
- **Node.js 18** ou superior
- **npm** ou **pnpm**
- **Git** (opcional)

---

## 🚀 Instalação Rápida

### 1. Extrair o Sistema

```bash
tar -xzf jamal_sistema_CORRIGIDO_03NOV2025.tar.gz
cd jamal_sistema
```

### 2. Configurar o Backend

```bash
cd backend

# Instalar dependências
pip3 install -r requirements.txt

# Iniciar o servidor
python3.11 app.py
```

O backend estará rodando em: `http://localhost:5000`

### 3. Configurar o Frontend

Em outro terminal:

```bash
cd frontend

# Instalar dependências (apenas na primeira vez)
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

O frontend estará rodando em: `http://localhost:3000`

---

## 🌐 Acessar o Sistema

### Para Clientes (Cardápio)
```
http://localhost:3000/
```

### Para Administradores (Gestão)
```
http://localhost:3000/admin/login
```

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `admin123`

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro acesso!

---

## 🧪 Testar as Correções

### Teste 1: Seletor de Tamanhos para Pizzas

1. Acesse o cardápio: `http://localhost:3000/cardapio`
2. Filtre por **"PIZZAS SALGADAS"**
3. Clique em qualquer pizza (ex: "3 QUEIJOS")
4. **Verifique se aparece:**
   - ✅ Seletor de tamanhos (Broto, Média, Grande)
   - ✅ Preços diferentes para cada tamanho
   - ✅ Botão "Montar Pizza Meio a Meio"
   - ✅ Seletor de acréscimos

### Teste 2: Painel Administrativo

1. Acesse: `http://localhost:3000/admin/login`
2. Faça login com as credenciais
3. Vá para a aba **"Produtos"**
4. **Verifique se:**
   - ✅ Aparecem todos os 495 produtos
   - ✅ É possível filtrar por categoria
   - ✅ É possível alternar entre visualização em lista e agrupada
   - ✅ Cada categoria mostra a contagem correta

### Teste 3: Adicionar ao Carrinho

1. No cardápio, selecione uma pizza
2. Escolha o tamanho
3. Adicione acréscimos (opcional)
4. Clique em "Adicionar ao Carrinho"
5. **Verifique se:**
   - ✅ O produto foi adicionado com o tamanho correto
   - ✅ O preço está correto
   - ✅ Os acréscimos foram incluídos

---

## 📊 Dados do Sistema

### Banco de Dados
- **Arquivo:** `backend/instance/esfiharia.db`
- **Total de produtos:** 495
- **Categorias:** 19

### Produtos por Categoria

| Categoria | Quantidade |
|-----------|------------|
| Pizzas Salgadas | 47 |
| Pizzas Doces | 19 |
| Esfihas Salgadas | 91 |
| Esfihas Doces | 29 |
| Esfihas Vegetarianas | 7 |
| Esfihas Especiais | 6 |
| Pastéis Salgados | 91 |
| Pastéis Doces | 29 |
| Pastéis Vegetarianos | 7 |
| Pastéis Especiais | 6 |
| Fogazzes Salgadas | 86 |
| Fogazzes Doces | 29 |
| Fogazzes Vegetarianas | 7 |
| Fogazzes Especiais | 6 |
| Beirutes | 16 |
| Batata Simples | 2 |
| Batata Recheada | 2 |
| Salgados | 5 |
| Bebidas | 10 |

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente

#### Backend (`backend/.env`)
```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=sua_chave_secreta_aqui
DATABASE_URI=sqlite:///instance/esfiharia.db
```

#### Frontend (`frontend/.env`)
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### Portas

- **Backend:** 5000 (padrão Flask)
- **Frontend:** 3000 (padrão React)

Para alterar as portas, edite os arquivos de configuração correspondentes.

---

## 🐛 Solução de Problemas

### Problema: "Erro ao carregar produtos"

**Solução:**
1. Verifique se o backend está rodando
2. Verifique se o banco de dados existe: `backend/instance/esfiharia.db`
3. Verifique a URL da API no arquivo `frontend/.env`

### Problema: "Seletor de tamanhos não aparece"

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a página com Ctrl+F5
3. Verifique se o frontend foi compilado corretamente

### Problema: "Produtos não aparecem no admin"

**Solução:**
1. Verifique se está logado como administrador
2. Verifique se o backend está retornando dados: `http://localhost:5000/api/esfihas/`
3. Verifique o console do navegador para erros

### Problema: "Erro de conexão com o servidor"

**Solução:**
1. Verifique se o backend está rodando na porta 5000
2. Verifique se não há firewall bloqueando
3. Verifique se a URL da API está correta no `.env`

---

## 📚 Estrutura do Projeto

```
jamal_sistema/
├── backend/                    # Servidor Flask (Python)
│   ├── app.py                 # Arquivo principal
│   ├── requirements.txt       # Dependências Python
│   ├── instance/
│   │   └── esfiharia.db      # Banco de dados SQLite
│   └── src/
│       ├── models/           # Modelos de dados
│       ├── routes/           # Rotas da API
│       └── utils/            # Utilitários
│
├── frontend/                   # Aplicação React
│   ├── package.json          # Dependências Node.js
│   ├── public/               # Arquivos estáticos
│   └── src/
│       ├── components/       # Componentes React
│       ├── services/         # Serviços de API
│       └── contexts/         # Contextos React
│
├── CORRECOES_IMPLEMENTADAS.md  # Documentação das correções
└── README_INSTALACAO.md        # Este arquivo
```

---

## 🔐 Segurança

### Recomendações Importantes

1. **Altere a senha padrão** do administrador
2. **Altere o SECRET_KEY** no backend
3. **Use HTTPS** em produção
4. **Configure CORS** adequadamente
5. **Faça backup** regular do banco de dados

### Criar Novo Administrador

```python
# No backend, execute:
python3.11 -c "
from src.models.user import User
from werkzeug.security import generate_password_hash
import sqlite3

conn = sqlite3.connect('instance/esfiharia.db')
cursor = conn.cursor()

cursor.execute('''
    INSERT INTO user (username, password_hash, is_admin)
    VALUES (?, ?, ?)
''', ('novo_admin', generate_password_hash('nova_senha'), True))

conn.commit()
conn.close()
print('Novo administrador criado!')
"
```

---

## 📝 Manutenção

### Backup do Banco de Dados

```bash
# Fazer backup
cp backend/instance/esfiharia.db backend/instance/esfiharia_backup_$(date +%Y%m%d).db

# Restaurar backup
cp backend/instance/esfiharia_backup_YYYYMMDD.db backend/instance/esfiharia.db
```

### Atualizar Dependências

```bash
# Backend
cd backend
pip3 install --upgrade -r requirements.txt

# Frontend
cd frontend
npm update
```

---

## 🚀 Deploy em Produção

### Backend (Gunicorn)

```bash
cd backend
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (Build)

```bash
cd frontend
npm run build
# Os arquivos estarão em frontend/build/
```

### Nginx (Exemplo de Configuração)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        root /caminho/para/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📞 Suporte

### Documentação Adicional

- **Correções Implementadas:** `CORRECOES_IMPLEMENTADAS.md`
- **API Documentation:** Acesse `http://localhost:5000/api/docs` (se configurado)

### Logs

- **Backend:** Verifique o terminal onde o Flask está rodando
- **Frontend:** Abra o Console do Navegador (F12)

---

## ✅ Checklist de Instalação

- [ ] Python 3.11 instalado
- [ ] Node.js 18+ instalado
- [ ] Sistema extraído
- [ ] Dependências do backend instaladas
- [ ] Dependências do frontend instaladas
- [ ] Backend rodando na porta 5000
- [ ] Frontend rodando na porta 3000
- [ ] Acesso ao cardápio funcionando
- [ ] Acesso ao admin funcionando
- [ ] Seletor de tamanhos aparecendo para pizzas
- [ ] Todos os produtos aparecendo no admin

---

## 🎉 Pronto!

Seu sistema Jamal Esfiharia está pronto para uso!

**Desenvolvido por:** Manus AI  
**Data:** 03 de Novembro de 2025  
**Versão:** 1.0 - Correção de Seletor de Tamanhos

---

## 📄 Licença

Este sistema foi desenvolvido para uso comercial da Jamal Esfiharia.
Todos os direitos reservados.
