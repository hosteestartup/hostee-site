"use client"

import type React from "react"

// Página de login para clientes e empresas
// Inclui validação de formulário e redirecionamento baseado no tipo de usuário

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { fazerLogin } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpar erro quando usuário começar a digitar
    if (erro) setErro(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro(null)

    // Validação básica
    if (!formData.email || !formData.senha) {
      setErro("Por favor, preencha todos os campos")
      setCarregando(false)
      return
    }

    try {
      const resultado = await fazerLogin(formData)

      if (resultado.sucesso && resultado.usuario) {
        // Redirecionar baseado no tipo de usuário
        if (resultado.usuario.tipo === "empresa") {
          router.push("/painel-empresa")
        } else {
          router.push("/")
        }
      } else {
        setErro(resultado.erro || "Erro no login")
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setErro("Erro inesperado. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-page">
      <Header />

      <main className="login-main">
        <div className="container-pequeno">
          <div className="login-card">
            <div className="login-header">
              <h1>Entrar na Host.ee</h1>
              <p>Acesse sua conta para continuar</p>
            </div>

            {/* Mensagem de erro */}
            {erro && <div className="mensagem mensagem-erro">{erro}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha" className="form-label">
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Sua senha"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primario btn-grande" disabled={carregando}>
                {carregando ? <div className="loading"></div> : "Entrar"}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="link-destaque">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>

            {/* Contas de demonstração */}
            <div className="demo-accounts">
              <h3>Contas de Demonstração</h3>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="btn btn-secundario btn-pequeno"
                  onClick={() => {
                    setFormData({ email: "cliente1@email.com", senha: "123456" })
                  }}
                >
                  Cliente Demo
                </button>
                <button
                  type="button"
                  className="btn btn-secundario btn-pequeno"
                  onClick={() => {
                    setFormData({ email: "empresa1@email.com", senha: "123456" })
                  }}
                >
                  Empresa Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .login-main {
          padding: 4rem 0;
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
        }

        .login-card {
          background-color: var(--cor-secundaria);
          border-radius: var(--border-radius-grande);
          box-shadow: var(--sombra-media);
          padding: 3rem;
          max-width: 400px;
          margin: 0 auto;
          animation: slideUp 0.5s ease-out;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: var(--cor-cinza-medio);
          font-size: 1rem;
          margin: 0;
        }

        .login-form {
          margin-bottom: 2rem;
        }

        .login-footer {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #f0f0f0;
        }

        .link-destaque {
          color: var(--cor-primaria);
          font-weight: 500;
          text-decoration: underline;
        }

        .link-destaque:hover {
          opacity: 0.8;
        }

        .demo-accounts {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #f0f0f0;
          text-align: center;
        }

        .demo-accounts h3 {
          font-size: 1rem;
          color: var(--cor-cinza-escuro);
          margin-bottom: 1rem;
        }

        .demo-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .login-main {
            padding: 2rem 0;
          }

          .login-card {
            padding: 2rem;
            margin: 0 1rem;
          }

          .demo-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
