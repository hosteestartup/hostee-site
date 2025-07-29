"use client"

import type React from "react"

// Painel administrativo da empresa
// Permite gerenciar serviços, horários e visualizar estatísticas

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { obterUsuarioAtual } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface EmpresaInfo {
  id: string
  nome_empresa: string
  descricao?: string
  categoria?: string
  avaliacao_media: number
  total_avaliacoes: number
}

interface ServicoEmpresa {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracao: number
  ativo: boolean
}

interface EstatisticasEmpresa {
  totalAgendamentos: number
  agendamentosPendentes: number
  agendamentosConfirmados: number
  receitaTotal: number
}

export default function PainelEmpresaPage() {
  const router = useRouter()
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null)
  const [servicos, setServicos] = useState<ServicoEmpresa[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasEmpresa>({
    totalAgendamentos: 0,
    agendamentosPendentes: 0,
    agendamentosConfirmados: 0,
    receitaTotal: 0,
  })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<"visao-geral" | "servicos" | "configuracoes">("visao-geral")

  // Estados para novo serviço
  const [mostrarFormServico, setMostrarFormServico] = useState(false)
  const [novoServico, setNovoServico] = useState({
    nome: "",
    descricao: "",
    preco: "",
    duracao: "",
  })
  const [salvandoServico, setSalvandoServico] = useState(false)

  useEffect(() => {
    verificarUsuarioECarregarDados()
  }, [])

  const verificarUsuarioECarregarDados = async () => {
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

      await carregarDadosEmpresa(usuario.id)
    } catch (error) {
      console.error("Erro ao verificar usuário:", error)
      setErro("Erro ao carregar dados")
    } finally {
      setCarregando(false)
    }
  }

  const carregarDadosEmpresa = async (usuarioId: string) => {
    try {
      // Carregar dados da empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from("empresas")
        .select("*")
        .eq("usuario_id", usuarioId)
        .single()

      if (empresaError) {
        throw new Error("Empresa não encontrada")
      }

      setEmpresa(empresaData)

      // Carregar serviços
      const { data: servicosData, error: servicosError } = await supabase
        .from("servicos")
        .select("*")
        .eq("empresa_id", empresaData.id)
        .order("created_at", { ascending: false })

      if (servicosError) {
        console.error("Erro ao carregar serviços:", servicosError)
      } else {
        setServicos(servicosData || [])
      }

      // Carregar estatísticas
      await carregarEstatisticas(empresaData.id)
    } catch (error) {
      console.error("Erro ao carregar dados da empresa:", error)
      setErro("Erro ao carregar dados da empresa")
    }
  }

  const carregarEstatisticas = async (empresaId: string) => {
    try {
      const { data: agendamentos, error } = await supabase
        .from("agendamentos")
        .select("status, valor_total")
        .eq("empresa_id", empresaId)

      if (error) {
        console.error("Erro ao carregar estatísticas:", error)
        return
      }

      const stats = {
        totalAgendamentos: agendamentos?.length || 0,
        agendamentosPendentes: agendamentos?.filter((a) => a.status === "pendente").length || 0,
        agendamentosConfirmados: agendamentos?.filter((a) => a.status === "confirmado").length || 0,
        receitaTotal:
          agendamentos?.filter((a) => a.status === "concluido").reduce((total, a) => total + (a.valor_total || 0), 0) ||
          0,
      }

      setEstatisticas(stats)
    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error)
    }
  }

  const handleCriarServico = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return

    setSalvandoServico(true)
    setErro(null)

    try {
      const { data, error } = await supabase.from("servicos").insert([
        {
          empresa_id: empresa.id,
          nome: novoServico.nome,
          descricao: novoServico.descricao || null,
          preco: Number.parseFloat(novoServico.preco),
          duracao: Number.parseInt(novoServico.duracao),
          ativo: true,
        },
      ])

      if (error) {
        throw new Error(error.message)
      }

      // Recarregar serviços
      await carregarDadosEmpresa(empresa.id)

      // Limpar formulário
      setNovoServico({ nome: "", descricao: "", preco: "", duracao: "" })
      setMostrarFormServico(false)
    } catch (error) {
      console.error("Erro ao criar serviço:", error)
      setErro("Erro ao criar serviço")
    } finally {
      setSalvandoServico(false)
    }
  }

  const handleToggleServicoAtivo = async (servicoId: string, ativo: boolean) => {
    try {
      const { error } = await supabase.from("servicos").update({ ativo: !ativo }).eq("id", servicoId)

      if (error) {
        throw new Error(error.message)
      }

      // Atualizar lista local
      setServicos((prev) => prev.map((s) => (s.id === servicoId ? { ...s, ativo: !ativo } : s)))
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error)
      setErro("Erro ao atualizar serviço")
    }
  }

  if (carregando) {
    return (
      <div className="painel-page">
        <Header />
        <main className="painel-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading"></div>
              <p>Carregando painel...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (erro || !empresa) {
    return (
      <div className="painel-page">
        <Header />
        <main className="painel-main">
          <div className="container">
            <div className="erro-container">
              <h1>Erro no Painel</h1>
              <p>{erro || "Não foi possível carregar os dados da empresa."}</p>
              <button onClick={() => router.push("/")} className="btn btn-primario">
                Voltar ao Início
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="painel-page">
      <Header />

      <main className="painel-main">
        <div className="container">
          {/* Header do painel */}
          <div className="painel-header">
            <div className="empresa-info-header">
              <h1>{empresa.nome_empresa}</h1>
              <p>{empresa.categoria}</p>
              <div className="avaliacao-info">
                <span className="avaliacao">{empresa.avaliacao_media.toFixed(1)} ⭐</span>
                <span className="total-avaliacoes">({empresa.total_avaliacoes} avaliações)</span>
              </div>
            </div>
          </div>

          {/* Navegação por abas */}
          <div className="abas-navegacao">
            <button
              className={`aba ${abaAtiva === "visao-geral" ? "ativa" : ""}`}
              onClick={() => setAbaAtiva("visao-geral")}
            >
              Visão Geral
            </button>
            <button className={`aba ${abaAtiva === "servicos" ? "ativa" : ""}`} onClick={() => setAbaAtiva("servicos")}>
              Serviços ({servicos.length})
            </button>
            <button
              className={`aba ${abaAtiva === "configuracoes" ? "ativa" : ""}`}
              onClick={() => setAbaAtiva("configuracoes")}
            >
              Configurações
            </button>
          </div>

          {/* Conteúdo das abas */}
          <div className="abas-conteudo">
            {/* Aba Visão Geral */}
            {abaAtiva === "visao-geral" && (
              <div className="aba-visao-geral">
                {/* Cards de estatísticas */}
                <div className="estatisticas-grid">
                  <div className="estatistica-card">
                    <div className="estatistica-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div className="estatistica-info">
                      <h3>Total de Agendamentos</h3>
                      <p className="estatistica-numero">{estatisticas.totalAgendamentos}</p>
                    </div>
                  </div>

                  <div className="estatistica-card">
                    <div className="estatistica-icon pendente">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </div>
                    <div className="estatistica-info">
                      <h3>Aguardando Confirmação</h3>
                      <p className="estatistica-numero">{estatisticas.agendamentosPendentes}</p>
                    </div>
                  </div>

                  <div className="estatistica-card">
                    <div className="estatistica-icon confirmado">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                      </svg>
                    </div>
                    <div className="estatistica-info">
                      <h3>Confirmados</h3>
                      <p className="estatistica-numero">{estatisticas.agendamentosConfirmados}</p>
                    </div>
                  </div>

                  <div className="estatistica-card">
                    <div className="estatistica-icon receita">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div className="estatistica-info">
                      <h3>Receita Total</h3>
                      <p className="estatistica-numero">R$ {estatisticas.receitaTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Ações rápidas */}
                <div className="acoes-rapidas">
                  <h2>Ações Rápidas</h2>
                  <div className="acoes-grid">
                    <button onClick={() => router.push("/agendamentos-empresa")} className="acao-card">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <h3>Ver Agendamentos</h3>
                      <p>Gerencie todos os agendamentos</p>
                    </button>

                    <button onClick={() => setAbaAtiva("servicos")} className="acao-card">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      <h3>Gerenciar Serviços</h3>
                      <p>Adicione ou edite seus serviços</p>
                    </button>

                    <button onClick={() => setAbaAtiva("configuracoes")} className="acao-card">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <h3>Configurações</h3>
                      <p>Atualize informações da empresa</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Aba Serviços */}
            {abaAtiva === "servicos" && (
              <div className="aba-servicos">
                <div className="servicos-header">
                  <h2>Meus Serviços</h2>
                  <button onClick={() => setMostrarFormServico(true)} className="btn btn-primario">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Adicionar Serviço
                  </button>
                </div>

                {/* Formulário de novo serviço */}
                {mostrarFormServico && (
                  <div className="form-servico-container">
                    <form onSubmit={handleCriarServico} className="form-servico">
                      <div className="form-header">
                        <h3>Novo Serviço</h3>
                        <button type="button" onClick={() => setMostrarFormServico(false)} className="btn-fechar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Nome do Serviço *</label>
                          <input
                            type="text"
                            value={novoServico.nome}
                            onChange={(e) => setNovoServico((prev) => ({ ...prev, nome: e.target.value }))}
                            className="form-input"
                            placeholder="Ex: Corte de cabelo"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Preço (R$) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={novoServico.preco}
                            onChange={(e) => setNovoServico((prev) => ({ ...prev, preco: e.target.value }))}
                            className="form-input"
                            placeholder="0,00"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Duração (minutos) *</label>
                          <input
                            type="number"
                            min="1"
                            value={novoServico.duracao}
                            onChange={(e) => setNovoServico((prev) => ({ ...prev, duracao: e.target.value }))}
                            className="form-input"
                            placeholder="30"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Descrição</label>
                        <textarea
                          value={novoServico.descricao}
                          onChange={(e) => setNovoServico((prev) => ({ ...prev, descricao: e.target.value }))}
                          className="form-textarea"
                          placeholder="Descreva o serviço..."
                          rows={3}
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={() => setMostrarFormServico(false)}
                          className="btn btn-secundario"
                        >
                          Cancelar
                        </button>
                        <button type="submit" disabled={salvandoServico} className="btn btn-primario">
                          {salvandoServico ? <div className="loading"></div> : "Salvar Serviço"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lista de serviços */}
                {servicos.length > 0 ? (
                  <div className="servicos-lista">
                    {servicos.map((servico) => (
                      <div key={servico.id} className={`servico-item ${!servico.ativo ? "inativo" : ""}`}>
                        <div className="servico-info">
                          <h4>{servico.nome}</h4>
                          {servico.descricao && <p className="servico-descricao">{servico.descricao}</p>}
                          <div className="servico-detalhes">
                            <span className="preco">R$ {servico.preco.toFixed(2)}</span>
                            <span className="duracao">{servico.duracao} min</span>
                            <span className={`status ${servico.ativo ? "ativo" : "inativo"}`}>
                              {servico.ativo ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </div>
                        <div className="servico-acoes">
                          <button
                            onClick={() => handleToggleServicoAtivo(servico.id, servico.ativo)}
                            className={`btn btn-pequeno ${servico.ativo ? "btn-secundario" : "btn-primario"}`}
                          >
                            {servico.ativo ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="estado-vazio">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <h3>Nenhum serviço cadastrado</h3>
                    <p>Adicione seus primeiros serviços para começar a receber agendamentos.</p>
                    <button onClick={() => setMostrarFormServico(true)} className="btn btn-primario">
                      Adicionar Primeiro Serviço
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Aba Configurações */}
            {abaAtiva === "configuracoes" && (
              <div className="aba-configuracoes">
                <h2>Configurações da Empresa</h2>
                <div className="configuracoes-info">
                  <p>Esta seção estará disponível em breve. Por enquanto, você pode:</p>
                  <ul>
                    <li>Gerenciar seus serviços na aba "Serviços"</li>
                    <li>Visualizar agendamentos em "Agendamentos"</li>
                    <li>Acompanhar estatísticas na "Visão Geral"</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {erro && <div className="mensagem mensagem-erro">{erro}</div>}
        </div>
      </main>

      <style jsx>{`
        .painel-page {
          min-height: 100vh;
          background-color: var(--cor-secundaria);
        }

        .painel-main {
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

        .painel-header {
          background: linear-gradient(135deg, var(--cor-primaria) 0%, var(--cor-cinza-escuro) 100%);
          color: var(--cor-secundaria);
          padding: 3rem 2rem;
          border-radius: var(--border-radius-grande);
          margin-bottom: 2rem;
        }

        .empresa-info-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .empresa-info-header p {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }

        .avaliacao-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avaliacao {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .total-avaliacoes {
          opacity: 0.8;
        }

        .abas-navegacao {
          display: flex;
          border-bottom: 2px solid #f0f0f0;
          margin-bottom: 2rem;
        }

        .aba {
          padding: 1rem 2rem;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          color: var(--cor-cinza-medio);
          transition: all var(--transicao-rapida);
          position: relative;
        }

        .aba:hover {
          color: var(--cor-primaria);
        }

        .aba.ativa {
          color: var(--cor-primaria);
        }

        .aba.ativa::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--cor-primaria);
        }

        .abas-conteudo {
          animation: fadeIn 0.3s ease-in;
        }

        .estatisticas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .estatistica-card {
          background-color: var(--cor-secundaria);
          border: 1px solid #f0f0f0;
          border-radius: var(--border-radius-grande);
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all var(--transicao-rapida);
        }

        .estatistica-card:hover {
          box-shadow: var(--sombra-media);
          transform: translateY(-2px);
        }

        .estatistica-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .estatistica-icon.pendente {
          background-color: var(--cor-aviso);
        }

        .estatistica-icon.confirmado {
          background-color: var(--cor-sucesso);
        }

        .estatistica-icon.receita {
          background-color: var(--cor-primaria);
        }

        .estatistica-icon svg {
          width: 24px;
          height: 24px;
        }

        .estatistica-info h3 {
          font-size: 0.875rem;
          color: var(--cor-cinza-medio);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .estatistica-numero {
          font-size: 2rem;
          font-weight: 700;
          color: var(--cor-primaria);
          margin: 0;
        }

        .acoes-rapidas {
          margin-bottom: 3rem;
        }

        .acoes-rapidas h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 1.5rem;
        }

        .acoes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .acao-card {
          background-color: var(--cor-secundaria);
          border: 1px solid #f0f0f0;
          border-radius: var(--border-radius-grande);
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all var(--transicao-rapida);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .acao-card:hover {
          box-shadow: var(--sombra-media);
          transform: translateY(-4px);
          border-color: var(--cor-primaria);
        }

        .acao-card svg {
          width: 48px;
          height: 48px;
          color: var(--cor-primaria);
        }

        .acao-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin: 0;
        }

        .acao-card p {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
          margin: 0;
        }

        .servicos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .servicos-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin: 0;
        }

        .servicos-header .btn svg {
          width: 16px;
          height: 16px;
        }

        .form-servico-container {
          background-color: var(--cor-cinza-claro);
          border-radius: var(--border-radius-grande);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .form-servico {
          background-color: var(--cor-secundaria);
          border-radius: var(--border-radius);
          padding: 2rem;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .form-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin: 0;
        }

        .btn-fechar {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--cor-cinza-medio);
          padding: 0.5rem;
          border-radius: 50%;
          transition: all var(--transicao-rapida);
        }

        .btn-fechar:hover {
          background-color: var(--cor-cinza-claro);
          color: var(--cor-primaria);
        }

        .btn-fechar svg {
          width: 20px;
          height: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .servicos-lista {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .servico-item {
          background-color: var(--cor-secundaria);
          border: 1px solid #f0f0f0;
          border-radius: var(--border-radius-grande);
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          transition: all var(--transicao-rapida);
        }

        .servico-item:hover {
          box-shadow: var(--sombra-leve);
        }

        .servico-item.inativo {
          opacity: 0.6;
          background-color: #fafafa;
        }

        .servico-info {
          flex: 1;
        }

        .servico-info h4 {
          font-size: 1.125rem;
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
          gap: 1rem;
          align-items: center;
        }

        .servico-detalhes .preco {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--cor-primaria);
        }

        .servico-detalhes .duracao {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .servico-detalhes .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .servico-detalhes .status.ativo {
          background-color: rgba(34, 197, 94, 0.1);
          color: var(--cor-sucesso);
        }

        .servico-detalhes .status.inativo {
          background-color: rgba(156, 163, 175, 0.1);
          color: var(--cor-cinza-medio);
        }

        .servico-acoes {
          display: flex;
          gap: 0.5rem;
        }

        .configuracoes-info {
          background-color: var(--cor-cinza-claro);
          border-radius: var(--border-radius);
          padding: 2rem;
          text-align: center;
        }

        .configuracoes-info p {
          color: var(--cor-cinza-escuro);
          margin-bottom: 1.5rem;
        }

        .configuracoes-info ul {
          list-style: none;
          padding: 0;
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
        }

        .configuracoes-info li {
          padding: 0.5rem 0;
          color: var(--cor-cinza-escuro);
          position: relative;
          padding-left: 1.5rem;
        }

        .configuracoes-info li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--cor-primaria);
          font-weight: bold;
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
          .painel-header {
            padding: 2rem 1.5rem;
          }

          .empresa-info-header h1 {
            font-size: 2rem;
          }

          .estatisticas-grid {
            grid-template-columns: 1fr;
          }

          .acoes-grid {
            grid-template-columns: 1fr;
          }

          .servicos-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .servico-item {
            flex-direction: column;
            align-items: stretch;
          }

          .servico-acoes {
            justify-content: center;
          }

          .abas-navegacao {
            overflow-x: auto;
          }

          .aba {
            white-space: nowrap;
          }
        }

        @media (max-width: 480px) {
          .form-servico-container,
          .form-servico {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
