"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function logIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter();

  function logIn(){
    
  }
  return (
    <>
      <div>
        <input type="text" placeholder="Mail" onChange={e => setEmail(e.target.value)}></input>
        <input type="password" placeholder="Contraseña" onChange={e => setPassword(e.target.value)}></input>
        <button type="button" onClick={logIn}>Iniciar Sesion</button>
        <button type="button" onClick={register}>Registrarse</button>
      </div>
    </>
  )
}
