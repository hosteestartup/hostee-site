"use client"

// Página para empresas visualizarem e gerenciarem agendamentos
// Permite aceitar, recusar e visualizar detalhes dos agendamentos

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { obterAgendamentosEmpresa, atualizarStatusAgendamento } from "@/lib/agendamentos"
import { obterUsuarioAtual } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface AgendamentoEmpresa {
  id: string
  data_agendamento: string
  hora_inicio: string
  hora_fim: string
  status: string
  valor_total: number
  observacoes?: string
  usuarios: {
    nome: string
    telefone?: string
  }
  servicos: {
    nome: string
    preco: number
    duracao: number
  }
}

export default function AgendamentosEmpresaPage() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<AgendamentoEmpresa[]>([])
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [atualizandoStatus, setAtualizandoStatus] = useState<string | null>(null)

  useEffect(() => {
    verificarUsuarioECarregarAgendamentos()
  }, [])

  const verificarUsuarioECarregarAgendamentos = async () => {
    try {
      const usuario = await obterUsuarioAtual()
      if (!usuario) {
        router.push("/login")
        return
      }

      if (usuario.tipo !== "empresa") {
        router.push("/")
        return
      }

      // Buscar empresa do usuário
      const { data: empresa, error: empresaError } = await supabase
        .from("empresas")
        .select("id")
        .eq("usuario_id", usuario.id)
        .single()

      if (empresaError || !empresa) {
        setErro("Empresa não encontrada")
        setCarregando(false)
        return
      }

      setEmpresaId(empresa.id)

      const resultado = await obterAgendamentosEmpresa(empresa.id)
      if (resultado.sucesso) {
        setAgendamentos(resultado.agendamentos)
      } else {
        setErro(resultado.erro || "Erro ao carregar agendamentos")
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
      setErro("Erro inesperado ao carregar agendamentos")
    } finally {
      setCarregando(false)
    }
  }

  const handleAtualizarStatus = async (agendamentoId: string, novoStatus: string) => {
    setAtualizandoStatus(agendamentoId)
    try {
      const resultado = await atualizarStatusAgendamento(agendamentoId, novoStatus)
      if (resultado.sucesso) {
        // Atualizar lista local
        setAgendamentos((prev) =>
          prev.map((agendamento) =>
            agendamento.id === agendamentoId ? { ...agendamento, status: novoStatus } : agendamento,
          ),
        )
      } else {
        setErro(resultado.erro || "Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      setErro("Erro inesperado ao atualizar status")
    } finally {
      setAtualizandoStatus(null)
    }
  }

  const agendamentosFiltrados = agendamentos.filter((agendamento) => {
    if (filtroStatus === "todos") return true
    return agendamento.status === filtroStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "var(--cor-aviso)"
      case "confirmado":
        return "var(--cor-sucesso)"
      case "cancelado":
        return "var(--cor-erro)"
      case "concluido":
        return "var(--cor-primaria)"
      default:
        return "var(--cor-cinza-medio)"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente"
      case "confirmado":
        return "Confirmado"
      case "cancelado":
        return "Cancelado"
      case "concluido":
        return "Concluído"
      default:
        return status
    }
  }

  const isAgendamentoPassado = (data: string, hora: string) => {
    const agora = new Date()
    const dataAgendamento = new Date(`${data}T${hora}:00`)
    return dataAgendamento < agora
  }

  const isAgendamentoHoje = (data: string) => {
    const hoje = new Date().toISOString().split("T")[0]
    return data === hoje
  }

  if (carregando) {
    return (
      <div className="agendamentos-empresa-page">
        <Header />
        <main className="agendamentos-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading"></div>
              <p>Carregando agendamentos...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="agendamentos-empresa-page">
      <Header />

      <main className="agendamentos-main">
        <div className="container">
          <div className="agendamentos-header">
            <h1>Gerenciar Agendamentos</h1>
            <p>Visualize e gerencie todos os agendamentos da sua empresa</p>
          </div>

          {/* Filtros */}
          <div className="filtros-container">
            <div className="filtros">
              <button
                onClick={() => setFiltroStatus("todos")}
                className={`filtro-btn ${filtroStatus === "todos" ? "ativo" : ""}`}
              >
                Todos ({agendamentos.length})
              </button>
              <button
                onClick={() => setFiltroStatus("pendente")}
                className={`filtro-btn ${filtroStatus === "pendente" ? "ativo" : ""}`}
              >
                Pendentes ({agendamentos.filter((a) => a.status === "pendente").length})
              </button>
              <button
                onClick={() => setFiltroStatus("confirmado")}
                className={`filtro-btn ${filtroStatus === "confirmado" ? "ativo" : ""}`}
              >
                Confirmados ({agendamentos.filter((a) => a.status === "confirmado").length})
              </button>
              <button
                onClick={() => setFiltroStatus("concluido")}
                className={`filtro-btn ${filtroStatus === "concluido" ? "ativo" : ""}`}
              >
                Concluídos ({agendamentos.filter((a) => a.status === "concluido").length})
              </button>
            </div>
          </div>

          {/* Lista de agendamentos */}
          {erro && <div className="mensagem mensagem-erro">{erro}</div>}

          {agendamentosFiltrados.length > 0 ? (
            <div className="agendamentos-lista">
              {agendamentosFiltrados.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className={`agendamento-card ${isAgendamentoHoje(agendamento.data_agendamento) ? "hoje" : ""}`}
                >
                  <div className="agendamento-header">
                    <div className="cliente-info">
                      <h3>{agendamento.usuarios.nome}</h3>
                      {agendamento.usuarios.telefone && (
                        <p className="telefone">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {agendamento.usuarios.telefone}
                        </p>
                      )}
                    </div>
                    <div className="status-container">
                      <div className="status-badge" style={{ backgroundColor: getStatusColor(agendamento.status) }}>
                        {getStatusText(agendamento.status)}
                      </div>
                      {isAgendamentoHoje(agendamento.data_agendamento) && <span className="badge-hoje">Hoje</span>}
                    </div>
                  </div>

                  <div className="agendamento-body">
                    <div className="servico-info">
                      <h4>{agendamento.servicos.nome}</h4>
                      <div className="servico-detalhes">
                        <span className="preco">R$ {agendamento.valor_total?.toFixed(2)}</span>
                        <span className="duracao">{agendamento.servicos.duracao} min</span>
                      </div>
                    </div>

                    <div className="data-hora">
                      <div className="data">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>
                          {new Date(agendamento.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <div className="hora">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12,6 12,12 16,14" />
                        </svg>
                        <span>
                          {agendamento.hora_inicio} - {agendamento.hora_fim}
                        </span>
                      </div>
                    </div>

                    {agendamento.observacoes && (
                      <div className="observacoes">
                        <strong>Observações do cliente:</strong> {agendamento.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="agendamento-footer">
                    {isAgendamentoPassado(agendamento.data_agendamento, agendamento.hora_inicio) && (
                      <span className="agendamento-passado">Agendamento passado</span>
                    )}

                    <div className="acoes">
                      {agendamento.status === "pendente" && (
                        <>
                          <button
                            onClick={() => handleAtualizarStatus(agendamento.id, "confirmado")}
                            disabled={atualizandoStatus === agendamento.id}
                            className="btn btn-sucesso btn-pequeno"
                          >
                            {atualizandoStatus === agendamento.id ? (
                              <div className="loading-pequeno"></div>
                            ) : (
                              <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                Confirmar
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleAtualizarStatus(agendamento.id, "cancelado")}
                            disabled={atualizandoStatus === agendamento.id}
                            className="btn btn-erro btn-pequeno"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Recusar
                          </button>
                        </>
                      )}

                      {agendamento.status === "confirmado" &&
                        !isAgendamentoPassado(agendamento.data_agendamento, agendamento.hora_inicio) && (
                          <button
                            onClick={() => handleAtualizarStatus(agendamento.id, "concluido")}
                            disabled={atualizandoStatus === agendamento.id}
                            className="btn btn-primario btn-pequeno"
                          >
                            {atualizandoStatus === agendamento.id ? (
                              <div className="loading-pequeno"></div>
                            ) : (
                              <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                Marcar como Concluído
                              </>
                            )}
                          </button>
                        )}

                      {agendamento.status === "confirmado" && (
                        <button className="btn btn-secundario btn-pequeno">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="estado-vazio">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h3>
                {filtroStatus === "todos"
                  ? "Nenhum agendamento encontrado"
                  : `Nenhum agendamento ${getStatusText(filtroStatus).toLowerCase()}`}
              </h3>
              <p>
                {filtroStatus === "todos"
                  ? "Você ainda não recebeu nenhum agendamento. Divulgue seus serviços para atrair mais clientes!"
                  : `Você não possui agendamentos com status "${getStatusText(filtroStatus).toLowerCase()}".`}
              </p>
              <button onClick={() => router.push("/painel-empresa")} className="btn btn-primario">
                Ir para o Painel
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .agendamentos-empresa-page {
          min-height: 100vh;
          background-color: var(--cor-secundaria);
        }

        .agendamentos-main {
          padding: 2rem 0;
        }

        .loading-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .loading-container p {
          margin-top: 1rem;
          color: var(--cor-cinza-medio);
        }

        .agendamentos-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .agendamentos-header h1 {
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 0.5rem;
        }

        .agendamentos-header p {
          color: var(--cor-cinza-medio);
          font-size: 1.125rem;
        }

        .filtros-container {
          margin-bottom: 2rem;
        }

        .filtros {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .filtro-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e5e5e5;
          border-radius: 25px;
          background-color: var(--cor-secundaria);
          color: var(--cor-cinza-escuro);
          cursor: pointer;
          transition: all var(--transicao-rapida);
          font-weight: 500;
          white-space: nowrap;
        }

        .filtro-btn:hover {
          border-color: var(--cor-primaria);
          background-color: var(--cor-cinza-claro);
        }

        .filtro-btn.ativo {
          border-color: var(--cor-primaria);
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
        }

        .agendamentos-lista {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .agendamento-card {
          background-color: var(--cor-secundaria);
          border: 1px solid #f0f0f0;
          border-radius: var(--border-radius-grande);
          box-shadow: var(--sombra-leve);
          overflow: hidden;
          transition: all var(--transicao-rapida);
        }

        .agendamento-card:hover {
          box-shadow: var(--sombra-media);
        }
      `}</style>
    </div>
  )
}
