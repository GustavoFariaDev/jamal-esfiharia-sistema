# Instruções para Aplicar Correções - 26/11/2025

## 📋 Resumo das Correções Implementadas

Este documento contém as instruções para aplicar as correções realizadas no sistema da Jamal Esfiharia.

---

## 🔧 Correções Realizadas

### 1. ✅ Validação de Endereço Obrigatória
**Problema:** Pedidos sendo criados sem número da residência  
**Solução:** Validação reforçada no backend e frontend

**Arquivos modificados:**
- `backend/src/routes/pedido_simples.py`
- `frontend/src/components/FullMenu.js`

**O que foi feito:**
- Adicionada validação no backend que bloqueia pedidos de entrega sem:
  - Endereço completo
  - Número da residência
  - CEP
- Validação já existia no frontend, mas foi reforçada no backend

---

### 2. 🍕 Correção de Preços das Pizzas
**Problema:** Pizza média saindo pelo preço da broto (R$ 30 ao invés de R$ 38)  
**Solução:** Script criado para corrigir preços automaticamente

**Arquivo criado:**
- `backend/corrigir_precos_pizzas.py`

**Como executar no servidor:**

```bash
# 1. Acessar o console do Render (ou SSH)
cd /opt/render/project/src/backend

# 2. Executar o script
python3 corrigir_precos_pizzas.py
```

**O que o script faz:**
- Busca todas as pizzas no banco de dados
- Identifica preços incorretos (média ≤ broto)
- Corrige automaticamente para: Broto R$ 30,00 → Média R$ 38,00 → Grande R$ 65,00
- Mostra relatório detalhado das correções

---

### 3. 🥔 Opções de Recheio para Batatas
**Problema:** Batatas recheadas sem opções de escolha  
**Solução:** Script criado para adicionar duas opções

**Arquivo criado:**
- `backend/adicionar_opcoes_batata_recheada.py`

**Como executar no servidor:**

```bash
# 1. Acessar o console do Render (ou SSH)
cd /opt/render/project/src/backend

# 2. Executar o script
python3 adicionar_opcoes_batata_recheada.py
```

**O que o script faz:**
- Cria duas opções de batata recheada:
  1. BATATA FRITA RECHEADA - CALABRESA E MUSSARELA
  2. BATATA FRITA RECHEADA - BACON E CHEDDAR
- Ambas com o mesmo preço
- Desativa a opção genérica (se existir)

---

### 4. 📱 Confirmação de Pedidos ao Cliente via WhatsApp
**Problema:** Pedidos não sendo enviados/confirmados aos clientes  
**Solução:** Sistema automático de confirmação implementado

**Arquivos criados/modificados:**
- `backend/src/services/whatsapp_cliente_service.py` (NOVO)
- `backend/src/routes/pedido_simples.py` (MODIFICADO)
- `frontend/src/components/FullMenu.js` (MODIFICADO)

**Como funciona:**

Quando um cliente faz um pedido:

1. **Sistema abre 2 abas do WhatsApp Web automaticamente:**
   - **Aba 1 (0,5s):** Mensagem para a gestão (como antes)
   - **Aba 2 (2s):** Mensagem de confirmação para o cliente

2. **Mensagem ao cliente inclui:**
   - ✅ Confirmação do pedido com número
   - 📦 Lista completa de itens
   - 💰 Valor total detalhado
   - ⏱️ Tempo estimado de entrega/retirada
   - 🏠 Tipo de entrega escolhido
   - 💳 Forma de pagamento

3. **A gestão precisa apenas:**
   - Clicar em "Enviar" na aba do cliente
   - Pronto! Cliente recebe confirmação automática

**⚠️ IMPORTANTE:** O sistema abre o WhatsApp Web com a mensagem pronta. A gestão deve clicar em "Enviar" para confirmar o envio ao cliente.

---

## 🚀 Passos para Deploy em Produção

### Opção 1: Deploy Automático (Recomendado)

Se o Render está configurado para deploy automático:

1. ✅ **As alterações já foram enviadas ao GitHub**
2. ✅ **O Render vai detectar automaticamente**
3. ✅ **Aguardar o deploy finalizar (5-10 minutos)**
4. ⚠️ **Executar os scripts de correção** (ver abaixo)

### Opção 2: Deploy Manual

Se precisar fazer deploy manual:

```bash
# No console do Render ou via SSH
cd /opt/render/project/src
git pull origin main
# Reiniciar o serviço pelo painel do Render
```

---

## 📝 Checklist Pós-Deploy

Após o deploy, execute os scripts no servidor:

### 1️⃣ Corrigir Preços das Pizzas

```bash
cd /opt/render/project/src/backend
python3 corrigir_precos_pizzas.py
```

**Verificar:**
- [ ] Script executou sem erros
- [ ] Relatório mostra pizzas corrigidas
- [ ] Testar no site: pizza média deve custar R$ 38,00

---

### 2️⃣ Adicionar Opções de Batata

```bash
cd /opt/render/project/src/backend
python3 adicionar_opcoes_batata_recheada.py
```

**Verificar:**
- [ ] Script executou sem erros
- [ ] 2 produtos criados/atualizados
- [ ] Testar no site: aparecem as duas opções de batata

---

### 3️⃣ Testar Sistema de Confirmação

**Fazer um pedido teste:**

1. [ ] Acessar o site em produção
2. [ ] Adicionar um produto ao carrinho
3. [ ] Preencher dados (incluindo número da residência)
4. [ ] Finalizar pedido
5. [ ] Verificar se abrem 2 abas do WhatsApp:
   - Aba 1: Mensagem para gestão
   - Aba 2: Mensagem de confirmação ao cliente
6. [ ] Clicar em "Enviar" na aba do cliente
7. [ ] Verificar se o cliente recebe a confirmação

---

### 4️⃣ Testar Validação de Endereço

**Tentar fazer pedido sem número:**

1. [ ] Adicionar produto ao carrinho
2. [ ] Escolher "Entrega"
3. [ ] Preencher CEP e endereço
4. [ ] **NÃO preencher o número**
5. [ ] Tentar finalizar
6. [ ] Deve aparecer erro: "Número da residência é obrigatório"

---

## 🔍 Verificação de Problemas

### Se os scripts não executarem:

```bash
# Verificar se está no diretório correto
pwd
# Deve mostrar: /opt/render/project/src/backend

# Verificar permissões
ls -la corrigir_precos_pizzas.py
ls -la adicionar_opcoes_batata_recheada.py

# Se necessário, dar permissão de execução
chmod +x corrigir_precos_pizzas.py
chmod +x adicionar_opcoes_batata_recheada.py
```

### Se o WhatsApp não abrir automaticamente:

1. Verificar se o navegador está bloqueando pop-ups
2. Permitir pop-ups para o domínio do site
3. Testar em modo anônimo/privado

### Se a validação não funcionar:

1. Limpar cache do navegador (Ctrl + Shift + Delete)
2. Fazer hard refresh (Ctrl + F5)
3. Verificar se o deploy foi concluído com sucesso

---

## 📞 Suporte

Se encontrar algum problema durante a aplicação das correções:

1. Verificar logs do Render
2. Verificar console do navegador (F12)
3. Documentar o erro exato que aparece
4. Verificar se todas as etapas foram seguidas

---

## ✅ Resumo Final

**Correções aplicadas:**
- ✅ Validação de endereço obrigatória
- ✅ Script de correção de preços criado
- ✅ Script de opções de batata criado
- ✅ Sistema de confirmação ao cliente implementado

**Próximos passos:**
1. Aguardar deploy automático do Render
2. Executar script de correção de preços
3. Executar script de opções de batata
4. Testar todas as funcionalidades
5. Monitorar primeiros pedidos reais

---

**Data:** 26/11/2025  
**Desenvolvedor:** Gustavo (Manus AI)  
**Commit:** `00a30f3` - Fix: Corrigir múltiplos problemas do sistema
