# Correções de Acréscimos e Fonte na Impressão

## Data: 16/11/2025

## Problemas Identificados

1. **Acréscimos não aparecendo**: Alguns acréscimos (como atum) não estavam sendo exibidos na impressão do pedido
2. **Fonte pequena**: A fonte da impressão estava muito pequena, dificultando a leitura

## Análise do Problema

O código original usava uma estrutura `if/elif` que **SOMENTE** tratava 4 tipos específicos de acréscimos:
- `pizza_metade`
- `pizza_toda`
- `borda`
- `esfiha`

**PROBLEMA CRÍTICO**: Se um acréscimo tivesse qualquer outro tipo ou tipo vazio, ele **NÃO ERA EXIBIDO** porque não entrava em nenhuma condição do `if/elif`.

## Correções Realizadas

### 1. Correção da Lógica de Exibição de Acréscimos

**ANTES** (código problemático):
```python
if tipo_acr == 'pizza_metade':
    tipo_label = " (metade)"
elif tipo_acr == 'pizza_toda':
    tipo_label = " (toda)"
elif tipo_acr == 'esfiha':
    tipo_label = ""
elif tipo_acr == 'borda':
    # formatação
    pass
# ❌ Se não for nenhum desses tipos, o acréscimo NÃO é adicionado!
```

**DEPOIS** (código corrigido):
```python
# Acréscimos - SEMPRE exibir, independente do tipo
if acrescimos:
    for acr in acrescimos:
        # ... processa dados ...
        
        # Formatação específica por tipo (mas SEMPRE exibe)
        if tipo_acr == 'pizza_metade':
            tipo_label = " (metade)"
        elif tipo_acr == 'pizza_toda':
            tipo_label = " (toda)"
        elif tipo_acr == 'borda':
            # formatação especial
            pass
        # Para 'esfiha' e QUALQUER outro tipo, não adiciona label especial
        
        # ✅ SEMPRE adiciona o acréscimo, independente do tipo
        desc += f"<br/>&nbsp;&nbsp;+ {prefixo}{nome_acr}{tipo_label}{qtd_label} R$ {preco_acr:.2f}"
```

**Mudança Principal**: 
- A linha que adiciona o acréscimo (`desc +=` ou `lines.append()`) agora está **FORA** do bloco `if/elif`
- Isso garante que **TODOS** os acréscimos sejam exibidos, independentemente do tipo
- Os tipos conhecidos ainda recebem formatação especial, mas tipos desconhecidos também aparecem

### 2. Arquivos Corrigidos

#### `backend/src/services/printer_enhanced.py` (arquivo principal)
- ✅ Corrigida impressão térmica (linhas 222-256)
- ✅ Corrigida geração de PDF (linhas 495-526)

#### `backend/src/services/printer.py` (backup/alternativo)
- ✅ Corrigida impressão térmica (linhas 202-236)
- ✅ Corrigida geração de PDF (linhas 439-470)

### 3. Aumento do Tamanho da Fonte

**Alterações realizadas em `printer_enhanced.py`**:
- **Título**: 16pt → 18pt
- **Texto normal**: 8pt → 10pt
- **Leading (espaçamento)**: 10pt → 12pt
- **Tabela de itens**: 9pt → 10pt
- **Tabela de totais**: 10pt → 11pt

**Alterações realizadas em `printer.py`**:
- **Título**: 16pt → 18pt
- **Texto normal**: 9pt → 11pt
- **Leading (espaçamento)**: 11pt → 14pt
- **Tabela de itens**: 9pt → 11pt
- **Tabela de totais**: 10pt → 12pt

## Resultado Esperado

✅ **TODOS** os acréscimos agora aparecem na impressão, incluindo:
- Atum (tipo: esfiha)
- Catupiry (tipo: esfiha)
- Mussarela (tipo: pizza_metade, pizza_toda)
- Bordas (tipo: borda)
- **Qualquer outro acréscimo**, mesmo com tipo desconhecido ou vazio

✅ A fonte está maior e mais legível em toda a impressão

✅ A formatação está consistente entre impressão térmica e PDF

## Tipos de Acréscimos Suportados

### Tipos com Formatação Especial:
- `pizza_metade` - Exibe "(metade)" após o nome
- `pizza_toda` - Exibe "(toda)" após o nome
- `borda` - Adiciona prefixo "Borda" se necessário

### Tipos com Formatação Padrão:
- `esfiha` - Exibe apenas o nome e preço
- **Qualquer outro tipo** - Exibe apenas o nome e preço

## Exemplo de Saída

### Pedido com Esfihas e Acréscimos:
```
1x ALHO C/ MUSSARELA                    R$ 11.00
   + Tomate R$ 3.00
   + Atum R$ 3.00

3x ALADIM Broto                         R$ 114.00
   + Catupiry (2x) R$ 6.00
```

### Pizza com Acréscimos:
```
1x Pizza Meio a Meio Grande             R$ 57.00
   • 4 QUEIJOS
   • 3 QUEIJOS
   + Mussarela (metade) R$ 7.00
   + Mussarela (metade) R$ 7.00
   + Catupiry R$ 13.00
```

## Testes Recomendados

1. ✅ Fazer pedido com esfihas e acréscimos de atum
2. ✅ Fazer pedido com esfihas e acréscimos de catupiry
3. ✅ Fazer pedido com pizza e acréscimos diversos
4. ✅ Imprimir pedidos em PDF
5. ✅ Verificar se todos os acréscimos aparecem
6. ✅ Verificar se a fonte está legível
7. ✅ Testar impressão térmica (se disponível)

## Commits

### Commit 1 (16/11/2025):
- Adicionar tratamento para tipo 'esfiha'
- Aumentar tamanhos de fonte

### Commit 2 (16/11/2025):
- **Garantir que TODOS os acréscimos apareçam**
- Remover dependência de tipos específicos
- Adicionar comentários explicativos
- Atualizar documentação
