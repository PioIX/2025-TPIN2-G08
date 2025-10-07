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
    async function objNewUser(){
        if(name == ""){
            alert("Debe completar el campo del nombre")
            return -1
        } else if(email == ""){
            alert("Debe completar el campo del email")
            return -1
        } else if(password == ""){
            alert("Debe completar el campo de la contraseña")
            return -1
        }
        let obj = {
            photo: photo,
            name: name,
            email: email,
            password: password
        }
        let response = await newUser(obj)
        if (response.msg == 1){
            alert("Registro exitoso")
            router.push("/")
        } else {
            alert("Algo ocurrio")
        }
    }

    return (
        <div className={"container"}>
            <div className={"form"}>
                <h1 className={"title"}>BATALLA NAVAL</h1>
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
                        {showPassword ? "💥" : "🛥️"}
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
                    <button className={"button"} type="button" onClick={objNewUser}>Registrarse</button>
                    <a className={"link"} type="button" onClick={iniciarSesion}>Iniciar Sesión</a>
                </div>
            </div>
        </div>
    )
}
