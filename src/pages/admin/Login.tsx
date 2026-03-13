import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hosts } from '../../data/mock'

import '../../Styles/Login.css'

export default function Login(): React.ReactElement {
    // Campos controlados do formulário.
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Feedback visual de erro e de carregamento.
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Hook para redirecionar usuário entre rotas.
    const navigate = useNavigate()

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        setErrorMessage('')
        setIsLoading(true)

        // Simula tempo de autenticação para representar chamada de API.
        setTimeout(() => {
            // Procura no mock um host com as credenciais informadas.
            const host = hosts.find(h => h.email === email && h.password === password)

            if (host) {
                // Persistência simples no navegador para manter sessão local.
                localStorage.setItem('loggedHost', JSON.stringify(host))

                // Dashboard é tratado pela rota /admin/* no router.
                navigate('/admin/dashboard')
            } else {
                setErrorMessage('E-mail ou senha inválido.')
            }

            // Finaliza estado de carregamento em qualquer resultado.
            setIsLoading(false)
        }, 600)
    }

    return (
        <div className="login-page">
            {/* Bloco institucional/lateral da tela de login */}
            <div className="login-hero">
                <div className="login-hero__content">
                    <span className="page-kicker">Acesso restrito</span>
                    <h1>Painel de Gestores</h1>
                    <p>
                        Acesso exclusivo para gestores de CAPS. Informe suas credenciais para
                        continuar.
                    </p>
                </div>
            </div>

            {/* Formulário de autenticação */}
            <div className="login-form-wrapper">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Entrar no Sistema</h2>

                    <fieldset className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </fieldset>

                    <fieldset className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </fieldset>

                    {/* Mensagem exibida quando credenciais não conferem */}
                    {errorMessage && (
                        <div className="login-error">
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    <div className="login-remember">
                        <label>
                            <input type="checkbox" disabled={isLoading} />
                            Manter-me conectado
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={isLoading}
                    >
                        {/* O texto do botão muda enquanto o "login" está em andamento */}
                        {isLoading ? 'Autenticando...' : 'Entrar'}
                    </button>

                    <div className="login-help">
                        <p className="login-help__text">
                            Teste com: <strong>teste@caps.br</strong> / <strong>senha123</strong>
                        </p>
                        <a href="#" className="login-help__link">
                            Esqueceu a senha?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    )
}
