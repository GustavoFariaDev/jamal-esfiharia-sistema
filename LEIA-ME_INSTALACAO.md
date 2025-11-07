# 🚀 Instalação - Sistema Jamal Esfiharia

**Versão:** Completo e Corrigido - 04/11/2025  
**Status:** ✅ Pronto para uso

---

## 📦 O que está incluído

Este pacote contém o sistema completo com todas as correções aplicadas:

### ✅ Funcionalidades Implementadas:

1. **Modal de Esfiha com Tipo de Massa**
   - Seletor visual Aberta/Fechada (🥟 🥙)
   - 9 acréscimos disponíveis (R$ 3,00 a R$ 5,00)
   - Controle de quantidade
   - Cálculo automático de preço

2. **Banco de Dados Completo**
   - 495 produtos cadastrados
   - 42 acréscimos (esfihas, pizzas, bordas)
   - Campo `tipo_massa` adicionado
   - Estrutura completa para pedidos

3. **Backend Flask**
   - API REST completa
   - CORS configurado
   - Rotas de produtos, acréscimos, pedidos
   - Sistema de pausa temporária

4. **Frontend React**
   - Cardápio completo
   - Painel administrativo
   - Carrinho de compras
   - Calculadora de entrega

---

## 🔧 Instalação Rápida

### Pré-requisitos

- **Python 3.11+**
- **Node.js 18+** e npm
- **SQLite3** (já incluído no Python)

### Passo 1: Extrair o arquivo

```bash
unzip jamal_sistema_COMPLETO_CORRIGIDO.zip
cd jamal_final
```

### Passo 2: Instalar Backend

```bash
cd backend
pip3 install -r requirements.txt
```

### Passo 3: Instalar Frontend

```bash
cd ../frontend
npm install
```

### Passo 4: Iniciar Sistema

**Terminal 1 - Backend:**
```bash
cd backend
python3.11 app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Passo 5: Acessar

- **Cardápio (Clientes):** http://localhost:3000
- **Painel Admin:** http://localhost:3000/admin
- **API Backend:** http://localhost:5000/api/

---

## 🧪 Testar Funcionalidades

### Teste 1: Modal de Esfiha

1. Acesse http://localhost:3000
2. Clique em "CARDÁPIO"
3. Clique em "+ Adicionar" em qualquer esfiha
4. **Deve abrir modal** com:
   - 🥟 Aberta | 🥙 Fechada
   - Lista de 9 acréscimos
   - Controle de quantidade
   - Preço total calculado

### Teste 2: Adicionar ao Carrinho

1. No modal, selecione "Aberta"
2. Marque 2 acréscimos (ex: Bacon + Catupiry)
3. Defina quantidade: 2
4. Clique em "Adicionar ao Carrinho"
5. Abra o carrinho (ícone no canto inferior direito)
6. **Deve exibir:**
   ```
   Esfiha de Carne (Aberta) + Bacon, Catupiry
   Quantidade: 2
   Preço: R$ 14,50 × 2 = R$ 29,00
   ```

### Teste 3: Painel Admin

1. Acesse http://localhost:3000/admin
2. Faça login (ou crie usuário admin)
3. Visualize produtos, pedidos e configurações

---

## 📊 Estrutura do Projeto

```
jamal_final/
├── backend/
│   ├── app.py                    # Aplicação Flask principal
│   ├── src/
│   │   ├── models/              # Modelos do banco de dados
│   │   │   ├── esfiha.py
│   │   │   ├── acrescimo.py
│   │   │   ├── pedido.py
│   │   │   └── ...
│   │   └── routes/              # Rotas da API
│   │       ├── esfiha.py
│   │       ├── acrescimos.py
│   │       ├── pedido.py
│   │       └── ...
│   ├── instance/
│   │   └── jamal.db             # Banco SQLite (495 produtos)
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EsfihaModal.js   # 🆕 Modal de esfiha (NOVO)
│   │   │   ├── FullMenu.js      # ✅ Cardápio (CORRIGIDO)
│   │   │   ├── AdminPanel.js    # Painel admin
│   │   │   ├── PizzaModal.js    # Modal de pizza
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── apiService.js    # Cliente da API
│   │   └── App.js               # Rotas principais
│   ├── package.json
│   ├── .env                      # Configuração da API
│   └── ...
│
└── LEIA-ME_INSTALACAO.md        # Este arquivo
```

---

## 🔐 Criar Usuário Admin

Se precisar criar um usuário administrativo:

```bash
cd backend
python3.11 criar_admin.py
```

Ou via Python:

```python
from src.models.user import User
from app import db, app

with app.app_context():
    admin = User(
        username='admin',
        email='admin@jamal.com',
        is_admin=True
    )
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.commit()
    print('✅ Admin criado!')
```

---

## 📝 Configurações

### Backend (.env ou variáveis de ambiente)

```bash
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=sua_chave_secreta_aqui
DATABASE_URL=sqlite:///instance/jamal.db
```

### Frontend (.env)

```bash
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

**Nota:** O arquivo `.env` já está configurado no pacote.

---

## 🔍 Verificar Banco de Dados

### Ver produtos cadastrados:

```bash
cd backend
python3.11 -c "
import sqlite3
conn = sqlite3.connect('instance/jamal.db')
cursor = conn.cursor()

# Total de produtos
cursor.execute('SELECT COUNT(*) FROM esfiha')
print(f'Total de produtos: {cursor.fetchone()[0]}')

# Produtos por categoria
cursor.execute('SELECT categoria, COUNT(*) FROM esfiha GROUP BY categoria')
for cat, count in cursor.fetchall():
    print(f'{cat}: {count}')

conn.close()
"
```

### Ver acréscimos:

```bash
cd backend
python3.11 -c "
import sqlite3
conn = sqlite3.connect('instance/jamal.db')
cursor = conn.cursor()

cursor.execute('SELECT tipo, COUNT(*) FROM acrescimo GROUP BY tipo')
for tipo, count in cursor.fetchall():
    print(f'{tipo}: {count} acréscimos')

conn.close()
"
```

---

## 🚨 Solução de Problemas

### Problema 1: Erro ao instalar dependências do Python

**Solução:**
```bash
pip3 install --upgrade pip
pip3 install -r requirements.txt
```

### Problema 2: Erro ao instalar dependências do Node

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema 3: Porta 5000 ou 3000 já em uso

**Solução:**
```bash
# Verificar processos
lsof -i :5000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Problema 4: CORS Error no frontend

**Solução:**
O CORS já está configurado no backend. Verifique se o `.env` do frontend está correto:
```bash
cat frontend/.env
# Deve mostrar: REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### Problema 5: Modal de esfiha não abre

**Solução:**
Verifique se o arquivo `EsfihaModal.js` existe:
```bash
ls -la frontend/src/components/EsfihaModal.js
```

Se não existir, o arquivo está no pacote ZIP.

---

## 📊 Dados do Sistema

### Produtos: **495**

| Categoria | Quantidade |
|-----------|------------|
| ESFIHAS SALGADAS | 91 |
| FOGAZZES SALGADAS | 91 |
| PASTÉIS SALGADOS | 86 |
| PIZZAS SALGADAS | 47 |
| ESFIHAS DOCES | 29 |
| FOGAZZES DOCES | 29 |
| PASTÉIS DOCES | 29 |
| PIZZAS DOCES | 19 |
| BEIRUTES | 16 |
| BEBIDAS | 10 |
| Outros | 48 |

### Acréscimos: **42**

- **Esfihas:** 9 itens (R$ 3,00 a R$ 5,00)
- **Pizza Metade:** 14 itens (R$ 7,00)
- **Pizza Toda:** 14 itens (R$ 12,00)
- **Bordas:** 5 itens (R$ 13,00 a R$ 16,00)

---

## 🎯 Próximos Passos (Opcional)

Após instalação, você pode:

1. **Personalizar produtos**
   - Adicionar imagens
   - Ajustar preços
   - Criar novas categorias

2. **Configurar entrega**
   - Ajustar taxas de entrega
   - Definir raio de atendimento

3. **Customizar design**
   - Alterar cores em `tailwind.config.js`
   - Modificar logos e imagens

4. **Deploy em produção**
   - Usar Gunicorn para backend
   - Build do React para frontend
   - Configurar nginx

---

## 📞 Suporte

### Logs para Diagnóstico

**Backend:**
```bash
# Executar com logs visíveis
cd backend
python3.11 app.py
```

**Frontend:**
```bash
# Executar com logs visíveis
cd frontend
npm start
```

### Testar API

```bash
# Listar produtos
curl http://localhost:5000/api/esfihas/ | python3 -m json.tool

# Listar acréscimos
curl http://localhost:5000/api/acrescimos?tipo=esfiha | python3 -m json.tool

# Verificar status da loja
curl http://localhost:5000/api/configuracao/status | python3 -m json.tool
```

---

## ✅ Checklist de Verificação

Após instalação, confirme:

- [ ] Backend rodando sem erros (porta 5000)
- [ ] Frontend rodando sem erros (porta 3000)
- [ ] Cardápio carregando produtos
- [ ] Modal de esfiha abrindo
- [ ] Seletor de tipo de massa funcionando
- [ ] Acréscimos carregando
- [ ] Carrinho funcionando
- [ ] Painel admin acessível
- [ ] Pedidos sendo salvos no banco

---

## 🎉 Conclusão

Seu sistema Jamal Esfiharia está pronto para uso com todas as funcionalidades:

✅ Modal de personalização de esfihas  
✅ Tipo de massa (Aberta/Fechada)  
✅ 9 acréscimos para esfihas  
✅ 495 produtos cadastrados  
✅ Painel administrativo completo  
✅ Sistema de pedidos funcional  

**Boas vendas! 🥟🍕**

---

**Versão:** 1.0 Completo e Corrigido  
**Data:** 04/11/2025  
**Compatibilidade:** Python 3.11+ | Node.js 18+ | React 18.x
