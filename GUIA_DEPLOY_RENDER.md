# 🚀 Guia Completo de Deploy no Render - Jamal Esfiharia

**Data:** 07 de novembro de 2025  
**Objetivo:** Colocar o cardápio e painel admin no ar

---

## 📋 Pré-requisitos

- ✅ Conta no Render.com
- ✅ Repositório GitHub: https://github.com/LilGus999/jamal-esfiharia-sistema
- ✅ Código atualizado (commit `1f646e0` ou posterior)

---

## 🎯 Visão Geral do Deploy

O sistema Jamal Esfiharia possui **2 partes** que precisam ser deployadas:

1. **Frontend (React)** - Interface do cardápio e admin
2. **Backend (Flask)** - API REST para gerenciar dados

---

## 📦 PARTE 1: Deploy do Backend (API)

### Passo 1.1: Criar Web Service no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte o repositório: `LilGus999/jamal-esfiharia-sistema`
4. Clique em **"Connect"**

### Passo 1.2: Configurar o Backend

Preencha os campos:

```
Name: jamal-esfiharia-backend
Region: Ohio (US East)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn -c gunicorn_config.py app:app
Instance Type: Free
```

### Passo 1.3: Configurar Variáveis de Ambiente do Backend

Clique em **"Advanced"** → **"Add Environment Variable"**

Adicione as seguintes variáveis:

```env
# Flask
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=sua-chave-secreta-aqui-gere-uma-aleatoria

# Banco de Dados (se usar PostgreSQL no Render)
DATABASE_URL=postgresql://user:password@host:5432/database

# CORS (permitir frontend)
CORS_ORIGINS=https://jamal-esfiharia.onrender.com

# Configurações da aplicação
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua-senha-admin-segura
```

**⚠️ IMPORTANTE:**
- Gere uma `SECRET_KEY` forte (ex: use `python -c "import secrets; print(secrets.token_hex(32))"`)
- Use uma senha forte para `ADMIN_PASSWORD`
- Se não tiver banco configurado, o sistema usará SQLite (menos recomendado para produção)

### Passo 1.4: Criar o Backend

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (5-10 minutos)
3. Anote a URL gerada (ex: `https://jamal-esfiharia-backend.onrender.com`)

### Passo 1.5: Testar o Backend

Acesse no navegador:
```
https://jamal-esfiharia-backend.onrender.com/api/health
```

Deve retornar algo como:
```json
{
  "status": "ok",
  "message": "API funcionando"
}
```

---

## 🎨 PARTE 2: Deploy do Frontend (React)

### Passo 2.1: Criar Static Site no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Static Site"**
3. Conecte o repositório: `LilGus999/jamal-esfiharia-sistema`
4. Clique em **"Connect"**

### Passo 2.2: Configurar o Frontend

Preencha os campos:

```
Name: jamal-esfiharia
Branch: main
Root Directory: frontend
Build Command: yarn install && yarn build
Publish Directory: build
```

### Passo 2.3: Configurar Variáveis de Ambiente do Frontend

Clique em **"Advanced"** → **"Add Environment Variable"**

Adicione:

```env
REACT_APP_API_BASE_URL=https://jamal-esfiharia-backend.onrender.com/api
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

**⚠️ IMPORTANTE:** Substitua `jamal-esfiharia-backend.onrender.com` pela URL real do seu backend!

### Passo 2.4: Criar o Frontend

1. Clique em **"Create Static Site"**
2. Aguarde o deploy (3-5 minutos)
3. Anote a URL gerada (ex: `https://jamal-esfiharia.onrender.com`)

---

## ⚙️ PARTE 3: Configurar Rewrite Rule (CRÍTICO!)

**Esta é a configuração mais importante! Sem ela, as rotas não funcionam!**

### Passo 3.1: Acessar Configurações

1. No Render Dashboard, clique no serviço **"jamal-esfiharia"** (frontend)
2. Vá em **"Redirects/Rewrites"** no menu lateral

### Passo 3.2: Adicionar Rewrite Rule

Clique em **"Add Rule"** e preencha:

```
Source Path: /*
Destination Path: /index.html
Action: Rewrite
```

### Passo 3.3: Salvar

1. Clique em **"Save"**
2. Aguarde alguns segundos para aplicar

### Passo 3.4: Testar Rotas

Acesse as seguintes URLs e verifique se carregam corretamente:

- ✅ `https://jamal-esfiharia.onrender.com/` (Home)
- ✅ `https://jamal-esfiharia.onrender.com/cardapio` (Cardápio)
- ✅ `https://jamal-esfiharia.onrender.com/admin/login` (Login Admin)

**Se retornar 404, a Rewrite Rule não foi configurada corretamente!**

---

## 🔍 PARTE 4: Verificação e Testes

### Teste 1: Verificar se o Frontend carrega

1. Acesse: `https://jamal-esfiharia.onrender.com`
2. Deve carregar a página inicial
3. Verifique se não há erros no console (F12)

### Teste 2: Verificar se o Backend responde

1. Abra o console do navegador (F12)
2. Acesse o cardápio
3. Verifique se os produtos carregam
4. Se houver erro de CORS ou conexão, verifique as variáveis de ambiente

### Teste 3: Testar fluxo completo

1. **Cardápio:**
   - Acesse `/cardapio`
   - Adicione um produto ao carrinho
   - Preencha dados do cliente
   - Finalize o pedido
   - Verifique se não há erros

2. **Admin:**
   - Acesse `/admin/login`
   - Faça login (use as credenciais configuradas no backend)
   - Verifique se o pedido aparece na lista
   - Teste adicionar/editar um produto

### Teste 4: Verificar integração Frontend ↔ Backend

Abra o console (F12) e execute:

```javascript
console.log('API URL:', process.env.REACT_APP_API_BASE_URL);
```

Deve mostrar a URL do backend. Se mostrar `undefined` ou `localhost`, as variáveis de ambiente não foram configuradas!

---

## 🐛 Troubleshooting (Resolução de Problemas)

### Problema 1: Rotas retornam 404

**Sintoma:** `/cardapio` e `/admin/login` retornam "Not Found"

**Causa:** Rewrite Rule não configurada

**Solução:**
1. Vá em Render Dashboard → "jamal-esfiharia" → Redirects/Rewrites
2. Adicione a regra: `/* → /index.html (Rewrite)`
3. Salve e aguarde alguns minutos

---

### Problema 2: Produtos não carregam no cardápio

**Sintoma:** Cardápio vazio ou erro "Failed to fetch"

**Causa:** Backend não está respondendo ou CORS bloqueado

**Solução:**
1. Verifique se o backend está no ar: `https://[SEU-BACKEND]/api/health`
2. Verifique se `REACT_APP_API_BASE_URL` está configurado corretamente
3. Verifique se `CORS_ORIGINS` no backend inclui a URL do frontend
4. Verifique logs do backend no Render Dashboard

---

### Problema 3: Erro de CORS

**Sintoma:** Console mostra erro "CORS policy blocked"

**Causa:** Backend não está permitindo requisições do frontend

**Solução:**
1. No backend, adicione variável de ambiente:
   ```
   CORS_ORIGINS=https://jamal-esfiharia.onrender.com
   ```
2. Verifique se o código do backend tem configuração de CORS
3. Faça redeploy do backend

---

### Problema 4: Build falha no frontend

**Sintoma:** Deploy falha com erro de build

**Causa:** Dependências faltando ou erro no código

**Solução:**
1. Verifique se `@craco/craco` está em `dependencies` (não `devDependencies`)
2. Verifique se `yarn.lock` está commitado
3. Verifique logs de build no Render Dashboard
4. Se necessário, limpe cache: Settings → "Clear build cache & deploy"

---

### Problema 5: Pedidos não aparecem no admin

**Sintoma:** Pedido é criado mas não aparece no painel admin

**Causa:** Backend não está salvando ou frontend não está buscando corretamente

**Solução:**
1. Verifique logs do backend
2. Teste endpoint diretamente: `https://[SEU-BACKEND]/api/pedidos/admin`
3. Verifique se autenticação está funcionando
4. Verifique se banco de dados está configurado

---

### Problema 6: Login do admin não funciona

**Sintoma:** Erro ao tentar fazer login

**Causa:** Credenciais incorretas ou backend não configurado

**Solução:**
1. Verifique variáveis de ambiente do backend:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
2. Verifique se o endpoint `/api/auth/login` está respondendo
3. Verifique logs do backend

---

## 📊 Checklist Final

Antes de considerar o deploy completo, verifique:

### Frontend
- [ ] Site carrega na URL principal
- [ ] Rota `/cardapio` funciona
- [ ] Rota `/admin/login` funciona
- [ ] Rewrite Rule configurada
- [ ] Variável `REACT_APP_API_BASE_URL` configurada
- [ ] Sem erros no console do navegador

### Backend
- [ ] API responde em `/api/health`
- [ ] Produtos são retornados em `/api/produtos`
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados funcionando

### Integração
- [ ] Produtos carregam no cardápio
- [ ] Pedidos são criados com sucesso
- [ ] Pedidos aparecem no admin
- [ ] Login do admin funciona
- [ ] Upload de imagens funciona (se implementado)

---

## 🎉 Deploy Completo!

Se todos os itens do checklist estão marcados, seu sistema está no ar! 🚀

### URLs do Sistema

- **Cardápio:** `https://jamal-esfiharia.onrender.com/cardapio`
- **Admin:** `https://jamal-esfiharia.onrender.com/admin/login`
- **API:** `https://jamal-esfiharia-backend.onrender.com/api`

---

## 📝 Manutenção e Atualizações

### Como fazer deploy de novas alterações

1. Faça alterações no código localmente
2. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição das alterações"
   git push origin main
   ```
3. O Render detecta automaticamente e faz redeploy
4. Aguarde 3-10 minutos para o deploy completar

### Como ver logs

1. Acesse Render Dashboard
2. Clique no serviço (frontend ou backend)
3. Vá em **"Logs"** no menu lateral
4. Veja logs em tempo real

### Como fazer rollback

1. Acesse Render Dashboard
2. Clique no serviço
3. Vá em **"Events"**
4. Encontre o deploy anterior que funcionava
5. Clique em **"Rollback to this deploy"**

---

## 🔒 Segurança

### Recomendações importantes

1. **Nunca commite credenciais** no código
2. **Use variáveis de ambiente** para dados sensíveis
3. **Use HTTPS** sempre (Render fornece automaticamente)
4. **Gere senhas fortes** para admin
5. **Monitore logs** regularmente
6. **Faça backups** do banco de dados

---

## 📞 Suporte

Se encontrar problemas não listados aqui:

1. Verifique logs do Render
2. Verifique console do navegador (F12)
3. Teste endpoints da API diretamente
4. Revise configurações de variáveis de ambiente
5. Consulte documentação do Render: https://render.com/docs

---

## 🎯 Próximos Passos (Opcional)

Após o deploy básico funcionar, considere:

1. **Configurar domínio customizado** (ex: jamal-esfiharia.com.br)
2. **Configurar banco de dados PostgreSQL** (mais robusto que SQLite)
3. **Adicionar monitoramento** (Sentry, LogRocket)
4. **Configurar backups automáticos**
5. **Adicionar CI/CD** (testes automáticos)
6. **Otimizar performance** (CDN, cache)

---

**Boa sorte com o deploy! 🚀**

**Versão:** 1.0  
**Última atualização:** 07 de novembro de 2025
