// Configuração do cliente Supabase
// Este arquivo centraliza a conexão com o banco de dados

import { createClient } from "@supabase/supabase-js"

// URLs e chaves do Supabase fornecidas pelo usuário
const supabaseUrl = "https://wowacdktyfdutdzmfatd.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvd2FjZGt0eWZkdXRkem1mYXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDU5NTUsImV4cCI6MjA2OTM4MTk1NX0.Z5a5pSS-yo0PH3jW6UjjTCU9mOc8mZgwrUoSwCaYg3M"

// Criar cliente Supabase para uso no lado do cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para as tabelas do banco
export interface Usuario {
  id: string
  email: string
  nome: string
  telefone?: string
  tipo: "cliente" | "empresa"
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Empresa {
  id: string
  usuario_id: string
  nome_empresa: string
  descricao?: string
  endereco: string
  cidade: string
  estado: string
  cep?: string
  latitude?: number
  longitude?: number
  categoria?: string
  avaliacao_media: number
  total_avaliacoes: number
  horario_funcionamento?: any
  imagem_perfil?: string
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface Servico {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  preco: number
  duracao: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Agendamento {
  id: string
  cliente_id: string
  empresa_id: string
  servico_id: string
  data_agendamento: string
  hora_inicio: string
  hora_fim: string
  status: "pendente" | "confirmado" | "cancelado" | "concluido"
  observacoes?: string
  valor_total?: number
  created_at: string
  updated_at: string
}

export interface Mensagem {
  id: string
  agendamento_id: string
  remetente_id: string
  conteudo: string
  lida: boolean
  created_at: string
}

export interface Favorito {
  id: string
  cliente_id: string
  empresa_id: string
  created_at: string
}

export interface Avaliacao {
  id: string
  cliente_id: string
  empresa_id: string
  agendamento_id: string
  nota: number
  comentario?: string
  created_at: string
}
