-- ============================================================
-- Schema do banco de dados - Funerária Jardins
-- Execute este arquivo no seu banco PostgreSQL para criar as tabelas
-- Comando: psql $DATABASE_URL -f schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS associados (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  cpf         TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'Ativo',
  plano       TEXT NOT NULL DEFAULT 'BRONZE',
  telefone    TEXT,
  email       TEXT,
  endereco    TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dependentes (
  id            SERIAL PRIMARY KEY,
  associado_id  INTEGER NOT NULL REFERENCES associados(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  parentesco    TEXT NOT NULL,
  idade         INTEGER NOT NULL,
  peso          REAL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
  id            SERIAL PRIMARY KEY,
  associado_id  INTEGER NOT NULL REFERENCES associados(id) ON DELETE CASCADE,
  descricao     TEXT NOT NULL,
  valor         REAL NOT NULL,
  tipo          TEXT NOT NULL,   -- 'entrada' ou 'saida'
  data          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observacao    TEXT
);
