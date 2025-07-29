"use client"

import type React from "react"

// Página de cadastro para novos usuários (clientes e empresas)
// Inclui validação completa e criação de perfil de empresa

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { cadastrarUsuario } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function CadastroPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState(1) // 1: dados básicos, 2: dados da empresa (se aplicável)
  const [formData, setFormData] = useState({
    // Dados básicos
    email: "",
    senha: "",
    confirmarSenha: "",
    nome: "",
    telefone: "",
    tipo: "cliente" as "cliente" | "empresa",
    // Dados da empresa (se tipo === 'empresa')
    nomeEmpresa: "",
    descricao: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    categoria: "",
  })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const categorias = [
    "Beleza",
    "Saúde",
    "Automotivo",
    "Casa e Jardim",
    "Tecnologia",
    "Educação",
    "Alimentação",
    "Esportes",
    "Outros",
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpar erro quando usuário começar a digitar
    if (erro) setErro(null)
  }

  const validarEtapa1 = () => {
    if (!formData.email || !formData.senha || !formData.confirmarSenha || !formData.nome) {
      setErro("Por favor, preencha todos os campos obrigatórios")
      return false
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem")
      return false
    }

    if (formData.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErro("Por favor, insira um e-mail válido")
      return false
    }

    return true
  }

  const validarEtapa2 = () => {
    if (!formData.nomeEmpresa || !formData.endereco || !formData.cidade || !formData.estado || !formData.categoria) {
      setErro("Por favor, preencha todos os campos obrigatórios da empresa")
      return false
    }
    return true
  }

  const handleProximaEtapa = () => {
    if (validarEtapa1()) {
      if (formData.tipo === "empresa") {
        setEtapa(2)
      } else {
        handleSubmit()
      }
    }
  }

  const handleSubmit = async () => {
    setCarregando(true)
    setErro(null)

    try {
      // Validar etapa atual
      if (etapa === 1 && !validarEtapa1()) {
        setCarregando(false)
        return
      }

      if (etapa === 2 && !validarEtapa2()) {
        setCarregando(false)
        return
      }

      // Cadastrar usuário
      const resultado = await cadastrarUsuario({
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        telefone: formData.telefone,
        tipo: formData.tipo,
      })

      if (resultado.sucesso && resultado.usuario) {
        // Se for empresa, criar perfil da empresa
        if (formData.tipo === "empresa") {
          const { error: empresaError } = await supabase.from("empresas").insert([
            {
              usuario_id: resultado.usuario.id,
              nome_empresa: formData.nomeEmpresa,
              descricao: formData.descricao,
              endereco: formData.endereco,
              cidade: formData.cidade,
              estado: formData.estado,
              cep: formData.cep,
              categoria: formData.categoria,
              horario_funcionamento: {
                segunda: "08:00-18:00",
                terca: "08:00-18:00",
                quarta: "08:00-18:00",
                quinta: "08:00-18:00",
                sexta: "08:00-18:00",
                sabado: "08:00-17:00",
                domingo: "fechado",
              },
            },
          ])

          if (empresaError) {
            console.error("Erro ao criar perfil da empresa:", empresaError)
            setErro("Usuário criado, mas houve erro ao criar perfil da empresa")
            setCarregando(false)
            return
          }
        }

        // Redirecionar para login com sucesso
        router.push("/login?cadastro=sucesso")
      } else {
        setErro(resultado.erro || "Erro no cadastro")
      }
    } catch (error) {
      console.error("Erro no cadastro:", error)
      setErro("Erro inesperado. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="cadastro-page">
      <Header />

      <main className="cadastro-main">
        <div className="container-pequeno">
          <div className="cadastro-card">
            <div className="cadastro-header">
              <h1>Criar Conta na Host.ee</h1>
              <p>{etapa === 1 ? "Preencha seus dados para começar" : "Complete as informações da sua empresa"}</p>

              {/* Indicador de etapas */}
              {formData.tipo === "empresa" && (
                <div className="etapas-indicador">
                  <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
                    <span className="etapa-numero">1</span>
                    <span className="etapa-texto">Dados Pessoais</span>
                  </div>
                  <div className="etapa-linha"></div>
                  <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
                    <span className="etapa-numero">2</span>
                    <span className="etapa-texto">Dados da Empresa</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mensagem de erro */}
            {erro && <div className="mensagem mensagem-erro">{erro}</div>}

            {/* Etapa 1: Dados básicos */}
            {etapa === 1 && (
              <form className="cadastro-form">
                <div className="form-group">
                  <label htmlFor="tipo" className="form-label">
                    Tipo de Conta *
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="empresa">Empresa</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="nome" className="form-label">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    E-mail *
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
                  <label htmlFor="telefone" className="form-label">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="senha" className="form-label">
                    Senha *
                  </label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmarSenha" className="form-label">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleProximaEtapa}
                  className="btn btn-primario btn-grande"
                  disabled={carregando}
                >
                  {carregando ? (
                    <div className="loading"></div>
                  ) : formData.tipo === "empresa" ? (
                    "Próxima Etapa"
                  ) : (
                    "Criar Conta"
                  )}
                </button>
              </form>
            )}

            {/* Etapa 2: Dados da empresa */}
            {etapa === 2 && (
              <form className="cadastro-form">
                <div className="form-group">
                  <label htmlFor="nomeEmpresa" className="form-label">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    id="nomeEmpresa"
                    name="nomeEmpresa"
                    value={formData.nomeEmpresa}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Nome da sua empresa"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="categoria" className="form-label">
                    Categoria *
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="descricao" className="form-label">
                    Descrição da Empresa
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Descreva sua empresa e serviços..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endereco" className="form-label">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Rua, número, bairro"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cidade" className="form-label">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Cidade"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="estado" className="form-label">
                      Estado *
                    </label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cep" className="form-label">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setEtapa(1)}
                    className="btn btn-secundario"
                    disabled={carregando}
                  >
                    Voltar
                  </button>
                  <button type="button" onClick={handleSubmit} className="btn btn-primario" disabled={carregando}>
                    {carregando ? <div className="loading"></div> : "Criar Conta"}
                  </button>
                </div>
              </form>
            )}

            <div className="cadastro-footer">
              <p>
                Já tem uma conta?{" "}
                <Link href="/login" className="link-destaque">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .cadastro-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .cadastro-main {
          padding: 4rem 0;
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
        }

        .cadastro-card {
          background-color: var(--cor-secundaria);
          border-radius: var(--border-radius-grande);
          box-shadow: var(--sombra-media);
          padding: 3rem;
          max-width: 500px;
          margin: 0 auto;
          animation: slideUp 0.5s ease-out;
        }

        .cadastro-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .cadastro-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: var(--cor-primaria);
          margin-bottom: 0.5rem;
        }

        .cadastro-header p {
          color: var(--cor-cinza-medio);
          font-size: 1rem;
          margin-bottom: 2rem;
        }

        .etapas-indicador {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .etapa {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .etapa-numero {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #e5e5e5;
          color: var(--cor-cinza-medio);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all var(--transicao-rapida);
        }

        .etapa.ativa .etapa-numero {
          background-color: var(--cor-primaria);
          color: var(--cor-secundaria);
        }

        .etapa-texto {
          font-size: 0.75rem;
          color: var(--cor-cinza-medio);
          font-weight: 500;
        }

        .etapa.ativa .etapa-texto {
          color: var(--cor-primaria);
        }

        .etapa-linha {
          width: 60px;
          height: 2px;
          background-color: #e5e5e5;
          margin: 0 1rem;
        }

        .cadastro-form {
          margin-bottom: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
        }

        .form-actions .btn {
          flex: 1;
        }

        .cadastro-footer {
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

        /* Responsividade */
        @media (max-width: 768px) {
          .cadastro-main {
            padding: 2rem 0;
          }

          .cadastro-card {
            padding: 2rem;
            margin: 0 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .etapas-indicador {
            flex-direction: column;
            gap: 1rem;
          }

          .etapa-linha {
            width: 2px;
            height: 30px;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}
