-- Políticas de segurança RLS para controle de acesso

-- Políticas para usuários
CREATE POLICY "Usuários podem ver próprio perfil" ON usuarios
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON usuarios
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para empresas (visíveis para todos, editáveis apenas pelo dono)
CREATE POLICY "Empresas são visíveis para todos" ON empresas
  FOR SELECT USING (true);

CREATE POLICY "Empresas podem ser editadas pelo dono" ON empresas
  FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Políticas para serviços (visíveis para todos, editáveis pela empresa)
CREATE POLICY "Serviços são visíveis para todos" ON servicos
  FOR SELECT USING (true);

CREATE POLICY "Serviços podem ser editados pela empresa" ON servicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM empresas 
      WHERE empresas.id = servicos.empresa_id 
      AND empresas.usuario_id::text = auth.uid()::text
    )
  );

-- Políticas para agendamentos
CREATE POLICY "Agendamentos visíveis para cliente e empresa" ON agendamentos
  FOR SELECT USING (
    auth.uid()::text = cliente_id::text OR 
    EXISTS (
      SELECT 1 FROM empresas 
      WHERE empresas.id = agendamentos.empresa_id 
      AND empresas.usuario_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Clientes podem criar agendamentos" ON agendamentos
  FOR INSERT WITH CHECK (auth.uid()::text = cliente_id::text);

CREATE POLICY "Empresas podem atualizar agendamentos" ON agendamentos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM empresas 
      WHERE empresas.id = agendamentos.empresa_id 
      AND empresas.usuario_id::text = auth.uid()::text
    )
  );

-- Políticas para mensagens
CREATE POLICY "Mensagens visíveis para participantes" ON mensagens
  FOR SELECT USING (
    auth.uid()::text = remetente_id::text OR
    EXISTS (
      SELECT 1 FROM agendamentos a
      WHERE a.id = mensagens.agendamento_id
      AND (
        a.cliente_id::text = auth.uid()::text OR
        EXISTS (
          SELECT 1 FROM empresas e
          WHERE e.id = a.empresa_id
          AND e.usuario_id::text = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Usuários podem enviar mensagens" ON mensagens
  FOR INSERT WITH CHECK (auth.uid()::text = remetente_id::text);

-- Políticas para favoritos
CREATE POLICY "Favoritos visíveis para o cliente" ON favoritos
  FOR SELECT USING (auth.uid()::text = cliente_id::text);

CREATE POLICY "Clientes podem gerenciar favoritos" ON favoritos
  FOR ALL USING (auth.uid()::text = cliente_id::text);

-- Políticas para avaliações
CREATE POLICY "Avaliações são visíveis para todos" ON avaliacoes
  FOR SELECT USING (true);

CREATE POLICY "Clientes podem criar avaliações" ON avaliacoes
  FOR INSERT WITH CHECK (auth.uid()::text = cliente_id::text);
