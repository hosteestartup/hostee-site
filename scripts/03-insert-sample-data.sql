-- Dados de exemplo para testar a plataforma

-- Inserir usuários de exemplo
INSERT INTO usuarios (id, email, senha, nome, telefone, tipo) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'cliente1@email.com', '$2a$10$example', 'João Silva', '(11) 99999-1111', 'cliente'),
('550e8400-e29b-41d4-a716-446655440002', 'cliente2@email.com', '$2a$10$example', 'Maria Santos', '(11) 99999-2222', 'cliente'),
('550e8400-e29b-41d4-a716-446655440003', 'empresa1@email.com', '$2a$10$example', 'Carlos Barbeiro', '(11) 99999-3333', 'empresa'),
('550e8400-e29b-41d4-a716-446655440004', 'empresa2@email.com', '$2a$10$example', 'Ana Esteticista', '(11) 99999-4444', 'empresa'),
('550e8400-e29b-41d4-a716-446655440005', 'empresa3@email.com', '$2a$10$example', 'Pedro Mecânico', '(11) 99999-5555', 'empresa');

-- Inserir empresas de exemplo
INSERT INTO empresas (id, usuario_id, nome_empresa, descricao, endereco, cidade, estado, cep, latitude, longitude, categoria, avaliacao_media, total_avaliacoes, horario_funcionamento) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Barbearia do Carlos', 'Barbearia tradicional com mais de 20 anos de experiência. Cortes modernos e clássicos.', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', -23.5505, -46.6333, 'Beleza', 4.8, 127, '{"segunda": "08:00-18:00", "terca": "08:00-18:00", "quarta": "08:00-18:00", "quinta": "08:00-18:00", "sexta": "08:00-19:00", "sabado": "08:00-17:00", "domingo": "fechado"}'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Estética Ana Bella', 'Centro de estética especializado em tratamentos faciais e corporais com equipamentos de última geração.', 'Av. Paulista, 456', 'São Paulo', 'SP', '01310-100', -23.5618, -46.6565, 'Beleza', 4.9, 89, '{"segunda": "09:00-19:00", "terca": "09:00-19:00", "quarta": "09:00-19:00", "quinta": "09:00-19:00", "sexta": "09:00-19:00", "sabado": "09:00-16:00", "domingo": "fechado"}'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Auto Mecânica Pedro', 'Oficina mecânica especializada em carros nacionais e importados. Serviços de qualidade e preço justo.', 'Rua dos Mecânicos, 789', 'São Paulo', 'SP', '04567-890', -23.5329, -46.6395, 'Automotivo', 4.6, 203, '{"segunda": "07:00-17:00", "terca": "07:00-17:00", "quarta": "07:00-17:00", "quinta": "07:00-17:00", "sexta": "07:00-17:00", "sabado": "07:00-12:00", "domingo": "fechado"}');

-- Inserir serviços de exemplo
INSERT INTO servicos (empresa_id, nome, descricao, preco, duracao) VALUES
-- Barbearia do Carlos
('660e8400-e29b-41d4-a716-446655440001', 'Corte Masculino', 'Corte de cabelo masculino tradicional ou moderno', 25.00, 30),
('660e8400-e29b-41d4-a716-446655440001', 'Barba Completa', 'Aparar e modelar barba com navalha', 20.00, 20),
('660e8400-e29b-41d4-a716-446655440001', 'Corte + Barba', 'Pacote completo: corte de cabelo + barba', 40.00, 45),
-- Estética Ana Bella
('660e8400-e29b-41d4-a716-446655440002', 'Limpeza de Pele', 'Limpeza profunda com extração e hidratação', 80.00, 60),
('660e8400-e29b-41d4-a716-446655440002', 'Massagem Relaxante', 'Massagem corporal para alívio do stress', 120.00, 90),
('660e8400-e29b-41d4-a716-446655440002', 'Depilação Pernas', 'Depilação completa das pernas com cera', 60.00, 45),
-- Auto Mecânica Pedro
('660e8400-e29b-41d4-a716-446655440003', 'Troca de Óleo', 'Troca de óleo do motor com filtro', 80.00, 30),
('660e8400-e29b-41d4-a716-446655440003', 'Alinhamento', 'Alinhamento e balanceamento das rodas', 120.00, 60),
('660e8400-e29b-41d4-a716-446655440003', 'Revisão Completa', 'Revisão geral do veículo com relatório', 200.00, 120);

-- Inserir alguns agendamentos de exemplo
INSERT INTO agendamentos (cliente_id, empresa_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, valor_total) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM servicos WHERE nome = 'Corte Masculino' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '10:00', '10:30', 'confirmado', 25.00),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM servicos WHERE nome = 'Limpeza de Pele' LIMIT 1), CURRENT_DATE + INTERVAL '2 days', '14:00', '15:00', 'pendente', 80.00);

-- Inserir algumas avaliações
INSERT INTO avaliacoes (cliente_id, empresa_id, agendamento_id, nota, comentario) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM agendamentos LIMIT 1), 5, 'Excelente atendimento! Corte perfeito e ambiente muito limpo.');

-- Inserir alguns favoritos
INSERT INTO favoritos (cliente_id, empresa_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002');
