-- 🚀 SCRIPT COMPLETO DA PLATAFORMA HOST.EE
-- Inclui TODOS os dados: usuários, empresas, serviços, agendamentos, etc.
-- IDs reais da autenticação já configurados

-- ========================================
-- 1. LIMPAR TODOS OS DADOS EXISTENTES
-- ========================================
DELETE FROM avaliacoes;
DELETE FROM favoritos;
DELETE FROM mensagens;
DELETE FROM agendamentos;
DELETE FROM servicos;
DELETE FROM empresas;
DELETE FROM usuarios;

-- ========================================
-- 2. INSERIR TODOS OS USUÁRIOS
-- ========================================
INSERT INTO usuarios (id, email, senha, nome, telefone, tipo) VALUES
-- USUÁRIOS REAIS DA AUTENTICAÇÃO
('1b7127f4-22e4-49f4-bff7-4fd41ca39ea4', 'cliente1@email.com', '$2a$10$example', 'João Silva', '(11) 99999-1111', 'cliente'),
('c4d9bf18-72fc-4b1f-8527-801377857e57', 'empresa1@email.com', '$2a$10$example', 'Carlos Barbeiro', '(11) 99999-3333', 'empresa'),

-- CLIENTES ADICIONAIS
('550e8400-e29b-41d4-a716-446655440002', 'cliente2@email.com', '$2a$10$example', 'Maria Santos', '(11) 99999-2222', 'cliente'),
('550e8400-e29b-41d4-a716-446655440006', 'cliente3@email.com', '$2a$10$example', 'Pedro Oliveira', '(11) 99999-6666', 'cliente'),
('550e8400-e29b-41d4-a716-446655440007', 'cliente4@email.com', '$2a$10$example', 'Ana Costa', '(11) 99999-7777', 'cliente'),

-- EMPRESAS ADICIONAIS
('550e8400-e29b-41d4-a716-446655440004', 'empresa2@email.com', '$2a$10$example', 'Ana Esteticista', '(11) 99999-4444', 'empresa'),
('550e8400-e29b-41d4-a716-446655440005', 'empresa3@email.com', '$2a$10$example', 'Pedro Mecânico', '(11) 99999-5555', 'empresa'),
('550e8400-e29b-41d4-a716-446655440008', 'empresa4@email.com', '$2a$10$example', 'Roberto Dentista', '(11) 99999-8888', 'empresa'),
('550e8400-e29b-41d4-a716-446655440009', 'empresa5@email.com', '$2a$10$example', 'Lucia Massagista', '(11) 99999-9999', 'empresa'),
('550e8400-e29b-41d4-a716-446655440010', 'empresa6@email.com', '$2a$10$example', 'Fernando Personal', '(11) 99999-0000', 'empresa');

-- ========================================
-- 3. INSERIR TODAS AS EMPRESAS
-- ========================================
INSERT INTO empresas (id, usuario_id, nome_empresa, descricao, endereco, cidade, estado, cep, latitude, longitude, categoria, avaliacao_media, total_avaliacoes, horario_funcionamento) VALUES

-- BARBEARIA DO CARLOS (empresa1@email.com)
('660e8400-e29b-41d4-a716-446655440001', 'c4d9bf18-72fc-4b1f-8527-801377857e57', 'Barbearia do Carlos', 'Barbearia tradicional com mais de 20 anos de experiência. Cortes modernos e clássicos.', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', -23.5505, -46.6333, 'Beleza', 4.8, 127, '{"segunda": "08:00-18:00", "terca": "08:00-18:00", "quarta": "08:00-18:00", "quinta": "08:00-18:00", "sexta": "08:00-19:00", "sabado": "08:00-17:00", "domingo": "fechado"}'),

-- ESTÉTICA ANA BELLA
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Estética Ana Bella', 'Centro de estética especializado em tratamentos faciais e corporais com equipamentos de última geração.', 'Av. Paulista, 456', 'São Paulo', 'SP', '01310-100', -23.5618, -46.6565, 'Beleza', 4.9, 89, '{"segunda": "09:00-19:00", "terca": "09:00-19:00", "quarta": "09:00-19:00", "quinta": "09:00-19:00", "sexta": "09:00-19:00", "sabado": "09:00-16:00", "domingo": "fechado"}'),

-- AUTO MECÂNICA PEDRO
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Auto Mecânica Pedro', 'Oficina mecânica especializada em carros nacionais e importados. Serviços de qualidade e preço justo.', 'Rua dos Mecânicos, 789', 'São Paulo', 'SP', '04567-890', -23.5329, -46.6395, 'Automotivo', 4.6, 203, '{"segunda": "07:00-17:00", "terca": "07:00-17:00", "quarta": "07:00-17:00", "quinta": "07:00-17:00", "sexta": "07:00-17:00", "sabado": "07:00-12:00", "domingo": "fechado"}'),

-- CLÍNICA DENTAL ROBERTO
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', 'Clínica Dental Roberto', 'Clínica odontológica completa com tratamentos modernos e atendimento humanizado.', 'Av. Brasil, 1000', 'São Paulo', 'SP', '01430-000', -23.5489, -46.6388, 'Saúde', 4.7, 156, '{"segunda": "08:00-18:00", "terca": "08:00-18:00", "quarta": "08:00-18:00", "quinta": "08:00-18:00", "sexta": "08:00-17:00", "sabado": "08:00-12:00", "domingo": "fechado"}'),

-- SPA LUCIA BEM-ESTAR
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440009', 'Spa Lucia Bem-Estar', 'Espaço dedicado ao relaxamento e bem-estar com massagens terapêuticas e tratamentos corporais.', 'Rua Augusta, 2500', 'São Paulo', 'SP', '01412-100', -23.5505, -46.6605, 'Beleza', 4.9, 98, '{"segunda": "09:00-20:00", "terca": "09:00-20:00", "quarta": "09:00-20:00", "quinta": "09:00-20:00", "sexta": "09:00-20:00", "sabado": "09:00-18:00", "domingo": "10:00-16:00"}'),

-- PERSONAL FERNANDO FITNESS
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', 'Personal Fernando Fitness', 'Treinamento personalizado e consultoria em fitness para todos os níveis.', 'Rua Consolação, 3000', 'São Paulo', 'SP', '01416-000', -23.5535, -46.6620, 'Esportes', 4.8, 73, '{"segunda": "06:00-22:00", "terca": "06:00-22:00", "quarta": "06:00-22:00", "quinta": "06:00-22:00", "sexta": "06:00-22:00", "sabado": "07:00-18:00", "domingo": "08:00-16:00"}');

-- ========================================
-- 4. INSERIR TODOS OS SERVIÇOS
-- ========================================
INSERT INTO servicos (empresa_id, nome, descricao, preco, duracao) VALUES

-- SERVIÇOS DA BARBEARIA DO CARLOS
('660e8400-e29b-41d4-a716-446655440001', 'Corte Masculino', 'Corte de cabelo masculino tradicional ou moderno', 25.00, 30),
('660e8400-e29b-41d4-a716-446655440001', 'Barba Completa', 'Aparar e modelar barba com navalha', 20.00, 20),
('660e8400-e29b-41d4-a716-446655440001', 'Corte + Barba', 'Pacote completo: corte de cabelo + barba', 40.00, 45),
('660e8400-e29b-41d4-a716-446655440001', 'Bigode', 'Aparar e modelar bigode', 15.00, 15),
('660e8400-e29b-41d4-a716-446655440001', 'Sobrancelha Masculina', 'Design de sobrancelha masculina', 18.00, 20),

-- SERVIÇOS DA ESTÉTICA ANA BELLA
('660e8400-e29b-41d4-a716-446655440002', 'Limpeza de Pele', 'Limpeza profunda com extração e hidratação', 80.00, 60),
('660e8400-e29b-41d4-a716-446655440002', 'Massagem Relaxante', 'Massagem corporal para alívio do stress', 120.00, 90),
('660e8400-e29b-41d4-a716-446655440002', 'Depilação Pernas', 'Depilação completa das pernas com cera', 60.00, 45),
('660e8400-e29b-41d4-a716-446655440002', 'Hidratação Facial', 'Tratamento hidratante para o rosto', 70.00, 50),
('660e8400-e29b-41d4-a716-446655440002', 'Peeling Químico', 'Renovação celular com ácidos', 150.00, 75),
('660e8400-e29b-41d4-a716-446655440002', 'Drenagem Linfática', 'Massagem para redução de inchaço', 90.00, 60),

-- SERVIÇOS DA AUTO MECÂNICA PEDRO
('660e8400-e29b-41d4-a716-446655440003', 'Troca de Óleo', 'Troca de óleo do motor com filtro', 80.00, 30),
('660e8400-e29b-41d4-a716-446655440003', 'Alinhamento', 'Alinhamento e balanceamento das rodas', 120.00, 60),
('660e8400-e29b-41d4-a716-446655440003', 'Revisão Completa', 'Revisão geral do veículo com relatório', 200.00, 120),
('660e8400-e29b-41d4-a716-446655440003', 'Troca de Pastilhas', 'Substituição das pastilhas de freio', 150.00, 45),
('660e8400-e29b-41d4-a716-446655440003', 'Diagnóstico Eletrônico', 'Análise computadorizada do veículo', 100.00, 30),

-- SERVIÇOS DA CLÍNICA DENTAL ROBERTO
('660e8400-e29b-41d4-a716-446655440004', 'Limpeza Dental', 'Limpeza completa com remoção de tártaro e polimento', 120.00, 60),
('660e8400-e29b-41d4-a716-446655440004', 'Restauração', 'Restauração de dentes com resina composta', 180.00, 90),
('660e8400-e29b-41d4-a716-446655440004', 'Clareamento Dental', 'Clareamento dental profissional', 350.00, 120),
('660e8400-e29b-41d4-a716-446655440004', 'Extração Simples', 'Remoção de dente sem complicações', 200.00, 45),
('660e8400-e29b-41d4-a716-446655440004', 'Canal', 'Tratamento endodôntico completo', 400.00, 90),

-- SERVIÇOS DO SPA LUCIA BEM-ESTAR
('660e8400-e29b-41d4-a716-446655440005', 'Massagem Relaxante', 'Massagem corporal completa para relaxamento', 150.00, 90),
('660e8400-e29b-41d4-a716-446655440005', 'Drenagem Linfática', 'Drenagem linfática manual terapêutica', 120.00, 60),
('660e8400-e29b-41d4-a716-446655440005', 'Reflexologia', 'Massagem nos pés com técnicas de reflexologia', 80.00, 45),
('660e8400-e29b-41d4-a716-446655440005', 'Massagem com Pedras Quentes', 'Relaxamento profundo com pedras vulcânicas', 180.00, 120),
('660e8400-e29b-41d4-a716-446655440005', 'Aromaterapia', 'Sessão de relaxamento com óleos essenciais', 100.00, 60),

-- SERVIÇOS DO PERSONAL FERNANDO FITNESS
('660e8400-e29b-41d4-a716-446655440006', 'Treino Personalizado', 'Sessão individual de treinamento personalizado', 100.00, 60),
('660e8400-e29b-41d4-a716-446655440006', 'Avaliação Física', 'Avaliação completa com medidas e planejamento', 80.00, 45),
('660e8400-e29b-41d4-a716-446655440006', 'Consultoria Nutricional', 'Orientação nutricional para objetivos fitness', 120.00, 60),
('660e8400-e29b-41d4-a716-446655440006', 'Treino Funcional', 'Treinamento funcional em grupo pequeno', 70.00, 45),
('660e8400-e29b-41d4-a716-446655440006', 'Aula de Yoga', 'Sessão de yoga personalizada', 90.00, 60);

-- ========================================
-- 5. INSERIR AGENDAMENTOS DE EXEMPLO
-- ========================================
INSERT INTO agendamentos (cliente_id, empresa_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, valor_total) VALUES

-- AGENDAMENTOS DO JOÃO (cliente1@email.com)
('1b7127f4-22e4-49f4-bff7-4fd41ca39ea4', '660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM servicos WHERE nome = 'Corte Masculino' AND empresa_id = '660e8400-e29b-41d4-a716-446655440001' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '10:00', '10:30', 'confirmado', 25.00),
('1b7127f4-22e4-49f4-bff7-4fd41ca39ea4', '660e8400-e29b-41d4-a716-446655440006', (SELECT id FROM servicos WHERE nome = 'Treino Personalizado' LIMIT 1), CURRENT_DATE + INTERVAL '5 days', '18:00', '19:00', 'confirmado', 100.00),

-- AGENDAMENTOS DA MARIA
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM servicos WHERE nome = 'Limpeza de Pele' LIMIT 1), CURRENT_DATE + INTERVAL '2 days', '14:00', '15:00', 'pendente', 80.00),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', (SELECT id FROM servicos WHERE nome = 'Massagem Relaxante' AND empresa_id = '660e8400-e29b-41d4-a716-446655440005' LIMIT 1), CURRENT_DATE + INTERVAL '4 days', '16:00', '17:30', 'pendente', 150.00),

-- AGENDAMENTOS DO PEDRO
('550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM servicos WHERE nome = 'Limpeza Dental' LIMIT 1), CURRENT_DATE + INTERVAL '3 days', '14:00', '15:00', 'confirmado', 120.00),
('550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM servicos WHERE nome = 'Troca de Óleo' LIMIT 1), CURRENT_DATE + INTERVAL '6 days', '09:00', '09:30', 'pendente', 80.00),

-- AGENDAMENTOS DA ANA
('550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM servicos WHERE nome = 'Corte + Barba' LIMIT 1), CURRENT_DATE + INTERVAL '7 days', '15:00', '15:45', 'pendente', 40.00);

-- ========================================
-- 6. INSERIR FAVORITOS
-- ========================================
INSERT INTO favoritos (cliente_id, empresa_id) VALUES
('1b7127f4-22e4-49f4-bff7-4fd41ca39ea4', '660e8400-e29b-41d4-a716-446655440001'), -- João -> Barbearia
('1b7127f4-22e4-49f4-bff7-4fd41ca39ea4', '660e8400-e29b-41d4-a716-446655440006'), -- João -> Personal
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002'), -- Maria -> Estética
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005'), -- Maria -> Spa
('550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004'), -- Pedro -> Dentista
('550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001'); -- Ana -> Barbearia

-- ========================================
-- 7. INSERIR AVALIAÇÕES
-- ========================================
INSERT INTO avaliacoes (cliente_id, empresa_id, agendamento_id, nota, comentario) VALUES
('1b7127f4-22e4-49f4-bff7-4fd41ca39ea4', '660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM agendamentos WHERE cliente_id = '1b7127f4-22e4-49f4-bff7-4fd41ca39ea4' AND empresa_id = '660e8400-e29b-41d4-a716-446655440001' LIMIT 1), 5, 'Excelente atendimento! Corte perfeito e ambiente muito limpo. Carlos é um profissional excepcional!'),
('550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM agendamentos WHERE cliente_id = '550e8400-e29b-41d4-a716-446655440006' AND empresa_id = '660e8400-e29b-41d4-a716-446655440004' LIMIT 1), 5, 'Dr. Roberto é muito profissional e cuidadoso. Clínica moderna e bem equipada.'),
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', (SELECT id FROM agendamentos WHERE cliente_id = '550e8400-e29b-41d4-a716-446655440002' AND empresa_id = '660e8400-e29b-41d4-a716-446655440005' LIMIT 1), 5, 'Ambiente muito relaxante e massagem incrível. Saí renovada! Recomendo demais.'),
('1b7127f4-22e4-49f4-bff7-4fd41ca39ea4', '660e8400-e29b-41d4-a716-446655440006', (SELECT id FROM agendamentos WHERE cliente_id = '1b7127f4-22e4-49f4-bff7-4fd41ca39ea4' AND empresa_id = '660e8400-e29b-41d4-a716-446655440006' LIMIT 1), 4, 'Fernando é um excelente personal trainer. Treinos bem planejados e resultados visíveis.');

-- ========================================
-- 8. VERIFICAÇÕES FINAIS
-- ========================================
SELECT '🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!' as status;

SELECT '👥 USUÁRIOS CRIADOS:' as info;
SELECT id, email, tipo, nome FROM usuarios ORDER BY tipo, nome;

SELECT '🏢 EMPRESAS CRIADAS:' as info;
SELECT e.nome_empresa, e.categoria, e.avaliacao_media, u.email as proprietario 
FROM empresas e 
JOIN usuarios u ON e.usuario_id = u.id 
ORDER BY e.categoria, e.nome_empresa;

SELECT '⚙️ SERVIÇOS DISPONÍVEIS:' as info;
SELECT e.nome_empresa, s.nome as servico, s.preco, s.duracao 
FROM servicos s 
JOIN empresas e ON s.empresa_id = e.id 
ORDER BY e.nome_empresa, s.preco;

SELECT '📅 AGENDAMENTOS CRIADOS:' as info;
SELECT u.nome as cliente, e.nome_empresa, s.nome as servico, a.data_agendamento, a.status 
FROM agendamentos a 
JOIN usuarios u ON a.cliente_id = u.id 
JOIN empresas e ON a.empresa_id = e.id 
JOIN servicos s ON a.servico_id = s.id 
ORDER BY a.data_agendamento;

SELECT '⭐ AVALIAÇÕES:' as info;
SELECT u.nome as cliente, e.nome_empresa, av.nota, av.comentario 
FROM avaliacoes av 
JOIN usuarios u ON av.cliente_id = u.id 
JOIN empresas e ON av.empresa_id = e.id;

SELECT '❤️ FAVORITOS:' as info;
SELECT u.nome as cliente, e.nome_empresa 
FROM favoritos f 
JOIN usuarios u ON f.cliente_id = u.id 
JOIN empresas e ON f.empresa_id = e.id 
ORDER BY u.nome;

SELECT '✅ TUDO PRONTO PARA USO!' as final_status;
SELECT 'Login: cliente1@email.com / 123456 (Cliente)' as login_info;
SELECT 'Login: empresa1@email.com / 123456 (Empresa)' as login_info2;
