# Jamal Esfiharia - Frontend

Sistema frontend da Jamal Esfiharia, focado exclusivamente em esfihas tradicionais árabes.

## 🍽️ Sobre o Projeto

Este é o frontend da Jamal Esfiharia, uma aplicação React moderna e responsiva para apresentação e venda de esfihas tradicionais árabes.

## ✨ Funcionalidades

- **Página Principal**: Apresentação da esfiharia com slider de imagens
- **Cardápio Completo**: Visualização de todos os produtos disponíveis
- **Sistema de Carrinho**: Adicionar e gerenciar itens no carrinho
- **Painel Administrativo**: Gerenciamento de produtos (acesso restrito)
- **Design Responsivo**: Otimizado para desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **React 18**: Framework principal
- **React Router**: Navegação entre páginas
- **Tailwind CSS**: Estilização e design responsivo
- **Radix UI**: Componentes de interface
- **Lucide React**: Ícones modernos
- **Axios**: Requisições HTTP

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos para instalação

1. **Clone ou extraia o projeto**
```bash
cd jamal_frontend_limpo
```

2. **Instale as dependências**
```bash
npm install --legacy-peer-deps
# ou
yarn install
```

**Nota:** A flag `--legacy-peer-deps` é necessária devido a conflitos de peer dependencies entre algumas bibliotecas.

3. **Configure as variáveis de ambiente**
```bash
cp .env .env.local
```

4. **Execute o projeto**
```bash
npm start
# ou
yarn start
```

O projeto será executado em `http://localhost:3000`

## 🏗️ Scripts Disponíveis

- `npm start`: Executa o projeto em modo de desenvolvimento
- `npm run build`: Cria a versão de produção
- `npm test`: Executa os testes

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── Header.js        # Cabeçalho da aplicação
│   ├── HeroSlider.js    # Slider principal com imagens
│   ├── WelcomeSection.js # Seção de boas-vindas
│   ├── MenuSection.js   # Seção do cardápio
│   ├── FullMenu.js      # Página completa do cardápio
│   ├── AdminPanel.js    # Painel administrativo
│   └── ui/              # Componentes de UI reutilizáveis
├── hooks/               # Custom hooks
├── lib/                 # Utilitários e configurações
└── mock/                # Dados mockados para desenvolvimento
```

## 🎨 Personalização

### Cores do Tema
As cores principais estão definidas no Tailwind CSS:
- `jamal-red`: Vermelho principal da marca
- `jamal-gold`: Dourado para destaques

### Imagens
- Apenas imagens relacionadas a esfihas são utilizadas
- Imagens localizadas em `/public/`

## 🔧 Configuração do Backend

O frontend está configurado para se conectar com um backend em:
- Desenvolvimento: `http://localhost:5000`
- Produção: Configurar no arquivo `.env`

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deploy

Para fazer deploy do projeto:

1. **Build de produção**
```bash
npm run build
```

2. **Servir arquivos estáticos**
Os arquivos gerados na pasta `build/` podem ser servidos por qualquer servidor web.

## 📞 Suporte

Sistema limpo e otimizado, focado exclusivamente em esfihas tradicionais árabes.

---

**Jamal Esfiharia** - Tradição árabe em cada esfiha 🥟
