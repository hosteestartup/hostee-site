// Funções de autenticação e gerenciamento de usuários
// Centraliza todas as operações relacionadas ao login/cadastro

import { supabase } from "./supabase"
import type { Usuario } from "./supabase"

// Interface para dados de cadastro
export interface DadosCadastro {
  email: string
  senha: string
  nome: string
  telefone?: string
  tipo: "cliente" | "empresa"
}

// Interface para dados de login
export interface DadosLogin {
  email: string
  senha: string
}

// Função para cadastrar novo usuário
export async function cadastrarUsuario(dados: DadosCadastro) {
  try {
    // Primeiro, criar usuário na autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
    })

    if (authError) {
      throw new Error(`Erro na autenticação: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("Usuário não foi criado")
    }

    // Depois, inserir dados adicionais na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: authData.user.id,
          email: dados.email,
          nome: dados.nome,
          telefone: dados.telefone,
          tipo: dados.tipo,
        },
      ])
      .select()
      .single()

    if (userError) {
      throw new Error(`Erro ao salvar dados do usuário: ${userError.message}`)
    }

    return { usuario: userData, sucesso: true }
  } catch (error) {
    console.error("Erro no cadastro:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido no cadastro",
      sucesso: false,
    }
  }
}

// Função para fazer login
export async function fazerLogin(dados: DadosLogin) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha,
    })

    if (authError) {
      throw new Error(`Erro no login: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("Usuário não encontrado")
    }

    // Buscar dados completos do usuário
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError) {
      throw new Error(`Erro ao buscar dados do usuário: ${userError.message}`)
    }

    return { usuario: userData, sucesso: true }
  } catch (error) {
    console.error("Erro no login:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido no login",
      sucesso: false,
    }
  }
}

// Função para fazer logout
export async function fazerLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`Erro no logout: ${error.message}`)
    }
    return { sucesso: true }
  } catch (error) {
    console.error("Erro no logout:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido no logout",
      sucesso: false,
    }
  }
}

// Função para obter usuário atual
export async function obterUsuarioAtual(): Promise<Usuario | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const { data: userData, error: userError } = await supabase.from("usuarios").select("*").eq("id", user.id).single()

    if (userError) {
      console.error("Erro ao buscar dados do usuário:", userError)
      return null
    }

    return userData
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error)
    return null
  }
}

// Função para verificar se usuário está logado
export async function verificarAutenticacao() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return !!session
}
