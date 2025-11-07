# Sistema de Gestão Jamal Esfiharia
## ✅ Versão com Cálculo de Taxa de Entrega Integrado

---

## 🎯 O que foi implementado

### ✅ Cálculo Automático de Taxa de Entrega
O sistema agora calcula automaticamente a taxa de entrega baseada na distância do cliente durante a criação do pedido.

**Funcionalidades**:
- ✅ Cálculo automático integrado ao fluxo de pedidos
- ✅ Tabela de taxas conforme especificação (0km a 20km)
- ✅ Validação de distância obrigatória para entregas
- ✅ Taxa R$ 0,00 para retiradas
- ✅ API REST para consultas (opcional)
- ✅ Banco de dados atualizado com novos campos

---

## 📋 Requisitos

- Python 3.11+
- Flask e dependências (veja `requirements.txt`)
- SQLite (incluído)

---

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd backend_corrigido
pip install -r requirements.txt
```

### 2. Executar o Servidor

```bash
python3.11 app.py
```

O servidor estará disponível em: `http://localhost:5000`

### 3. Criar Pedido com Entrega

**Endpoint**: `POST /api/pedidos/criar-intent-pagamento`

**Exemplo de requisição**:
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
      "quantidade": 5
    }
  ]
}
```

**O sistema irá**:
1. Calcular o subtotal dos produtos
2. Calcular a taxa de entrega baseada em `distancia_km` (3.2km = R$ 5,00)
3. Somar tudo e retornar o `valor_total`

### 4. Criar Pedido com Retirada

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

**Observação**: Não precisa informar distância. Taxa será R$ 0,00.

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

## 🧪 Testes

### Testar Cálculo de Taxa
```bash
python3.11 test_delivery_fee.py
```

### Testar Integração Completa
```bash
./test_integration.sh
```

---

## 📁 Estrutura de Arquivos

```
backend_corrigido/
├── app.py                              # Aplicação principal
├── src/
│   ├── models/
│   │   └── pedido.py                   # ✅ Modelo atualizado com distancia_km e taxa_entrega
│   ├── routes/
│   │   ├── pedido.py                   # ✅ Integração do cálculo na criação de pedidos
│   │   └── delivery.py                 # ✅ NOVO: API de consulta de taxas
│   └── services/
│       └── delivery_fee.py             # ✅ NOVO: Módulo de cálculo de taxa
├── instance/
│   └── esfiharia.db                    # ✅ Banco atualizado com novos campos
├── migrate_add_delivery_fields.py      # ✅ NOVO: Script de migração
├── test_delivery_fee.py                # ✅ NOVO: Testes unitários
├── test_integration.sh                 # ✅ NOVO: Testes de integração
├── DOCUMENTACAO_TAXA_ENTREGA.md        # ✅ NOVO: Documentação completa
└── README_TAXA_ENTREGA.md              # ✅ NOVO: Este arquivo
```

---

## 🔄 Migração do Banco de Dados

**Já executada!** O banco de dados foi atualizado com os campos:
- `distancia_km` (FLOAT, nullable)
- `taxa_entrega` (FLOAT, default 0.0)

Se precisar executar novamente:
```bash
python3.11 migrate_add_delivery_fields.py
```

---

## 📖 Documentação Completa

Para detalhes técnicos completos, consulte:
- **DOCUMENTACAO_TAXA_ENTREGA.md** - Documentação técnica detalhada

---

## 🎯 Fluxo de Criação de Pedido

```
1. Cliente seleciona produtos
   ↓
2. Cliente informa:
   - Forma de entrega (retirada ou entrega)
   - Se entrega: endereço + distância em km
   ↓
3. Sistema calcula:
   - Subtotal dos produtos
   - Taxa de entrega (se aplicável)
   - Valor total = subtotal + taxa
   ↓
4. Sistema registra no banco:
   - Pedido completo
   - Distância e taxa salvos
   - Status: pagamento_pendente
   ↓
5. Sistema retorna:
   - ID do pedido
   - Valor total (já com taxa incluída)
   - Client secret para pagamento
```

---

## ⚠️ Observações Importantes

1. **Distância obrigatória para entregas**
   - Se `forma_entrega = "entrega"`, o campo `distancia_km` é **obrigatório**
   - O sistema retornará erro se não for informado

2. **Retiradas não precisam de distância**
   - Se `forma_entrega = "retirada"`, não informe `distancia_km`
   - Taxa será automaticamente R$ 0,00

3. **Distâncias acima de 20km**
   - O sistema retornará erro
   - Mensagem: "Entre em contato para calcular a taxa"

4. **Valor total já inclui taxa**
   - O `valor_total` retornado já inclui a taxa de entrega
   - Não é necessário calcular novamente no frontend

---

## 🔌 Endpoints da API

### Criar Pedido (Principal)
- **POST** `/api/pedidos/criar-intent-pagamento`
- Calcula taxa automaticamente e cria pedido

### Consultar Taxa (Opcional)
- **POST** `/api/delivery/calcular-taxa`
- **POST** `/api/delivery/calcular-total`
- **GET** `/api/delivery/tabela-taxas`

---

## 📞 Suporte

Para dúvidas técnicas, consulte a documentação completa em `DOCUMENTACAO_TAXA_ENTREGA.md`.

---

**Versão**: 1.0 com Taxa de Entrega  
**Data**: Outubro 2025  
**Sistema**: Jamal Esfiharia - Gestão de Pedidos

