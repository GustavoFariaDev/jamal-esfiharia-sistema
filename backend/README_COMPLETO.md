# Sistema de Gestão Jamal Esfiharia
## ✅ Versão Completa com Google Maps + Taxa de Entrega

---

## 🎯 Funcionalidades Implementadas

### ✅ 1. Cálculo Automático de Taxa de Entrega
- Tabela de taxas baseada em distância (0km a 20km)
- Cálculo automático integrado ao fluxo de pedidos
- Taxa R$ 0,00 para retiradas
- Validações robustas

### ✅ 2. Integração com Google Maps API
- **Cálculo automático de distância** via Google Maps
- Cliente informa apenas o endereço (não precisa saber a distância)
- Tempo estimado de deslocamento
- **Modo híbrido**: funciona com ou sem Google Maps

### ✅ 3. API REST Completa
- Endpoints para criação de pedidos
- Endpoints para consulta de taxas
- Endpoints para cálculo de distância
- Documentação completa

---

## 🚀 Como Usar

### Instalação Rápida

```bash
# 1. Descompactar
unzip sistema_gestao_jamal_COMPLETO.zip
cd backend_corrigido

# 2. Instalar dependências
pip install -r requirements.txt

# 3. (Opcional) Configurar Google Maps
cp .env.example .env
# Edite o .env e adicione sua API Key

# 4. Executar servidor
python3.11 app.py
```

O servidor estará disponível em: `http://localhost:5000`

---

## 📋 Configuração do Google Maps (Opcional)

### Opção 1: Usar Google Maps (Recomendado)

**Vantagens**:
- ✅ Cliente só informa o endereço
- ✅ Distância calculada automaticamente
- ✅ Mais preciso
- ✅ Melhor experiência do usuário

**Configuração**:
1. Obtenha API Key no Google Cloud Platform
2. Configure variáveis de ambiente:

```bash
# Arquivo .env
GOOGLE_MAPS_API_KEY=sua_api_key_aqui
ENDERECO_RESTAURANTE=Rua Exemplo, 100, São Paulo, SP, Brasil
```

**Documentação completa**: Veja `DOCUMENTACAO_GOOGLE_MAPS.md`

---

### Opção 2: Usar Distância Manual (Sem Google Maps)

**Vantagens**:
- ✅ Grátis (sem custos de API)
- ✅ Não precisa de configuração
- ✅ Funciona offline

**Como funciona**:
- Cliente informa endereço + distância em km
- Sistema calcula taxa baseada na distância informada

---

## 📊 Exemplos de Uso

### 1. Criar Pedido com Google Maps (Automático)

**Requisição**:
```json
POST /api/pedidos/criar-intent-pagamento
{
  "nome_cliente": "João Silva",
  "telefone": "(11) 98765-4321",
  "endereco": "Avenida Paulista, 1000, São Paulo, SP",
  "forma_entrega": "entrega",
  "itens": [
    {"esfiha_id": 1, "quantidade": 5}
  ]
}
```

**O que acontece**:
1. Sistema consulta Google Maps
2. Calcula distância automaticamente
3. Calcula taxa de entrega
4. Retorna valor total

**Resposta**:
```json
{
  "status": "success",
  "pedido_id": 42,
  "valor_total": 55.00
}
```

---

### 2. Criar Pedido Manual (Sem Google Maps)

**Requisição**:
```json
POST /api/pedidos/criar-intent-pagamento
{
  "nome_cliente": "João Silva",
  "telefone": "(11) 98765-4321",
  "endereco": "Avenida Paulista, 1000, São Paulo, SP",
  "forma_entrega": "entrega",
  "distancia_km": 3.2,
  "itens": [
    {"esfiha_id": 1, "quantidade": 5}
  ]
}
```

**O que acontece**:
1. Sistema usa distância informada (3.2km)
2. Calcula taxa de entrega (R$ 5,00)
3. Retorna valor total

---

### 3. Consultar Distância + Taxa

**Requisição**:
```json
POST /api/delivery/calcular-distancia-e-taxa
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
    "valor_total": 50.5
  }
}
```

---

## 📊 Tabela de Taxas

| Distância       | Taxa      |
|-----------------|-----------|
| 0km a 1,5km     | R$ 3,00   |
| 1,5km a 2,5km   | R$ 4,00   |
| 2,5km a 3,5km   | R$ 5,00   |
| 3,5km a 4,5km   | R$ 6,00   |
| 4,5km a 5,5km   | R$ 7,00   |
| 5,5km a 6,5km   | R$ 8,00   |
| 6,5km a 7,5km   | R$ 9,00   |
| 7,5km a 8,5km   | R$ 10,00  |
| 8,5km a 9,5km   | R$ 11,00  |
| 10km            | R$ 13,00  |
| 12km            | R$ 15,00  |
| 13km            | R$ 16,00  |
| 14km            | R$ 18,00  |
| 15km            | R$ 20,00  |
| 16km            | R$ 22,00  |
| 18km            | R$ 25,00  |
| 19km            | R$ 27,00  |
| 20km            | R$ 29,00  |

---

## 🔌 Endpoints da API

### Pedidos
- `POST /api/pedidos/criar-intent-pagamento` - Criar pedido

### Taxa de Entrega
- `POST /api/delivery/calcular-taxa` - Calcular apenas taxa
- `POST /api/delivery/calcular-total` - Calcular valor total
- `GET /api/delivery/tabela-taxas` - Obter tabela de taxas

### Google Maps
- `POST /api/delivery/calcular-distancia` - Calcular distância
- `POST /api/delivery/calcular-distancia-e-taxa` - Distância + taxa
- `GET /api/delivery/status-google-maps` - Verificar configuração

---

## 📁 Estrutura de Arquivos

```
backend_corrigido/
├── app.py                              # Aplicação principal
├── .env.example                        # Exemplo de configuração
├── src/
│   ├── models/
│   │   └── pedido.py                   # ✅ Modelo com distancia_km e taxa_entrega
│   ├── routes/
│   │   ├── pedido.py                   # ✅ Criação de pedidos com Google Maps
│   │   └── delivery.py                 # ✅ API de taxa e distância
│   └── services/
│       ├── delivery_fee.py             # ✅ Cálculo de taxa
│       └── google_maps.py              # ✅ NOVO: Integração Google Maps
├── instance/
│   └── esfiharia.db                    # Banco de dados
├── migrate_add_delivery_fields.py      # Script de migração
├── test_delivery_fee.py                # Testes de taxa
├── test_google_maps_simulacao.py       # ✅ NOVO: Teste Google Maps
├── DOCUMENTACAO_TAXA_ENTREGA.md        # Doc: Taxa de entrega
├── DOCUMENTACAO_GOOGLE_MAPS.md         # ✅ NOVO: Doc: Google Maps
└── README_COMPLETO.md                  # ✅ NOVO: Este arquivo
```

---

## 🧪 Testes

### Testar Taxa de Entrega
```bash
python3.11 test_delivery_fee.py
```

### Testar Google Maps
```bash
python3.11 test_google_maps_simulacao.py
```

### Testar via API
```bash
# Verificar status do Google Maps
curl http://localhost:5000/api/delivery/status-google-maps

# Calcular distância
curl -X POST http://localhost:5000/api/delivery/calcular-distancia \
  -H "Content-Type: application/json" \
  -d '{"endereco": "Avenida Paulista, 1000, São Paulo, SP"}'
```

---

## 💰 Custos

### Google Maps API
- **Grátis**: Até $200 USD/mês (~40.000 requisições)
- **Pago**: $0,005 por requisição adicional

### Estimativa para seu negócio:
- **Até 1.300 pedidos/dia**: 100% grátis
- **Acima disso**: Avalie custo-benefício ou use modo manual

---

## ⚙️ Configurações

### Variáveis de Ambiente (.env)

```bash
# Flask
SECRET_KEY=sua-chave-secreta
DATABASE_URL=sqlite:///instance/esfiharia.db

# Stripe (Pagamentos)
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook

# Google Maps (Opcional)
GOOGLE_MAPS_API_KEY=sua_api_key_do_google_maps
ENDERECO_RESTAURANTE=Rua Exemplo, 100, São Paulo, SP, Brasil
```

---

## 🎯 Fluxo Completo

```
1. Cliente seleciona produtos
   ↓
2. Cliente escolhe forma de entrega
   ↓
3a. Se ENTREGA + Google Maps configurado:
    - Cliente informa apenas ENDEREÇO
    - Sistema calcula distância automaticamente
    - Sistema calcula taxa
    ↓
3b. Se ENTREGA sem Google Maps:
    - Cliente informa ENDEREÇO + DISTÂNCIA
    - Sistema calcula taxa
    ↓
3c. Se RETIRADA:
    - Taxa = R$ 0,00
    ↓
4. Sistema calcula valor total
   (produtos + taxa de entrega)
   ↓
5. Sistema registra pedido no banco
   ↓
6. Sistema retorna:
   - ID do pedido
   - Valor total
   - Client secret para pagamento
```

---

## 📖 Documentação Completa

- **DOCUMENTACAO_TAXA_ENTREGA.md** - Detalhes técnicos do cálculo de taxa
- **DOCUMENTACAO_GOOGLE_MAPS.md** - Guia completo do Google Maps
- **README_COMPLETO.md** - Este arquivo (visão geral)

---

## ✅ Checklist de Implementação

### Backend
- ✅ Módulo de cálculo de taxa de entrega
- ✅ Integração com Google Maps API
- ✅ Modelo de dados atualizado (distancia_km, taxa_entrega)
- ✅ Migração do banco de dados
- ✅ API REST completa
- ✅ Validações e tratamento de erros
- ✅ Testes automatizados

### Documentação
- ✅ Documentação técnica completa
- ✅ Guia de configuração do Google Maps
- ✅ Exemplos de uso
- ✅ Estimativa de custos

### Próximos Passos (Sugestões)
- ⬜ Frontend para captura de endereço
- ⬜ Autocomplete de endereços
- ⬜ Cache de distâncias frequentes
- ⬜ Relatórios de entregas
- ⬜ Área de cobertura (raio máximo)

---

## 🤝 Suporte

Para dúvidas:
- **Taxa de entrega**: Veja `DOCUMENTACAO_TAXA_ENTREGA.md`
- **Google Maps**: Veja `DOCUMENTACAO_GOOGLE_MAPS.md`
- **API do Google**: https://developers.google.com/maps/documentation

---

## 📝 Notas Importantes

1. **Google Maps é opcional**
   - Sistema funciona perfeitamente sem ele
   - Use distância manual se preferir

2. **Modo híbrido**
   - Se `distancia_km` for fornecido, sistema usa ele
   - Se não, tenta calcular via Google Maps
   - Se Google Maps não configurado, retorna erro

3. **Segurança**
   - Nunca compartilhe sua API Key
   - Configure restrições no Google Cloud
   - Use variáveis de ambiente

4. **Custos**
   - Monitore uso no Google Cloud Console
   - Configure alertas de custo
   - Implemente cache para reduzir requisições

---

**Versão**: 2.0 (Com Google Maps)  
**Data**: Outubro 2025  
**Sistema**: Jamal Esfiharia - Gestão de Pedidos

