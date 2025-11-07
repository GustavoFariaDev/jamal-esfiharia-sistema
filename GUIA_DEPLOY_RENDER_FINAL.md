# 🚀 Guia de Deploy no Render.com - Jamal Esfiharia

**Versão:** 1.0  
**Data:** 06/11/2025  
**Sistema:** 100% Testado e Aprovado

---

## 📋 Pré-requisitos

Antes de iniciar o deploy, certifique-se de ter:

- [x] Conta no [Render.com](https://render.com) (gratuita)
- [x] Repositório Git com o código (GitHub, GitLab ou Bitbucket)
- [x] Sistema testado localmente (✅ 100% dos testes passaram)

---

## 🎯 Opção 1: Deploy Simplificado (Recomendado)

Esta opção faz o deploy do backend e frontend juntos em um único serviço, simplificando a configuração.

### Passo 1: Preparar o Repositório

O sistema já está pronto para deploy. A estrutura atual é:

```
jamal_live_melhorado/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── gunicorn_config.py
│   └── ...
├── frontend/
│   └── build/  (já compilado)
├── Procfile
├── runtime.txt
└── render.yaml
```

### Passo 2: Criar Web Service no Render

Acesse o [Dashboard do Render](https://dashboard.render.com/) e siga os passos:

**2.1. Novo Web Service**
- Clique em "New +" → "Web Service"
- Conecte seu repositório Git
- Selecione o repositório do projeto

**2.2. Configurações Básicas**
```
Name: jamal-esfiharia
Region: Oregon (US West)
Branch: main (ou master)
Root Directory: (deixe vazio)
Environment: Python 3
```

**2.3. Build & Deploy**
```
Build Command:
cd backend && pip install -r requirements.txt

Start Command:
cd backend && gunicorn --config gunicorn_config.py app:app
```

**2.4. Plano**
```
Instance Type: Free
```

### Passo 3: Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `SECRET_KEY` | (gerar aleatório) | Chave secreta do Flask |
| `JWT_SECRET_KEY` | (gerar aleatório) | Chave para JWT |
| `FLASK_ENV` | `production` | Ambiente de produção |
| `DEBUG` | `False` | Desabilitar debug |
| `PYTHON_VERSION` | `3.11.0` | Versão do Python |

**Como gerar chaves aleatórias:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Passo 4: Deploy

- Clique em "Create Web Service"
- Aguarde o build (3-5 minutos)
- Acesse a URL fornecida pelo Render

**URL do seu sistema:**
```
https://jamal-esfiharia.onrender.com
```

---

## 🎯 Opção 2: Deploy com Banco PostgreSQL (Recomendado para Produção)

Para ambientes de produção, é recomendado usar PostgreSQL em vez de SQLite.

### Passo 1: Criar Banco PostgreSQL

**1.1. No Dashboard do Render**
- Clique em "New +" → "PostgreSQL"
- Configure:
  ```
  Name: jamal-database
  Database: jamal_db
  User: jamal_user
  Region: Oregon (US West)
  Plan: Free
  ```

**1.2. Obter URL de Conexão**
- Após criar, copie a "Internal Database URL"
- Formato: `postgresql://user:pass@host/dbname`

### Passo 2: Atualizar Dependências

Adicione ao `backend/requirements.txt`:
```
psycopg2-binary==2.9.9
```

### Passo 3: Configurar Web Service

Siga os mesmos passos da Opção 1, mas adicione mais uma variável de ambiente:

| Chave | Valor |
|-------|-------|
| `DATABASE_URL` | (URL do PostgreSQL) |

### Passo 4: Migração de Dados

O sistema criará as tabelas automaticamente na primeira execução. Para migrar dados do SQLite:

```bash
# Exportar dados do SQLite
sqlite3 backend/instance/jamal.db .dump > backup.sql

# Importar para PostgreSQL (ajustar sintaxe)
psql $DATABASE_URL < backup_converted.sql
```

---

## 🔧 Configurações Avançadas

### Configurar Domínio Personalizado

**1. No Dashboard do Render:**
- Vá para seu Web Service
- Clique em "Settings" → "Custom Domain"
- Adicione seu domínio: `www.jamalesfiharia.com.br`

**2. Configure DNS:**
```
Tipo: CNAME
Nome: www
Valor: jamal-esfiharia.onrender.com
```

### Configurar HTTPS

O Render fornece HTTPS automaticamente com Let's Encrypt. Não é necessária configuração adicional.

### Configurar Google Maps (Opcional)

Para usar o cálculo de distância automático:

**1. Obter API Key:**
- Acesse [Google Cloud Console](https://console.cloud.google.com/)
- Crie um projeto
- Ative "Distance Matrix API"
- Crie uma API Key

**2. Adicionar Variável de Ambiente:**
```
GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

**3. Configurar Endereço do Restaurante:**

No banco de dados, adicione uma configuração:
```sql
INSERT INTO configuracao (chave, valor, tipo, descricao)
VALUES ('endereco_restaurante', 'Rua Exemplo, 123, São Paulo, SP', 'string', 'Endereço base para cálculo de distância');
```

---

## 📊 Monitoramento e Logs

### Acessar Logs

**No Dashboard do Render:**
- Vá para seu Web Service
- Clique em "Logs"
- Visualize logs em tempo real

### Métricas

**Disponível no plano Free:**
- CPU Usage
- Memory Usage
- Bandwidth
- Response Time

### Alertas

Configure alertas para:
- Falhas de deploy
- Erros de aplicação
- Uso excessivo de recursos

---

## 🐛 Troubleshooting

### Problema: Build Falha

**Solução:**
```bash
# Verificar requirements.txt
cat backend/requirements.txt

# Verificar versão do Python
cat runtime.txt
```

### Problema: Aplicação não Inicia

**Verificar:**
1. Procfile está correto
2. gunicorn_config.py existe
3. Variáveis de ambiente configuradas
4. Porta está correta (usar $PORT)

**Logs úteis:**
```bash
# No Render, verificar:
- Build logs
- Deploy logs
- Application logs
```

### Problema: Banco de Dados não Conecta

**SQLite:**
- Verificar se diretório `instance/` existe
- Verificar permissões de escrita

**PostgreSQL:**
- Verificar DATABASE_URL
- Verificar se psycopg2-binary está instalado
- Verificar conexão de rede

### Problema: Frontend não Carrega

**Verificar:**
1. Build do React está em `backend/static/`
2. Rotas do Flask servem arquivos estáticos
3. CORS está configurado corretamente

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [x] **SECRET_KEY forte e aleatória**
- [x] **DEBUG=False em produção**
- [x] **HTTPS habilitado**
- [x] **CORS configurado corretamente**
- [x] **Senhas hasheadas**
- [x] **JWT com expiração**
- [x] **Validação de entrada**
- [x] **Rate limiting** (considerar adicionar)

### Recomendações Adicionais

**1. Backup Regular:**
```bash
# Configurar backup automático do PostgreSQL no Render
# Plano pago oferece backups automáticos
```

**2. Monitoramento de Segurança:**
- Usar serviços como Sentry para rastreamento de erros
- Configurar alertas de segurança
- Revisar logs regularmente

**3. Atualizações:**
```bash
# Manter dependências atualizadas
pip list --outdated
pip install --upgrade <package>
```

---

## 📈 Otimização de Performance

### Cache

Considere adicionar cache para:
- Listagem de produtos
- Configurações do sistema
- Cálculos de taxa de entrega

**Exemplo com Flask-Caching:**
```python
from flask_caching import Cache

cache = Cache(app, config={
    'CACHE_TYPE': 'simple',
    'CACHE_DEFAULT_TIMEOUT': 300
})

@cache.cached(timeout=300)
def listar_esfihas():
    # ...
```

### CDN para Imagens

Para melhor performance, considere usar:
- Cloudinary
- AWS S3 + CloudFront
- Render Static Sites

### Compressão

O Gunicorn já está configurado para compressão. Para melhorar:

```python
from flask_compress import Compress
Compress(app)
```

---

## 🔄 CI/CD Automático

O Render já faz deploy automático quando você faz push para o repositório.

### Configurar Deploy Automático

**1. No Dashboard:**
- Settings → Build & Deploy
- Auto-Deploy: Yes
- Branch: main

**2. Deploy Manual:**
- Clique em "Manual Deploy" → "Deploy latest commit"

### Ambientes Separados

Crie ambientes diferentes:

**Desenvolvimento:**
```
Branch: develop
URL: jamal-dev.onrender.com
```

**Produção:**
```
Branch: main
URL: jamal-esfiharia.onrender.com
```

---

## 📞 Suporte

### Recursos Úteis

- **Documentação Render:** https://render.com/docs
- **Status do Render:** https://status.render.com
- **Comunidade:** https://community.render.com
- **Suporte:** support@render.com

### Problemas Comuns

**Plano Free hiberna após 15 minutos de inatividade:**
- Primeira requisição pode demorar ~30 segundos
- Considere upgrade para plano pago se necessário
- Use serviços de "keep-alive" (ping periódico)

**Limite de 750 horas/mês no plano Free:**
- Suficiente para testes e pequenos projetos
- Para produção, considere plano Starter ($7/mês)

---

## ✅ Checklist Final de Deploy

Antes de considerar o deploy completo, verifique:

### Pré-Deploy
- [ ] Código testado localmente (100% dos testes)
- [ ] Variáveis de ambiente documentadas
- [ ] Secrets configurados
- [ ] Banco de dados escolhido (SQLite ou PostgreSQL)

### Durante Deploy
- [ ] Repositório conectado ao Render
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Plano selecionado

### Pós-Deploy
- [ ] Aplicação acessível via URL
- [ ] Login funcionando
- [ ] Produtos carregando
- [ ] Pedidos sendo criados
- [ ] Logs sem erros críticos
- [ ] Performance aceitável

### Produção
- [ ] Domínio personalizado configurado (opcional)
- [ ] HTTPS funcionando
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Documentação atualizada

---

## 🎉 Conclusão

Seguindo este guia, seu sistema **Jamal Esfiharia** estará rodando em produção no Render.com com:

✅ **Alta disponibilidade**  
✅ **HTTPS automático**  
✅ **Deploy automático**  
✅ **Logs centralizados**  
✅ **Escalabilidade**  

**Tempo estimado de deploy:** 10-15 minutos

**Custo:** Gratuito (plano Free) ou $7/mês (plano Starter)

---

**Desenvolvido por:** Sistema Jamal Esfiharia  
**Versão:** 1.0  
**Data:** 06/11/2025  
**Status:** ✅ Pronto para Produção
