// ============================================================
// Funerária Jardins — Servidor Principal
// Node.js + Express (JavaScript puro, sem TypeScript)
// ============================================================
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");
const db      = require("./db");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middlewares ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Helpers ─────────────────────────────────────────────────
function limparCpf(cpf) {
  return cpf.replace(/\D/g, "");
}

async function getAssociadoComDependentes(id) {
  const { rows: associado } = await db.query(
    "SELECT * FROM associados WHERE id = $1 LIMIT 1",
    [id]
  );
  if (!associado[0]) return null;
  const { rows: dependentes } = await db.query(
    "SELECT * FROM dependentes WHERE associado_id = $1 ORDER BY id",
    [id]
  );
  return { ...associado[0], dependentes };
}

// ============================================================
// ROTAS — PAINEL ADMIN
// ============================================================

// ── Dashboard: resumo geral ───────────────────────────────────
app.get("/api/dashboard/resumo", async (req, res) => {
  try {
    const { rows: todos } = await db.query("SELECT * FROM associados");
    const { rows: deps }  = await db.query("SELECT id FROM dependentes");

    const totalAssociados     = todos.length;
    const totalAtivos         = todos.filter(a => a.status === "Ativo").length;
    const totalInadimplentes  = todos.filter(a => a.status === "Inadimplente").length;
    const totalDependentes    = deps.length;

    const valorPorPlano = { BRONZE: 30, PRATA: 40, OURO: 50, DIAMANTE: 100 };
    const receitaMensalEstimada = todos
      .filter(a => a.status === "Ativo")
      .reduce((acc, a) => acc + (valorPorPlano[a.plano] || 0), 0);

    const contagem = {};
    for (const a of todos) {
      contagem[a.plano] = (contagem[a.plano] || 0) + 1;
    }
    const porPlano = Object.entries(contagem).map(([plano, quantidade]) => ({ plano, quantidade }));

    res.json({ totalAssociados, totalAtivos, totalInadimplentes, totalDependentes, porPlano, receitaMensalEstimada });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dashboard: lista de inadimplentes ────────────────────────
app.get("/api/dashboard/inadimplentes", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM associados WHERE status = 'Inadimplente' ORDER BY nome"
    );
    const result = await Promise.all(rows.map(a => getAssociadoComDependentes(a.id)));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Associados: listar (com filtros opcionais) ───────────────
app.get("/api/associados", async (req, res) => {
  try {
    const { busca, status, plano } = req.query;
    let query  = "SELECT * FROM associados WHERE 1=1";
    const params = [];

    if (busca) {
      params.push(`%${busca}%`);
      query += ` AND nome ILIKE $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (plano) {
      params.push(plano);
      query += ` AND plano = $${params.length}`;
    }
    query += " ORDER BY nome";

    const { rows } = await db.query(query, params);
    const result = await Promise.all(rows.map(a => getAssociadoComDependentes(a.id)));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Associados: criar ─────────────────────────────────────────
app.post("/api/associados", async (req, res) => {
  try {
    const { nome, cpf, status = "Ativo", plano = "BRONZE", telefone, email, endereco } = req.body;
    if (!nome || !cpf) return res.status(400).json({ error: "nome e cpf são obrigatórios" });

    const { rows } = await db.query(
      `INSERT INTO associados (nome, cpf, status, plano, telefone, email, endereco)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nome, limparCpf(cpf), status, plano, telefone, email, endereco]
    );
    res.status(201).json({ ...rows[0], dependentes: [] });
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "CPF já cadastrado" });
    res.status(500).json({ error: err.message });
  }
});

// ── Associados: buscar um ─────────────────────────────────────
app.get("/api/associados/:id", async (req, res) => {
  try {
    const result = await getAssociadoComDependentes(Number(req.params.id));
    if (!result) return res.status(404).json({ error: "Associado não encontrado" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Associados: atualizar ─────────────────────────────────────
app.patch("/api/associados/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const campos = ["nome", "cpf", "status", "plano", "telefone", "email", "endereco"];
    const sets   = [];
    const params = [];

    for (const campo of campos) {
      if (req.body[campo] !== undefined) {
        params.push(campo === "cpf" ? limparCpf(req.body[campo]) : req.body[campo]);
        sets.push(`${campo} = $${params.length}`);
      }
    }
    if (sets.length === 0) return res.status(400).json({ error: "Nenhum campo enviado" });

    params.push(id);
    const { rows } = await db.query(
      `UPDATE associados SET ${sets.join(", ")}, atualizado_em = NOW() WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!rows[0]) return res.status(404).json({ error: "Associado não encontrado" });
    const result = await getAssociadoComDependentes(rows[0].id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Associados: excluir ───────────────────────────────────────
app.delete("/api/associados/:id", async (req, res) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM associados WHERE id = $1 RETURNING id",
      [Number(req.params.id)]
    );
    if (!rows[0]) return res.status(404).json({ error: "Associado não encontrado" });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dependentes: listar ────────────────────────────────────────
app.get("/api/associados/:id/dependentes", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM dependentes WHERE associado_id = $1 ORDER BY id",
      [Number(req.params.id)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dependentes: adicionar ─────────────────────────────────────
app.post("/api/associados/:id/dependentes", async (req, res) => {
  try {
    const associadoId = Number(req.params.id);
    const { nome, parentesco, idade, peso } = req.body;
    if (!nome || !parentesco || idade === undefined) {
      return res.status(400).json({ error: "nome, parentesco e idade são obrigatórios" });
    }
    const { rows: existentes } = await db.query(
      "SELECT id FROM dependentes WHERE associado_id = $1",
      [associadoId]
    );
    if (existentes.length >= 6) {
      return res.status(400).json({ error: "Limite de 6 dependentes atingido" });
    }
    const { rows } = await db.query(
      `INSERT INTO dependentes (associado_id, nome, parentesco, idade, peso)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [associadoId, nome, parentesco, Number(idade), peso ? Number(peso) : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dependentes: atualizar ─────────────────────────────────────
app.patch("/api/associados/:id/dependentes/:depId", async (req, res) => {
  try {
    const { nome, parentesco, idade, peso } = req.body;
    const sets   = [];
    const params = [];

    if (nome)       { params.push(nome);         sets.push(`nome = $${params.length}`); }
    if (parentesco) { params.push(parentesco);   sets.push(`parentesco = $${params.length}`); }
    if (idade !== undefined) { params.push(Number(idade)); sets.push(`idade = $${params.length}`); }
    if (peso  !== undefined) { params.push(Number(peso));  sets.push(`peso = $${params.length}`); }

    if (sets.length === 0) return res.status(400).json({ error: "Nenhum campo enviado" });

    params.push(Number(req.params.depId), Number(req.params.id));
    const { rows } = await db.query(
      `UPDATE dependentes SET ${sets.join(", ")} WHERE id = $${params.length - 1} AND associado_id = $${params.length} RETURNING *`,
      params
    );
    if (!rows[0]) return res.status(404).json({ error: "Dependente não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dependentes: excluir ───────────────────────────────────────
app.delete("/api/associados/:id/dependentes/:depId", async (req, res) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM dependentes WHERE id = $1 AND associado_id = $2 RETURNING id",
      [Number(req.params.depId), Number(req.params.id)]
    );
    if (!rows[0]) return res.status(404).json({ error: "Dependente não encontrado" });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Financeiro: listar lançamentos ────────────────────────────
app.get("/api/associados/:id/financeiro", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM lancamentos_financeiros WHERE associado_id = $1 ORDER BY data DESC",
      [Number(req.params.id)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Financeiro: adicionar lançamento ──────────────────────────
app.post("/api/associados/:id/financeiro", async (req, res) => {
  try {
    const associadoId = Number(req.params.id);
    const { descricao, valor, tipo, observacao } = req.body;
    if (!descricao || valor === undefined || !tipo) {
      return res.status(400).json({ error: "descricao, valor e tipo são obrigatórios" });
    }
    const { rows } = await db.query(
      `INSERT INTO lancamentos_financeiros (associado_id, descricao, valor, tipo, observacao)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [associadoId, descricao, Number(valor), tipo, observacao || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROTAS — APP DO ASSOCIADO (cliente)
// ============================================================

// ── Login por CPF ─────────────────────────────────────────────
app.get("/api/cliente/:cpf", async (req, res) => {
  try {
    const cpfLimpo = limparCpf(req.params.cpf);
    const { rows: associado } = await db.query(
      "SELECT * FROM associados WHERE cpf = $1 LIMIT 1",
      [cpfLimpo]
    );
    if (!associado[0]) return res.status(404).json({ error: "Associado não encontrado" });

    const { rows: dependentes } = await db.query(
      "SELECT id, associado_id, nome, parentesco, idade, criado_em FROM dependentes WHERE associado_id = $1 ORDER BY id",
      [associado[0].id]
      // NOTA: campo "peso" propositalmente omitido — uso interno apenas
    );
    res.json({ ...associado[0], dependentes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Saúde da API ──────────────────────────────────────────────
app.get("/api/healthz", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "error" });
  }
});

// ── Qualquer rota não encontrada retorna a página correspondente
app.get("/adm*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});
app.get("/client*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "client.html"));
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Iniciar servidor ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`  Admin:  http://localhost:${PORT}/adm`);
  console.log(`  App:    http://localhost:${PORT}/client`);
});
