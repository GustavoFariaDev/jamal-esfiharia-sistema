# Documentação: Sistema de Cálculo de Taxa de Entrega

## Visão Geral

O sistema de gestão Jamal Esfiharia agora inclui cálculo automático de taxa de entrega baseado na distância do cliente. A taxa é calculada automaticamente durante a criação do pedido e integrada ao valor total.

---

## 🎯 Funcionalidades Implementadas

### 1. Cálculo Automático de Taxa
- **Módulo**: `src/services/delivery_fee.py`
- **Classe**: `DeliveryFeeCalculator`
- Calcula a taxa baseada na distância fornecida
- Valida distâncias e retorna mensagens de erro apropriadas
- Suporta distâncias de 0km até 20km

### 2. Integração com Pedidos
- **Arquivo**: `src/routes/pedido.py`
- A taxa é calculada automaticamente ao criar um pedido com entrega
- Campos adicionados ao modelo `Pedido`:
  - `distancia_km`: Distância em quilômetros (Float, nullable)
  - `taxa_entrega`: Taxa de entrega calculada (Float, default 0.0)

### 3. API REST para Consulta
- **Arquivo**: `src/routes/delivery.py`
- **Endpoints disponíveis**:
  - `POST /api/delivery/calcular-taxa` - Calcula apenas a taxa
  - `POST /api/delivery/calcular-total` - Calcula valor total (pedido + taxa)
  - `GET /api/delivery/tabela-taxas` - Retorna tabela completa de taxas

---

## 📊 Tabela de Taxas de Entrega

| Faixa de Distância | Taxa      |
|---------------------|-----------|
| 0km a 1,5km         | R$ 3,00   |
| 1,5km a 2,5km       | R$ 4,00   |
| 2,5km a 3,5km       | R$ 5,00   |
| 3,5km a 4,5km       | R$ 6,00   |
| 4,5km a 5,5km       | R$ 7,00   |
| 5,5km a 6,5km       | R$ 8,00   |
| 6,5km a 7,5km       | R$ 9,00   |
| 7,5km a 8,5km       | R$ 10,00  |
| 8,5km a 9,5km       | R$ 11,00  |
| 10km                | R$ 13,00  |
| 12km                | R$ 15,00  |
| 13km                | R$ 16,00  |
| 14km                | R$ 18,00  |
| 15km                | R$ 20,00  |
| 16km                | R$ 22,00  |
| 18km                | R$ 25,00  |
| 19km                | R$ 27,00  |
| 20km                | R$ 29,00  |

**Observação**: Distâncias acima de 20km requerem contato para cálculo personalizado.

---

## 🔧 Como Usar

### Criar Pedido com Entrega

**Endpoint**: `POST /api/pedidos/criar-intent-pagamento`

**Corpo da Requisição**:
```json
{
  "nome_cliente": "João Silva",
  "telefone": "(11) 98765-4321",
  "endereco": "Rua Exemplo, 123",
  "forma_entrega": "entrega",
  "distancia_km": 3.2,
  "itens": [
    {
      "esfiha_id": 1,
      "quantidade": 5,
      "observacoes": "Sem cebola"
    }
  ],
  "observacoes": "Entregar após 19h"
}
```

**Resposta de Sucesso**:
```json
{
  "status": "success",
  "client_secret": "pi_xxx_secret_xxx",
  "pedido_id": 42,
  "valor_total": 50.50
}
```

**Observações**:
- Para `forma_entrega: "entrega"`, os campos `endereco` e `distancia_km` são **obrigatórios**
- Para `forma_entrega: "retirada"`, a taxa de entrega será **R$ 0,00**
- O `valor_total` retornado já inclui a taxa de entrega

---

### Criar Pedido com Retirada

**Corpo da Requisição**:
```json
{
  "nome_cliente": "Maria Santos",
  "telefone": "(11) 91234-5678",
  "forma_entrega": "retirada",
  "itens": [
    {
      "esfiha_id": 1,
      "quantidade": 3
    }
  ]
}
```

**Observações**:
- Não é necessário informar `endereco` nem `distancia_km`
- Taxa de entrega será automaticamente **R$ 0,00**

---

### Consultar Taxa de Entrega (Opcional)

**Endpoint**: `POST /api/delivery/calcular-taxa`

**Corpo da Requisição**:
```json
{
  "distancia_km": 5.2
}
```

**Resposta**:
```json
{
  "status": "success",
  "data": {
    "taxa": 7.0,
    "distancia": 5.2,
    "faixa": "4.5km a 5.5km",
    "erro": null
  }
}
```

---

### Calcular Valor Total (Opcional)

**Endpoint**: `POST /api/delivery/calcular-total`

**Corpo da Requisição**:
```json
{
  "valor_pedido": 45.50,
  "distancia_km": 3.2
}
```

**Resposta**:
```json
{
  "status": "success",
  "data": {
    "valor_pedido": 45.5,
    "taxa_entrega": 5.0,
    "valor_total": 50.5,
    "distancia": 3.2,
    "faixa": "2.5km a 3.5km",
    "erro": null
  }
}
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `pedido`

**Novos Campos**:
- `distancia_km` (FLOAT, nullable): Distância em quilômetros do cliente
- `taxa_entrega` (FLOAT, NOT NULL, default 0.0): Taxa de entrega calculada

**Exemplo de Registro**:
```sql
INSERT INTO pedido (
  nome_cliente, telefone, endereco, forma_entrega, 
  distancia_km, taxa_entrega, valor_total, status
) VALUES (
  'João Silva', '(11) 98765-4321', 'Rua Exemplo, 123', 'entrega',
  3.2, 5.0, 50.50, 'pagamento_pendente'
);
```

---

## 🧪 Testes

### Executar Testes Unitários
```bash
cd /home/ubuntu/backend_corrigido
python3.11 test_delivery_fee.py
```

### Executar Testes de Integração
```bash
cd /home/ubuntu/backend_corrigido
./test_integration.sh
```

---

## 📝 Processo de Cálculo

1. **Receber dados do pedido**
   - Lista de produtos selecionados
   - Distância do cliente (se entrega)

2. **Calcular subtotal**
   - Soma do valor de todos os produtos

3. **Calcular taxa de entrega**
   - Se `forma_entrega == "entrega"`:
     - Validar `distancia_km`
     - Buscar taxa na tabela
     - Adicionar ao subtotal
   - Se `forma_entrega == "retirada"`:
     - Taxa = R$ 0,00

4. **Gerar valor total**
   - `valor_total = subtotal + taxa_entrega`

5. **Registrar no banco de dados**
   - Salvar pedido com todos os campos
   - Incluir `distancia_km` e `taxa_entrega`

---

## ⚠️ Validações e Erros

### Erros Comuns

**1. Entrega sem distância**
```json
{
  "status": "error",
  "message": "Distância em km é obrigatória para entrega."
}
```

**2. Distância inválida**
```json
{
  "status": "error",
  "message": "Distância inválida. Deve ser um número."
}
```

**3. Distância acima de 20km**
```json
{
  "status": "error",
  "message": "Distância acima de 20km. Entre em contato para calcular a taxa."
}
```

---

## 🔄 Migração do Banco de Dados

A migração foi executada automaticamente pelo script `migrate_add_delivery_fields.py`.

**Para executar novamente** (se necessário):
```bash
cd /home/ubuntu/backend_corrigido
python3.11 migrate_add_delivery_fields.py
```

**O que a migração faz**:
- Adiciona coluna `distancia_km` (FLOAT, nullable)
- Adiciona coluna `taxa_entrega` (FLOAT, default 0.0)
- Atualiza pedidos existentes com `taxa_entrega = 0.0`

---

## 📦 Arquivos Modificados/Criados

### Arquivos Criados
- `src/services/delivery_fee.py` - Módulo de cálculo de taxa
- `src/routes/delivery.py` - Rotas da API de entrega
- `migrate_add_delivery_fields.py` - Script de migração
- `test_delivery_fee.py` - Testes unitários
- `test_integration.sh` - Testes de integração
- `DOCUMENTACAO_TAXA_ENTREGA.md` - Esta documentação

### Arquivos Modificados
- `src/models/pedido.py` - Adicionados campos `distancia_km` e `taxa_entrega`
- `src/routes/pedido.py` - Integrado cálculo de taxa na criação de pedidos
- `app.py` - Registrado blueprint `delivery_bp`

---

## 🚀 Próximos Passos (Sugestões)

1. **Interface de usuário**
   - Adicionar campo de distância no formulário de pedido
   - Mostrar taxa calculada antes de finalizar

2. **Integração com API de mapas**
   - Calcular distância automaticamente via Google Maps API
   - Validar endereço do cliente

3. **Relatórios**
   - Relatório de taxas de entrega por período
   - Análise de distâncias mais comuns

4. **Configuração dinâmica**
   - Permitir admin alterar tabela de taxas
   - Criar promoções de frete grátis

---

## 📞 Suporte

Para dúvidas ou problemas, consulte o código-fonte ou entre em contato com a equipe de desenvolvimento.

**Versão**: 1.0  
**Data**: Outubro 2025  
**Autor**: Sistema de Gestão Jamal Esfiharia

