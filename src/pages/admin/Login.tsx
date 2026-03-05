import {FaUser, FaLock} from 'react-icons/fa'
import { useState } from 'react'

import '../../Styles/Login.css'

export default function Login(): React.ReactElement {
    const[username, setUsername] = useState('')
    const[password, setPassword] = useState('')

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        console.log("teste", username, password)
        console.log("Envio")
    }

    return (
        <div style={{ padding: 24 }}>
                <form className="login-form" onSubmit={handleSubmit}>
                    <h1>Acesse o sistema de Doação do CAPS</h1>
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

                    <button type="submit">Entrar</button>

                    <div className="signup-link">
                        <p>
                            Não tem uma conta? <a href="#">Cadastre-se</a>
                        </p>
                    </div>
                </form>
            </div>
    )
}
