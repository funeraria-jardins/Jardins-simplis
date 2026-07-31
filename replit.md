# Funerária Jardins — Sistema de Gestão

Sistema completo de gestão funerária em Node.js + Express + PostgreSQL.

## Como rodar

O workflow **"Start application"** já está configurado. Clique em Run para iniciar.

O servidor sobe na porta 5000 e serve:
- `/` → Página inicial com menu
- `/admin` → Painel Administrativo
- `/client` → App do Associado (PWA)

## Stack

- **Backend:** Node.js + Express
- **Banco:** PostgreSQL (built-in do Replit, variável `DATABASE_URL` automática)
- **Frontend:** HTML + TailwindCSS CDN + JavaScript vanilla (sem build)

## Estrutura de arquivos

```
├── server.js          → Servidor Express com todas as rotas da API
├── db.js              → Conexão com o PostgreSQL
├── schema.sql         → DDL das tabelas (já aplicado no banco)
├── seed.sql           → 10 associados de teste (opcional)
├── package.json       → Dependências npm
├── .env.example       → Modelo de variáveis de ambiente
└── public/
    ├── index.html     → Página inicial (menu)
    ├── admin.html     → Painel Administrativo
    └── client.html    → App do Associado
```

## Banco de dados

Tabelas criadas automaticamente via `schema.sql`:
- `associados` — cadastro dos associados
- `dependentes` — dependentes de cada associado
- `lancamentos_financeiros` — histórico financeiro

Para inserir dados de teste: `psql $DATABASE_URL -f seed.sql`

## User preferences

- Trabalhar em português
