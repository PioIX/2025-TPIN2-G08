"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [photo, setPhoto] = useState("")
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false)
    function iniciarSesion() {
        router.push("/")
    }
    function registrarse() {

    }
    return (
        <div className={"container"}>
            <div className={"form"}>
                <h1 className={"title"}>BATALLA NAVAL</h1>
                <h2 className={"subTitle"}>Registro</h2>
                <input
                    type="email"
                    className={"input"}
                    placeholder="Usuario"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <div className="password-container">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="input"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <span onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "💥" : "🛥️"}
                    </span>
                </div>
                <input
                    type="photo"
                    className={"input"}
                    placeholder="Foto de perfil (url)"
                    value={photo}
                    onChange={e => setPhoto(e.target.value)}
                />
                <div className={"buttons"}>
                    <button className={"button"} type="button" onClick={registrarse}>Registrarse</button>
                    <a className={"link"} type="button" onClick={iniciarSesion}>Iniciar Sesión</a>
                </div>
            </div>
        </div>
    )
}
