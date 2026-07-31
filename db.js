// ============================================================
// Conexão com o banco de dados PostgreSQL
// ============================================================
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false }, // necessário em provedores como Neon, Supabase, Railway
});

// Testa a conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
    return;
  }
  release();
  console.log("Banco de dados conectado com sucesso.");
});

module.exports = pool;
