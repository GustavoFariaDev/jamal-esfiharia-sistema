# 🍕 Jamal Esfiharia - Sistema de Gestão

Sistema completo de esfiharia com cardápio online e painel administrativo.

## 🚀 Deploy Rápido

**Quer colocar o sistema no ar?** Siga um destes guias:

- 📋 **[CHECKLIST_RAPIDO.md](CHECKLIST_RAPIDO.md)** - Checklist objetivo (20-30 min)
- 📖 **[GUIA_DEPLOY_RENDER.md](GUIA_DEPLOY_RENDER.md)** - Guia completo passo a passo
- 📊 **[RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)** - Visão geral das melhorias

## ✨ Funcionalidades

### Cardápio Online
- Visualização completa de produtos
- Busca e filtros por categoria
- Carrinho de compras
- Pizzas meio a meio
- Calculadora de taxa de entrega
- Finalização de pedidos

### Painel Administrativo
- Gerenciamento de produtos
- Gerenciamento de pedidos
- Gerenciamento de clientes
- Upload de imagens
- Controle de status do restaurante
- Impressão de pedidos

## 🏗️ Arquitetura

### Frontend (React)
- React 18
- React Router para navegação
- Tailwind CSS para estilização
- shadcn/ui para componentes
- Hooks customizados para lógica de negócio

### Backend (Flask)
- Flask REST API
- SQLAlchemy ORM
- Autenticação JWT
- CORS configurado
- Upload de imagens

## 📦 Estrutura do Projeto

```
jamal-esfiharia-sistema/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── hooks/          # Hooks customizados
│   │   ├── services/       # Serviços de API
│   │   └── contexts/       # Contextos React
│   └── package.json
│
├── backend/                 # API Flask
│   ├── app.py              # Aplicação principal
│   ├── requirements.txt    # Dependências Python
│   └── gunicorn_config.py  # Configuração do servidor
│
└── docs/                    # Documentação
    ├── GUIA_DEPLOY_RENDER.md
    ├── CHECKLIST_RAPIDO.md
    └── MELHORIAS_IMPLEMENTADAS.md
```

## 🛠️ Desenvolvimento Local

### Frontend

```bash
cd frontend
yarn install
yarn start
```

Acesse: http://localhost:3000

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

API disponível em: http://localhost:5000

## 🌐 Deploy em Produção

### Opção 1: Render.com (Recomendado)

Siga o **[CHECKLIST_RAPIDO.md](CHECKLIST_RAPIDO.md)** para deploy em 20-30 minutos.

**Configurações necessárias:**

**Backend:**
- Runtime: Python 3
- Build: `pip install -r requirements.txt`
- Start: `gunicorn -c gunicorn_config.py app:app`

**Frontend:**
- Build: `yarn install && yarn build`
- Publish: `build`
- **Rewrite Rule:** `/* → /index.html` (CRÍTICO!)

### Variáveis de Ambiente

**Frontend:**
```env
REACT_APP_API_BASE_URL=https://seu-backend.onrender.com/api
NODE_ENV=production
```

**Backend:**
```env
FLASK_ENV=production
SECRET_KEY=sua-chave-secreta
ADMIN_USERNAME=admin
ADMIN_PASSWORD=senha-forte
CORS_ORIGINS=https://seu-frontend.onrender.com
```

## 📝 Melhorias Recentes (v1.1.0)

- ✅ Hooks customizados (useCart, useProductFilter, useProducts)
- ✅ Componente CartModal modularizado
- ✅ Estrutura de pastas organizada
- ✅ Documentação completa de deploy
- ✅ Código mais limpo e manutenível

Veja detalhes em **[MELHORIAS_IMPLEMENTADAS.md](MELHORIAS_IMPLEMENTADAS.md)**

## 🐛 Troubleshooting

### Rotas retornam 404
→ Configure a Rewrite Rule no Render: `/* → /index.html`

### Produtos não carregam
→ Verifique `REACT_APP_API_BASE_URL` no frontend

### Erro de CORS
→ Configure `CORS_ORIGINS` no backend

Mais soluções em **[GUIA_DEPLOY_RENDER.md](GUIA_DEPLOY_RENDER.md)**

## 📄 Licença

Este projeto é privado e de uso exclusivo da Jamal Esfiharia.

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Crie hooks para lógica complexa
2. Mantenha componentes pequenos e focados
3. Documente mudanças importantes
4. Teste antes de fazer commit

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação na pasta `docs/` ou os guias de deploy.

---

**Versão:** 1.1.0  
**Última atualização:** 07 de novembro de 2025  
**Status:** ✅ Pronto para produção
