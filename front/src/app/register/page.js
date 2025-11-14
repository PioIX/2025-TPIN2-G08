"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [photo, setPhoto] = useState("")
    const [name, setName] = useState("")
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false)
    const [showInconveniente, setShowInconveniente] = useState(false);
    const [inconveniente, setInconveniente] = useState("");
    const [bueno, setBueno] = useState(false);

    function iniciarSesion() {
        router.replace("/")
    }
    async function newUser(newUser) {
        let result = await fetch('http://localhost:4000/newUser', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUser)
        })
        let response = await result.json()
        return response
    }
    async function objNewUser() {
        if (name == "") {
            setShowInconveniente(true)
            setInconveniente("Debe completar el campo del nombre")
            setBueno(false);
        } else if (email == "") {
            setShowInconveniente(true)
            setInconveniente("Debe completar el campo del email")
            setBueno(false);
        } else if (password == "") {
            setShowInconveniente(true)
            setInconveniente("Debe completar el campo de la contraseña")
            setBueno(false);
        } else {
            let obj = {
                photo: photo,
                name: name,
                email: email,
                password: password
            }
            let response = await newUser(obj)
            if (response.msg == 1) {
                setShowInconveniente(true)
                setInconveniente("Registro exitoso")
                setBueno(true);
                router.replace("/")
            }else if(response.msg == -1){
                setShowInconveniente(true)
                setInconveniente("El email ya está registrado")
                
            } else {
                setShowInconveniente(true)
                setInconveniente("Algo ha ocurrido")
                setBueno(false);
            }
        }
    }

    return (
        <>
            <div className={"container"}>
                <img src="/LogoBN.svg"></img>
                <div className={"form"}>
                    <h2 className={"subTitle"}>Registro</h2>
                    <div className="input-container">
                        <input type="text" className={"input"} placeholder="Mail"
                            onChange={e => setEmail(e.target.value)}/>
                    </div>

                    <div className="input-container">
                        <input type={showPassword ? "text" : "password"} className="input" placeholder="Contraseña"
                            onChange={e => setPassword(e.target.value)}/>
                        <span onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? "🙉" : "🙈"}
                        </span>
                    </div>
                    <div className="input-container">
                        <input type="text" className={"input"} placeholder="Foto de perfil (url)"
                            onChange={e => setPhoto(e.target.value)}/>
                    </div>
                    <div className="input-container">
                        <input type="text" className={"input"} placeholder="Nombre"
                            onChange={e => setName(e.target.value)}/>
                    </div>
                    <div className={"buttons"}>
                        <button className={"button"} type="button" onClick={objNewUser}>
                            Registrarse
                        </button>
                        <a className={"link"} type="button" onClick={iniciarSesion}>
                            Iniciar Sesión
                        </a>
                    </div>
                </div>
            </div>

            {showInconveniente && (
                bueno ? (
                    <div className="cuadroCompleto"
                        onClick={() => {
                            setShowInconveniente(false);
                            setInconveniente("");
                        }}>
                        <div className="conveniente">
                            <h2>{inconveniente}</h2>
                            <button className="btn cerrarBueno"
                                onClick={() => {
                                    setShowInconveniente(false);
                                    setInconveniente("");
                                }}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="cuadroCompleto"
                        onClick={() => {
                            setShowInconveniente(false);
                            setInconveniente("");
                        }}>
                        <div className="inconveniente">
                            <h2>{inconveniente}</h2>
                            <button
                                className="btn cerrarMalo"
                                onClick={() => {
                                    setShowInconveniente(false);
                                    setInconveniente("");
                                }}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                )
            )}
        </>
    )
}
