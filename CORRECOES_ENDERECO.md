# Correções no Sistema de Impressão - Endereço Completo

## Problema Identificado
O endereço completo não está aparecendo nas impressões PDF e térmica, mesmo que o campo "Observações" só apareça após preencher o CEP.

## Análise do Código Atual

### Impressão Térmica (printer.py - linhas 124-142)
- ✅ Já exibe CEP, endereço e complemento
- ✅ Código correto

### Impressão PDF (printer.py - linhas 405-417)
- ✅ Já exibe CEP, endereço e complemento
- ✅ Código correto

### Rota de Impressão (print.py - linhas 39-55)
- ✅ Passa corretamente: endereco, complemento, cep_entrega
- ✅ Código correto

## Possível Causa
O PDF de exemplo mostra que o endereço NÃO está aparecendo. Isso pode indicar que:
1. Os dados não estão sendo salvos corretamente no banco de dados
2. O campo `endereco` está vazio no momento da impressão
3. Há um problema com o mapeamento de campos

## Solução
Vou garantir que:
1. O endereço seja sempre exibido de forma destacada
2. Adicionar validação para garantir que o endereço seja obrigatório
3. Melhorar a formatação do endereço nas impressões
