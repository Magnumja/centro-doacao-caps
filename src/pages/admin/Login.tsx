import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

import '../../Styles/Login.css'

export default function Login(): React.ReactElement {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setErrorMessage('')
        setIsLoading(true)

        try {
            // envia credenciais ao backend; backend devolve cookie httpOnly
            await api.post('/api/auth/login', { email, password })

            // busca dados do host autenticado
            const host = await api.get('/api/auth/me')

            // salva e redireciona
            localStorage.setItem('loggedHost', JSON.stringify(host))
            navigate('/admin/dashboard')
        } catch (err: any) {
            setErrorMessage(err?.message || 'Erro ao autenticar.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-page">
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

                    <button type="submit" className="login-submit" disabled={isLoading}>
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
