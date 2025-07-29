"use client"

// Página de agendamento com calendário e seleção de horários
// Permite ao cliente escolher data e hora para o serviço

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/Header"
import { obterDetalhesEmpresa } from "@/lib/empresas"
import { obterHorariosDisponiveis, criarAgendamento } from "@/lib/agendamentos"
import { obterUsuarioAtual } from "@/lib/auth"
import type { Empresa, Servico, HorarioDisponivel } from "@/lib/supabase"

export default function AgendarPage() {
  const params = useParams()
  const router = useRouter()
  const empresaId = params.empresaId as string
  const servicoId = params.servicoId as string

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [servico, setServico] = useState<Servico | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [carregandoAgendamento, setCarregandoAgendamento] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Estados do agendamento
  const [dataSelecionada, setDataSelecionada] = useState("")
  const [horarioSelecionado, setHorarioSelecionado] = useState("")
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<HorarioDisponivel[]>([])
  const [observacoes, setObservacoes] = useState("")

  useEffect(() => {
    carregarDados()
  }, [empresaId, servicoId])

  useEffect(() => {
    if (dataSelecionada && servico) {
      carregarHorarios()
    }
  }, [dataSelecionada, servico])

  const carregarDados = async () => {
    try {
      const resultado = await obterDetalhesEmpresa(empresaId)
      if (resultado.sucesso) {
        setEmpresa(resultado.empresa)
        const servicoEncontrado = resultado.empresa.servicos.find((s: Servico) => s.id === servicoId)
        if (servicoEncontrado) {
          setServico(servicoEncontrado)
        } else {
          setErro("Serviço não encontrado")
        }
      } else {
        setErro(resultado.erro || "Empresa não encontrada")
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      setErro("Erro ao carregar dados")
    } finally {
      setCarregando(false)
    }
  }

  const carregarHorarios = async () => {
    if (!dataSelecionada || !servico) return

    setCarregandoHorarios(true)
    try {
      const resultado = await obterHorariosDisponiveis(empresaId, dataSelecionada, servicoId)
      if (resultado.sucesso) {
        setHorariosDisponiveis(resultado.horarios)
        setHorarioSelecionado("") // Limpar seleção anterior
      } else {
        setErro(resultado.erro || "Erro ao carregar horários")
      }
    } catch (error) {
      console.error("Erro ao carregar horários:", error)
      setErro("Erro ao carregar horários disponíveis")
    } finally {
      setCarregandoHorarios(false)
    }
  }

  const handleConfirmarAgendamento = async () => {
    if (!dataSelecionada || !horarioSelecionado) {
      setErro("Por favor, selecione data e horário")
      return
    }

    setCarregandoAgendamento(true)
    setErro(null)

    try {
      const usuario = await obterUsuarioAtual()
      if (!usuario) {
        router.push("/login")
        return
      }

      const resultado = await criarAgendamento({
        cliente_id: usuario.id,
        empresa_id: empresaId,
        servico_id: servicoId,
        data_agendamento: dataSelecionada,
        hora_inicio: horarioSelecionado,
        observacoes: observacoes || undefined,
      })

      if (resultado.sucesso) {
        // Redirecionar para página de sucesso ou agendamentos
        router.push(`/agendamento-confirmado/${resultado.agendamento.id}`)
      } else {
        setErro(resultado.erro || "Erro ao criar agendamento")
      }
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error)
      setErro("Erro inesperado ao confirmar agendamento")
    } finally {
      setCarregandoAgendamento(false)
    }
  }

  // Gerar datas disponíveis (próximos 30 dias, excluindo domingos)
  const gerarDatasDisponiveis = () => {
    const datas = []
    const hoje = new Date()

    for (let i = 1; i <= 30; i++) {
      const data = new Date(hoje)
      data.setDate(hoje.getDate() + i)

      // Pular domingos (0 = domingo)
      if (data.getDay() !== 0) {
        datas.push({
          valor: data.toISOString().split("T")[0],
          texto: data.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
          }),
        })
      }
    }
    return datas
  }

  const datasDisponiveis = gerarDatasDisponiveis()

  if (carregando) {
    return (
      <div className="agendar-page">
        <Header />
        <main className="agendar-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading"></div>
              <p>Carregando informações...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (erro || !empresa || !servico) {
    return (
      <div className="agendar-page">
        <Header />
        <main className="agendar-main">
          <div className="container">
            <div className="erro-container">
              <h1>Erro no Agendamento</h1>
              <p>{erro || "Não foi possível carregar as informações necessárias."}</p>
              <button onClick={() => router.back()} className="btn btn-primario">
                Voltar
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="agendar-page">
      <Header />

      <main className="agendar-main">
        <div className="container">
          {/* Header do agendamento */}
          <div className="agendar-header">
            <button onClick={() => router.back()} className="btn-voltar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <h1>Agendar Serviço</h1>
          </div>

          <div className="agendar-content">
            {/* Resumo do serviço */}
            <div className="servico-resumo">
              <div className="empresa-info">
                <h2>{empresa.nome_empresa}</h2>
                <p className="empresa-endereco">
                  {empresa.endereco}, {empresa.cidade}
                </p>
              </div>

              <div className="servico-info">
                <h3>{servico.nome}</h3>
                {servico.descricao && <p className="servico-descricao">{servico.descricao}</p>}
                <div className="servico-detalhes">
                  <span className="preco">R$ {servico.preco.toFixed(2)}</span>
                  <span className="duracao">{servico.duracao} minutos</span>
                </div>
              </div>
            </div>

            {/* Formulário de agendamento */}
            <div className="agendar-form">
              <div className="form-section">
                <h3>Selecione a Data</h3>
                <div className="datas-grid">
                  {datasDisponiveis.map((data) => (
                    <button
                      key={data.valor}
                      onClick={() => setDataSelecionada(data.valor)}
                      className={`data-btn ${dataSelecionada === data.valor ? "selecionada" : ""}`}
                    >
                      {data.texto}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de horário */}
              {dataSelecionada && (
                <div className="form-section">
                  <h3>Selecione o Horário</h3>
                  {carregandoHorarios ? (
                    <div className="horarios-loading">
                      <div className="loading"></div>
                      <p>Carregando horários disponíveis...</p>
                    </div>
                  ) : (
                    <div className="horarios-grid">
                      {horariosDisponiveis.map((horario) => (
                        <button
                          key={horario.hora}
                          onClick={() => setHorarioSelecionado(horario.hora)}
                          disabled={!horario.disponivel}
                          className={`horario-btn ${
                            horarioSelecionado === horario.hora ? "selecionado" : ""
                          } ${!horario.disponivel ? "indisponivel" : ""}`}
                        >
                          {horario.hora}
                        </button>
                      ))}
                    </div>
                  )}

                  {!carregandoHorarios && horariosDisponiveis.length === 0 && (
                    <div className="sem-horarios">
                      <p>Não há horários disponíveis para esta data.</p>
                      <p>Tente selecionar outra data.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Observações */}
              {dataSelecionada && horarioSelecionado && (
                <div className="form-section">
                  <h3>Observações (Opcional)</h3>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="form-textarea"
                    placeholder="Alguma observação especial para o agendamento..."
                    rows={3}
                  />
                </div>
              )}

              {/* Resumo e confirmação */}
              {dataSelecionada && horarioSelecionado && (
                <div className="confirmacao-section">
                  <div className="resumo-agendamento">
                    <h3>Resumo do Agendamento</h3>
                    <div className="resumo-item">
                      <span className="label">Empresa:</span>
                      <span className="valor">{empresa.nome_empresa}</span>
                    </div>
                    <div className="resumo-item">
                      <span className="label">Serviço:</span>
                      <span className="valor">{servico.nome}</span>
                    </div>
                    <div className="resumo-item">
                      <span className="label">Data:</span>
                      <span className="valor">
                        {new Date(dataSelecionada + "T00:00:00").toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="resumo-item">
                      <span className="label">Horário:</span>
                      <span className="valor">{horarioSelecionado}</span>
                    </div>
                    <div className="resumo-item">
                      <span className="label">Duração:</span>
                      <span className="valor">{servico.duracao} minutos</span>
                    </div>
                    <div className="resumo-item total">
                      <span className="label">Valor Total:</span>
                      <span className="valor">R$ {servico.preco.toFixed(2)}</span>
                    </div>
                  </div>

                  {erro && <div className="mensagem mensagem-erro">{erro}</div>}

                  <button
                    onClick={handleConfirmarAgendamento}
                    disabled={carregandoAgendamento}
                    className="btn btn-primario btn-grande btn-confirmar"
                  >
                    {carregandoAgendamento ? <div className="loading"></div> : "Confirmar Agendamento"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .agendar-page {
          min-height: 100vh;
          background-color: var(--cor-secundaria);
        }

        .agendar-main {
          padding: 2rem 0;
        }

        .loading-container,
        .erro-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .loading-container p {
          margin-top: 1rem;
          color: var(--cor-cinza-medio);
        }

        .erro-container h1 {
          color: var(--cor-erro);
          margin-bottom: 1rem;
        }

        .erro-container p {
          color: var(--cor-cinza-medio);
          margin-bottom: 2rem;
        }

        .agendar-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .btn-voltar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: none;
          border: 1px solid #e5e5e5;
          border-radius: var(--border-radius);
          color: var(--cor-cinza-escuro);
          cursor: pointer;
          transition: all var(--transicao-rapida);
        }

        .btn-voltar:hover {
          background-color: var(--cor-cinza-claro);
          border-color: var(--cor-primaria);
        }

        .btn-voltar svg {
          width: 16px;
          height: 16px;
        }

        .agendar-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin: 0;
        }

        .agendar-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 3rem;
        }

        .servico-resumo {
          background-color: var(--cor-cinza-claro);
          border-radius: var(--border-radius-grande);
          padding: 2rem;
          height: fit-content;
          position: sticky;
          top: 2rem;
        }

        .empresa-info {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e5e5;
        }

        .empresa-info h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 0.5rem;
        }

        .empresa-endereco {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .servico-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 0.5rem;
        }

        .servico-descricao {
          color: var(--cor-cinza-escuro);
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .servico-detalhes {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preco {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--cor-primaria);
        }

        .duracao {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .agendar-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          background-color: var(--cor-secundaria);
          border: 1px solid #f0f0f0;
          border-radius: var(--border-radius-grande);
          padding: 2rem;
        }

        .form-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 1.5rem;
        }

        .datas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .data-btn {
          padding: 1rem;
          border: 2px solid #e5e5e5;
          border-radius: var(--border-radius);
          background-color: var(--cor-secundaria);
          color: var(--cor-cinza-escuro);
          cursor: pointer;
          transition: all var(--transicao-rapida);
          font-weight: 500;
          text-transform: capitalize;
        }

        .data-btn:hover {
          border-color: var(--cor-primaria);
          background-color: var(--cor-cinza-claro);
        }

        .data-btn.selecionada {
          border-color: var(--cor-primaria);
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
        }

        .horarios-loading {
          text-align: center;
          padding: 2rem;
        }

        .horarios-loading p {
          margin-top: 1rem;
          color: var(--cor-cinza-medio);
        }

        .horarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
        }

        .horario-btn {
          padding: 1rem;
          border: 2px solid #e5e5e5;
          border-radius: var(--border-radius);
          background-color: var(--cor-secundaria);
          color: var(--cor-cinza-escuro);
          cursor: pointer;
          transition: all var(--transicao-rapida);
          font-weight: 500;
        }

        .horario-btn:hover:not(:disabled) {
          border-color: var(--cor-primaria);
          background-color: var(--cor-cinza-claro);
        }

        .horario-btn.selecionado {
          border-color: var(--cor-primaria);
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
        }

        .horario-btn.indisponivel {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f5f5f5;
        }

        .sem-horarios {
          text-align: center;
          padding: 2rem;
          color: var(--cor-cinza-medio);
        }

        .sem-horarios p {
          margin-bottom: 0.5rem;
        }

        .confirmacao-section {
          background-color: var(--cor-cinza-claro);
          border-radius: var(--border-radius-grande);
          padding: 2rem;
        }

        .resumo-agendamento {
          margin-bottom: 2rem;
        }

        .resumo-agendamento h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 1.5rem;
        }

        .resumo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e5e5;
        }

        .resumo-item:last-child {
          border-bottom: none;
        }

        .resumo-item.total {
          font-weight: 600;
          font-size: 1.125rem;
          color: var(--cor-primaria);
          border-top: 2px solid var(--cor-primaria);
          margin-top: 1rem;
          padding-top: 1rem;
        }

        .resumo-item .label {
          color: var(--cor-cinza-escuro);
        }

        .resumo-item .valor {
          color: var(--cor-primaria);
          font-weight: 500;
          text-transform: capitalize;
        }

        .btn-confirmar {
          width: 100%;
          font-size: 1.125rem;
          padding: 1.25rem;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .agendar-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .servico-resumo {
            position: static;
          }

          .datas-grid {
            grid-template-columns: 1fr;
          }

          .horarios-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .agendar-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .agendar-header h1 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .horarios-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-section,
          .servico-resumo,
          .confirmacao-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
