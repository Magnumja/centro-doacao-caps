import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAdminLogin } from '../../hooks/useAdminLogin'


export default function Login(): React.ReactElement {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const {
        errorMessage,
        isLoading,
        localAuthBypassEnabled,
        directLocalAccess,
        login,
    } = useAdminLogin()

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        await login(email, password)
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
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </fieldset>

                    <fieldset className="form-group">
                        <label htmlFor="password">Senha</label>
                        <div className="password-field">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                            autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                            </button>
                        </div>
                    </fieldset>

                    {errorMessage && (
                        <div className="login-error" role="alert">
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    <button type="submit" className="login-submit" disabled={isLoading}>
                        {isLoading ? 'Autenticando...' : 'Entrar'}
                    </button>

                    {localAuthBypassEnabled && (
                        <button
                            type="button"
                            className="login-submit login-submit--secondary"
                            disabled={isLoading}
                            onClick={directLocalAccess}
                        >
                            Entrar direto no localhost
                        </button>
                    )}

                    <p className="login-help">
                        Esqueceu a senha? Solicite a redefinição à coordenação da rede CAPS.
                    </p>
                </form>
            </div>
        </div>
    )
}
