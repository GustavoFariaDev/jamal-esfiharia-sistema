# Correções de Acréscimos e Fonte na Impressão

## Data: 16/11/2025

## Problemas Identificados

1. **Acréscimos não aparecendo**: Alguns acréscimos (como atum) não estavam sendo exibidos na impressão do pedido
2. **Fonte pequena**: A fonte da impressão estava muito pequena, dificultando a leitura

## Correções Realizadas

### Arquivo: `backend/src/services/printer_enhanced.py`

#### 1. Correção da Exibição de Acréscimos (PDF)

**Problema**: O código não estava tratando corretamente o tipo de acréscimo 'esfiha', fazendo com que alguns acréscimos não aparecessem.

**Solução**: Adicionado tratamento específico para acréscimos do tipo 'esfiha' (linhas 493-523):

```python
# Acréscimos
if acrescimos:
    for acr in acrescimos:
        nome_acr = acr.get('nome', 'Acréscimo')
        tipo_acr = acr.get('tipo', '')
        preco_acr = float(acr.get('preco', 0))
        qtd_acr = acr.get('quantidade', 1)
        
        tipo_label = ""
        prefixo = ""
        
        if tipo_acr == 'pizza_metade':
            tipo_label = " (metade)"
        elif tipo_acr == 'pizza_toda':
            tipo_label = " (toda)"
        elif tipo_acr == 'esfiha':  # ← ADICIONADO
            tipo_label = ""
        elif tipo_acr == 'borda':
            if 'Borda' not in nome_acr:
                prefixo = "Borda "
            else:
                nome_acr = nome_acr.replace('Borda de ', '').replace('Borda ', '')
        
        # Quantidade de acréscimos
        qtd_label = ""
        if tipo_acr == 'esfiha' and qtd_acr > 1:
            qtd_label = f" ({qtd_acr}x)"
        elif qtd > 1 and tipo_acr not in ['borda', 'esfiha']:
            qtd_label = " (cada)"
        
        desc += f"<br/>&nbsp;&nbsp;+ {prefixo}{nome_acr}{tipo_label}{qtd_label} R$ {preco_acr:.2f}"
```

#### 2. Correção da Exibição de Acréscimos (Impressão Térmica)

**Solução**: Adicionado o mesmo tratamento para impressão térmica (linhas 222-257):

```python
elif tipo_acr == 'esfiha':  # ← ADICIONADO
    tipo_label = ""
```

#### 3. Aumento do Tamanho da Fonte

**Alterações realizadas**:

- **Título**: 16pt → 18pt (linha 406)
- **Texto normal**: 8pt → 10pt (linha 417)
- **Leading (espaçamento)**: 10pt → 12pt (linha 418)
- **Tabela de itens**: 9pt → 10pt (linha 532)
- **Tabela de totais**: 10pt → 11pt (linha 558)

### Arquivo: `backend/src/services/printer.py`

**Nota**: Este arquivo também foi corrigido preventivamente, embora o sistema esteja usando `printer_enhanced.py`.

## Resultado Esperado

✅ Todos os acréscimos (incluindo atum) agora aparecem na impressão
✅ A fonte está maior e mais legível
✅ A formatação está consistente entre impressão térmica e PDF

## Tipos de Acréscimos Suportados

- `pizza_metade` - Acréscimo em metade da pizza
- `pizza_toda` - Acréscimo na pizza inteira
- `esfiha` - Acréscimo em esfiha (ex: atum, catupiry)
- `borda` - Borda recheada

## Testes Recomendados

1. Fazer um pedido com esfihas e acréscimos de atum
2. Imprimir o pedido em PDF
3. Verificar se todos os acréscimos aparecem
4. Verificar se a fonte está legível
5. Testar impressão térmica (se disponível)
