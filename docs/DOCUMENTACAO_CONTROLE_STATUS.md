# 🔐 Documentação - Controle de Status do Restaurante

**Data:** 26 de Outubro de 2025  
**Versão:** 1.0  
**Funcionalidade:** Sistema de Abertura e Fechamento do Restaurante

---

## 📋 Visão Geral

Esta funcionalidade permite que administradores controlem o status de abertura/fechamento do restaurante através do painel administrativo, e exibe um banner informativo para os clientes quando o restaurante está fechado ou não está aceitando pedidos.

---

## 🎯 Funcionalidades Implementadas

### Para Administradores

1. **Controle Manual de Status**
   - Botão para abrir/fechar o restaurante instantaneamente
   - Pausar aceitação de pedidos sem fechar completamente
   - Ativar modo manutenção

2. **Configuração de Horários**
   - Definir horário de abertura e fechamento
   - Configurar dias de funcionamento
   - Mensagem personalizada de fechamento

3. **Verificação Automática**
   - Sistema verifica automaticamente se está dentro do horário
   - Valida dia da semana
   - Respeita configurações manuais

### Para Clientes

1. **Banner de Status**
   - Exibido automaticamente quando restaurante está fechado
   - Mostra mensagem personalizada
   - Informa horário de funcionamento
   - Atualiza automaticamente a cada 1 minuto

2. **Bloqueio de Pedidos**
   - Impede finalização de pedidos quando fechado
   - Mensagem clara sobre indisponibilidade

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `status_restaurante`

```sql
CREATE TABLE status_restaurante (
    id INTEGER PRIMARY KEY,
    aberto BOOLEAN DEFAULT TRUE,
    mensagem_fechamento VARCHAR(500),
    horario_abertura VARCHAR(5),      -- Formato: HH:MM
    horario_fechamento VARCHAR(5),    -- Formato: HH:MM
    dias_funcionamento VARCHAR(100),  -- JSON: ["seg", "ter", ...]
    aceita_pedidos BOOLEAN DEFAULT TRUE,
    modo_manutencao BOOLEAN DEFAULT FALSE,
    atualizado_em DATETIME,
    atualizado_por INTEGER FOREIGN KEY(user.id)
);
```

### Tabela: `configuracao`

```sql
CREATE TABLE configuracao (
    id INTEGER PRIMARY KEY,
    chave VARCHAR(100) UNIQUE,
    valor VARCHAR(500),
    tipo VARCHAR(50),              -- string, boolean, json
    descricao VARCHAR(200),
    atualizado_em DATETIME
);
```

---

## 🔌 API Endpoints

### Endpoints Públicos

#### `GET /api/configuracao/status`
Retorna o status público do restaurante.

**Resposta:**
```json
{
  "aberto": true,
  "aceita_pedidos": true,
  "mensagem": "Estamos abertos!",
  "horario_abertura": "18:00",
  "horario_fechamento": "23:00",
  "dias_funcionamento": ["ter", "qua", "qui", "sex", "sab", "dom"]
}
```

### Endpoints Administrativos (Requer Autenticação)

#### `GET /api/configuracao/status/admin`
Retorna status completo do restaurante (apenas admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "status": {
    "id": 1,
    "aberto": true,
    "mensagem_fechamento": "Estamos fechados no momento...",
    "horario_abertura": "18:00",
    "horario_fechamento": "23:00",
    "dias_funcionamento": ["ter", "qua", "qui", "sex", "sab", "dom"],
    "aceita_pedidos": true,
    "modo_manutencao": false,
    "atualizado_em": "2025-10-26T20:00:00",
    "atualizado_por": 1
  },
  "verificacao": {
    "esta_aberto": true,
    "mensagem": "Restaurante aberto"
  }
}
```

#### `POST /api/configuracao/status/toggle`
Abre ou fecha o restaurante manualmente (apenas admin).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "aberto": false,
  "mensagem": "Fechado para manutenção"
}
```

**Resposta:**
```json
{
  "message": "Restaurante fechado com sucesso",
  "status": { ... }
}
```

#### `PUT /api/configuracao/status/update`
Atualiza configurações de status (apenas admin).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "horario_abertura": "18:00",
  "horario_fechamento": "23:00",
  "dias_funcionamento": ["ter", "qua", "qui", "sex", "sab", "dom"],
  "aceita_pedidos": true,
  "modo_manutencao": false,
  "mensagem_fechamento": "Estamos fechados. Volte amanhã!"
}
```

---

## 🎨 Componentes Frontend

### 1. `RestaurantStatusControl.js`
Componente administrativo para controle do status.

**Localização:** `/frontend/src/components/RestaurantStatusControl.js`

**Funcionalidades:**
- Botão grande de toggle (Abrir/Fechar)
- Visualização de horários e dias
- Controles para pausar pedidos
- Ativar modo manutenção
- Atualização em tempo real

**Uso:**
```jsx
import RestaurantStatusControl from './RestaurantStatusControl';

// No AdminPanel
<RestaurantStatusControl />
```

### 2. `RestaurantStatusBanner.js`
Banner público para clientes.

**Localização:** `/frontend/src/components/RestaurantStatusBanner.js`

**Funcionalidades:**
- Exibição condicional (só aparece se fechado)
- Atualização automática a cada 1 minuto
- Mensagem personalizada
- Horário de funcionamento

**Uso:**
```jsx
import RestaurantStatusBanner from './RestaurantStatusBanner';

// Na página principal
<RestaurantStatusBanner />
```

---

## 🚀 Como Usar

### Instalação

1. **Executar migração do banco de dados:**
```bash
cd backend
python3 migrate_add_configuracao.py
```

2. **Verificar instalação:**
```bash
# O script exibirá:
✅ Migração concluída com sucesso!
📊 Status do Sistema:
  • Restaurante: ABERTO
  • Horário: 18:00 às 23:00
  • Aceita pedidos: SIM
  • Modo manutenção: NÃO
```

### Uso no Painel Admin

1. **Acessar o painel:**
   - URL: `http://localhost:3000/admin`
   - Login com credenciais de admin

2. **Navegar para aba "Status":**
   - Clicar na aba "Status" no menu superior

3. **Controlar o restaurante:**
   - **Fechar rapidamente:** Clicar no botão vermelho "🔒 FECHAR RESTAURANTE"
   - **Abrir novamente:** Clicar no botão verde "🔓 ABRIR RESTAURANTE"
   - **Pausar pedidos:** Clicar em "🚫 Pausar Pedidos"
   - **Modo manutenção:** Clicar em "⚠️ Modo Manutenção"

### Configuração de Horários

Os horários padrão são:
- **Abertura:** 18:00
- **Fechamento:** 23:00
- **Dias:** Terça a Domingo

Para alterar, você pode:
1. Modificar via API (endpoint `/api/configuracao/status/update`)
2. Editar diretamente no banco de dados
3. Criar interface de configuração no painel admin (futuro)

---

## 📊 Lógica de Verificação

O sistema verifica o status do restaurante na seguinte ordem:

1. **Modo Manutenção?**
   - Se SIM → Fechado

2. **Manualmente Fechado?**
   - Se SIM → Fechado com mensagem personalizada

3. **Dia da Semana Correto?**
   - Se NÃO → Fechado (ex: "Não abrimos às segundas")

4. **Dentro do Horário?**
   - Se NÃO → Fechado (ex: "Horário: 18:00 às 23:00")

5. **Aceita Pedidos?**
   - Se NÃO → Aberto mas não aceita pedidos

6. **Tudo OK?**
   - Restaurante ABERTO e aceitando pedidos ✅

---

## 🎨 Exemplos de Uso

### Exemplo 1: Fechar para Almoço
```javascript
// Fechar temporariamente
POST /api/configuracao/status/toggle
{
  "aberto": false,
  "mensagem": "Fechado para almoço. Voltamos às 18:00!"
}
```

### Exemplo 2: Manutenção Programada
```javascript
// Ativar modo manutenção
PUT /api/configuracao/status/update
{
  "modo_manutencao": true,
  "mensagem_fechamento": "Sistema em manutenção. Voltamos em breve!"
}
```

### Exemplo 3: Pausar Pedidos (Cozinha Lotada)
```javascript
// Pausar sem fechar
PUT /api/configuracao/status/update
{
  "aceita_pedidos": false,
  "mensagem_fechamento": "Muitos pedidos no momento. Aguarde alguns minutos!"
}
```

### Exemplo 4: Alterar Horário de Funcionamento
```javascript
// Mudar para horário de verão
PUT /api/configuracao/status/update
{
  "horario_abertura": "17:00",
  "horario_fechamento": "00:00"
}
```

---

## 🔧 Configurações Padrão

### Status Inicial
```json
{
  "aberto": true,
  "mensagem_fechamento": "Estamos fechados no momento. Volte em breve!",
  "horario_abertura": "18:00",
  "horario_fechamento": "23:00",
  "dias_funcionamento": ["ter", "qua", "qui", "sex", "sab", "dom"],
  "aceita_pedidos": true,
  "modo_manutencao": false
}
```

### Configurações Gerais
```json
{
  "nome_restaurante": "Jamal Esfiharia",
  "telefone_contato": "5511933331106",
  "taxa_entrega_minima": "5.00",
  "pedido_minimo": "20.00",
  "aceita_retirada": true
}
```

---

## ✅ Checklist de Implementação

- ✅ Modelo de dados criado (`configuracao.py`)
- ✅ Rotas de API implementadas (`configuracao.py`)
- ✅ Migração do banco de dados criada
- ✅ Componente de controle admin criado
- ✅ Banner de status para clientes criado
- ✅ Integração com AdminPanel
- ✅ Integração com Home e FullMenu
- ✅ Documentação completa

---

## 🎉 Benefícios

1. **Controle Total:** Admin pode abrir/fechar com 1 clique
2. **Automação:** Verificação automática de horário e dia
3. **Flexibilidade:** Pausar pedidos sem fechar completamente
4. **Comunicação:** Mensagens personalizadas para clientes
5. **Manutenção:** Modo especial para updates do sistema
6. **UX:** Banner discreto mas informativo para clientes

---

## 📝 Próximas Melhorias

1. **Agendamento:** Agendar abertura/fechamento automático
2. **Notificações:** Avisar clientes sobre reabertura
3. **Histórico:** Log de todas as mudanças de status
4. **Analytics:** Relatório de horários de pico
5. **Interface:** Editor visual de horários no admin

---

**Desenvolvido por:** Manus AI  
**Data:** 26 de Outubro de 2025  
**Versão:** 1.0

