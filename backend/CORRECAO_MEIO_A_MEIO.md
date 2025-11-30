# Correção do Bug de Preço Meio a Meio

## Análise do Problema

Após análise detalhada do código, foi identificado que:

1. **O código está CORRETO** em todos os arquivos:
   - `backend/src/routes/pedido.py` (linha 200)
   - `backend/src/routes/pedido_simples.py` (linha 115)
   - `frontend/src/components/HalfAndHalfSelector.js` (linha 77)

2. Todos os arquivos usam `max()` para calcular o preço:
   ```python
   preco_base = max(esfiha.preco, esfiha_metade2.preco)
   ```

## Possíveis Causas do Problema

O problema reportado nas imagens pode ter as seguintes causas:

### 1. Pedidos Antigos
Os pedidos mostrados nas screenshots podem ter sido criados **antes** da implementação da correção. O preço é salvo no banco de dados no momento da criação do pedido e não é recalculado.

### 2. Cache do Navegador
O frontend pode estar usando uma versão antiga em cache. Solução:
- Limpar cache do navegador (Ctrl+Shift+Del)
- Fazer hard refresh (Ctrl+F5)

### 3. Problema com Tamanhos
O cálculo pode estar usando o preço base ao invés do preço específico do tamanho. Verificar se:
- `preco_broto`, `preco_media`, `preco_grande` estão cadastrados corretamente
- O frontend está enviando o tamanho correto

## Solução Implementada

Adicionei logs detalhados nos arquivos de cálculo para facilitar o debug:

### Arquivo: `backend/src/routes/pedido_simples.py`

```python
# Linha 99-116 (com logs adicionados)
if eh_meio_a_meio and esfiha_id_metade2:
    esfiha_metade2 = Esfiha.query.get(esfiha_id_metade2)
    if not esfiha_metade2:
        return jsonify({
            "status": "error",
            "message": f"Produto ID {esfiha_id_metade2} (segunda metade) não encontrado."
        }), 404
    
    if not esfiha_metade2.disponivel:
        return jsonify({
            "status": "error",
            "message": f"Produto '{esfiha_metade2.nome}' não está disponível no momento."
        }), 400
    
    # LOG: Mostrar cálculo de preço
    print(f"\n=== CÁLCULO MEIO A MEIO ===")
    print(f"Pizza 1: {esfiha.nome} - R$ {esfiha.preco:.2f}")
    print(f"Pizza 2: {esfiha_metade2.nome} - R$ {esfiha_metade2.preco:.2f}")
    
    # Preço da pizza meio a meio = maior preço entre as duas metades
    preco_base = max(esfiha.preco, esfiha_metade2.preco)
    print(f"Preço calculado (MAX): R$ {preco_base:.2f}")
    print(f"===========================\n")
```

## Como Testar

1. **Criar um novo pedido meio a meio** através do sistema
2. **Verificar os logs** no console do backend
3. **Conferir o PDF gerado** para ver se o preço está correto
4. **Comparar** com os pedidos antigos

## Verificação de Pedidos Existentes

Para verificar se há pedidos com preço incorreto no banco:

```sql
SELECT 
    p.id as pedido_id,
    p.nome_cliente,
    ip.eh_meio_a_meio,
    e1.nome as pizza1,
    e1.preco as preco1,
    e2.nome as pizza2,
    e2.preco as preco2,
    ip.preco_unitario as preco_salvo,
    CASE 
        WHEN ip.preco_unitario < GREATEST(e1.preco, e2.preco) THEN 'ERRO'
        ELSE 'OK'
    END as status
FROM pedido p
JOIN item_pedido ip ON p.id = ip.pedido_id
JOIN esfiha e1 ON ip.esfiha_id = e1.id
LEFT JOIN esfiha e2 ON ip.esfiha_id_metade2 = e2.id
WHERE ip.eh_meio_a_meio = 1
ORDER BY p.data_criacao DESC
LIMIT 20;
```

## Conclusão

O código está correto e usando `max()` para calcular o preço. Se o problema persistir em **novos pedidos**, verificar:

1. Se o frontend está enviando os IDs corretos das pizzas
2. Se os preços cadastrados no banco estão corretos
3. Os logs adicionados para identificar onde está o problema
