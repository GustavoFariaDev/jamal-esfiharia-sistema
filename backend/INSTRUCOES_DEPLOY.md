# 🚀 Instruções para Deploy dos Produtos no Render

Este documento explica como fazer o deploy dos produtos e imagens no ambiente de produção (Render).

---

## 📋 Visão Geral

Você possui:
- ✅ **495 produtos** em formato JSON/SQL
- ✅ **574 imagens** (78MB total)
- ✅ Sistema já deployado no Render
- ✅ Scripts de importação prontos

---

## 🎯 Opções de Deploy

### Opção 1: Deploy via GitHub + Script Automático (Recomendado)

Esta é a opção mais profissional e automatizada.

#### Passo 1: Fazer commit dos scripts no GitHub

```bash
cd /home/ubuntu/jamal-esfiharia-sistema

# Adicionar os scripts de importação
git add backend/importar_produtos_completo.py
git add backend/importar_produtos_sql.py
git add backend/verificar_produtos.py
git add backend/GUIA_IMPORTACAO.md

# Fazer commit
git commit -m "Adicionar scripts de importação de produtos"

# Fazer push
git push origin main
```

#### Passo 2: Fazer upload dos dados para o Render

Você tem duas opções:

**Opção A: Upload via Render Shell**

1. Acesse o dashboard do Render: https://dashboard.render.com
2. Clique no serviço `jamal-esfiharia-sistema`
3. Clique em **"Shell"** no menu lateral
4. Faça upload dos arquivos:
   - `produtos.json` ou `produtos.sql`
   - Pasta `imagens/` (pode precisar compactar em .tar.gz)

**Opção B: Upload via SCP/SFTP**

Se o Render permitir acesso SSH:
```bash
# Compactar os dados
cd /home/ubuntu/upload
tar -czf jamal_dados.tar.gz jamal_export/

# Fazer upload (substitua com suas credenciais)
scp jamal_dados.tar.gz usuario@render-server:/tmp/
```

#### Passo 3: Executar a importação no Render

No shell do Render:

```bash
# Navegar para o backend
cd /opt/render/project/src/backend

# Extrair dados (se enviou compactado)
tar -xzf /tmp/jamal_dados.tar.gz -C /tmp/

# Executar importação
python3 importar_produtos_completo.py /tmp/jamal_export/produtos.json /tmp/jamal_export/imagens
```

#### Passo 4: Verificar

```bash
python3 verificar_produtos.py
```

---

### Opção 2: Upload Manual via Interface Admin

Esta opção é mais trabalhosa, mas não requer acesso ao servidor.

#### Vantagens:
- ✅ Não precisa de acesso SSH
- ✅ Interface visual
- ✅ Controle individual de cada produto

#### Desvantagens:
- ❌ Muito trabalhoso para 495 produtos
- ❌ Precisa fazer upload de cada imagem manualmente
- ❌ Propenso a erros

**Não recomendado para este volume de dados.**

---

### Opção 3: API de Importação em Lote

Criar um endpoint de API para importação em lote.

#### Passo 1: Criar rota de importação

Adicione ao backend um novo arquivo `src/routes/import_bulk.py`:

```python
from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.esfiha import Esfiha
from src.middleware.auth import token_required, admin_required

import_bulk_bp = Blueprint('import_bulk', __name__)

@import_bulk_bp.route('/import-products', methods=['POST'])
@token_required
@admin_required
def import_products():
    """Importa produtos em lote via API"""
    try:
        produtos = request.json.get('produtos', [])
        
        importados = 0
        for produto_data in produtos:
            produto = Esfiha(
                nome=produto_data['nome'],
                descricao=produto_data.get('descricao', ''),
                preco=produto_data.get('preco_broto', 0),
                preco_broto=produto_data.get('preco_broto'),
                preco_media=produto_data.get('preco_media'),
                preco_grande=produto_data.get('preco_grande'),
                categoria=produto_data.get('categoria', ''),
                disponivel=produto_data.get('disponivel', True),
                imagem_url=produto_data.get('imagem_url', '')
            )
            db.session.add(produto)
            importados += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{importados} produtos importados com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

#### Passo 2: Registrar a rota no app.py

```python
from src.routes.import_bulk import import_bulk_bp
app.register_blueprint(import_bulk_bp, url_prefix='/api/import')
```

#### Passo 3: Fazer requisição via Python

```python
import requests
import json

# Login
response = requests.post('https://jamal-esfiharia.onrender.com/api/auth/login', json={
    'username': 'admin',
    'password': 'sua_senha'
})
token = response.json()['token']

# Carregar produtos
with open('produtos.json', 'r') as f:
    produtos = json.load(f)

# Importar em lotes de 50
batch_size = 50
for i in range(0, len(produtos), batch_size):
    batch = produtos[i:i+batch_size]
    
    response = requests.post(
        'https://jamal-esfiharia.onrender.com/api/import/import-products',
        headers={'Authorization': f'Bearer {token}'},
        json={'produtos': batch}
    )
    
    print(f'Lote {i//batch_size + 1}: {response.json()}')
```

---

## 🖼️ Upload de Imagens

As imagens precisam estar acessíveis via URL. Você tem algumas opções:

### Opção A: Usar o sistema de upload do próprio backend

O backend já tem uma rota `/api/upload` que pode ser usada.

### Opção B: Usar serviço de armazenamento externo

Recomendado para produção:

1. **Cloudinary** (gratuito até 25GB)
   - Upload via API
   - CDN automático
   - Otimização de imagens

2. **AWS S3** (pago)
   - Escalável
   - Confiável
   - Integração fácil

3. **Imgur** (gratuito)
   - Simples
   - API fácil
   - Limitações de uso

### Opção C: Incluir imagens no repositório

**Não recomendado** - 78MB de imagens tornarão o repositório pesado.

---

## 📝 Checklist de Deploy

- [ ] Scripts de importação commitados no GitHub
- [ ] Dados (JSON/SQL) preparados
- [ ] Imagens compactadas e prontas
- [ ] Backup do banco de dados atual feito
- [ ] Acesso ao Render Shell configurado
- [ ] Token de admin disponível (se usar API)
- [ ] Servidor backend em modo manutenção (opcional)
- [ ] Upload dos dados concluído
- [ ] Importação executada com sucesso
- [ ] Verificação de integridade realizada
- [ ] Imagens acessíveis via URL
- [ ] Teste no painel administrativo
- [ ] Teste no frontend (cardápio)
- [ ] Servidor voltou ao normal

---

## 🔧 Configurações do Render

### Variáveis de Ambiente

Certifique-se de que estas variáveis estão configuradas:

```
DATABASE_URL=postgresql://...
SECRET_KEY=sua_chave_secreta
FLASK_ENV=production
```

### Build Command

```bash
cd backend && pip install -r requirements.txt
```

### Start Command

```bash
cd backend && gunicorn app:app
```

---

## 🚨 Solução de Problemas

### Erro: "Disk quota exceeded"

O Render free tier tem limite de armazenamento. Considere:
- Usar serviço externo para imagens
- Comprimir imagens antes do upload
- Upgrade para plano pago

### Erro: "Database connection failed"

Verifique:
- `DATABASE_URL` está configurado corretamente
- Banco de dados PostgreSQL está ativo
- Credenciais estão corretas

### Imagens não aparecem

Verifique:
- Caminho das imagens está correto no banco
- Pasta `static/uploads/` existe
- Permissões de leitura estão corretas
- CORS está configurado para servir imagens

---

## 📞 Próximos Passos

1. **Escolha a opção de deploy** que melhor se adequa à sua situação
2. **Faça backup** do banco de dados atual
3. **Execute a importação** seguindo as instruções
4. **Verifique** se tudo está funcionando
5. **Teste** o sistema completo

---

**Recomendação Final:**

Para este volume de dados (495 produtos + 574 imagens), a **Opção 1 (GitHub + Script Automático)** é a mais eficiente e profissional. Ela garante:
- ✅ Importação rápida e automatizada
- ✅ Rastreabilidade via Git
- ✅ Fácil rollback em caso de problemas
- ✅ Possibilidade de re-executar se necessário

---

**Data:** 07/11/2025  
**Sistema:** Jamal Esfiharia  
**Ambiente:** Render (Production)
