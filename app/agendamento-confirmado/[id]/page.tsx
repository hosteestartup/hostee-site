"use client"

// Página de confirmação do agendamento
// Mostra detalhes do agendamento criado e opções de próximos passos

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import { supabase } from "@/lib/supabase"

interface AgendamentoDetalhado {
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
    cidade: string
    estado: string
    telefone?: string
  }
  servicos: {
    nome: string
    duracao: number
  }
}

export default function AgendamentoConfirmadoPage() {
  const params = useParams()
  const router = useRouter()
  const agendamentoId = params.id as string

  const [agendamento, setAgendamento] = useState<AgendamentoDetalhado | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (agendamentoId) {
      carregarAgendamento()
    }
  }, [agendamentoId])

  const carregarAgendamento = async () => {
    try {
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          *,
          empresas (nome_empresa, endereco, cidade, estado, telefone),
          servicos (nome, duracao)
        `)
        .eq("id", agendamentoId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      setAgendamento(data)
    } catch (error) {
      console.error("Erro ao carregar agendamento:", error)
      setErro("Agendamento não encontrado")
    } finally {
      setCarregando(false)
    }
  }

  if (carregando) {
    return (
      <div className="confirmacao-page">
        <Header />
        <main className="confirmacao-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading"></div>
              <p>Carregando confirmação...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (erro || !agendamento) {
    return (
      <div className="confirmacao-page">
        <Header />
        <main className="confirmacao-main">
          <div className="container">
            <div className="erro-container">
              <h1>Agendamento não encontrado</h1>
              <p>{erro || "O agendamento que você procura não existe."}</p>
              <Link href="/" className="btn btn-primario">
                Voltar ao Início
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="confirmacao-page">
      <Header />

      <main className="confirmacao-main">
        <div className="container-pequeno">
          <div className="confirmacao-card">
            {/* Ícone de sucesso */}
            <div className="sucesso-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            </div>

            <div className="confirmacao-header">
              <h1>Agendamento Confirmado!</h1>
              <p>Seu agendamento foi criado com sucesso e está aguardando confirmação da empresa.</p>
            </div>

            {/* Detalhes do agendamento */}
            <div className="agendamento-detalhes">
              <h2>Detalhes do Agendamento</h2>

              <div className="detalhe-item">
                <span className="label">Empresa:</span>
                <span className="valor">{agendamento.empresas.nome_empresa}</span>
              </div>

              <div className="detalhe-item">
                <span className="label">Serviço:</span>
                <span className="valor">{agendamento.servicos.nome}</span>
              </div>

              <div className="detalhe-item">
                <span className="label">Data:</span>
                <span className="valor">
                  {new Date(agendamento.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="detalhe-item">
                <span className="label">Horário:</span>
                <span className="valor">
                  {agendamento.hora_inicio} às {agendamento.hora_fim}
                </span>
              </div>

              <div className="detalhe-item">
                <span className="label">Duração:</span>
                <span className="valor">{agendamento.servicos.duracao} minutos</span>
              </div>

              <div className="detalhe-item">
                <span className="label">Endereço:</span>
                <span className="valor">
                  {agendamento.empresas.endereco}, {agendamento.empresas.cidade} - {agendamento.empresas.estado}
                </span>
              </div>

              <div className="detalhe-item">
                <span className="label">Status:</span>
                <span className={`valor status ${agendamento.status}`}>
                  {agendamento.status === "pendente" ? "Aguardando Confirmação" : agendamento.status}
                </span>
              </div>

              <div className="detalhe-item total">
                <span className="label">Valor Total:</span>
                <span className="valor">R$ {agendamento.valor_total?.toFixed(2)}</span>
              </div>

              {agendamento.observacoes && (
                <div className="observacoes">
                  <span className="label">Observações:</span>
                  <p className="valor">{agendamento.observacoes}</p>
                </div>
              )}
            </div>

            {/* Status do agendamento */}
            <div className="status-info">
              <div className="status-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="status-texto">
                <h3>Aguardando Confirmação</h3>
                <p>
                  A empresa irá analisar seu agendamento e confirmar em breve. Você receberá uma notificação quando
                  houver uma atualização.
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="confirmacao-acoes">
              <Link href="/meus-agendamentos" className="btn btn-primario">
                Ver Meus Agendamentos
              </Link>
              <Link href="/" className="btn btn-secundario">
                Voltar ao Início
              </Link>
            </div>

            {/* Informações adicionais */}
            <div className="info-adicional">
              <h3>Próximos Passos</h3>
              <ul>
                <li>A empresa analisará seu agendamento</li>
                <li>Você receberá uma confirmação por email</li>
                <li>Chegue com 10 minutos de antecedência</li>
                <li>Em caso de dúvidas, entre em contato com a empresa</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .confirmacao-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .confirmacao-main {
          padding: 4rem 0;
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
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

        .confirmacao-card {
          background-color: var(--cor-secundaria);
          border-radius: var(--border-radius-grande);
          box-shadow: var(--sombra-media);
          padding: 3rem;
          max-width: 600px;
          margin: 0 auto;
          animation: slideUp 0.5s ease-out;
        }

        .sucesso-icon {
          text-align: center;
          margin-bottom: 2rem;
        }

        .sucesso-icon svg {
          width: 64px;
          height: 64px;
          color: var(--cor-sucesso);
          background-color: rgba(34, 197, 94, 0.1);
          border-radius: 50%;
          padding: 1rem;
        }

        .confirmacao-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .confirmacao-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 1rem;
        }

        .confirmacao-header p {
          color: var(--cor-cinza-escuro);
          font-size: 1rem;
          line-height: 1.6;
        }

        .agendamento-detalhes {
          background-color: var(--cor-cinza-claro);
          border-radius: var(--border-radius);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .agendamento-detalhes h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 1.5rem;
        }

        .detalhe-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e5e5;
        }

        .detalhe-item:last-child {
          border-bottom: none;
        }

        .detalhe-item.total {
          font-weight: 600;
          font-size: 1.125rem;
          color: var(--cor-primaria);
          border-top: 2px solid var(--cor-primaria);
          margin-top: 1rem;
          padding-top: 1rem;
        }

        .detalhe-item .label {
          color: var(--cor-cinza-escuro);
          font-weight: 500;
          min-width: 120px;
        }

        .detalhe-item .valor {
          color: var(--cor-primaria);
          font-weight: 500;
          text-align: right;
          text-transform: capitalize;
        }

        .status.pendente {
          color: var(--cor-aviso);
        }

        .status.confirmado {
          color: var(--cor-sucesso);
        }

        .status.cancelado {
          color: var(--cor-erro);
        }

        .observacoes {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.75rem 0;
        }

        .observacoes .valor {
          text-align: left;
          font-weight: normal;
          color: var(--cor-cinza-escuro);
          line-height: 1.5;
        }

        .status-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background-color: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .status-icon svg {
          width: 24px;
          height: 24px;
          color: var(--cor-aviso);
          flex-shrink: 0;
        }

        .status-texto h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--cor-aviso);
          margin-bottom: 0.5rem;
        }

        .status-texto p {
          color: var(--cor-cinza-escuro);
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }

        .confirmacao-acoes {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .confirmacao-acoes .btn {
          flex: 1;
          text-align: center;
        }

        .info-adicional {
          border-top: 1px solid #f0f0f0;
          padding-top: 2rem;
        }

        .info-adicional h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 1rem;
        }

        .info-adicional ul {
          list-style: none;
          padding: 0;
        }

        .info-adicional li {
          padding: 0.5rem 0;
          color: var(--cor-cinza-escuro);
          position: relative;
          padding-left: 1.5rem;
        }

        .info-adicional li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--cor-sucesso);
          font-weight: bold;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .confirmacao-main {
            padding: 2rem 0;
          }

          .confirmacao-card {
            padding: 2rem;
            margin: 0 1rem;
          }

          .confirmacao-header h1 {
            font-size: 1.75rem;
          }

          .confirmacao-acoes {
            flex-direction: column;
          }

          .detalhe-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.25rem;
          }

          .detalhe-item .valor {
            text-align: left;
          }

          .status-info {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}
