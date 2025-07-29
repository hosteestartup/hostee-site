"use client"

// Página inicial da plataforma Host.ee
// Inclui busca por localização, filtros e lista de empresas próximas

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import EmpresaCard from "@/components/EmpresaCard"
import { buscarEmpresasProximas, obterCategorias } from "@/lib/empresas"
import type { Empresa } from "@/lib/supabase"

interface EmpresaComDistancia extends Empresa {
  distancia?: number
  servicos?: any[]
}

export default function HomePage() {
  const [empresas, setEmpresas] = useState<EmpresaComDistancia[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [carregando, setCarregando] = useState(true)
  const [carregandoBusca, setCarregandoBusca] = useState(false)
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  // Filtros de busca
  const [filtros, setFiltros] = useState({
    categoria: "",
    termo: "",
    raio: 10, // km
  })

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais()
    obterLocalizacaoUsuario()
  }, [])

  // Buscar empresas quando filtros ou localização mudarem
  useEffect(() => {
    if (localizacao) {
      buscarEmpresas()
    }
  }, [filtros, localizacao])

  const carregarDadosIniciais = async () => {
    try {
      // Carregar categorias disponíveis
      const resultadoCategorias = await obterCategorias()
      if (resultadoCategorias.sucesso) {
        setCategorias(resultadoCategorias.categorias)
      }

      // Carregar empresas iniciais (sem localização)
      const resultadoEmpresas = await buscarEmpresasProximas()
      if (resultadoEmpresas.sucesso) {
        setEmpresas(resultadoEmpresas.empresas)
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error)
      setErro("Erro ao carregar dados. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  const obterLocalizacaoUsuario = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacao({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.warn("Erro ao obter localização:", error)
          // Continuar sem localização
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutos
        },
      )
    }
  }

  const buscarEmpresas = async () => {
    setCarregandoBusca(true)
    setErro(null)

    try {
      const parametrosBusca = {
        categoria: filtros.categoria || undefined,
        termo: filtros.termo || undefined,
        latitude: localizacao?.lat,
        longitude: localizacao?.lng,
        raio: filtros.raio,
      }

      const resultado = await buscarEmpresasProximas(parametrosBusca)

      if (resultado.sucesso) {
        setEmpresas(resultado.empresas)
      } else {
        setErro(resultado.erro || "Erro ao buscar empresas")
      }
    } catch (error) {
      console.error("Erro na busca:", error)
      setErro("Erro ao buscar empresas. Tente novamente.")
    } finally {
      setCarregandoBusca(false)
    }
  }

  const handleFiltroChange = (campo: string, valor: string | number) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const limparFiltros = () => {
    setFiltros({
      categoria: "",
      termo: "",
      raio: 10,
    })
  }

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Encontre os melhores serviços
              <span className="destaque"> próximos a você</span>
            </h1>
            <p className="hero-subtitle">
              A Host.ee conecta você aos melhores prestadores de serviços da sua região. Agende com facilidade e tenha
              uma experiência incrível.
            </p>

            {/* Barra de busca principal */}
            <div className="busca-principal">
              <div className="busca-input-group">
                <svg className="busca-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar serviços, empresas..."
                  value={filtros.termo}
                  onChange={(e) => handleFiltroChange("termo", e.target.value)}
                  className="busca-input"
                />
              </div>
              <button className="btn btn-primario busca-btn" onClick={buscarEmpresas} disabled={carregandoBusca}>
                {carregandoBusca ? <div className="loading"></div> : "Buscar"}
              </button>
            </div>

            {/* Status da localização */}
            <div className="localizacao-status">
              {localizacao ? (
                <div className="localizacao-ativa">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>Localização ativada - mostrando empresas próximas</span>
                </div>
              ) : (
                <div className="localizacao-inativa">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>Ative a localização para ver empresas próximas</span>
                  <button onClick={obterLocalizacaoUsuario} className="btn-ativar-localizacao">
                    Ativar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="filtros">
        <div className="container">
          <div className="filtros-content">
            <div className="filtros-grupo">
              {/* Filtro por categoria */}
              <div className="filtro-item">
                <label className="filtro-label">Categoria</label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => handleFiltroChange("categoria", e.target.value)}
                  className="form-select"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por raio */}
              {localizacao && (
                <div className="filtro-item">
                  <label className="filtro-label">Distância: {filtros.raio} km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filtros.raio}
                    onChange={(e) => handleFiltroChange("raio", Number.parseInt(e.target.value))}
                    className="filtro-range"
                  />
                </div>
              )}
            </div>

            <div className="filtros-acoes">
              <button onClick={limparFiltros} className="btn btn-secundario btn-pequeno">
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de empresas */}
      <section className="empresas">
        <div className="container">
          <div className="empresas-header">
            <h2>{localizacao ? "Empresas próximas a você" : "Empresas disponíveis"}</h2>
            <div className="empresas-contador">
              {empresas.length} {empresas.length === 1 ? "empresa encontrada" : "empresas encontradas"}
            </div>
          </div>

          {/* Mensagem de erro */}
          {erro && <div className="mensagem mensagem-erro">{erro}</div>}

          {/* Loading */}
          {(carregando || carregandoBusca) && (
            <div className="empresas-loading">
              <div className="loading-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="empresa-skeleton">
                    <div className="skeleton skeleton-imagem"></div>
                    <div className="skeleton-content">
                      <div className="skeleton skeleton-titulo"></div>
                      <div className="skeleton skeleton-texto"></div>
                      <div className="skeleton skeleton-texto-pequeno"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid de empresas */}
          {!carregando && !carregandoBusca && empresas.length > 0 && (
            <div className="empresas-grid">
              {empresas.map((empresa) => (
                <EmpresaCard key={empresa.id} empresa={empresa} mostrarDistancia={!!localizacao} />
              ))}
            </div>
          )}

          {/* Estado vazio */}
          {!carregando && !carregandoBusca && empresas.length === 0 && (
            <div className="estado-vazio">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <h3>Nenhuma empresa encontrada</h3>
              <p>Tente ajustar os filtros ou expandir a área de busca para encontrar mais opções.</p>
              <button onClick={limparFiltros} className="btn btn-primario">
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background-color: var(--cor-secundaria);
        }

        .hero {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 4rem 0;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: var(--cor-primaria);
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .destaque {
          color: var(--cor-cinza-escuro);
          position: relative;
        }

        .destaque::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--cor-primaria);
          border-radius: 2px;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--cor-cinza-escuro);
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .busca-principal {
          display: flex;
          max-width: 600px;
          margin: 0 auto 2rem;
          gap: 1rem;
          background-color: var(--cor-secundaria);
          padding: 0.5rem;
          border-radius: var(--border-radius-grande);
          box-shadow: var(--sombra-media);
        }

        .busca-input-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .busca-icon {
          position: absolute;
          left: 1rem;
          width: 20px;
          height: 20px;
          color: var(--cor-cinza-medio);
          z-index: 1;
        }

        .busca-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: none;
          border-radius: var(--border-radius);
          font-size: 1rem;
          background-color: transparent;
        }

        .busca-input:focus {
          outline: none;
        }

        .busca-btn {
          padding: 1rem 2rem;
          white-space: nowrap;
          min-width: 120px;
        }

        .localizacao-status {
          display: flex;
          justify-content: center;
        }

        .localizacao-ativa,
        .localizacao-inativa {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius);
          font-size: 0.875rem;
        }

        .localizacao-ativa {
          background-color: rgba(34, 197, 94, 0.1);
          color: var(--cor-sucesso);
        }

        .localizacao-inativa {
          background-color: rgba(156, 163, 175, 0.1);
          color: var(--cor-cinza-medio);
        }

        .localizacao-ativa svg,
        .localizacao-inativa svg {
          width: 16px;
          height: 16px;
        }

        .btn-ativar-localizacao {
          background: none;
          border: 1px solid currentColor;
          color: inherit;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all var(--transicao-rapida);
        }

        .btn-ativar-localizacao:hover {
          background-color: currentColor;
          color: var(--cor-secundaria);
        }

        .filtros {
          padding: 2rem 0;
          background-color: var(--cor-cinza-claro);
          border-bottom: 1px solid #e5e5e5;
        }

        .filtros-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .filtros-grupo {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .filtro-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filtro-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--cor-primaria);
        }

        .filtro-range {
          width: 150px;
          height: 4px;
          border-radius: 2px;
          background: #ddd;
          outline: none;
          cursor: pointer;
        }

        .filtro-range::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--cor-primaria);
          cursor: pointer;
        }

        .filtro-range::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--cor-primaria);
          cursor: pointer;
          border: none;
        }

        .empresas {
          padding: 3rem 0;
        }

        .empresas-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .empresas-header h2 {
          font-size: 2rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin: 0;
        }

        .empresas-contador {
          color: var(--cor-cinza-medio);
          font-size: 0.875rem;
        }

        .empresas-loading {
          margin-bottom: 2rem;
        }

        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .empresa-skeleton {
          background-color: var(--cor-secundaria);
          border-radius: var(--border-radius-grande);
          overflow: hidden;
          box-shadow: var(--sombra-leve);
        }

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        .skeleton-imagem {
          height: 200px;
        }

        .skeleton-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skeleton-titulo {
          height: 24px;
          border-radius: 4px;
        }

        .skeleton-texto {
          height: 16px;
          border-radius: 4px;
        }

        .skeleton-texto-pequeno {
          height: 14px;
          width: 60%;
          border-radius: 4px;
        }

        .empresas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
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
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .hero {
            padding: 2rem 0;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .busca-principal {
            flex-direction: column;
            gap: 0.75rem;
          }

          .filtros-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1.5rem;
          }

          .filtros-grupo {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .empresas-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .empresas-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .loading-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .busca-input {
            padding: 0.875rem 0.875rem 0.875rem 2.5rem;
          }

          .busca-btn {
            padding: 0.875rem 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
