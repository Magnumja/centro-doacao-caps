import { FaUser, FaLock } from 'react-icons/fa'
import { useState } from 'react'

import '../../Styles/Login.css'

export default function Login(): React.ReactElement {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        alert("Envando os dados: " + username + " - " + password)
    }

    return (
        <div className="Login" style={{ padding: 24 }}>
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className='login-titulo'>
                        <h1>Sistema de Doação CAPS</h1>
                    </div>
                    <div className="field">
                        <input type="email" placeholder="E-mail"

                            onChange={(e) => setUsername(e.target.value)} />
                        <FaUser className="icon" aria-hidden />
                    </div>
                    <div className="field">
                        <input type="password" placeholder="Senha"
                            onChange={(e) => setPassword(e.target.value)} />
                        <FaLock className="icon" aria-hidden />
                    </div>

                    <div className="recall-forget">
                        <label>
                            <input type="checkbox" />
                            Lembre de mim
                        </label>
                        <a href="#"> Esqueci minha senha</a>

                    </div>
                    <div className="login-button-container">
                        <div className="login-button">
                            <button type="submit">Entrar</button>
                        </div>
                    </div>
                    <div className="signup-link">
                        <p>
                            Não tem uma conta? <a href="#">Cadastre-se</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
