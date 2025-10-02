"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function logIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter();
  function registrarse() {

  }
  function iniciarSesion() {

  }
 return (
    <div className={"container"}>
      <div className={"form"}>
        <h1 className={"title"}>BATALLA NAVAL</h1>
        <input
          type="email"
          className={"input"}
          placeholder="Usuario"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          className={"input"}
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div className={"buttons"}>
          <button className={"button"} type="button" onClick={iniciarSesion}>Iniciar Sesión</button>
          <a className ={"link"} type="button" onClick={registrarse}>Registrarse</a>
        </div>
      </div>
    </div>
  )
}
