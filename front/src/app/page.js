"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function logIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)

  function register() {
    router.push("/register")
  }

  async function login(dataUser) {
    let result = await fetch('http://localhost:4000/verifyUser',{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataUser)
    })
    let response = await result.json()
    return response
  }

  async function objLogin(){
    console.log("Entre en la funcion")
    let obj = {
      email: email,
      password: password
    }
    let response = await login(obj)
    console.log(response)
    if (response.msg == 1){
      //falta un if para ver si es admin if(response.user.admin = true){}else...
      router.push("/lobby")
      console.log("Login exitoso")
    } else if(response.msg == -1){
      alert("El email ingresado no es valido")
    } else if(response.msg == -2){
      alert("La contraseña ingresada no es valida")
    }
  }
  return (
    <div className={"container"}>
      <div className={"form"}>
        <h1 className={"title"}>BATALLA NAVAL</h1>
        <h2 className={"subTitle"}>Iniciar Sesión</h2>
        <input
          type="email"
          className={"input"}
          placeholder="Mail"
          onChange={e => setEmail(e.target.value)}
        />
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            className="input"
            placeholder="Contraseña"
            onChange={e => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "💥" : "🛥️"}
          </span>
        </div>
        <div className={"buttons"}>
          <button className={"button"} type="button" onClick={objLogin}>Iniciar Sesión</button>
          <a className={"link"} type="button" onClick={register}>Registrarse</a>
        </div>
      </div>
    </div>
  )
}
