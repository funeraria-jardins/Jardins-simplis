-- ============================================================
-- Dados de teste - Funerária Jardins
-- Execute APÓS o schema.sql
-- Comando: psql $DATABASE_URL -f seed.sql
-- ============================================================

INSERT INTO associados (nome, cpf, status, plano, telefone, email, endereco) VALUES
  ('Carlos Alberto Silva',    '12345678901', 'Ativo',         'OURO',     '(95) 99201-1111', 'carlos@email.com',   'Av. Mario Homem de Melo, 100'),
  ('Maria das Graças Santos', '23456789012', 'Ativo',         'PRATA',    '(95) 99201-2222', 'maria@email.com',    'Rua das Flores, 200'),
  ('João Pedro Oliveira',     '34567890123', 'Inadimplente',  'BRONZE',   '(95) 99201-3333', 'joao@email.com',     'Av. Ene Garcez, 300'),
  ('Ana Paula Costa',         '45678901234', 'Ativo',         'DIAMANTE', '(95) 99201-4444', 'ana@email.com',      'Rua Coronel Pinto, 400'),
  ('Roberto Carlos Lima',     '56789012345', 'Ativo',         'BRONZE',   '(95) 99201-5555', 'roberto@email.com',  'Av. Sebastião Diniz, 500'),
  ('Fernanda Souza Melo',     '67890123456', 'Inadimplente',  'PRATA',    '(95) 99201-6666', 'fernanda@email.com', 'Rua Araújo Filho, 600'),
  ('Pedro Henrique Alves',    '78901234567', 'Ativo',         'OURO',     '(95) 99201-7777', 'pedro@email.com',    'Av. Glaycon de Paiva, 700'),
  ('Luciana Ferreira',        '89012345678', 'Ativo',         'BRONZE',   '(95) 99201-8888', 'luciana@email.com',  'Rua Cecília Brasil, 800'),
  ('Marcos Paulo Rocha',      '90123456789', 'Inadimplente',  'OURO',     '(95) 99201-9999', 'marcos@email.com',   'Av. Ville Roy, 900'),
  ('Juliana Carvalho',        '01234567890', 'Ativo',         'PRATA',    '(95) 99201-0000', 'juliana@email.com',  'Rua Araújo Filho, 1000')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO dependentes (associado_id, nome, parentesco, idade, peso) VALUES
  (1, 'Maria Silva',       'Cônjuge', 45, 62.0),
  (1, 'Lucas Silva',       'Filho',   18, 75.0),
  (2, 'José Santos',       'Cônjuge', 52, 80.0),
  (4, 'Paulo Costa',       'Cônjuge', 48, 85.0),
  (4, 'Clara Costa',       'Filha',   15, 55.0),
  (4, 'Bruno Costa',       'Filho',   20, 78.0)
ON CONFLICT DO NOTHING;

INSERT INTO lancamentos_financeiros (associado_id, descricao, valor, tipo, observacao) VALUES
  (1, 'Mensalidade Junho/2025',  50.00, 'entrada', NULL),
  (1, 'Mensalidade Maio/2025',   50.00, 'entrada', NULL),
  (1, 'Mensalidade Abril/2025',  50.00, 'entrada', NULL),
  (2, 'Mensalidade Junho/2025',  40.00, 'entrada', NULL),
  (2, 'Mensalidade Maio/2025',   40.00, 'entrada', NULL),
  (4, 'Mensalidade Junho/2025', 100.00, 'entrada', NULL),
  (4, 'Mensalidade Maio/2025',  100.00, 'entrada', NULL)
ON CONFLICT DO NOTHING;
