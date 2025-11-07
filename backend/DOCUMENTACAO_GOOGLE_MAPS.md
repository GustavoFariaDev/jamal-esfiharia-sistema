# Documentação: Integração com Google Maps API

## Visão Geral

O sistema agora suporta **cálculo automático de distância** usando a API do Google Maps Distance Matrix. Quando configurado, o sistema calcula automaticamente a distância entre o restaurante e o endereço do cliente, eliminando a necessidade de informar a distância manualmente.

---

## 🎯 Funcionalidades

### ✅ Cálculo Automático de Distância
- Integração com Google Maps Distance Matrix API
- Cálculo automático da distância em quilômetros
- Tempo estimado de deslocamento
- Validação de endereços
- Tratamento de erros robusto

### ✅ Modo Híbrido (Automático + Manual)
- **Com Google Maps**: Distância calculada automaticamente
- **Sem Google Maps**: Cliente informa distância manualmente
- Sistema funciona nos dois modos

### ✅ Endpoints Adicionais
- Consulta de distância isolada
- Consulta de distância + taxa
- Verificação de status da configuração

---

## 🔧 Configuração

### 1. Obter API Key do Google Maps

#### Passo 1: Criar conta no Google Cloud Platform
1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Aceite os termos de serviço

#### Passo 2: Criar um projeto
1. Clique em "Selecionar projeto" no topo
2. Clique em "Novo projeto"
3. Dê um nome (ex: "Jamal Esfiharia")
4. Clique em "Criar"

#### Passo 3: Ativar a Distance Matrix API
1. No menu lateral, vá em "APIs e serviços" > "Biblioteca"
2. Busque por "Distance Matrix API"
3. Clique na API
4. Clique em "Ativar"

#### Passo 4: Criar API Key
1. Vá em "APIs e serviços" > "Credenciais"
2. Clique em "Criar credenciais" > "Chave de API"
3. Copie a API Key gerada
4. **Importante**: Clique em "Restringir chave" para segurança

#### Passo 5: Configurar restrições (Recomendado)
1. Em "Restrições de aplicativo":
   - Selecione "Endereços IP"
   - Adicione o IP do seu servidor
   
2. Em "Restrições de API":
   - Selecione "Restringir chave"
   - Marque apenas "Distance Matrix API"

3. Clique em "Salvar"

---

### 2. Configurar Variáveis de Ambiente

#### Opção 1: Arquivo .env (Recomendado)

Crie um arquivo `.env` na raiz do projeto:

```bash
# Google Maps Configuration
GOOGLE_MAPS_API_KEY=AIzaSyC-SuaAPIKeyAqui123456789
ENDERECO_RESTAURANTE=Rua Exemplo, 100, Centro, São Paulo, SP, Brasil
```

#### Opção 2: Variáveis de ambiente do sistema

```bash
export GOOGLE_MAPS_API_KEY="AIzaSyC-SuaAPIKeyAqui123456789"
export ENDERECO_RESTAURANTE="Rua Exemplo, 100, Centro, São Paulo, SP, Brasil"
```

#### Opção 3: Configurar no servidor (Linux/Ubuntu)

Adicione ao arquivo `/etc/environment`:

```bash
GOOGLE_MAPS_API_KEY="AIzaSyC-SuaAPIKeyAqui123456789"
ENDERECO_RESTAURANTE="Rua Exemplo, 100, Centro, São Paulo, SP, Brasil"
```

---

### 3. Formato do Endereço do Restaurante

**Formato recomendado**:
```
Rua/Avenida, Número, Bairro, Cidade, Estado, País
```

**Exemplos válidos**:
```
Rua Augusta, 1234, Consolação, São Paulo, SP, Brasil
Avenida Paulista, 1000, Bela Vista, São Paulo, SP, Brasil
Rua das Flores, 50, Centro, Rio de Janeiro, RJ, Brasil
```

**Dicas**:
- Quanto mais completo, melhor a precisão
- Inclua sempre cidade e estado
- Use vírgulas para separar os componentes
- Evite abreviações excessivas

---

## 📡 Como Funciona

### Fluxo Automático (Com Google Maps)

```
1. Cliente faz pedido com entrega
   ↓
2. Cliente informa apenas o ENDEREÇO
   (não precisa informar distância)
   ↓
3. Sistema consulta Google Maps API
   - Origem: Endereço do restaurante
   - Destino: Endereço do cliente
   ↓
4. Google Maps retorna:
   - Distância em km
   - Tempo estimado
   ↓
5. Sistema calcula taxa baseada na distância
   ↓
6. Sistema retorna valor total
```

### Fluxo Manual (Sem Google Maps)

```
1. Cliente faz pedido com entrega
   ↓
2. Cliente informa ENDEREÇO + DISTÂNCIA (km)
   ↓
3. Sistema usa a distância informada
   ↓
4. Sistema calcula taxa baseada na distância
   ↓
5. Sistema retorna valor total
```

---

## 🚀 Uso da API

### 1. Criar Pedido (Modo Automático)

**Endpoint**: `POST /api/pedidos/criar-intent-pagamento`

**Com Google Maps configurado**:
```json
{
  "nome_cliente": "João Silva",
  "telefone": "(11) 98765-4321",
  "endereco": "Avenida Paulista, 1000, São Paulo, SP",
  "forma_entrega": "entrega",
  "itens": [
    {
      "esfiha_id": 1,
      "quantidade": 5
    }
  ]
}
```

**Observação**: Não é necessário informar `distancia_km`!

**Resposta**:
```json
{
  "status": "success",
  "pedido_id": 42,
  "valor_total": 55.00
}
```

---

### 2. Criar Pedido (Modo Manual)

**Sem Google Maps ou com distância manual**:
```json
{
  "nome_cliente": "João Silva",
  "telefone": "(11) 98765-4321",
  "endereco": "Avenida Paulista, 1000, São Paulo, SP",
  "forma_entrega": "entrega",
  "distancia_km": 3.2,
  "itens": [
    {
      "esfiha_id": 1,
      "quantidade": 5
    }
  ]
}
```

**Observação**: Se `distancia_km` for fornecido, o sistema usa ele (mesmo com Google Maps configurado).

---

### 3. Calcular Distância (Endpoint Isolado)

**Endpoint**: `POST /api/delivery/calcular-distancia`

**Requisição**:
```json
{
  "endereco": "Avenida Paulista, 1000, São Paulo, SP"
}
```

**Resposta de Sucesso**:
```json
{
  "status": "success",
  "data": {
    "distancia_km": 3.2,
    "distancia_texto": "3.2 km",
    "duracao_texto": "15 mins",
    "endereco_origem": "Rua Exemplo, 100, São Paulo, SP",
    "endereco_destino": "Avenida Paulista, 1000, São Paulo, SP",
    "erro": null
  }
}
```

**Resposta de Erro** (sem API Key):
```json
{
  "status": "error",
  "message": "API Key do Google Maps não configurada.",
  "data": {
    "distancia_km": null,
    "erro": "API Key do Google Maps não configurada. Configure a variável GOOGLE_MAPS_API_KEY."
  }
}
```

---

### 4. Calcular Distância + Taxa

**Endpoint**: `POST /api/delivery/calcular-distancia-e-taxa`

**Requisição**:
```json
{
  "endereco": "Avenida Paulista, 1000, São Paulo, SP",
  "valor_pedido": 45.50
}
```

**Resposta**:
```json
{
  "status": "success",
  "data": {
    "distancia_km": 3.2,
    "distancia_texto": "3.2 km",
    "duracao_texto": "15 mins",
    "taxa_entrega": 5.0,
    "faixa": "2.5km a 3.5km",
    "valor_pedido": 45.5,
    "valor_total": 50.5,
    "endereco_origem": "Rua Exemplo, 100, São Paulo, SP",
    "endereco_destino": "Avenida Paulista, 1000, São Paulo, SP"
  }
}
```

---

### 5. Verificar Status da Configuração

**Endpoint**: `GET /api/delivery/status-google-maps`

**Resposta (Configurado)**:
```json
{
  "status": "success",
  "data": {
    "configurado": true,
    "mensagem": "Google Maps configurado corretamente.",
    "endereco_restaurante": "Rua Exemplo, 100, São Paulo, SP",
    "api_key_presente": true
  }
}
```

**Resposta (Não Configurado)**:
```json
{
  "status": "warning",
  "data": {
    "configurado": false,
    "mensagem": "API Key não configurada. Configure GOOGLE_MAPS_API_KEY nas variáveis de ambiente."
  }
}
```

---

## ⚠️ Tratamento de Erros

### Erros Comuns

#### 1. API Key não configurada
```json
{
  "status": "error",
  "message": "Erro ao calcular distância: API Key do Google Maps não configurada."
}
```
**Solução**: Configure a variável `GOOGLE_MAPS_API_KEY`

#### 2. Endereço não encontrado
```json
{
  "status": "error",
  "message": "Erro ao calcular distância: Endereço não encontrado. Verifique se o endereço está correto."
}
```
**Solução**: Cliente deve fornecer endereço completo e válido

#### 3. Limite da API excedido
```json
{
  "status": "error",
  "message": "Erro ao calcular distância: Limite diário da API excedido. Tente novamente amanhã."
}
```
**Solução**: Aguardar reset do limite ou aumentar cota no Google Cloud

#### 4. Timeout
```json
{
  "status": "error",
  "message": "Erro ao calcular distância: Timeout ao conectar com Google Maps. Tente novamente."
}
```
**Solução**: Tentar novamente ou usar distância manual

---

## 💰 Custos da API

### Limite Gratuito
- **$200 USD/mês** de crédito gratuito
- Aproximadamente **40.000 requisições/mês** grátis
- Custo após limite: **$0,005 por requisição**

### Estimativa de Uso

**Cenário 1: Pequeno (100 pedidos/dia)**
- 3.000 pedidos/mês
- **Custo**: R$ 0,00 (dentro do limite gratuito)

**Cenário 2: Médio (500 pedidos/dia)**
- 15.000 pedidos/mês
- **Custo**: R$ 0,00 (dentro do limite gratuito)

**Cenário 3: Grande (2.000 pedidos/dia)**
- 60.000 pedidos/mês
- Excede em 20.000 requisições
- **Custo**: ~$100 USD (~R$ 500,00)

### Dicas para Reduzir Custos

1. **Cache de endereços**: Salvar distâncias de endereços frequentes
2. **Validação prévia**: Validar formato do endereço antes de consultar API
3. **Modo manual**: Oferecer opção de distância manual
4. **Limitar área**: Não aceitar pedidos muito distantes

---

## 🧪 Testes

### Testar Configuração
```bash
cd /home/ubuntu/backend_corrigido
python3.11 test_google_maps_simulacao.py
```

### Testar via API (com servidor rodando)
```bash
# Verificar status
curl http://localhost:5000/api/delivery/status-google-maps

# Calcular distância
curl -X POST http://localhost:5000/api/delivery/calcular-distancia \
  -H "Content-Type: application/json" \
  -d '{"endereco": "Avenida Paulista, 1000, São Paulo, SP"}'

# Calcular distância + taxa
curl -X POST http://localhost:5000/api/delivery/calcular-distancia-e-taxa \
  -H "Content-Type: application/json" \
  -d '{"endereco": "Avenida Paulista, 1000, São Paulo, SP", "valor_pedido": 45.50}'
```

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca compartilhe sua API Key publicamente**
   - Não commite no Git
   - Use variáveis de ambiente
   - Adicione `.env` ao `.gitignore`

2. **Configure restrições na API Key**
   - Restrinja por IP do servidor
   - Restrinja apenas para Distance Matrix API
   - Configure quota diária

3. **Monitore o uso**
   - Acesse Google Cloud Console regularmente
   - Configure alertas de custo
   - Revise logs de uso

4. **Valide entradas**
   - Valide formato do endereço
   - Limite tamanho do texto
   - Sanitize inputs

---

## 📊 Comparação: Manual vs Automático

| Aspecto | Manual | Automático (Google Maps) |
|---------|--------|--------------------------|
| **Precisão** | Depende do cliente | Alta (calculada por GPS) |
| **Experiência** | Cliente precisa saber distância | Cliente só informa endereço |
| **Custo** | Grátis | $200/mês grátis, depois pago |
| **Configuração** | Nenhuma | Requer API Key |
| **Confiabilidade** | Pode ter erros humanos | Precisa de internet |
| **Velocidade** | Instantâneo | ~1-2 segundos |

---

## 🎯 Recomendações

### Para Pequenos Negócios (< 100 pedidos/dia)
✅ **Use Google Maps**
- Dentro do limite gratuito
- Melhor experiência para o cliente
- Mais preciso

### Para Médios Negócios (100-500 pedidos/dia)
✅ **Use Google Maps com cache**
- Ainda dentro do limite gratuito
- Implemente cache para endereços frequentes
- Monitore uso

### Para Grandes Negócios (> 500 pedidos/dia)
⚠️ **Avalie custo-benefício**
- Pode exceder limite gratuito
- Considere cache agressivo
- Ou use modo manual para clientes recorrentes

---

## 📝 Próximos Passos (Sugestões)

1. **Implementar cache de endereços**
   - Salvar distâncias calculadas
   - Reutilizar para endereços repetidos

2. **Validação de endereço**
   - Autocomplete de endereços
   - Sugestões de correção

3. **Área de cobertura**
   - Definir raio máximo de entrega
   - Rejeitar pedidos fora da área

4. **Otimização de rotas**
   - Usar Directions API para múltiplas entregas
   - Calcular rota mais eficiente

---

## 📞 Suporte

Para dúvidas sobre a API do Google Maps:
- Documentação oficial: https://developers.google.com/maps/documentation/distance-matrix
- Console do Google Cloud: https://console.cloud.google.com/
- Suporte do Google: https://cloud.google.com/support

---

**Versão**: 1.0  
**Data**: Outubro 2025  
**Sistema**: Jamal Esfiharia - Gestão de Pedidos

