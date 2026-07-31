# Funerária Jardins — Versão Simplificada

Sistema completo de gestão funerária em **Node.js puro** (sem TypeScript, sem monorepo).
Fácil de hospedar em qualquer servidor que rode Node.js.

---

## O que tem aqui

| Módulo | O que faz |
|---|---|
| **Painel Admin** (`/admin`) | Dashboard com estatísticas, CRUD completo de associados e dependentes, histórico financeiro, lista de inadimplentes |
| **App do Associado** (`/client`) | Login por CPF, aba Financeiro com PIX, aba Meu Plano com dependentes, aba Suporte com contatos |
| **API REST** (`/api`) | Todos os endpoints documentados no `server.js` |

---

## Estrutura de arquivos

```
funeraria-simples/
├── server.js          → Servidor Express com todas as rotas da API
├── db.js              → Conexão com o PostgreSQL
├── schema.sql         → Cria as tabelas no banco
├── seed.sql           → Insere 10 associados de teste
├── package.json       → Dependências do projeto
├── .env.example       → Modelo das variáveis de ambiente
└── public/
    ├── index.html     → Página inicial (menu de acesso)
    ├── admin.html     → Painel Administrativo completo
    ├── client.html    → App do Associado (PWA)
    └── parceiros/     → Coloque as logos das farmácias parceiras aqui
```

---

## Como configurar do zero

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- Um banco de dados PostgreSQL (opções gratuitas: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app))

### 2. Instalar dependências

```bash
cd funeraria-simples
npm install
```

### 3. Configurar o banco de dados

Crie o arquivo `.env` copiando o `.env.example`:

```bash
cp .env.example .env
```

Edite o `.env` e coloque a URL do seu banco PostgreSQL:

```
DATABASE_URL=postgresql://usuario:senha@host:5432/funeraria
PORT=3000
```

### 4. Criar as tabelas

```bash
psql $DATABASE_URL -f schema.sql
```

### 5. (Opcional) Inserir dados de teste

```bash
psql $DATABASE_URL -f seed.sql
```

### 6. Iniciar o servidor

**Modo desenvolvimento** (reinicia automaticamente ao salvar arquivos):
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O sistema estará disponível em: http://localhost:3000

---

## Onde hospedar (opções simples)

| Plataforma | Grátis? | Como funciona |
|---|---|---|
| [Railway](https://railway.app) | ✅ plano free | Conecta ao GitHub, deploy automático |
| [Render](https://render.com) | ✅ plano free | Igual ao Railway, muito simples |
| [Fly.io](https://fly.io) | ✅ plano free | Um pouco mais técnico |
| VPS (Hetzner, DigitalOcean) | ❌ pago | Mais controle, usa PM2 + Nginx |

Para qualquer uma dessas plataformas:
1. Envie o projeto para um repositório GitHub
2. Conecte a plataforma ao repositório
3. Configure a variável de ambiente `DATABASE_URL`
4. Deploy!

---

## Planos e valores

| Plano | Mensalidade |
|---|---|
| BRONZE | R$ 30,00 |
| PRATA | R$ 40,00 |
| OURO | R$ 50,00 |
| DIAMANTE | R$ 100,00 |

**Chave PIX (CNPJ):** 66585418000116

---

## CPFs de teste (após rodar o seed.sql)

```
12345678901  →  Carlos Alberto Silva (Ouro / Ativo)
23456789012  →  Maria das Graças Santos (Prata / Ativo)
34567890123  →  João Pedro Oliveira (Bronze / Inadimplente)
45678901234  →  Ana Paula Costa (Diamante / Ativo)
56789012345  →  Roberto Carlos Lima (Bronze / Ativo)
```

---

## Tecnologias usadas

- **Node.js + Express** — servidor web
- **PostgreSQL + pg** — banco de dados
- **HTML + TailwindCSS CDN** — interface (sem build, sem npm no frontend)
- **JavaScript vanilla** — sem frameworks no frontend

---

## Personalizações comuns

### Mudar o nome/logo da empresa
Edite os títulos nos arquivos `public/admin.html` e `public/client.html`.

### Adicionar logos das farmácias parceiras
Coloque as imagens em `public/parceiros/` com os nomes:
- `pague-menos.png`
- `farmacia-popular.png`
- `santo-remedio.png`

### Mudar os contatos de suporte
Edite a seção Suporte no final do arquivo `public/client.html`.

### Mudar o endereço no mapa
Edite a variável `q` na função `abrirMapa()` dentro do `public/client.html`.
