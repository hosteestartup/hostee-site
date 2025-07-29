// Funções para gerenciar agendamentos
// Inclui criação, listagem, atualização de status e horários disponíveis

import { supabase } from "./supabase"

// Interface para criar novo agendamento
export interface NovoAgendamento {
  cliente_id: string
  empresa_id: string
  servico_id: string
  data_agendamento: string
  hora_inicio: string
  observacoes?: string
}

// Interface para horário disponível
export interface HorarioDisponivel {
  hora: string
  disponivel: boolean
}

// Função para criar novo agendamento
export async function criarAgendamento(dados: NovoAgendamento) {
  try {
    // Primeiro, buscar informações do serviço para calcular hora_fim e valor
    const { data: servico, error: servicoError } = await supabase
      .from("servicos")
      .select("duracao, preco")
      .eq("id", dados.servico_id)
      .single()

    if (servicoError || !servico) {
      throw new Error("Serviço não encontrado")
    }

    // Calcular hora de fim baseada na duração do serviço
    const horaInicio = new Date(`2000-01-01T${dados.hora_inicio}:00`)
    const horaFim = new Date(horaInicio.getTime() + servico.duracao * 60000)
    const horaFimString = horaFim.toTimeString().slice(0, 5)

    // Verificar se horário está disponível
    const disponivel = await verificarDisponibilidade(
      dados.empresa_id,
      dados.data_agendamento,
      dados.hora_inicio,
      horaFimString,
    )

    if (!disponivel) {
      throw new Error("Horário não disponível")
    }

    // Criar o agendamento
    const { data: agendamento, error } = await supabase
      .from("agendamentos")
      .insert([
        {
          ...dados,
          hora_fim: horaFimString,
          valor_total: servico.preco,
          status: "pendente",
        },
      ])
      .select(`
        *,
        empresas (nome_empresa),
        servicos (nome, preco, duracao),
        usuarios (nome)
      `)
      .single()

    if (error) {
      throw new Error(`Erro ao criar agendamento: ${error.message}`)
    }

    return { agendamento, sucesso: true }
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função para obter agendamentos do cliente
export async function obterAgendamentosCliente(clienteId: string) {
  try {
    const { data: agendamentos, error } = await supabase
      .from("agendamentos")
      .select(`
        *,
        empresas (nome_empresa, endereco, telefone),
        servicos (nome, preco, duracao)
      `)
      .eq("cliente_id", clienteId)
      .order("data_agendamento", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (error) {
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`)
    }

    return { agendamentos: agendamentos || [], sucesso: true }
  } catch (error) {
    console.error("Erro ao obter agendamentos do cliente:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função para obter agendamentos da empresa
export async function obterAgendamentosEmpresa(empresaId: string) {
  try {
    const { data: agendamentos, error } = await supabase
      .from("agendamentos")
      .select(`
        *,
        usuarios (nome, telefone),
        servicos (nome, preco, duracao)
      `)
      .eq("empresa_id", empresaId)
      .order("data_agendamento", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (error) {
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`)
    }

    return { agendamentos: agendamentos || [], sucesso: true }
  } catch (error) {
    console.error("Erro ao obter agendamentos da empresa:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função para atualizar status do agendamento
export async function atualizarStatusAgendamento(agendamentoId: string, novoStatus: string) {
  try {
    const { data: agendamento, error } = await supabase
      .from("agendamentos")
      .update({ status: novoStatus, updated_at: new Date().toISOString() })
      .eq("id", agendamentoId)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`)
    }

    return { agendamento, sucesso: true }
  } catch (error) {
    console.error("Erro ao atualizar status do agendamento:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função para obter horários disponíveis para uma data específica
export async function obterHorariosDisponiveis(empresaId: string, data: string, servicoId: string) {
  try {
    // Buscar duração do serviço
    const { data: servico, error: servicoError } = await supabase
      .from("servicos")
      .select("duracao")
      .eq("id", servicoId)
      .single()

    if (servicoError || !servico) {
      throw new Error("Serviço não encontrado")
    }

    // Buscar horário de funcionamento da empresa
    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("horario_funcionamento")
      .eq("id", empresaId)
      .single()

    if (empresaError || !empresa) {
      throw new Error("Empresa não encontrada")
    }

    // Buscar agendamentos existentes para a data
    const { data: agendamentosExistentes, error: agendamentosError } = await supabase
      .from("agendamentos")
      .select("hora_inicio, hora_fim")
      .eq("empresa_id", empresaId)
      .eq("data_agendamento", data)
      .in("status", ["pendente", "confirmado"])

    if (agendamentosError) {
      throw new Error(`Erro ao buscar agendamentos existentes: ${agendamentosError.message}`)
    }

    // Gerar horários disponíveis baseado no horário de funcionamento
    const diaSemana = obterDiaSemana(data)
    const horarioFuncionamento = empresa.horario_funcionamento?.[diaSemana]

    if (!horarioFuncionamento || horarioFuncionamento === "fechado") {
      return { horarios: [], sucesso: true }
    }

    const [inicioStr, fimStr] = horarioFuncionamento.split("-")
    const horarios = gerarHorarios(inicioStr, fimStr, servico.duracao, agendamentosExistentes || [])

    return { horarios, sucesso: true }
  } catch (error) {
    console.error("Erro ao obter horários disponíveis:", error)
    return {
      erro: error instanceof Error ? error.message : "Erro desconhecido",
      sucesso: false,
    }
  }
}

// Função auxiliar para verificar disponibilidade de horário
async function verificarDisponibilidade(
  empresaId: string,
  data: string,
  horaInicio: string,
  horaFim: string,
): Promise<boolean> {
  try {
    const { data: conflitos, error } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("empresa_id", empresaId)
      .eq("data_agendamento", data)
      .in("status", ["pendente", "confirmado"])
      .or(
        `and(hora_inicio.lte.${horaInicio},hora_fim.gt.${horaInicio}),and(hora_inicio.lt.${horaFim},hora_fim.gte.${horaFim}),and(hora_inicio.gte.${horaInicio},hora_fim.lte.${horaFim})`,
      )

    return !conflitos || conflitos.length === 0
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error)
    return false
  }
}

// Função auxiliar para obter dia da semana em português
function obterDiaSemana(data: string): string {
  const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
  const dataObj = new Date(data + "T00:00:00")
  return diasSemana[dataObj.getDay()]
}

// Função auxiliar para gerar horários disponíveis
function gerarHorarios(
  inicio: string,
  fim: string,
  duracaoServico: number,
  agendamentosExistentes: any[],
): HorarioDisponivel[] {
  const horarios: HorarioDisponivel[] = []
  const horaInicio = new Date(`2000-01-01T${inicio}:00`)
  const horaFim = new Date(`2000-01-01T${fim}:00`)

  // Gerar horários de 30 em 30 minutos
  const intervalo = 30 // minutos
  let horaAtual = new Date(horaInicio)

  while (horaAtual < horaFim) {
    const horaFimServico = new Date(horaAtual.getTime() + duracaoServico * 60000)

    // Verificar se o serviço termina antes do fechamento
    if (horaFimServico <= horaFim) {
      const horaString = horaAtual.toTimeString().slice(0, 5)
      const horaFimString = horaFimServico.toTimeString().slice(0, 5)

      // Verificar se há conflito com agendamentos existentes
      const temConflito = agendamentosExistentes.some((agendamento) => {
        return (
          (horaString >= agendamento.hora_inicio && horaString < agendamento.hora_fim) ||
          (horaFimString > agendamento.hora_inicio && horaFimString <= agendamento.hora_fim) ||
          (horaString <= agendamento.hora_inicio && horaFimString >= agendamento.hora_fim)
        )
      })

      horarios.push({
        hora: horaString,
        disponivel: !temConflito,
      })
    }

    horaAtual = new Date(horaAtual.getTime() + intervalo * 60000)
  }

  return horarios
}
