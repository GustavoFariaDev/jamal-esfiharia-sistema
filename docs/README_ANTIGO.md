# Sistema Jamal Esfiharia - CORRIGIDO

## Versão: FINAL_04NOV2025_SEM_BUGS

### ✅ Correções Aplicadas

1. **Rota /cardapio corrigida** - Agora usa o componente `FullMenu` com todos os recursos
2. **Arquivo MenuSection.js removido** - Eliminada a interferência
3. **Limpeza de arquivos** - Backups e arquivos desnecessários removidos
4. **Documentação organizada** - Todos os .md movidos para pasta `docs/`

---

## 🎯 Recursos Disponíveis

### Para Pizzas:
- ✅ **Seletor de tamanhos** (Broto, Média, Grande)
- ✅ **Botão "Montar Pizza Meio a Meio"**
- ✅ **Seletor de acréscimos e bordas**
- ✅ **Preços diferenciados por tamanho**

### Para Esfihas:
- ✅ **Seletor de acréscimos**
- ✅ **Preço único**

### Para Outros Produtos:
- ✅ **Exibição simples** (nome, descrição, preço, botão adicionar)

---

## 🚀 Como Iniciar o Sistema

### 1. Backend

```bash
cd backend
pip3 install -r requirements.txt
python3 app.py
```

O backend estará disponível em: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

O frontend estará disponível em: `http://localhost:3000`

---

## 📱 Rotas Disponíveis

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Home | Página inicial |
| `/menu` | FullMenu | Cardápio completo |
| `/cardapio` | FullMenu | Cardápio completo (mesma funcionalidade) |
| `/admin/login` | AdminLogin | Login do administrador |
| `/admin` | AdminPanel | Painel administrativo |

---

## 🗄️ Banco de Dados

O sistema usa SQLite com o arquivo `instance/esfiharia.db`

### Produtos Cadastrados:
- 66 Pizzas (salgadas e doces)
- Esfihas (salgadas, doces, vegetarianas, especiais)
- Beirutes
- Batatas (simples e recheadas)
- Pastéis
- Fogazzes
- Bebidas

---

## 🔧 Estrutura de Arquivos

```
jamal_sistema/
├── backend/
│   ├── app.py                 # Aplicação Flask
│   ├── instance/
│   │   └── esfiharia.db      # Banco de dados
│   ├── src/                   # Código fonte
│   └── requirements.txt       # Dependências Python
│
├── frontend/
│   ├── src/
│   │   ├── App.js            # Rotas (CORRIGIDO)
│   │   ├── components/
│   │   │   ├── FullMenu.js   # Cardápio completo
│   │   │   ├── PizzaCard.js  # Card de pizza com recursos
│   │   │   ├── HalfAndHalfSelector.js
│   │   │   ├── ExtrasSelector.js
│   │   │   └── ...
│   │   └── ...
│   └── package.json
│
└── docs/                      # Documentação
    └── *.md
```

---

## 📝 Alterações Realizadas

### App.js
```javascript
// ANTES:
<Route path="/cardapio" element={<MenuSection />} />

// DEPOIS:
<Route path="/cardapio" element={<FullMenu />} />
```

### Arquivos Removidos:
- ❌ `frontend/src/components/MenuSection.js` (causava interferência)
- ❌ `frontend/src/components/FullMenu.js.bak` (backup desnecessário)

### Arquivos Organizados:
- 📁 Todos os arquivos `.md` movidos para `docs/`

---

## 🎨 Componentes Principais

### FullMenu.js
- Cardápio completo com filtros
- Integração com PizzaCard
- Carrinho de compras
- Calculadora de taxa de entrega
- Formulário de pedido

### PizzaCard.js
- Detecção automática de tipo de produto
- Seletor de tamanhos para pizzas
- Botão meio a meio
- Seletor de acréscimos
- Cálculo automático de preço

### HalfAndHalfSelector.js
- Seleção de duas metades
- Cálculo de preço (maior valor + 50% do menor)
- Suporte a acréscimos

### ExtrasSelector.js
- Acréscimos para pizzas (pizza toda ou metade)
- Acréscimos para esfihas
- Bordas recheadas
- Cálculo automático de valores

---

## 🔐 Acesso Administrativo

**URL:** `http://localhost:3000/admin/login`

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `admin123`

---

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação em `docs/`

---

**Sistema testado e funcionando em:** 04/11/2025  
**Versão:** FINAL_04NOV2025_SEM_BUGS
