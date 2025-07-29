"use client"

// Componente de cabeçalho da aplicação
// Inclui navegação, logo e menu do usuário

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { obterUsuarioAtual, fazerLogout } from "@/lib/auth"
import type { Usuario } from "@/lib/supabase"

export default function Header() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)

  // Verificar usuário logado ao carregar componente
  useEffect(() => {
    verificarUsuario()
  }, [])

  const verificarUsuario = async () => {
    try {
      const usuarioAtual = await obterUsuarioAtual()
      setUsuario(usuarioAtual)
    } catch (error) {
      console.error("Erro ao verificar usuário:", error)
    } finally {
      setCarregando(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fazerLogout()
      setUsuario(null)
      setMenuAberto(false)
      // Redirecionar para página inicial
      window.location.href = "/"
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo da Host.ee */}
          <Link href="/" className="logo-link">
            <Image
              src="/logo-hostee.png"
              alt="Host.ee - Engajamento Empresarial"
              width={40}
              height={40}
              className="logo-image"
            />
            <span className="logo-text">Host.ee</span>
          </Link>

          {/* Navegação principal */}
          <nav className="nav-principal">
            <Link href="/" className="nav-link">
              Início
            </Link>
            <Link href="/empresas" className="nav-link">
              Empresas
            </Link>
            {usuario && usuario.tipo === "cliente" && (
              <>
                <Link href="/favoritos" className="nav-link">
                  Favoritos
                </Link>
                <Link href="/meus-agendamentos" className="nav-link">
                  Agendamentos
                </Link>
              </>
            )}
            {usuario && usuario.tipo === "empresa" && (
              <>
                <Link href="/painel-empresa" className="nav-link">
                  Painel
                </Link>
                <Link href="/agendamentos-empresa" className="nav-link">
                  Agendamentos
                </Link>
              </>
            )}
          </nav>

          {/* Menu do usuário */}
          <div className="user-menu">
            {carregando ? (
              <div className="loading"></div>
            ) : usuario ? (
              <div className="user-dropdown">
                <button className="user-button" onClick={() => setMenuAberto(!menuAberto)}>
                  <div className="user-avatar">{usuario.nome.charAt(0).toUpperCase()}</div>
                  <span className="user-name">{usuario.nome}</span>
                  <svg
                    className={`dropdown-icon ${menuAberto ? "rotated" : ""}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>

                {menuAberto && (
                  <div className="dropdown-menu">
                    <Link href="/perfil" className="dropdown-item" onClick={() => setMenuAberto(false)}>
                      Meu Perfil
                    </Link>
                    {usuario.tipo === "empresa" && (
                      <Link
                        href="/configuracoes-empresa"
                        className="dropdown-item"
                        onClick={() => setMenuAberto(false)}
                      >
                        Configurações
                      </Link>
                    )}
                    <button className="dropdown-item logout-button" onClick={handleLogout}>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link href="/login" className="btn btn-secundario btn-pequeno">
                  Entrar
                </Link>
                <Link href="/cadastro" className="btn btn-primario btn-pequeno">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <button className="menu-mobile-toggle" onClick={() => setMenuAberto(!menuAberto)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Menu mobile expandido */}
        {menuAberto && (
          <div className="menu-mobile">
            <Link href="/" className="menu-mobile-item">
              Início
            </Link>
            <Link href="/empresas" className="menu-mobile-item">
              Empresas
            </Link>
            {usuario && usuario.tipo === "cliente" && (
              <>
                <Link href="/favoritos" className="menu-mobile-item">
                  Favoritos
                </Link>
                <Link href="/meus-agendamentos" className="menu-mobile-item">
                  Agendamentos
                </Link>
              </>
            )}
            {usuario && usuario.tipo === "empresa" && (
              <>
                <Link href="/painel-empresa" className="menu-mobile-item">
                  Painel
                </Link>
                <Link href="/agendamentos-empresa" className="menu-mobile-item">
                  Agendamentos
                </Link>
              </>
            )}
            {!usuario && (
              <>
                <Link href="/login" className="menu-mobile-item">
                  Entrar
                </Link>
                <Link href="/cadastro" className="menu-mobile-item">
                  Cadastrar
                </Link>
              </>
            )}
            {usuario && (
              <button className="menu-mobile-item logout-button" onClick={handleLogout}>
                Sair
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .header {
          background-color: var(--cor-secundaria);
          border-bottom: 1px solid #f0f0f0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--sombra-leve);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          min-height: 70px;
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--cor-primaria);
          transition: opacity var(--transicao-rapida);
        }

        .logo-link:hover {
          opacity: 0.8;
        }

        .logo-image {
          border-radius: 8px;
        }

        .nav-principal {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          font-weight: 500;
          color: var(--cor-primaria);
          transition: all var(--transicao-rapida);
          padding: 0.5rem 0;
          position: relative;
        }

        .nav-link:hover {
          color: var(--cor-cinza-escuro);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: var(--cor-primaria);
          transition: width var(--transicao-rapida);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .user-menu {
          position: relative;
        }

        .user-dropdown {
          position: relative;
        }

        .user-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid #e5e5e5;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transicao-rapida);
        }

        .user-button:hover {
          background-color: var(--cor-cinza-claro);
          border-color: var(--cor-primaria);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-name {
          font-weight: 500;
          color: var(--cor-primaria);
        }

        .dropdown-icon {
          transition: transform var(--transicao-rapida);
        }

        .dropdown-icon.rotated {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: var(--cor-secundaria);
          border: 1px solid #e5e5e5;
          border-radius: var(--border-radius);
          box-shadow: var(--sombra-media);
          min-width: 200px;
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          color: var(--cor-primaria);
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          transition: background-color var(--transicao-rapida);
          font-size: 0.875rem;
        }

        .dropdown-item:hover {
          background-color: var(--cor-cinza-claro);
        }

        .logout-button {
          border-top: 1px solid #e5e5e5;
          color: var(--cor-erro);
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .menu-mobile-toggle {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .menu-mobile-toggle span {
          width: 24px;
          height: 2px;
          background-color: var(--cor-primaria);
          transition: all var(--transicao-rapida);
        }

        .menu-mobile {
          display: none;
          flex-direction: column;
          padding: 1rem 0;
          border-top: 1px solid #e5e5e5;
          background-color: var(--cor-secundaria);
        }

        .menu-mobile-item {
          padding: 0.75rem 0;
          color: var(--cor-primaria);
          font-weight: 500;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: color var(--transicao-rapida);
        }

        .menu-mobile-item:hover {
          color: var(--cor-cinza-escuro);
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .nav-principal {
            display: none;
          }

          .user-menu .user-dropdown {
            display: none;
          }

          .user-menu .auth-buttons {
            display: none;
          }

          .menu-mobile-toggle {
            display: flex;
          }

          .menu-mobile {
            display: flex;
          }

          .user-name {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            display: none;
          }

          .header-content {
            padding: 0.75rem 0;
          }
        }
      `}</style>
    </header>
  )
}
