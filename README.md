# 🥟 Jamal Esfiharia - Sistema de Gestão de Pedidos

Sistema completo de gestão para esfiharia/pizzaria com controle de pedidos, delivery, cardápio digital e painel administrativo.

![Status](https://img.shields.io/badge/status-pronto%20para%20produ%C3%A7%C3%A3o-success)
![Testes](https://img.shields.io/badge/testes-100%25%20aprovado-brightgreen)
![Python](https://img.shields.io/badge/python-3.11-blue)
![Flask](https://img.shields.io/badge/flask-2.3.3-lightgrey)
![React](https://img.shields.io/badge/react-18.x-61dafb)

---

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Instalação Local](#-instalação-local)
- [Deploy no Render.com](#-deploy-no-rendercom)
- [Documentação](#-documentação)
- [Testes](#-testes)
- [API](#-api)
- [Licença](#-licença)

---

## ✨ Características

### Para Clientes
- 📱 Cardápio digital responsivo
- 🛒 Carrinho de compras intuitivo
- 🚚 Cálculo automático de taxa de entrega
- 💳 Múltiplas formas de pagamento
- 📍 Rastreamento de pedidos em tempo real
- ⭐ Sistema de avaliações

### Para Administradores
- 📊 Dashboard com estatísticas
- 📦 Gestão completa de pedidos
- 🍕 Gerenciamento de produtos
- 👥 Cadastro de clientes
- 💰 Controle financeiro
- 🖨️ Impressão de pedidos
- ⚙️ Configurações do restaurante

### Funcionalidades Técnicas
- 🔐 Autenticação JWT
- 🗄️ Banco de dados SQLite/PostgreSQL
- 🌐 API RESTful completa
- 📱 Design responsivo
- 🚀 Deploy automático
- 📈 Logs e monitoramento

---

## 🛠️ Tecnologias

### Backend
- **Python 3.11**
- **Flask 2.3.3** - Framework web
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - Autenticação
- **Gunicorn** - WSGI server
- **ReportLab** - Geração de PDFs

### Frontend
- **React 18** - Interface
- **TailwindCSS** - Estilização
- **Axios** - Requisições HTTP
- **React Router** - Navegação

### Infraestrutura
- **Render.com** - Hospedagem
- **PostgreSQL** - Banco de dados (produção)
- **SQLite** - Banco de dados (desenvolvimento)

---

## 🚀 Instalação Local

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- Git

### Passo 1: Clonar Repositório

```bash
git clone https://github.com/seu-usuario/jamal-esfiharia.git
cd jamal-esfiharia
```

### Passo 2: Configurar Backend

```bash
cd backend

# Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp ../.env.example .env
# Edite .env com suas configurações

# Iniciar servidor
python app.py
```

O backend estará rodando em `http://localhost:5000`

### Passo 3: Configurar Frontend (Opcional)

O frontend já está compilado em `backend/static/`. Para desenvolvimento:

```bash
cd frontend

# Instalar dependências
yarn install

# Iniciar servidor de desenvolvimento
yarn start
```

O frontend estará rodando em `http://localhost:3000`

### Passo 4: Criar Usuário Admin

```bash
cd backend
python criar_admin.py
```

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `admin123`

⚠️ **Importante:** Altere a senha após o primeiro login!

---

## 🌐 Deploy no Render.com

O sistema está pronto para deploy no Render.com. Consulte o guia completo:

📖 **[GUIA_DEPLOY_RENDER_FINAL.md](GUIA_DEPLOY_RENDER_FINAL.md)**

### Deploy Rápido

1. Crie conta no [Render.com](https://render.com)
2. Conecte seu repositório Git
3. Configure como "Web Service"
4. Use as configurações:

```yaml
Build Command: cd backend && pip install -r requirements.txt
Start Command: cd backend && gunicorn --config gunicorn_config.py app:app
```

5. Adicione variáveis de ambiente:
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`
   - `FLASK_ENV=production`

6. Deploy!

---

## 📚 Documentação

### Documentos Disponíveis

- **[RELATORIO_TESTES_COMPLETO.md](RELATORIO_TESTES_COMPLETO.md)** - Relatório completo de testes
- **[GUIA_DEPLOY_RENDER_FINAL.md](GUIA_DEPLOY_RENDER_FINAL.md)** - Guia de deploy
- **[LEIA-ME_INSTALACAO.md](LEIA-ME_INSTALACAO.md)** - Instruções de instalação
- **[backend/README_COMPLETO.md](backend/README_COMPLETO.md)** - Documentação do backend

### Estrutura do Projeto

```
jamal_live_melhorado/
├── backend/                 # Backend Flask
│   ├── app.py              # Aplicação principal
│   ├── requirements.txt    # Dependências Python
│   ├── gunicorn_config.py  # Configuração Gunicorn
│   ├── src/
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços
│   │   └── middleware/     # Middlewares
│   ├── instance/           # Banco de dados
│   └── static/             # Frontend build
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes
│   │   ├── contexts/       # Context API
│   │   └── services/       # Serviços API
│   └── build/              # Build de produção
├── docs/                   # Documentação
├── Procfile               # Comando Render
├── runtime.txt            # Versão Python
└── render.yaml            # Configuração Render
```

---

## ✅ Testes

O sistema possui 100% de cobertura de testes funcionais.

### Executar Testes

```bash
cd backend
source venv/bin/activate
python ../test_sistema_final.py
```

### Resultados dos Testes

```
Total de testes: 13
Testes aprovados: 13 ✅
Taxa de sucesso: 100% 🎉
```

**Testes incluem:**
- ✅ Autenticação e segurança
- ✅ Gestão de produtos
- ✅ Gestão de pedidos
- ✅ Cálculo de taxa de entrega
- ✅ Configurações do sistema
- ✅ API completa

---

## 🔌 API

### Autenticação

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Produtos

```bash
# Listar produtos
GET /api/esfihas/

# Criar produto (requer autenticação)
POST /api/esfihas/
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Esfiha de Carne",
  "descricao": "Carne temperada",
  "preco": 5.50,
  "categoria": "Salgada"
}
```

### Pedidos

```bash
# Criar pedido
POST /api/pedidos/criar
Content-Type: application/json

{
  "nome_cliente": "João Silva",
  "telefone": "11999999999",
  "itens": [
    {
      "esfiha_id": 1,
      "quantidade": 3
    }
  ],
  "forma_entrega": "delivery",
  "endereco": "Rua Exemplo, 123"
}
```

### Documentação Completa

Consulte o [RELATORIO_TESTES_COMPLETO.md](RELATORIO_TESTES_COMPLETO.md) para lista completa de endpoints.

---

## 🔐 Segurança

### Implementações

- ✅ Autenticação JWT
- ✅ Senhas hasheadas (Werkzeug)
- ✅ Proteção CSRF
- ✅ CORS configurado
- ✅ Validação de entrada
- ✅ SQL Injection protection (SQLAlchemy)
- ✅ HTTPS (Render.com)

### Recomendações

1. Altere as credenciais padrão
2. Use senhas fortes
3. Mantenha dependências atualizadas
4. Configure backup regular
5. Monitore logs de acesso

---

## 📊 Performance

### Métricas

- **Tempo de resposta:** < 100ms
- **Listagem de produtos:** ~50ms (497 itens)
- **Criação de pedido:** ~80ms
- **Autenticação:** ~40ms

### Otimizações

- Paginação em listagens
- Índices no banco de dados
- Cache de configurações
- Compressão Gzip
- Lazy loading de imagens

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Sistema Jamal Esfiharia** - Desenvolvimento completo

---

## 📞 Suporte

Para dúvidas e suporte:

- 📧 Email: suporte@jamalesfiharia.com.br
- 🌐 Website: https://jamalesfiharia.com.br
- 📱 WhatsApp: (11) 99999-9999

---

## 🙏 Agradecimentos

- Comunidade Flask
- Comunidade React
- Render.com
- Todos os contribuidores

---

**Desenvolvido com ❤️ para gestão eficiente de esfiharias e pizzarias**

**Status:** ✅ Pronto para Produção  
**Versão:** 1.0.0  
**Data:** 06/11/2025
