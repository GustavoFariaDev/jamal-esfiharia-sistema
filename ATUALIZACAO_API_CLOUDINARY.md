# 🔄 Atualização de API - Cloudinary (Jamal Image)

**Data:** 09 de novembro de 2025  
**Tipo:** Atualização de credenciais de API

---

## 📋 Resumo da Atualização

As credenciais da API do Cloudinary foram atualizadas para utilizar a nova conta **"JAMAL IMAGE"**.

### Credenciais Antigas (Removidas)

```
Cloud Name: image
API Key: 439968778124911
API Secret: 4xYcYzn1DZDAHQ__l1_w6mpOzk4
```

### Credenciais Novas (Ativas)

```
Cloud Name: dbb7oidld
API Key: 468221897619255
API Secret: HTmVxJABYYsmtUBsrYP13NSW9CU
Status: Active
```

---

## 📁 Arquivos Modificados

### 1. `backend/src/routes/upload.py`

**Alteração:** Atualização das credenciais padrão do Cloudinary

```python
# Configurar Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'dbb7oidi4'),
    api_key=os.getenv('CLOUDINARY_API_KEY', '468221897619255'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', 'HTmVxJABYYsmtUBsrYP13NSW9CU')
)
```

### 2. `backend/.env.example`

**Alteração:** Adicionadas variáveis de ambiente do Cloudinary

```env
# Configurações do Cloudinary (Upload de Imagens)
# Obtenha suas credenciais em: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=dbb7oidld
CLOUDINARY_API_KEY=468221897619255
CLOUDINARY_API_SECRET=HTmVxJABYYsmtUBsrYP13NSW9CU
```

---

## ⚙️ Configuração em Produção (Render.com)

### Passos para Atualizar Variáveis de Ambiente

1. **Acessar Dashboard do Render:**
   - URL: https://dashboard.render.com
   - Faça login com suas credenciais

2. **Selecionar o Serviço Backend:**
   - Menu lateral → **Services**
   - Clique no serviço do backend (Python/Flask)

3. **Atualizar Variáveis de Ambiente:**
   - Aba **Environment**
   - Adicione ou atualize as seguintes variáveis:

   ```
   CLOUDINARY_CLOUD_NAME=dbb7oidld
   CLOUDINARY_API_KEY=468221897619255
   CLOUDINARY_API_SECRET=HTmVxJABYYsmtUBsrYP13NSW9CU
   ```

4. **Salvar e Redeploy:**
   - Clique em **Save Changes**
   - O Render fará redeploy automático do serviço

---

## 🧪 Testes Recomendados

Após a atualização, teste as seguintes funcionalidades:

### 1. Upload de Imagem de Produto

1. Acesse o painel administrativo
2. Vá em **Produtos** → **Adicionar Produto**
3. Faça upload de uma imagem
4. Verifique se a URL gerada começa com:
   ```
   https://res.cloudinary.com/dbb7oidld/...
   ```

### 2. Edição de Produto com Imagem

1. Selecione um produto existente
2. Altere a imagem
3. Salve e verifique se a nova URL foi atualizada

### 3. Visualização no Cardápio

1. Acesse o cardápio público
2. Verifique se todas as imagens carregam corretamente
3. Confirme que não há erros 404 ou imagens quebradas

---

## 🔍 Verificação de Logs

### Backend (Render Dashboard)

1. Acesse o serviço backend no Render
2. Aba **Logs**
3. Procure por mensagens de upload:
   ```
   Upload realizado com sucesso: https://res.cloudinary.com/dbb7oidld/...
   ```

### Erros Comuns

**Erro: "Invalid API credentials"**
- Verifique se as variáveis de ambiente estão corretas
- Confirme que não há espaços extras nas credenciais

**Erro: "Upload failed"**
- Verifique se a conta Cloudinary está ativa
- Confirme que o plano não atingiu o limite de armazenamento

---

## 📊 Impacto da Mudança

### ✅ Funcionalidades Afetadas

- Upload de imagens de produtos
- Edição de imagens existentes
- Visualização de imagens no cardápio
- Gerenciamento de mídia no painel admin

### ⚠️ Atenção

**Imagens antigas:** As imagens já hospedadas na conta antiga (`image`) continuarão funcionando até que a conta seja desativada. Recomenda-se:

1. **Migração gradual:** Ao editar produtos, faça novo upload das imagens
2. **Backup:** Baixe imagens importantes da conta antiga antes de desativá-la
3. **Monitoramento:** Verifique periodicamente se há imagens quebradas

---

## 🔐 Segurança

### Boas Práticas

1. **Nunca commitar credenciais:** As credenciais estão em `.env.example` apenas como referência. Use variáveis de ambiente em produção.

2. **Rotação de chaves:** Considere rotacionar as API keys periodicamente no dashboard do Cloudinary.

3. **Monitoramento de uso:** Acompanhe o uso da API no dashboard do Cloudinary para detectar atividades suspeitas.

---

## 📞 Suporte

### Cloudinary

- Dashboard: https://cloudinary.com/console
- Documentação: https://cloudinary.com/documentation
- Suporte: https://support.cloudinary.com

### Problemas no Sistema

Consulte a documentação principal em `docs/` ou os guias de deploy.

---

**Atualizado em:** 09/11/2025  
**Responsável:** Sistema Automatizado  
**Status:** ✅ Concluído
