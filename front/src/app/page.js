"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function logIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [showAdminOption, setShowAdminOption] = useState(false)
  const [showAdministracion, setShowAdministracion] = useState(false)


  async function login(dataUser) {
    let result = await fetch('http://localhost:4000/verifyUser', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataUser)
    })
    let response = await result.json()
    return response
  }

  async function objLogin() {
    console.log("Entre en la funcion")
    let obj = {
      email: email,
      password: password
    }
    let response = await login(obj)
    console.log(response)
    localStorage.setItem("idLoggued", response.user[0].id_user)
      if (response.msg == 1) {
      //if(response.user.admin == true){
      setShowAdminOption(true)
      //}else{
      // router.push("/lobby")
      //}
        
      console.log("Login exitoso")
    } else if (response.msg == -1) {
      alert("El email ingresado no es valido")
    } else if (response.msg == -2) {
      alert("La contraseña ingresada no es valida")
    }
  }
  return (
    <>

      {/* ACA VAN TODOS LOS MODAL */}
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}

      {showAdminOption && <div className="modalAdministracion">
        <div className="modalAdmin">
          <h2>¡Bienvenido!</h2>
          <button className="btn jugar" onClick={() => router.push("/lobby")}>
            Jugar
          </button>
          <button className="btn admin" onClick={() => (setShowAdminOption(false), setShowAdministracion(true))}>
            Administrar
          </button>
        </div>
      </div>}

      {/* ------------------------*/}

      {showAdministracion && <div className="modalAdministracion">
        <div className="modalAdmin">
          <h2>Elige el usuario que quiera eliminar</h2>
          <button className="btn jugar" onClick={() => (setShowAdministracion(false))}>
            Aceptar
          </button>
          <button className="btn admin" onClick={() => setShowAdministracion(false)}>
            Cerrar
          </button>
        </div>
      </div>}

      {/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ACA VAN TODOS LOS MODAL */}




      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}

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
            <a className={"link"} type="button" onClick={() => router.push("/register")}>Registrarse</a>
          </div>
        </div>
      </div>

      {/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ACA VA LA PAGINA PRINCIPAL */}
    </>
  )
}
