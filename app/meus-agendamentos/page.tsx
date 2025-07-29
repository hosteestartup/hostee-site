"use client"

// Página para o cliente visualizar seus agendamentos
// Lista todos os agendamentos com filtros por status

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { obterAgendamentosCliente } from "@/lib/agendamentos"
import { obterUsuarioAtual } from "@/lib/auth"

interface AgendamentoCompleto {
  id: string
  data_agendamento: string
  hora_inicio: string
  hora_fim: string
  status: string
  valor_total: number
  observacoes?: string
  empresas: {
    nome_empresa: string
    endereco: string
    telefone?: string
  }
  servicos: {
    nome: string
    preco: number
    duracao: number
  }
}

export default function MeusAgendamentosPage() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<AgendamentoCompleto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")

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

      if (usuario.tipo !== "cliente") {
        router.push("/")
        return
      }

      const resultado = await obterAgendamentosCliente(usuario.id)
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
        return "Aguardando Confirmação"
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

  if (carregando) {
    return (
      <div className="agendamentos-page">
        <Header />
        <main className="agendamentos-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading"></div>
              <p>Carregando seus agendamentos...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="agendamentos-page">
      <Header />

      <main className="agendamentos-main">
        <div className="container">
          <div className="agendamentos-header">
            <h1>Meus Agendamentos</h1>
            <p>Gerencie todos os seus agendamentos em um só lugar</p>
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
                <div key={agendamento.id} className="agendamento-card">
                  <div className="agendamento-header">
                    <div className="empresa-info">
                      <h3>{agendamento.empresas.nome_empresa}</h3>
                      <p className="endereco">{agendamento.empresas.endereco}</p>
                    </div>
                    <div className="status-badge" style={{ backgroundColor: getStatusColor(agendamento.status) }}>
                      {getStatusText(agendamento.status)}
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
                            weekday: "short",
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
                        <strong>Observações:</strong> {agendamento.observacoes}
                      </div>
                    )}
                  </div>

                  <div className="agendamento-footer">
                    {isAgendamentoPassado(agendamento.data_agendamento, agendamento.hora_inicio) && (
                      <span className="agendamento-passado">Agendamento passado</span>
                    )}

                    <div className="acoes">
                      {agendamento.status === "confirmado" && (
                        <button className="btn btn-secundario btn-pequeno">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Chat
                        </button>
                      )}

                      <button
                        className="btn btn-primario btn-pequeno"
                        onClick={() => router.push(`/agendamento/${agendamento.id}`)}
                      >
                        Ver Detalhes
                      </button>
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
                  ? "Você ainda não fez nenhum agendamento. Que tal explorar os serviços disponíveis?"
                  : `Você não possui agendamentos com status "${getStatusText(filtroStatus).toLowerCase()}".`}
              </p>
              <button onClick={() => router.push("/")} className="btn btn-primario">
                Explorar Serviços
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .agendamentos-page {
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
          transform: translateY(-2px);
        }

        .agendamento-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem 1.5rem 0;
        }

        .empresa-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 0.25rem;
        }

        .endereco {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: var(--cor-secundaria);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .agendamento-body {
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .servico-info h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 0.5rem;
        }

        .servico-detalhes {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .preco {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--cor-primaria);
        }

        .duracao {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .data-hora {
          display: flex;
          gap: 2rem;
        }

        .data,
        .hora {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--cor-cinza-escuro);
          font-weight: 500;
        }

        .data svg,
        .hora svg {
          width: 16px;
          height: 16px;
          color: var(--cor-cinza-medio);
        }

        .observacoes {
          background-color: var(--cor-cinza-claro);
          padding: 1rem;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
          color: var(--cor-cinza-escuro);
          line-height: 1.5;
        }

        .agendamento-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-top: 1px solid #f0f0f0;
          background-color: #fafafa;
        }

        .agendamento-passado {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
          font-style: italic;
        }

        .acoes {
          display: flex;
          gap: 0.75rem;
        }

        .acoes .btn svg {
          width: 16px;
          height: 16px;
        }

        .estado-vazio {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--cor-cinza-medio);
        }

        .estado-vazio svg {
          width: 64px;
          height: 64px;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .estado-vazio h3 {
          font-size: 1.5rem;
          color: var(--cor-cinza-escuro);
          margin-bottom: 1rem;
        }

        .estado-vazio p {
          font-size: 1rem;
          margin-bottom: 2rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .agendamentos-header h1 {
            font-size: 2rem;
          }

          .filtros {
            justify-content: flex-start;
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }

          .agendamento-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .status-badge {
            align-self: flex-start;
          }

          .data-hora {
            flex-direction: column;
            gap: 0.75rem;
          }

          .agendamento-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .acoes {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .agendamento-card {
            margin: 0 -0.5rem;
          }

          .acoes {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
