# 🚀 Guia de Deploy - Sistema Jamal no Render.com

Este guia contém todas as instruções necessárias para fazer o deploy do Sistema de Gestão Jamal Esfiharia no Render.com.

## 📋 Pré-requisitos

Antes de começar, você precisa:

1. **Conta no Render.com** - Criar conta gratuita em https://render.com
2. **Conta no GitHub** - Para hospedar o código
3. **Git instalado** - Para fazer upload do código

## 📊 Resumo do Sistema

O sistema foi otimizado e está pronto para deploy:

- **Tamanho original**: 505MB
- **Tamanho otimizado**: 3.7MB (redução de 99.3%)
- **Banco de dados**: Preservado com todos os dados
  - 1 usuário admin
  - 495 produtos (esfihas)
  - 52 acréscimos
  - 7 pedidos
  - 1 cliente

## 🗂️ Estrutura do Projeto

```
jamal_live_melhorado/
├── backend/              # API Flask
│   ├── src/             # Código fonte
│   ├── instance/        # Banco de dados SQLite
│   ├── app.py          # Aplicação principal
│   ├── requirements.txt # Dependências Python
│   └── gunicorn_config.py # Configuração produção
├── frontend/            # Interface React
│   ├── src/            # Código fonte
│   ├── public/         # Arquivos estáticos
│   └── package.json    # Dependências Node.js
├── Procfile            # Configuração Render
├── runtime.txt         # Versão Python
└── .gitignore         # Arquivos ignorados
```

## 📝 Passo a Passo - Deploy no Render.com

### Etapa 1: Preparar Repositório Git

1. **Inicializar Git no projeto:**
```bash
cd jamal_live_melhorado
git init
git add .
git commit -m "Initial commit - Sistema Jamal otimizado"
```

2. **Criar repositório no GitHub:**
   - Acesse https://github.com/new
   - Nome: `jamal-sistema`
   - Visibilidade: Privado (recomendado) ou Público
   - Clique em "Create repository"

3. **Fazer push do código:**
```bash
git remote add origin https://github.com/SEU_USUARIO/jamal-sistema.git
git branch -M main
git push -u origin main
```

### Etapa 2: Deploy do Backend (API)

1. **Acessar Render Dashboard:**
   - Vá para https://dashboard.render.com
   - Clique em "New +" → "Web Service"

2. **Conectar Repositório:**
   - Selecione "Connect a repository"
   - Autorize o GitHub
   - Selecione o repositório `jamal-sistema`

3. **Configurar Web Service:**
   - **Name**: `jamal-backend`
   - **Region**: Oregon (US West) - mais próximo do Brasil
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --config gunicorn_config.py app:app`

4. **Configurar Variáveis de Ambiente:**
   
   Clique em "Advanced" e adicione:
   
   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | `jamal-esfiharia-secret-key-2025-CHANGE-THIS` |
   | `JWT_SECRET_KEY` | `jamal-esfiharia-jwt-secret-2025-CHANGE-THIS` |
   | `FLASK_ENV` | `production` |
   | `DEBUG` | `False` |
   | `DATABASE_URL` | `sqlite:///instance/jamal.db` |
   | `PYTHON_VERSION` | `3.11.0` |

   **⚠️ IMPORTANTE**: Altere os valores de `SECRET_KEY` e `JWT_SECRET_KEY` para valores únicos e seguros!

5. **Configurar Plano:**
   - Selecione "Free" (gratuito)
   - Clique em "Create Web Service"

6. **Aguardar Deploy:**
   - O Render irá fazer o build e deploy
   - Aguarde até ver "Live" (verde)
   - Anote a URL gerada (ex: `https://jamal-backend.onrender.com`)

### Etapa 3: Deploy do Frontend (React)

1. **Criar Novo Web Service:**
   - No Dashboard, clique em "New +" → "Web Service"
   - Conecte o mesmo repositório

2. **Configurar Web Service:**
   - **Name**: `jamal-frontend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `npx serve -s build -l $PORT`

3. **Configurar Variáveis de Ambiente:**
   
   | Key | Value |
   |-----|-------|
   | `NODE_VERSION` | `22.13.0` |
   | `REACT_APP_API_URL` | URL do backend (ex: `https://jamal-backend.onrender.com`) |

4. **Configurar Plano:**
   - Selecione "Free"
   - Clique em "Create Web Service"

5. **Aguardar Deploy:**
   - Aguarde até ver "Live"
   - Anote a URL (ex: `https://jamal-frontend.onrender.com`)

### Etapa 4: Configurar CORS no Backend

Após o deploy do frontend, você precisa atualizar o CORS no backend:

1. **Editar `backend/app.py`** no seu repositório local
2. **Localizar a configuração CORS** (linha ~37)
3. **Atualizar para:**

```python
CORS(app, 
     resources={r"/*": {
         "origins": ["https://jamal-frontend.onrender.com"],  # Sua URL do frontend
         "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
         "expose_headers": ["Content-Type", "Authorization"],
         "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
     }},
     supports_credentials=True)
```

4. **Fazer commit e push:**
```bash
git add backend/app.py
git commit -m "Atualizar CORS com URL do frontend"
git push
```

5. O Render irá automaticamente fazer redeploy do backend

## ✅ Verificação Final

Após o deploy completo:

1. **Acesse o Frontend**: `https://jamal-frontend.onrender.com`
2. **Teste o Login**:
   - Verifique se consegue acessar a página de login
   - Tente fazer login (você precisará criar um usuário admin)

3. **Criar Usuário Admin**:
   - Acesse o Shell do backend no Render
   - Execute: `python criar_admin.py`

4. **Testar Funcionalidades**:
   - Login
   - Visualizar produtos
   - Criar pedido
   - Gerenciar clientes

## 🔧 Comandos Úteis

### Acessar Shell do Backend no Render:
1. Vá para o serviço backend no Dashboard
2. Clique em "Shell" no menu lateral
3. Execute comandos Python:

```bash
# Criar usuário admin
python criar_admin.py

# Popular acréscimos
python popular_acrescimos.py

# Verificar banco de dados
python -c "from app import create_app; app = create_app(); print('OK')"
```

### Ver Logs:
1. Acesse o serviço no Dashboard
2. Clique em "Logs" no menu lateral
3. Monitore erros e atividades

## 📱 URLs do Sistema

Após deploy completo:

- **Frontend (Clientes)**: `https://jamal-frontend.onrender.com`
- **Backend (API)**: `https://jamal-backend.onrender.com/api/`
- **Painel Admin**: `https://jamal-backend.onrender.com/admin`

## ⚠️ Limitações do Plano Free

O plano gratuito do Render tem algumas limitações:

1. **Sleep após inatividade**: Serviços dormem após 15 minutos sem uso
2. **Cold start**: Primeira requisição pode demorar 30-60 segundos
3. **750 horas/mês**: Limite de horas de execução
4. **Banco SQLite**: Dados podem ser perdidos em redeploys

### Solução para Persistência de Dados:

Para produção real, recomenda-se:
- Usar PostgreSQL (Render oferece plano free)
- Fazer backups regulares do banco
- Considerar upgrade para plano pago

## 🔐 Segurança

**IMPORTANTE - Antes de ir para produção:**

1. ✅ Alterar `SECRET_KEY` e `JWT_SECRET_KEY`
2. ✅ Configurar CORS com URL específica (não usar `*`)
3. ✅ Criar senhas fortes para usuários admin
4. ✅ Ativar HTTPS (Render faz automaticamente)
5. ✅ Revisar permissões de API

## 🆘 Problemas Comuns

### Backend não inicia:
- Verifique logs no Dashboard
- Confirme que `requirements.txt` está correto
- Verifique variáveis de ambiente

### Frontend não conecta ao Backend:
- Verifique `REACT_APP_API_URL` no frontend
- Confirme CORS no backend
- Teste API diretamente: `https://jamal-backend.onrender.com/api/`

### Banco de dados vazio:
- Execute `criar_admin.py` no Shell
- Execute `popular_acrescimos.py` se necessário
- Verifique se `instance/jamal.db` foi incluído no Git

## 📞 Suporte

Para dúvidas sobre o Render:
- Documentação: https://render.com/docs
- Comunidade: https://community.render.com

## 🎉 Conclusão

Seu sistema está agora no ar e acessível pela internet! 

Lembre-se de:
- Fazer backups regulares do banco de dados
- Monitorar logs para identificar problemas
- Considerar upgrade para plano pago para produção
- Testar todas as funcionalidades após deploy

**Boa sorte com seu sistema! 🥟**
