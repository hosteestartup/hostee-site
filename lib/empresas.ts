// Funções para gerenciar empresas e serviços
// Inclui busca por localização, favoritos e avaliações

import { supabase } from "./supabase"

// Interface para busca de empresas com filtros
export interface FiltrosBusca {
  categoria?: string
  latitude?: number
  longitude?: number
  raio?: number // em km
  termo?: string
}

// Função para buscar empresas próximas
export async function buscarEmpresasProximas(filtros: FiltrosBusca = {}) {
  try {
    let query = supabase
      .from("empresas")
      .select(`
        *,
        servicos (*)
      `)
      .eq("ativa", true)

    // Filtrar por categoria se especificada
    if (filtros.categoria) {
      query = query.eq("categoria", filtros.categoria)
    }

    // Filtrar por termo de busca se especificado
    if (filtros.termo) {
      query = query.or(`nome_empresa.ilike.%${filtros.termo}%,descricao.ilike.%${filtros.termo}%`)
    }

    const { data: empresas, error } = await query

    if (error) {
      throw new Error(`Erro ao buscar empresas: ${error.message}`)
    }

    // Se temos coordenadas, calcular distância e ordenar
    if (filtros.latitude && filtros.longitude && empresas) {
      const empresasComDistancia = empresas
        .map((empresa) => ({
          ...empresa,
          distancia: calcularDistancia(
            filtros.latitude!,
            filtros.longitude!,
            empresa.latitude || 0,
            empresa.longitude || 0,
          ),
        }))
        .filter((empresa) => !filtros.raio || empresa.distancia <= filtros.raio)
        .sort((a, b) => a.distancia - b.distancia)

      return { empresas: empresasComDistancia, sucesso: true }
    }

    return { empresas: empresas || [], sucesso: true }
  } catch (error) {
    console.error("Erro ao buscar empresas:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função para obter detalhes de uma empresa específica
export async function obterDetalhesEmpresa(empresaId: string) {
  try {
    const { data: empresa, error } = await supabase
      .from("empresas")
      .select(`
        *,
        servicos (*),
        avaliacoes (
          *,
          usuarios (nome)
        )
      `)
      .eq("id", empresaId)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar empresa: ${error.message}`)
    }

    return { empresa, sucesso: true }
  } catch (error) {
    console.error("Erro ao obter detalhes da empresa:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função para adicionar/remover favorito
export async function alternarFavorito(clienteId: string, empresaId: string) {
  try {
    // Verificar se já é favorito
    const { data: favoritoExistente } = await supabase
      .from("favoritos")
      .select("id")
      .eq("cliente_id", clienteId)
      .eq("empresa_id", empresaId)
      .single()

    if (favoritoExistente) {
      // Remover dos favoritos
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("cliente_id", clienteId)
        .eq("empresa_id", empresaId)

      if (error) {
        throw new Error(`Erro ao remover favorito: ${error.message}`)
      }

      return { favorito: false, sucesso: true }
    } else {
      // Adicionar aos favoritos
      const { error } = await supabase.from("favoritos").insert([{ cliente_id: clienteId, empresa_id: empresaId }])

      if (error) {
        throw new Error(`Erro ao adicionar favorito: ${error.message}`)
      }

      return { favorito: true, sucesso: true }
    }
  } catch (error) {
    console.error("Erro ao alterar favorito:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função para obter favoritos do cliente
export async function obterFavoritos(clienteId: string) {
  try {
    const { data: favoritos, error } = await supabase
      .from("favoritos")
      .select(`
        *,
        empresas (*)
      `)
      .eq("cliente_id", clienteId)

    if (error) {
      throw new Error(`Erro ao buscar favoritos: ${error.message}`)
    }

    return { favoritos: favoritos || [], sucesso: true }
  } catch (error) {
    console.error("Erro ao obter favoritos:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função para verificar se empresa é favorita
export async function verificarFavorito(clienteId: string, empresaId: string) {
  try {
    const { data: favorito } = await supabase
      .from("favoritos")
      .select("id")
      .eq("cliente_id", clienteId)
      .eq("empresa_id", empresaId)
      .single()

    return !!favorito
  } catch (error) {
    return false
  }
}

// Função auxiliar para calcular distância entre dois pontos (fórmula de Haversine)
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Função para obter categorias disponíveis
export async function obterCategorias() {
  try {
    const { data: categorias, error } = await supabase
      .from("empresas")
      .select("categoria")
      .not("categoria", "is", null)
      .eq("ativa", true)

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`)
    }

    // Remover duplicatas e ordenar
    const categoriasUnicas = [...new Set(categorias?.map((c) => c.categoria) || [])].filter(Boolean).sort()

    return { categorias: categoriasUnicas, sucesso: true }
  } catch (error) {
    console.error("Erro ao obter categorias:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}
