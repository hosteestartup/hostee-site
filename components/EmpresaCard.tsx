"use client"

import type React from "react"

// Componente de card para exibir informações da empresa
// Inclui avaliação, distância, favoritos e botão de agendamento

import { useState, useEffect } from "react"
import Link from "next/link"
import { verificarFavorito, alternarFavorito } from "@/lib/empresas"
import { obterUsuarioAtual } from "@/lib/auth"
import type { Empresa } from "@/lib/supabase"

interface EmpresaCardProps {
  empresa: Empresa & { distancia?: number; servicos?: any[] }
  mostrarDistancia?: boolean
}

export default function EmpresaCard({ empresa, mostrarDistancia = false }: EmpresaCardProps) {
  const [favorito, setFavorito] = useState(false)
  const [carregandoFavorito, setCarregandoFavorito] = useState(false)
  const [usuarioLogado, setUsuarioLogado] = useState(false)

  // Verificar se usuário está logado e se empresa é favorita
  useEffect(() => {
    verificarStatusFavorito()
  }, [empresa.id])

  const verificarStatusFavorito = async () => {
    try {
      const usuario = await obterUsuarioAtual()
      if (usuario && usuario.tipo === "cliente") {
        setUsuarioLogado(true)
        const ehFavorito = await verificarFavorito(usuario.id, empresa.id)
        setFavorito(ehFavorito)
      }
    } catch (error) {
      console.error("Erro ao verificar favorito:", error)
    }
  }

  const handleFavorito = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!usuarioLogado) {
      // Redirecionar para login se não estiver logado
      window.location.href = "/login"
      return
    }

    setCarregandoFavorito(true)
    try {
      const usuario = await obterUsuarioAtual()
      if (usuario) {
        const resultado = await alternarFavorito(usuario.id, empresa.id)
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

  // Renderizar estrelas de avaliação
  const renderEstrelas = (avaliacao: number) => {
    const estrelas = []
    const avaliacaoArredondada = Math.round(avaliacao * 2) / 2 // Arredondar para 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= avaliacaoArredondada) {
        // Estrela cheia
        estrelas.push(
          <svg key={i} className="estrela cheia" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>,
        )
      } else if (i - 0.5 === avaliacaoArredondada) {
        // Meia estrela
        estrelas.push(
          <svg key={i} className="estrela meia" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-${empresa.id}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#half-${empresa.id})`}
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>,
        )
      } else {
        // Estrela vazia
        estrelas.push(
          <svg key={i} className="estrela vazia" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>,
        )
      }
    }

    return estrelas
  }

  return (
    <div className="empresa-card">
      <Link href={`/empresa/${empresa.id}`} className="empresa-link">
        {/* Imagem da empresa */}
        <div className="empresa-imagem">
          {empresa.imagem_perfil ? (
            <img src={empresa.imagem_perfil || "/placeholder.svg"} alt={empresa.nome_empresa} />
          ) : (
            <div className="imagem-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" />
              </svg>
            </div>
          )}

          {/* Botão de favorito */}
          <button
            className={`favorito-btn ${favorito ? "ativo" : ""}`}
            onClick={handleFavorito}
            disabled={carregandoFavorito}
            title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {carregandoFavorito ? (
              <div className="loading-pequeno"></div>
            ) : (
              <svg viewBox="0 0 24 24" fill={favorito ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </button>
        </div>

        {/* Informações da empresa */}
        <div className="empresa-info">
          <div className="empresa-header">
            <h3 className="empresa-nome">{empresa.nome_empresa}</h3>
            {empresa.categoria && <span className="empresa-categoria">{empresa.categoria}</span>}
          </div>

          {/* Avaliação */}
          <div className="empresa-avaliacao">
            <div className="estrelas">{renderEstrelas(empresa.avaliacao_media)}</div>
            <span className="avaliacao-numero">{empresa.avaliacao_media.toFixed(1)}</span>
            <span className="total-avaliacoes">({empresa.total_avaliacoes} avaliações)</span>
          </div>

          {/* Descrição */}
          {empresa.descricao && (
            <p className="empresa-descricao">
              {empresa.descricao.length > 120 ? `${empresa.descricao.substring(0, 120)}...` : empresa.descricao}
            </p>
          )}

          {/* Localização e distância */}
          <div className="empresa-localizacao">
            <svg className="icone-localizacao" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="endereco">
              {empresa.cidade}, {empresa.estado}
            </span>
            {mostrarDistancia && empresa.distancia !== undefined && (
              <span className="distancia">• {empresa.distancia.toFixed(1)} km</span>
            )}
          </div>

          {/* Serviços em destaque */}
          {empresa.servicos && empresa.servicos.length > 0 && (
            <div className="servicos-destaque">
              <div className="servicos-lista">
                {empresa.servicos.slice(0, 3).map((servico, index) => (
                  <span key={servico.id} className="servico-tag">
                    {servico.nome}
                    {index < Math.min(empresa.servicos!.length, 3) - 1 && " • "}
                  </span>
                ))}
                {empresa.servicos.length > 3 && (
                  <span className="mais-servicos">+{empresa.servicos.length - 3} mais</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer do card */}
        <div className="empresa-footer">
          <div className="preco-range">
            {empresa.servicos && empresa.servicos.length > 0 && (
              <>
                <span className="preco-label">A partir de</span>
                <span className="preco-valor">R$ {Math.min(...empresa.servicos.map((s) => s.preco)).toFixed(2)}</span>
              </>
            )}
          </div>
          <button className="btn-agendar">
            Agendar
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Link>

      <style jsx>{`
        .empresa-card {
          background-color: var(--cor-secundaria);
          border-radius: var(--border-radius-grande);
          box-shadow: var(--sombra-leve);
          overflow: hidden;
          transition: all var(--transicao-media);
          border: 1px solid #f0f0f0;
          height: 100%;
        }

        .empresa-card:hover {
          box-shadow: var(--sombra-media);
          transform: translateY(-4px);
        }

        .empresa-link {
          display: block;
          color: inherit;
          text-decoration: none;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .empresa-imagem {
          position: relative;
          height: 200px;
          overflow: hidden;
          background-color: var(--cor-cinza-claro);
        }

        .empresa-imagem img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transicao-media);
        }

        .empresa-card:hover .empresa-imagem img {
          transform: scale(1.05);
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
          width: 48px;
          height: 48px;
        }

        .favorito-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.9);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transicao-rapida);
          color: var(--cor-cinza-medio);
          backdrop-filter: blur(4px);
        }

        .favorito-btn:hover {
          background-color: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }

        .favorito-btn.ativo {
          color: var(--cor-erro);
          background-color: rgba(255, 255, 255, 1);
        }

        .favorito-btn svg {
          width: 20px;
          height: 20px;
        }

        .loading-pequeno {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid var(--cor-primaria);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .empresa-info {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empresa-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .empresa-nome {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin: 0;
          line-height: 1.3;
        }

        .empresa-categoria {
          background-color: var(--cor-cinza-claro);
          color: var(--cor-cinza-escuro);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .empresa-avaliacao {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .estrelas {
          display: flex;
          gap: 2px;
        }

        .estrela {
          width: 16px;
          height: 16px;
          color: #fbbf24;
        }

        .estrela.vazia {
          color: #d1d5db;
        }

        .avaliacao-numero {
          font-weight: 600;
          color: var(--cor-primaria);
          font-size: 0.875rem;
        }

        .total-avaliacoes {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .empresa-descricao {
          color: var(--cor-cinza-escuro);
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }

        .empresa-localizacao {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .icone-localizacao {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .endereco {
          flex: 1;
        }

        .distancia {
          color: var(--cor-primaria);
          font-weight: 500;
        }

        .servicos-destaque {
          margin-top: auto;
        }

        .servicos-lista {
          font-size: 0.875rem;
          color: var(--cor-cinza-escuro);
          line-height: 1.4;
        }

        .servico-tag {
          font-weight: 500;
        }

        .mais-servicos {
          color: var(--cor-cinza-medio);
          font-style: italic;
        }

        .empresa-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-top: 1px solid #f0f0f0;
          background-color: #fafafa;
        }

        .preco-range {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .preco-label {
          font-size: 0.75rem;
          color: var(--cor-cinza-medio);
          text-transform: uppercase;
          font-weight: 500;
        }

        .preco-valor {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--cor-primaria);
        }

        .btn-agendar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
          border: none;
          border-radius: var(--border-radius);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transicao-rapida);
          font-size: 0.875rem;
        }

        .btn-agendar:hover {
          background-color: var(--cor-cinza-escuro);
          transform: translateY(-2px);
        }

        .btn-agendar svg {
          width: 16px;
          height: 16px;
          transition: transform var(--transicao-rapida);
        }

        .btn-agendar:hover svg {
          transform: translateX(2px);
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .empresa-imagem {
            height: 160px;
          }

          .empresa-info {
            padding: 1rem;
            gap: 0.75rem;
          }

          .empresa-nome {
            font-size: 1.125rem;
          }

          .empresa-footer {
            padding: 0.75rem 1rem;
          }

          .btn-agendar {
            padding: 0.625rem 1.25rem;
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  )
}
