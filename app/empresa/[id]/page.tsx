"use client"

// Página detalhada da empresa com informações completas e agendamento
// Inclui serviços, avaliações, localização e botão de agendamento

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/Header"
import { obterDetalhesEmpresa, verificarFavorito, alternarFavorito } from "@/lib/empresas"
import { obterUsuarioAtual } from "@/lib/auth"
import type { Empresa, Servico, Avaliacao } from "@/lib/supabase"

interface EmpresaDetalhada extends Empresa {
  servicos: Servico[]
  avaliacoes: (Avaliacao & { usuarios: { nome: string } })[]
}

export default function EmpresaPage() {
  const params = useParams()
  const router = useRouter()
  const empresaId = params.id as string

  const [empresa, setEmpresa] = useState<EmpresaDetalhada | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [favorito, setFavorito] = useState(false)
  const [carregandoFavorito, setCarregandoFavorito] = useState(false)
  const [usuarioLogado, setUsuarioLogado] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<"servicos" | "avaliacoes" | "info">("servicos")

  useEffect(() => {
    if (empresaId) {
      carregarEmpresa()
      verificarStatusFavorito()
    }
  }, [empresaId])

  const carregarEmpresa = async () => {
    try {
      const resultado = await obterDetalhesEmpresa(empresaId)
      if (resultado.sucesso) {
        setEmpresa(resultado.empresa)
      } else {
        setErro(resultado.erro || "Empresa não encontrada")
      }
    } catch (error) {
      console.error("Erro ao carregar empresa:", error)
      setErro("Erro ao carregar dados da empresa")
    } finally {
      setCarregando(false)
    }
  }

  const verificarStatusFavorito = async () => {
    try {
      const usuario = await obterUsuarioAtual()
      if (usuario && usuario.tipo === "cliente") {
        setUsuarioLogado(true)
        const ehFavorito = await verificarFavorito(usuario.id, empresaId)
        setFavorito(ehFavorito)
      }
    } catch (error) {
      console.error("Erro ao verificar favorito:", error)
    }
  }

  const handleFavorito = async () => {
    if (!usuarioLogado) {
      router.push("/login")
      return
    }

    setCarregandoFavorito(true)
    try {
      const usuario = await obterUsuarioAtual()
      if (usuario) {
        const resultado = await alternarFavorito(usuario.id, empresaId)
        if (resultado.sucesso) {
          setFavorito(resultado.favorito || false)
        }
      }
    } catch (error) {
      console.error("Erro ao alterar favorito:", error)
    } finally {
      setCarregandoFavorito(false)
    }
  }

  const handleAgendar = (servicoId: string) => {
    if (!usuarioLogado) {
      router.push("/login")
      return
    }
    router.push(`/agendar/${empresaId}/${servicoId}`)
  }

  const renderEstrelas = (avaliacao: number) => {
    const estrelas = []
    const avaliacaoArredondada = Math.round(avaliacao * 2) / 2

    for (let i = 1; i <= 5; i++) {
      if (i <= avaliacaoArredondada) {
        estrelas.push(
          <svg key={i} className="estrela cheia" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>,
        )
      } else if (i - 0.5 === avaliacaoArredondada) {
        estrelas.push(
          <svg key={i} className="estrela meia" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-${empresaId}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#half-${empresaId})`}
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>,
        )
      } else {
        estrelas.push(
          <svg key={i} className="estrela vazia" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>,
        )
      }
    }

    return estrelas
  }

  const formatarHorario = (horario: any) => {
    if (!horario) return "Não informado"

    const dias = {
      segunda: "Segunda",
      terca: "Terça",
      quarta: "Quarta",
      quinta: "Quinta",
      sexta: "Sexta",
      sabado: "Sábado",
      domingo: "Domingo",
    }

    return Object.entries(dias).map(([key, label]) => (
      <div key={key} className="horario-item">
        <span className="dia">{label}:</span>
        <span className="hora">{horario[key] === "fechado" ? "Fechado" : horario[key] || "Não informado"}</span>
      </div>
    ))
  }

  if (carregando) {
    return (
      <div className="empresa-page">
        <Header />
        <main className="empresa-main">
          <div className="container">
            <div className="loading-container">
              <div className="loading"></div>
              <p>Carregando informações da empresa...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (erro || !empresa) {
    return (
      <div className="empresa-page">
        <Header />
        <main className="empresa-main">
          <div className="container">
            <div className="erro-container">
              <h1>Empresa não encontrada</h1>
              <p>{erro || "A empresa que você procura não existe ou foi removida."}</p>
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
    <div className="empresa-page">
      <Header />

      <main className="empresa-main">
        <div className="container">
          {/* Header da empresa */}
          <div className="empresa-header">
            <div className="empresa-imagem-grande">
              {empresa.imagem_perfil ? (
                <img src={empresa.imagem_perfil || "/placeholder.svg"} alt={empresa.nome_empresa} />
              ) : (
                <div className="imagem-placeholder">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="empresa-info-header">
              <div className="empresa-titulo">
                <h1>{empresa.nome_empresa}</h1>
                {empresa.categoria && <span className="categoria-badge">{empresa.categoria}</span>}
              </div>

              <div className="empresa-avaliacao-header">
                <div className="estrelas">{renderEstrelas(empresa.avaliacao_media)}</div>
                <span className="avaliacao-numero">{empresa.avaliacao_media.toFixed(1)}</span>
                <span className="total-avaliacoes">({empresa.total_avaliacoes} avaliações)</span>
              </div>

              <div className="empresa-localizacao-header">
                <svg className="icone-localizacao" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>
                  {empresa.endereco}, {empresa.cidade} - {empresa.estado}
                </span>
              </div>

              <div className="empresa-acoes">
                <button
                  onClick={handleFavorito}
                  className={`btn-favorito ${favorito ? "ativo" : ""}`}
                  disabled={carregandoFavorito}
                >
                  {carregandoFavorito ? (
                    <div className="loading-pequeno"></div>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill={favorito ? "currentColor" : "none"} stroke="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {favorito ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Navegação por abas */}
          <div className="abas-navegacao">
            <button className={`aba ${abaAtiva === "servicos" ? "ativa" : ""}`} onClick={() => setAbaAtiva("servicos")}>
              Serviços ({empresa.servicos.length})
            </button>
            <button
              className={`aba ${abaAtiva === "avaliacoes" ? "ativa" : ""}`}
              onClick={() => setAbaAtiva("avaliacoes")}
            >
              Avaliações ({empresa.avaliacoes.length})
            </button>
            <button className={`aba ${abaAtiva === "info" ? "ativa" : ""}`} onClick={() => setAbaAtiva("info")}>
              Informações
            </button>
          </div>

          {/* Conteúdo das abas */}
          <div className="abas-conteudo">
            {/* Aba Serviços */}
            {abaAtiva === "servicos" && (
              <div className="aba-servicos">
                {empresa.servicos.length > 0 ? (
                  <div className="servicos-grid">
                    {empresa.servicos.map((servico) => (
                      <div key={servico.id} className="servico-card">
                        <div className="servico-info">
                          <h3 className="servico-nome">{servico.nome}</h3>
                          {servico.descricao && <p className="servico-descricao">{servico.descricao}</p>}
                          <div className="servico-detalhes">
                            <span className="servico-preco">R$ {servico.preco.toFixed(2)}</span>
                            <span className="servico-duracao">{servico.duracao} min</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAgendar(servico.id)}
                          className="btn btn-primario btn-agendar-servico"
                        >
                          Agendar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="estado-vazio">
                    <p>Esta empresa ainda não cadastrou serviços.</p>
                  </div>
                )}
              </div>
            )}

            {/* Aba Avaliações */}
            {abaAtiva === "avaliacoes" && (
              <div className="aba-avaliacoes">
                {empresa.avaliacoes.length > 0 ? (
                  <div className="avaliacoes-lista">
                    {empresa.avaliacoes.map((avaliacao) => (
                      <div key={avaliacao.id} className="avaliacao-card">
                        <div className="avaliacao-header">
                          <div className="avaliacao-usuario">
                            <div className="usuario-avatar">{avaliacao.usuarios.nome.charAt(0).toUpperCase()}</div>
                            <span className="usuario-nome">{avaliacao.usuarios.nome}</span>
                          </div>
                          <div className="avaliacao-nota">
                            <div className="estrelas-pequenas">{renderEstrelas(avaliacao.nota)}</div>
                            <span className="nota-numero">{avaliacao.nota}</span>
                          </div>
                        </div>
                        {avaliacao.comentario && <p className="avaliacao-comentario">{avaliacao.comentario}</p>}
                        <div className="avaliacao-data">
                          {new Date(avaliacao.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="estado-vazio">
                    <p>Esta empresa ainda não possui avaliações.</p>
                  </div>
                )}
              </div>
            )}

            {/* Aba Informações */}
            {abaAtiva === "info" && (
              <div className="aba-info">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>Sobre a Empresa</h3>
                    <p>{empresa.descricao || "Descrição não informada."}</p>
                  </div>

                  <div className="info-card">
                    <h3>Horário de Funcionamento</h3>
                    <div className="horarios-lista">{formatarHorario(empresa.horario_funcionamento)}</div>
                  </div>

                  <div className="info-card">
                    <h3>Localização</h3>
                    <div className="localizacao-detalhes">
                      <p>
                        <strong>Endereço:</strong> {empresa.endereco}
                      </p>
                      <p>
                        <strong>Cidade:</strong> {empresa.cidade} - {empresa.estado}
                      </p>
                      {empresa.cep && (
                        <p>
                          <strong>CEP:</strong> {empresa.cep}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .empresa-page {
          min-height: 100vh;
          background-color: var(--cor-secundaria);
        }

        .empresa-main {
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

        .empresa-header {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
          padding: 2rem;
          background-color: var(--cor-cinza-claro);
          border-radius: var(--border-radius-grande);
        }

        .empresa-imagem-grande {
          width: 100%;
          height: 300px;
          border-radius: var(--border-radius-grande);
          overflow: hidden;
          background-color: var(--cor-secundaria);
        }

        .empresa-imagem-grande img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .imagem-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cor-cinza-medio);
        }

        .imagem-placeholder svg {
          width: 64px;
          height: 64px;
        }

        .empresa-info-header {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .empresa-titulo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .empresa-titulo h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--cor-primaria);
          margin: 0;
        }

        .categoria-badge {
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .empresa-avaliacao-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .estrelas {
          display: flex;
          gap: 4px;
        }

        .estrela {
          width: 20px;
          height: 20px;
          color: #fbbf24;
        }

        .estrela.vazia {
          color: #d1d5db;
        }

        .avaliacao-numero {
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--cor-primaria);
        }

        .total-avaliacoes {
          color: var(--cor-cinza-medio);
        }

        .empresa-localizacao-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--cor-cinza-escuro);
        }

        .icone-localizacao {
          width: 20px;
          height: 20px;
          color: var(--cor-cinza-medio);
        }

        .empresa-acoes {
          margin-top: auto;
        }

        .btn-favorito {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background-color: var(--cor-secundaria);
          color: var(--cor-primaria);
          border: 2px solid var(--cor-primaria);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transicao-rapida);
          font-weight: 500;
        }

        .btn-favorito:hover {
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
        }

        .btn-favorito.ativo {
          background-color: var(--cor-erro);
          border-color: var(--cor-erro);
          color: var(--cor-secundaria);
        }

        .btn-favorito svg {
          width: 20px;
          height: 20px;
        }

        .loading-pequeno {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
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

        .servicos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .servico-card {
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

        .servico-card:hover {
          box-shadow: var(--sombra-media);
          transform: translateY(-2px);
        }

        .servico-info {
          flex: 1;
        }

        .servico-nome {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 0.5rem;
        }

        .servico-descricao {
          color: var(--cor-cinza-escuro);
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .servico-detalhes {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .servico-preco {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--cor-primaria);
        }

        .servico-duracao {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .btn-agendar-servico {
          white-space: nowrap;
          align-self: center;
        }

        .avaliacoes-lista {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .avaliacao-card {
          background-color: var(--cor-secundaria);
          border: 1px solid #f0f0f0;
          border-radius: var(--border-radius-grande);
          padding: 1.5rem;
        }

        .avaliacao-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .avaliacao-usuario {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .usuario-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .usuario-nome {
          font-weight: 500;
          color: var(--cor-primaria);
        }

        .avaliacao-nota {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .estrelas-pequenas {
          display: flex;
          gap: 2px;
        }

        .estrelas-pequenas .estrela {
          width: 16px;
          height: 16px;
        }

        .nota-numero {
          font-weight: 600;
          color: var(--cor-primaria);
        }

        .avaliacao-comentario {
          color: var(--cor-cinza-escuro);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .avaliacao-data {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .info-card {
          background-color: var(--cor-secundaria);
          border: 1px solid #f0f0f0;
          border-radius: var(--border-radius-grande);
          padding: 2rem;
        }

        .info-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 1rem;
        }

        .info-card p {
          color: var(--cor-cinza-escuro);
          line-height: 1.6;
        }

        .horarios-lista {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .horario-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .horario-item:last-child {
          border-bottom: none;
        }

        .dia {
          font-weight: 500;
          color: var(--cor-primaria);
        }

        .hora {
          color: var(--cor-cinza-escuro);
        }

        .localizacao-detalhes p {
          margin-bottom: 0.5rem;
        }

        .estado-vazio {
          text-align: center;
          padding: 3rem;
          color: var(--cor-cinza-medio);
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .empresa-header {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .empresa-imagem-grande {
            height: 200px;
          }

          .empresa-titulo h1 {
            font-size: 2rem;
          }

          .servicos-grid {
            grid-template-columns: 1fr;
          }

          .servico-card {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-agendar-servico {
            align-self: stretch;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .abas-navegacao {
            overflow-x: auto;
          }

          .aba {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  )
}
