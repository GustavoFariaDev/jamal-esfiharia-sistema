# Jamal Esfiharia — cardápio online e painel

Sistema de pedidos da Jamal Esfiharia: cardápio para o cliente, painel para a loja. O cliente monta o pedido, calcula o frete pelo CEP e finaliza; a loja acompanha, muda status e imprime.

Não há pagamento online — o pagamento acontece na entrega ou na retirada.

## Como funciona

```
Cliente (React)                  Loja (React, /admin)
      |                                  |
      +----------- API Flask ------------+
                       |
        SQLite (local) ou PostgreSQL (produção)
                       |
        Cloudinary (imagens)   Google Maps (distância)
```

O frontend é servido pelo próprio Flask em produção: o build do React é copiado para `backend/static/` e o Flask entrega o `index.html` para qualquer rota que não comece com `/api`.

## Rodando na sua máquina

Precisa de **Python 3.11** e **Node 18+**.

```bash
# backend
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python app.py            # sobe em http://localhost:5000

# frontend, em outro terminal
cd frontend
npm install
npm start                              # sobe em http://localhost:3000
```

Sem `DATABASE_URL`, o banco é um SQLite em `backend/instance/jamal.db`, criado sozinho na primeira execução.

## Configuração

Tudo por variável de ambiente. Nenhuma tem valor padrão embutido no código — credencial não mora em repositório.

| Variável | Para quê | Sem ela |
|---|---|---|
| `SECRET_KEY` | assina os tokens de login | sorteia uma por execução, e todo mundo é deslogado a cada reinício |
| `DATABASE_URL` | banco de produção (PostgreSQL) | usa SQLite local |
| `SETUP_TOKEN` | libera a criação do primeiro admin | a rota de setup responde 403 |
| `ADMIN_EMAIL` | e-mail do admin criado no setup | `admin@jamal.com` |
| `CLOUDINARY_CLOUD_NAME` `CLOUDINARY_API_KEY` `CLOUDINARY_API_SECRET` | upload de imagem dos produtos | o upload falha |
| `GOOGLE_MAPS_API_KEY` | distância a partir do endereço, no cálculo do frete pelo servidor | o cálculo por endereço não funciona (o cálculo por CEP, que o site usa, continua funcionando) |
| `PORT` | porta do gunicorn | 5000 |

No frontend, `REACT_APP_API_BASE_URL` aponta para a API. Em produção fica vazio (mesma origem, `/api`).

## Primeiro acesso

O admin não vem pronto. Com `SETUP_TOKEN` definido no servidor:

```bash
curl -X POST https://SEU-APP/api/setup/create-admin -H "X-Setup-Token: SEU_TOKEN"
```

A resposta traz a senha sorteada **uma única vez**. Anote e troque no primeiro login. A rota só cria o admin se ele ainda não existir.

## Deploy no Render

- **Build:** `./build.sh` — instala as dependências, compila o React, copia o build para `backend/static/`, cria as tabelas e o status inicial da loja
- **Start:** `gunicorn -c gunicorn_config.py "app:create_app()"`
- **Ambiente:** as variáveis da tabela acima, no painel do Render

## Taxa de entrega

A tabela de preços por distância mora em **um lugar só**: `backend/src/services/delivery_fee.py`. O navegador mede a distância (OSRM, com Haversine como reserva) e pergunta o valor ao servidor — a mesma conta que vai cobrar. Para mudar preço de frete, mexa só nesse arquivo.

Acima de 20 km o sistema não calcula: o pedido é recusado com a mensagem de entrar em contato.

## Impressão

Os pedidos são impressos via [QZ Tray](https://qz.io/), que precisa estar rodando na máquina da loja. O certificado público fica em `backend/certs/`; a chave privada **não** vai para o repositório (`backend/certs/private-key.pem`, ignorada pelo Git).

## Estrutura

```
backend/
  app.py                 fábrica da aplicação e rotas de arquivo estático
  src/routes/            endpoints da API, um arquivo por assunto
  src/models/            tabelas (SQLAlchemy)
  src/services/          frete, Google Maps, impressão, WhatsApp
  src/middleware/        autenticação e verificação de admin
  *.py (raiz)            scripts pontuais de importação e correção de dados
frontend/
  src/components/        telas e componentes
  src/services/          apiService (chamadas) e authService (sessão)
  src/hooks/             lógica reaproveitada
  src/components/ui/     shadcn/ui, biblioteca de terceiros
```

## Pendências conhecidas

- **A chave do Cloudinary precisa ser trocada.** Ela esteve escrita no código deste repositório, que é público, e continua no histórico do Git. Trocar no painel do Cloudinary é o único jeito de invalidar a antiga.
- **`SECRET_KEY` precisa estar definida no Render.** Sem ela o sistema funciona, mas derruba todos os logins a cada reinício do servidor.
- Os scripts soltos na raiz do `backend/` são de manutenção pontual (importar cardápio, corrigir preços). Não fazem parte da aplicação e não rodam sozinhos.
