import React, { useEffect, useState } from 'react'
import { FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useDonorSession } from '../hooks/useDonorSession'
import { getErrorMessage } from '../lib/api'

type Mode = 'entrar' | 'criar'

// Só aceita caminhos internos (evita redirecionar para outro site via ?voltar=).
function safeReturnPath(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/suas-doacoes'
}

export default function DonorAccess(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { donor, isChecking, login, register } = useDonorSession()

  const mode: Mode = searchParams.get('modo') === 'criar' ? 'criar' : 'entrar'
  const returnTo = safeReturnPath(searchParams.get('voltar'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quem já está logado não precisa ver esta tela.
  useEffect(() => {
    if (!isChecking && donor) navigate(returnTo, { replace: true })
  }, [donor, isChecking, navigate, returnTo])

  const switchMode = (next: Mode): void => {
    setErrorMessage('')
    const params = new URLSearchParams(searchParams)
    params.set('modo', next)
    setSearchParams(params, { replace: true })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    if (isSubmitting) return

    if (mode === 'criar' && password.length < 8) {
      setErrorMessage('A senha precisa ter pelo menos 8 caracteres.')
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)
    try {
      if (mode === 'criar') {
        await register({ name: name.trim(), email: email.trim(), password })
      } else {
        await login({ email: email.trim(), password })
      }
      navigate(returnTo, { replace: true })
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Não foi possível entrar agora. Tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCreating = mode === 'criar'

  return (
    <section className="page-block donor-access" aria-labelledby="donor-access-title">
      <div className="donor-access__intro">
        <span className="page-kicker">Conta do doador</span>
        <h1 id="donor-access-title">{isCreating ? 'Crie sua conta de doador' : 'Entre na sua conta'}</h1>
        <p>A conta é opcional: você pode doar sem ela. Com a conta, você ganha:</p>
        <ul className="donor-access__benefits">
          <li><FaCheck aria-hidden="true" /> Histórico das suas últimas doações em qualquer aparelho</li>
          <li><FaCheck aria-hidden="true" /> Nome e e-mail já preenchidos ao doar</li>
          <li><FaCheck aria-hidden="true" /> Doações anônimas continuam anônimas para a unidade</li>
        </ul>
      </div>

      <form className="page-card donor-access__form" onSubmit={handleSubmit} noValidate>
        <div className="donor-access__tabs" role="tablist" aria-label="Entrar ou criar conta">
          <button type="button" role="tab" aria-selected={!isCreating} className={!isCreating ? 'is-active' : ''} onClick={() => switchMode('entrar')}>
            Entrar
          </button>
          <button type="button" role="tab" aria-selected={isCreating} className={isCreating ? 'is-active' : ''} onClick={() => switchMode('criar')}>
            Criar conta
          </button>
        </div>

        {isCreating ? (
          <div className="donor-access__field">
            <label htmlFor="donor-access-name">Seu nome</label>
            <input
              id="donor-access-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
        ) : null}

        <div className="donor-access__field">
          <label htmlFor="donor-access-email">E-mail</label>
          <input
            id="donor-access-email"
            type="email"
            inputMode="email"
            autoComplete={isCreating ? 'email' : 'username'}
            placeholder="nome@exemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="donor-access__field">
          <label htmlFor="donor-access-password">Senha</label>
          <div className="donor-access__password">
            <input
              id="donor-access-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isCreating ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby={isCreating ? 'donor-access-password-hint' : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
            </button>
          </div>
          {isCreating ? <small id="donor-access-password-hint">Mínimo de 8 caracteres.</small> : null}
        </div>

        {errorMessage ? <p className="form-feedback donor-access__error" role="alert">{errorMessage}</p> : null}

        <button type="submit" className="unit-donate-button donor-access__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Aguarde...' : isCreating ? 'Criar conta' : 'Entrar'}
        </button>

        <p className="donor-access__switch">
          {isCreating ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
          <button type="button" onClick={() => switchMode(isCreating ? 'entrar' : 'criar')}>
            {isCreating ? 'Entrar' : 'Criar conta'}
          </button>
        </p>

        <Link className="donor-access__skip" to="/caps">Continuar sem conta e doar</Link>
      </form>
    </section>
  )
}
