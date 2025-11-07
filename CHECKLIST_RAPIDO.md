# ✅ Checklist Rápido - Deploy Jamal Esfiharia

**Use este checklist para configurar o deploy passo a passo**

---

## 🔴 BACKEND (API)

### 1. Criar Web Service
- [ ] Render Dashboard → New + → Web Service
- [ ] Conectar repositório: `LilGus999/jamal-esfiharia-sistema`
- [ ] Name: `jamal-esfiharia-backend`
- [ ] Root Directory: `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn -c gunicorn_config.py app:app`

### 2. Variáveis de Ambiente do Backend
- [ ] `FLASK_APP=app.py`
- [ ] `FLASK_ENV=production`
- [ ] `SECRET_KEY=[gerar chave aleatória]`
- [ ] `ADMIN_USERNAME=admin`
- [ ] `ADMIN_PASSWORD=[senha forte]`
- [ ] `CORS_ORIGINS=https://jamal-esfiharia.onrender.com`

### 3. Deploy e Teste
- [ ] Clicar em "Create Web Service"
- [ ] Aguardar deploy (5-10 min)
- [ ] Anotar URL: `https://jamal-esfiharia-backend.onrender.com`
- [ ] Testar: `https://[URL]/api/health`

---

## 🔵 FRONTEND (React)

### 4. Criar Static Site
- [ ] Render Dashboard → New + → Static Site
- [ ] Conectar repositório: `LilGus999/jamal-esfiharia-sistema`
- [ ] Name: `jamal-esfiharia`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `yarn install && yarn build`
- [ ] Publish Directory: `build`

### 5. Variáveis de Ambiente do Frontend
- [ ] `REACT_APP_API_BASE_URL=https://jamal-esfiharia-backend.onrender.com/api`
- [ ] `NODE_ENV=production`
- [ ] `GENERATE_SOURCEMAP=false`

### 6. Deploy
- [ ] Clicar em "Create Static Site"
- [ ] Aguardar deploy (3-5 min)
- [ ] Anotar URL: `https://jamal-esfiharia.onrender.com`

---

## ⚙️ CONFIGURAÇÃO CRÍTICA

### 7. Rewrite Rule (OBRIGATÓRIO!)
- [ ] Render Dashboard → "jamal-esfiharia" → Redirects/Rewrites
- [ ] Add Rule
- [ ] Source Path: `/*`
- [ ] Destination Path: `/index.html`
- [ ] Action: `Rewrite`
- [ ] Save

---

## ✅ TESTES

### 8. Testar Rotas
- [ ] `https://jamal-esfiharia.onrender.com/` (Home)
- [ ] `https://jamal-esfiharia.onrender.com/cardapio` (Cardápio)
- [ ] `https://jamal-esfiharia.onrender.com/admin/login` (Admin)

### 9. Testar Funcionalidades
- [ ] Produtos carregam no cardápio
- [ ] Adicionar produto ao carrinho funciona
- [ ] Finalizar pedido funciona
- [ ] Login no admin funciona
- [ ] Pedidos aparecem no admin

---

## 🎯 URLs FINAIS

Após tudo configurado:

- **Cardápio:** https://jamal-esfiharia.onrender.com/cardapio
- **Admin:** https://jamal-esfiharia.onrender.com/admin/login
- **API:** https://jamal-esfiharia-backend.onrender.com/api

---

## 🚨 SE ALGO NÃO FUNCIONAR

### Rotas retornam 404
→ Configure a Rewrite Rule (passo 7)

### Produtos não carregam
→ Verifique `REACT_APP_API_BASE_URL` no frontend

### Erro de CORS
→ Verifique `CORS_ORIGINS` no backend

### Build falha
→ Verifique se `@craco/craco` está em `dependencies`

---

**Tempo estimado:** 20-30 minutos

**Consulte o GUIA_DEPLOY_RENDER.md para detalhes completos**
