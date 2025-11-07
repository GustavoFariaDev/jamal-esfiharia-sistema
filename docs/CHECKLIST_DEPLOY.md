# Checklist de Deploy - Sistema Atualizado

## ✅ Antes de Fazer o Deploy

### Backup
- [ ] Fazer backup completo do banco de dados atual
- [ ] Fazer backup dos arquivos do sistema atual
- [ ] Verificar que os backups estão acessíveis e íntegros

### Preparação
- [ ] Extrair o arquivo `jamal_sistema_ATUALIZADO_v2.zip`
- [ ] Revisar a documentação em `ALTERACOES_SISTEMA_TAMANHOS_ACRESCIMOS.md`
- [ ] Ler o `RESUMO_ALTERACOES.md` para entender as mudanças

---

## 🔧 Durante o Deploy

### Backend

- [ ] Parar o servidor backend
- [ ] Substituir os arquivos do frontend
- [ ] Verificar que o arquivo `backend/instance/esfiharia.db` contém os acréscimos
  - Se não: executar o script `populate_acrescimos.py`
- [ ] Reiniciar o servidor backend
- [ ] Verificar logs para erros

### Frontend

- [ ] Parar o servidor frontend (se aplicável)
- [ ] Substituir os arquivos do frontend
- [ ] Instalar dependências (se necessário): `npm install` ou `pnpm install`
- [ ] Fazer build do frontend: `npm run build` ou `pnpm build`
- [ ] Reiniciar o servidor frontend
- [ ] Limpar cache do navegador

### Banco de Dados

- [ ] Verificar que a tabela `acrescimo` existe
- [ ] Confirmar que há 42 registros de acréscimos
- [ ] Verificar que produtos têm os campos `preco_broto`, `preco_media`, `preco_grande` preenchidos
- [ ] Testar consulta: `SELECT COUNT(*) FROM acrescimo WHERE disponivel = 1`

---

## 🧪 Testes Pós-Deploy

### Funcionalidades Básicas

- [ ] Acessar o site e verificar que carrega corretamente
- [ ] Verificar que as imagens estão sendo exibidas
- [ ] Testar busca de produtos
- [ ] Testar filtro por categoria

### Sistema de Tamanhos

- [ ] Selecionar uma pizza e verificar opções de tamanho (Broto, Média, Grande)
- [ ] Selecionar um beirute e verificar opções de tamanho (Broto, Médio, Grande)
- [ ] Selecionar uma batata e verificar opções de tamanho (Pequena, Grande)
- [ ] Confirmar que preços mudam ao selecionar tamanhos diferentes
- [ ] Verificar que produtos sem tamanho não exibem seletor

### Sistema de Acréscimos - Pizzas

- [ ] Clicar no botão "Acréscimos e Bordas" em uma pizza
- [ ] Verificar que as três abas aparecem (Metade, Pizza Toda, Bordas)
- [ ] Navegar entre as abas e verificar conteúdo
- [ ] Selecionar acréscimos em cada aba
- [ ] Verificar que o contador de acréscimos atualiza
- [ ] Confirmar que o preço total atualiza corretamente
- [ ] Verificar resumo na parte inferior do painel

### Sistema de Acréscimos - Esfihas

- [ ] Clicar no botão "Acréscimos" em uma esfiha
- [ ] Verificar que a lista de acréscimos aparece
- [ ] Selecionar múltiplos acréscimos
- [ ] Verificar que o contador atualiza
- [ ] Confirmar que o preço total está correto

### Carrinho e Pedido

- [ ] Adicionar produto com tamanho ao carrinho
- [ ] Adicionar produto com acréscimos ao carrinho
- [ ] Adicionar produto com tamanho E acréscimos ao carrinho
- [ ] Verificar que os nomes dos produtos no carrinho incluem tamanho e acréscimos
- [ ] Verificar que os preços no carrinho estão corretos
- [ ] Testar aumentar/diminuir quantidade no carrinho
- [ ] Testar remover item do carrinho
- [ ] Calcular taxa de entrega
- [ ] Preencher dados do cliente
- [ ] Finalizar pedido
- [ ] Verificar mensagem no WhatsApp

### Performance

- [ ] Verificar tempo de carregamento da página inicial
- [ ] Verificar tempo de carregamento das imagens
- [ ] Testar em conexão lenta (3G simulado)
- [ ] Verificar responsividade em mobile
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Safari)

---

## 🐛 Resolução de Problemas

### Acréscimos não aparecem

**Problema**: Botão de acréscimos não aparece ou lista está vazia  
**Solução**: 
1. Verificar se o banco de dados contém os acréscimos
2. Executar `populate_acrescimos.py` se necessário
3. Verificar logs do backend para erros na API
4. Confirmar que a rota `/api/acrescimos` está funcionando

### Tamanhos não aparecem

**Problema**: Seletor de tamanhos não é exibido  
**Solução**:
1. Verificar categoria do produto no banco de dados
2. Confirmar que `preco_broto`, `preco_media`, `preco_grande` estão preenchidos
3. Verificar se a categoria está em lowercase e sem espaços extras
4. Categorias válidas: pizza_salgada, pizza_doce, beirute, batata_simples, batata_recheada

### Preços incorretos

**Problema**: Preço total não bate com soma esperada  
**Solução**:
1. Verificar preços dos acréscimos no banco de dados
2. Limpar cache do navegador
3. Verificar console do navegador para erros JavaScript
4. Confirmar que todos os acréscimos selecionados estão sendo contabilizados

### Imagens não carregam

**Problema**: Imagens aparecem quebradas ou não carregam  
**Solução**:
1. Verificar permissões da pasta `backend/static/uploads`
2. Confirmar que o caminho das imagens no banco está correto
3. Verificar se o servidor está servindo arquivos estáticos corretamente
4. Testar acessar uma imagem diretamente pela URL

---

## 📊 Monitoramento Pós-Deploy

### Primeiras 24 Horas

- [ ] Monitorar logs do servidor para erros
- [ ] Verificar métricas de performance (tempo de resposta, uso de CPU/memória)
- [ ] Acompanhar feedback inicial de clientes
- [ ] Verificar taxa de conversão de pedidos

### Primeira Semana

- [ ] Analisar produtos mais pedidos com acréscimos
- [ ] Identificar tamanhos mais escolhidos
- [ ] Verificar se há erros recorrentes nos logs
- [ ] Coletar feedback da equipe de atendimento

### Primeiro Mês

- [ ] Comparar métricas com período anterior (ticket médio, número de pedidos)
- [ ] Analisar acréscimos mais vendidos
- [ ] Avaliar necessidade de ajustes de preços
- [ ] Considerar adição de novos acréscimos baseado em demanda

---

## 📞 Contatos de Suporte

Em caso de problemas técnicos durante ou após o deploy:

1. Consultar a documentação em `ALTERACOES_SISTEMA_TAMANHOS_ACRESCIMOS.md`
2. Verificar logs do servidor (backend e frontend)
3. Revisar este checklist para possíveis soluções
4. Contatar suporte técnico se necessário

---

## ✅ Deploy Concluído

Após completar todos os itens deste checklist:

- [ ] Marcar data e hora do deploy
- [ ] Documentar quaisquer problemas encontrados e soluções aplicadas
- [ ] Notificar equipe que o sistema está atualizado
- [ ] Compartilhar `GUIA_RAPIDO_CLIENTE.md` com equipe de atendimento
- [ ] Monitorar sistema nas próximas horas

---

**Data do Deploy**: ___/___/______  
**Responsável**: _________________  
**Observações**: _________________

---

**Boa sorte com o deploy!** 🚀
