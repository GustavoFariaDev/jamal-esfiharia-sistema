# Análise dos Problemas Identificados

## Problemas Reportados

### 1. Validação de Campos no Carrinho/Checkout
**Problema**: Todos os campos (CEP, endereço, nome, telefone) devem ser obrigatórios e validados antes de finalizar o pedido.

**Status Atual**: 
- O CartModal.js tem campos de entrada, mas não há validação visual forte
- A validação acontece apenas no backend

**Correção Necessária**:
- Adicionar validação no frontend antes de enviar o pedido
- Mostrar mensagens de erro claras para cada campo obrigatório
- Desabilitar botão "Finalizar Pedido" até que todos os campos obrigatórios estejam preenchidos

### 2. Preenchimento Automático de Endereço via CEP
**Problema**: O endereço deve ser preenchido automaticamente após inserir o CEP e NÃO pode ser digitado manualmente.

**Status Atual**:
- O campo de endereço é um input text editável manualmente (linha 176-182 do CartModal.js)
- Não há integração com API de CEP (ViaCEP ou similar)

**Correção Necessária**:
- Adicionar campo de CEP
- Integrar com API ViaCEP para buscar endereço automaticamente
- Tornar o campo de endereço somente leitura (readonly) após preenchimento automático
- Permitir apenas edição do número e complemento

### 3. Especificação de Produtos no PDF
**Problema**: O PDF impresso não especifica claramente o tipo de produto (Esfiha, Pizza, Beirute, Pastel, etc.). 
Exemplo da imagem: mostra "ATUM C/ MUSSARELA" mas não especifica se é esfiha, pizza ou pastel.

**Status Atual**:
- No printer_enhanced.py (linha 173-213), os itens são impressos com o nome do produto
- A categoria existe no banco de dados mas não está sendo exibida claramente no PDF
- Apenas pizzas meio a meio têm o tipo especificado ("Pizza Meio a Meio")
- Esfihas mostram tipo de massa (Aberta/Fechada) mas não mostram "ESFIHA" no nome

**Correção Necessária**:
- Adicionar prefixo da categoria antes do nome do produto
- Exemplos:
  - "ESFIHA - Atum c/ Mussarela (Aberta)"
  - "PIZZA - Calabresa (Média)"
  - "BEIRUTE - Bauru"
  - "PASTEL - Carne"
  - "BEBIDA - Guaraná Antarctica 2L"

## Categorias Disponíveis no Sistema

De acordo com `categories.py`, as categorias são:
- ESFIHAS SALGADAS
- ESFIHAS ESPECIAIS
- ESFIHAS VEGETARIANAS
- ESFIHAS DOCES
- PIZZAS SALGADAS
- PIZZAS DOCES
- FOGAZZES SALGADAS
- FOGAZZES ESPECIAIS
- FOGAZZES VEGETARIANAS
- FOGAZZES DOCES
- PASTÉIS SALGADOS
- PASTÉIS ESPECIAIS
- PASTÉIS VEGETARIANOS
- PASTÉIS DOCES
- BEIRUTES
- BATATA SIMPLES
- BATATA RECHEADA
- SALGADOS
- BEBIDAS

## Arquivos a Modificar

### Frontend:
1. `/frontend/src/components/Cart/CartModal.js` - Adicionar validação e integração com CEP
2. `/frontend/src/components/DeliveryCalculator.js` - Verificar se já tem integração com CEP

### Backend:
1. `/backend/src/services/printer_enhanced.py` - Adicionar categoria/tipo do produto na impressão
2. `/backend/src/routes/print.py` - Garantir que categoria está sendo passada corretamente
3. `/backend/src/routes/pedido.py` - Adicionar validação de CEP obrigatório para entregas
