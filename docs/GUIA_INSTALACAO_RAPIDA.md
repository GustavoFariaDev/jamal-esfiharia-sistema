# 🚀 GUIA DE INSTALAÇÃO RÁPIDA - JAMAL ESFIHARIA

**Sistema:** Jamal Esfiharia & Pizzaria  
**Versão:** 2.1 - Corrigida e Completa  
**Data:** 03/11/2025

---

## 📦 REQUISITOS

### Sistema Operacional
- Linux (Ubuntu 20.04+ recomendado)
- macOS
- Windows (com WSL2)

### Software Necessário
- **Python 3.11+**
- **Node.js 18+**
- **npm 9+**
- **pip3**

---

## 📥 INSTALAÇÃO

### 1. Extrair o Pacote

```bash
tar -xzf jamal_sistema_CORRIGIDO_03NOV2025.tar.gz
cd jamal_sistema
```

---

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências Python
pip3 install -r requirements.txt

# O banco de dados já está configurado com todos os produtos
# Não é necessário popular novamente
```

---

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências Node.js
npm install

# Configurar variáveis de ambiente
# Editar o arquivo .env com a URL do seu backend
```

**Arquivo `.env` do frontend:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_BASE_URL=http://localhost:5000/api
NODE_ENV=development
GENERATE_SOURCEMAP=false
WDS_SOCKET_PORT=0
REACT_APP_WHATSAPP_NUMBER=5511933331106
```

---

## ▶️ EXECUTAR O SISTEMA

### Terminal 1 - Backend

```bash
cd jamal_sistema/backend
python3 app.py
```

**Saída esperada:**
```
============================================================
🥟 JAMAL ESFIHARIA - SISTEMA DE GESTÃO
============================================================
🌐 Servidor iniciando...
📱 Painel Admin: http://localhost:5000/admin
🔧 API Base: http://localhost:5000/api/
============================================================
 * Running on http://0.0.0.0:5000
```

---

### Terminal 2 - Frontend

```bash
cd jamal_sistema/frontend
npm start
```

**Saída esperada:**
```
Compiled successfully!

You can now view jamal-esfiharia-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## 🌐 ACESSAR O SISTEMA

### Para Clientes (Cardápio)
**URL:** http://localhost:3000

### Para Administradores (Painel)
**URL:** http://localhost:5000/admin  
**Usuário:** admin  
**Senha:** admin123

---

## ✅ VERIFICAR INSTALAÇÃO

### 1. Testar Backend

```bash
# Listar categorias
curl http://localhost:5000/api/categories/

# Listar produtos (primeiros 10)
curl "http://localhost:5000/api/esfihas/?per_page=10"

# Verificar pizzas doces
curl "http://localhost:5000/api/esfihas/?categoria=PIZZAS%20DOCES"
```

### 2. Testar Frontend

1. Abrir http://localhost:3000
2. Verificar se os produtos aparecem
3. Testar filtro por categoria
4. Selecionar um produto e escolher tamanho
5. Adicionar ao carrinho

---

## 📊 DADOS DO SISTEMA

### Produtos Cadastrados: 485

- **Pizzas Salgadas:** 47
- **Pizzas Doces:** 19 ✨
- **Beirutes:** 16
- **Batatas:** 4
- **Salgados:** 5
- **Esfihas:** 133
- **Pastéis:** 133
- **Fogazzes:** 128

### Acréscimos Cadastrados: 42

- **Esfiha:** 9
- **Pizza Metade:** 14
- **Pizza Toda:** 14
- **Borda:** 5

---

## 🔧 CONFIGURAÇÕES ADICIONAIS

### Alterar Número do WhatsApp

Editar `frontend/.env`:
```env
REACT_APP_WHATSAPP_NUMBER=5511999999999
```

### Alterar Porta do Backend

Editar `backend/app.py` (linha 108):
```python
app.run(
    host='0.0.0.0',
    port=5000,  # Alterar aqui
    debug=False,
    use_reloader=False
)
```

### Alterar Porta do Frontend

```bash
PORT=3001 npm start
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Backend não inicia

**Erro:** `ModuleNotFoundError: No module named 'flask'`

**Solução:**
```bash
pip3 install -r requirements.txt
```

---

### Frontend não compila

**Erro:** `Cannot find module`

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Produtos não aparecem no frontend

**Verificar:**
1. Backend está rodando? `curl http://localhost:5000/api/esfihas/`
2. URL da API está correta no `.env`?
3. Console do navegador mostra erros?

**Solução:**
```bash
# Verificar logs do backend
# Verificar arquivo .env do frontend
# Abrir DevTools do navegador (F12)
```

---

### Erro de CORS

**Erro:** `Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solução:** O CORS já está configurado no backend. Reinicie o backend.

---

## 📁 ESTRUTURA DO PROJETO

```
jamal_sistema/
├── backend/
│   ├── app.py                    # Aplicação principal
│   ├── requirements.txt          # Dependências Python
│   ├── instance/
│   │   └── esfiharia.db         # Banco de dados SQLite
│   ├── src/
│   │   ├── models/              # Modelos do banco
│   │   ├── routes/              # Rotas da API
│   │   └── services/            # Serviços
│   └── adicionar_pizzas_doces.py # Script de pizzas doces
│
├── frontend/
│   ├── package.json             # Dependências Node.js
│   ├── .env                     # Variáveis de ambiente
│   ├── public/                  # Arquivos públicos
│   └── src/
│       ├── components/          # Componentes React
│       ├── services/            # Serviços de API
│       └── App.js              # Componente principal
│
└── CORRECOES_FINAIS_03NOV2025.md # Documentação
```

---

## 📞 SUPORTE

Para dúvidas, consulte:
- `CORRECOES_FINAIS_03NOV2025.md` - Correções aplicadas
- `README.md` - Documentação completa
- `GUIA_RAPIDO_CLIENTE.md` - Guia para clientes

---

## ✅ CHECKLIST DE INSTALAÇÃO

- [ ] Python 3.11+ instalado
- [ ] Node.js 18+ instalado
- [ ] Pacote extraído
- [ ] Dependências do backend instaladas
- [ ] Dependências do frontend instaladas
- [ ] Arquivo `.env` configurado
- [ ] Backend rodando na porta 5000
- [ ] Frontend rodando na porta 3000
- [ ] Produtos aparecem no cardápio
- [ ] Painel admin acessível

---

**Instalação estimada:** 10-15 minutos  
**Dificuldade:** Fácil  
**Status:** ✅ Pronto para uso
