# Lig Gesso — Sistema de Gestão

Sistema interno para controle de financeiro (caixa), estoque de materiais, pedidos/obras,
clientes, agenda e documentos.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL (Supabase)
- Supabase Storage (documentos enviados)
- NextAuth (Credentials) para login dos dois sócios

## Configuração do Supabase (uma vez só)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → Database → Connection string**, copie:
   - a conexão **Transaction pooler** (porta `6543`) → vai em `DATABASE_URL`
   - a conexão **direta** (porta `5432`) → vai em `DIRECT_URL`
3. Em **Project Settings → API**, copie a **Project URL** (`SUPABASE_URL`) e a
   **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) — essa chave é secreta, nunca
   exponha no frontend.
4. Em **Storage**, crie um bucket **privado** chamado `documentos` (mesmo nome de
   `SUPABASE_STORAGE_BUCKET`).
5. Preencha o arquivo `.env` na raiz do projeto com esses valores (veja
   `.env` já criado com o formato esperado).

## Rodando localmente

```bash
npm install
npx prisma migrate dev   # cria as tabelas no Supabase
npm run db:seed          # cria os 2 usuários iniciais
npm run dev
```

Acesse http://localhost:3000. Login inicial:

- `socio1@liggesso.com.br` / `trocar123`
- `socio2@liggesso.com.br` / `trocar123`

> Troque essas senhas assim que possível (ainda não há tela de troca de senha — pode ser
> feito diretamente no banco ou pedir para eu adicionar essa tela).

## Variáveis de ambiente (`.env`)

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Connection string do Supabase — **Transaction pooler, porta 6543**, com `?pgbouncer=true&connection_limit=4&pool_timeout=20`. `connection_limit` baixo é proposital: em pooler no modo transaction, cada instância serverless deve pedir poucas conexões (o pooler multiplexa muitas instâncias sobre seu próprio pool, que é limitado). Um valor alto aqui esgota esse pool sob concorrência real. Não usar o Session pooler (porta 5432) aqui: ele tem um limite ainda menor e fixo de conexões simultâneas (15 no plano free) e derruba o site sob qualquer uso concorrente. |
| `DIRECT_URL` | Connection string do Session pooler (porta 5432) — usada só pelo Prisma para `migrate`, onde não há problema de concorrência |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta (service role) — só usada no servidor |
| `SUPABASE_STORAGE_BUCKET` | Nome do bucket de documentos (padrão: `documentos`) |
| `NEXTAUTH_SECRET` | Chave secreta da sessão. Gere uma com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL pública do sistema (`http://localhost:3000` local) |

## Deploy (Vercel)

1. Suba este projeto para um repositório no GitHub.
2. No [Vercel](https://vercel.com), **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env` (com os valores
   de produção — pode ser o mesmo projeto Supabase ou um separado):
   - `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
     `SUPABASE_STORAGE_BUCKET`
   - `NEXTAUTH_SECRET` (gere uma nova, diferente da de desenvolvimento)
   - `NEXTAUTH_URL` = a URL que o Vercel gerar para o projeto (dá pra ajustar depois)
4. Deploy. No primeiro boot, o comando de start já roda as migrações e cria os 2
   usuários iniciais automaticamente (`prisma migrate deploy && npm run db:seed && next start`).

> **Região das funções**: o `vercel.json` fixa a região das funções serverless em
> `pdx1` (Portland/Oregon), perto do banco Supabase (`us-west-2`). Se o banco for
> recriado em outra região no futuro, atualize esse arquivo — rodar a função longe
> do banco (ex.: São Paulo ↔ Oregon) adiciona segundos de latência por consulta e
> causa falhas intermitentes.

## Estrutura dos módulos

- `/dashboard` — visão geral (saldo, obras em andamento, agenda, estoque baixo)
- `/financeiro` — entradas e saídas de caixa
- `/estoque` — materiais e movimentações
- `/pedidos` — obras, com materiais/financeiro/agenda/documentos vinculados
- `/clientes` — cadastro e histórico
- `/agenda` — compromissos
- `/documentos` — upload de arquivos (servidos por rota autenticada, nunca públicos)
