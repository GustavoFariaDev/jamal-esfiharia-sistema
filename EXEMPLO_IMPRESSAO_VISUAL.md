# Exemplo Visual da Impressão - Esfiharia Jamal

## Como Ficará a Impressão Térmica

```
========================================
         ESFIHARIA JAMAL
       Rua das Esfihas, 123
      Tel: (11) 99999-9999
========================================
PEDIDO #10 | 06/11/25 20:28
Cliente: Cliente VIP - Teste Co
Fone: (11) 91111-2222
Entrega: Retirada
----------------------------------------
ITENS

1x Pizza Meio a Meio Grande    R$ 62,00
   • 5 QUEIJOS
   • 3 QUEIJOS
   + Cheddar (metade) R$ 7,00
   + Gorgonzola (metade) R$ 7,00
   + Borda Cheddar R$ 13,00

1x 4 QUEIJOS Grande            R$ 67,00
   + Mussarela (toda) R$ 12,00
   + Bacon (toda) R$ 12,00
   + Mussarela R$ 13,00

5x ALHO C/ CATUPIRY            R$ 95,00
   (Aberta)
   [2 c/ acréscimo, 3 normal]
   + Bacon (2x) R$ 4,00

3x ALHO C/ CATUPIRY            R$ 61,50
   (Aberta)
   + Bacon (cada) R$ 4,00
   + Catupiry (cada) R$ 4,00

2x ALHO C/ MUSSARELA           R$ 40,00
   (Aberta)
   + Mussarela (cada) R$ 4,00
   + Provolone (cada) R$ 5,00

2x ATUM                        R$ 34,00
   (Aberta)
   + Cebola (cada) R$ 3,00
   + Tomate (cada) R$ 3,00

4x ESFIHA DE CHOCOLATE         R$ 36,00
   (Fechada)

2x ESFIHA ESPECIAL             R$ 28,00
   (Fechada)
   [Todas c/ acréscimo]
   + Nutella (2x) R$ 4,00

----------------------------------------
Subtotal:                     R$ 423,50
----------------------------------------
TOTAL:                        R$ 423,50
----------------------------------------
Pagamento: cartao
Status: PENDENTE
----------------------------------------
Obs: Pedido de teste com todos os
tipos de acréscimos
----------------------------------------
    Obrigado pela preferência!


```

## 📋 Explicação Detalhada

### 🍕 PIZZAS

#### Pizza Meio a Meio com Acréscimos em Metades Diferentes
```
1x Pizza Meio a Meio Grande    R$ 62,00
   • 5 QUEIJOS              ← Sabor da metade 1
   • 3 QUEIJOS              ← Sabor da metade 2
   + Cheddar (metade) R$ 7,00    ← Acréscimo só na metade 1
   + Gorgonzola (metade) R$ 7,00 ← Acréscimo só na metade 2
   + Borda Cheddar R$ 13,00      ← Borda em toda a pizza
```

#### Pizza Inteira com Acréscimos na Pizza Toda
```
1x 4 QUEIJOS Grande            R$ 67,00
   + Mussarela (toda) R$ 12,00   ← Acréscimo em toda a pizza
   + Bacon (toda) R$ 12,00       ← Acréscimo em toda a pizza
   + Mussarela R$ 13,00          ← Borda (automaticamente "toda")
```

### 🥟 ESFIHAS

#### Esfihas com Acréscimos Parciais
```
5x ALHO C/ CATUPIRY            R$ 95,00
   (Aberta)                    ← Tipo de massa obrigatório
   [2 c/ acréscimo, 3 normal]  ← Contagem clara
   + Bacon (2x) R$ 4,00        ← Bacon em apenas 2 esfihas
```
**Interpretação para a cozinha:**
- Preparar 5 esfihas de ALHO C/ CATUPIRY abertas
- 2 esfihas levam Bacon adicional
- 3 esfihas são normais (sem acréscimo)

#### Esfihas com Acréscimos em Todas
```
3x ALHO C/ CATUPIRY            R$ 61,50
   (Aberta)                    ← Tipo de massa obrigatório
   + Bacon (cada) R$ 4,00      ← Bacon em todas as 3 esfihas
   + Catupiry (cada) R$ 4,00   ← Catupiry em todas as 3 esfihas
```
**Interpretação para a cozinha:**
- Preparar 3 esfihas de ALHO C/ CATUPIRY abertas
- Todas levam Bacon adicional
- Todas levam Catupiry adicional

#### Esfihas Todas com Acréscimo
```
2x ESFIHA ESPECIAL             R$ 28,00
   (Fechada)                   ← Tipo de massa obrigatório
   [Todas c/ acréscimo]        ← Todas têm acréscimo
   + Nutella (2x) R$ 4,00      ← Nutella nas 2 esfihas
```

#### Esfihas Sem Acréscimo
```
4x ESFIHA DE CHOCOLATE         R$ 36,00
   (Fechada)                   ← Tipo de massa obrigatório
                               ← Sem acréscimos
```

## 🎯 Regras Aplicadas

### Para PIZZAS:
| Situação | Como Aparece | Exemplo |
|----------|--------------|---------|
| Acréscimo em metade | `+ Nome (metade) R$ X,XX` | `+ Cheddar (metade) R$ 7,00` |
| Acréscimo na pizza toda | `+ Nome (toda) R$ X,XX` | `+ Mussarela (toda) R$ 12,00` |
| Borda | `+ Borda Nome R$ X,XX` | `+ Borda Cheddar R$ 13,00` |

### Para ESFIHAS:
| Situação | Como Aparece | Exemplo |
|----------|--------------|---------|
| Tipo de massa | `(Aberta)` ou `(Fechada)` | Sempre aparece |
| Acréscimo em todas | `+ Nome (cada) R$ X,XX` | `+ Bacon (cada) R$ 4,00` |
| Acréscimo em algumas | `[X c/ acréscimo, Y normal]`<br>`+ Nome (Xx) R$ X,XX` | `[2 c/ acréscimo, 3 normal]`<br>`+ Bacon (2x) R$ 4,00` |
| Todas com acréscimo | `[Todas c/ acréscimo]`<br>`+ Nome (Xx) R$ X,XX` | `[Todas c/ acréscimo]`<br>`+ Nutella (2x) R$ 4,00` |

## ✅ Benefícios da Nova Impressão

### Para a Cozinha:
1. ✅ Sabe exatamente qual tipo de massa usar (aberta/fechada)
2. ✅ Sabe em qual lado da pizza colocar cada ingrediente
3. ✅ Sabe quantas esfihas levam acréscimo e quantas são normais
4. ✅ Identifica bordas facilmente

### Para o Cliente:
1. ✅ Vê claramente o que pediu
2. ✅ Entende como os acréscimos foram aplicados
3. ✅ Transparência total nos preços

### Para o Negócio:
1. ✅ Menos erros de preparação
2. ✅ Mais profissionalismo
3. ✅ Maior satisfação do cliente
