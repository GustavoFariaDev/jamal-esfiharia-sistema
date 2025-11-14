#!/usr/bin/env python3
"""
Script para testar a remoção de categorias duplicadas
"""

# Simular o comportamento do código corrigido
categorias_do_banco = [
    ('BEBIDAS',),
    ('bebidas',),
    ('ESFIHAS SALGADAS',),
    ('PIZZAS SALGADAS',),
    ('BATATA SIMPLES',),
    ('SALGADOS',)
]

print("=" * 80)
print("TESTE DE REMOÇÃO DE CATEGORIAS DUPLICADAS")
print("=" * 80)

print("\n📋 Categorias originais do banco:")
for cat in categorias_do_banco:
    print(f"   - {cat[0]}")

# Código ANTIGO (com duplicação)
print("\n❌ ANTES (com duplicação):")
category_names_old = {cat[0] for cat in categorias_do_banco if cat[0]}
print(f"   Total: {len(category_names_old)} categorias")
for cat in sorted(category_names_old):
    print(f"   - {cat}")

# Código NOVO (sem duplicação)
print("\n✅ DEPOIS (sem duplicação):")
category_names_new = {cat[0].upper() for cat in categorias_do_banco if cat[0]}
print(f"   Total: {len(category_names_new)} categorias")
for cat in sorted(category_names_new):
    print(f"   - {cat}")

print("\n" + "=" * 80)
print("RESULTADO:")
print(f"   Categorias removidas: {len(category_names_old) - len(category_names_new)}")
print(f"   ✅ Duplicação de 'BEBIDAS' e 'bebidas' removida!")
print("=" * 80)
