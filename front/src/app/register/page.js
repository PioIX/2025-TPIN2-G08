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

    function iniciarSesion() {
        router.push("/")
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
            console.log("Debe completar el campo del nombre");
            setShowInconveniente(true)
            setInconveniente("Debe completar el campo del nombre")
        } else if (email == "") {
            console.log("Debe completar el campo del email");
            setShowInconveniente(true)
            setInconveniente("Debe completar el campo del email")
        } else if (password == "") {
            console.log("Debe completar el campo de la contraseña");
            setShowInconveniente(true)
            setInconveniente("Debe completar el campo de la contraseña")
        } else {
            let obj = {
                photo: photo,
                name: name,
                email: email,
                password: password
            }
            let response = await newUser(obj)
            if (response.msg == 1) {
                //alert("Registro exitoso")
                console.log("Registro exitoso");
                setShowInconveniente(true)
                setInconveniente("Registro exitoso")
                router.push("/")
            } else {
                //alert("Algo ha ocurrido")
                console.log("Algo ha ocurrido");
                setShowInconveniente(true)
                setInconveniente("Algo ha ocurrido")
            }
        }

    }

    return (
        <>
            <div className={"container"}>
                <img src="/LogoBN.svg"></img>
                <div className={"form"}>
                    <h2 className={"subTitle"}>Registro</h2>
                    <input
                        type="text"
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
                            {showPassword ? "🙉" : "🙈"}
                        </span>
                    </div>
                    <input
                        type="text"
                        className={"input"}
                        placeholder="Foto de perfil (url)"
                        onChange={e => setPhoto(e.target.value)}
                    />
                    <input
                        type="text"
                        className={"input"}
                        placeholder="Nombre"
                        onChange={e => setName(e.target.value)}
                    />
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
                <div
                    className="cuadroCompleto"
                    onClick={() => {
                        setShowInconveniente(false);
                        setInconveniente("");
                    }}
                >
                    <div
                        className="inconveniente"
                        onClick={(e) => e.stopPropagation()} // evita cerrar si clicás dentro
                    >
                        <h2>{inconveniente}</h2>
                        <button
                            className="btn cerrar"
                            onClick={() => {
                                setShowInconveniente(false);
                                setInconveniente("");
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </>
    )

}
