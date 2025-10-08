"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSocket } from "@/hooks/useSocket"
import Form from "@/components/Form"

export default function Test(){

    const router = useRouter()
    const [users, setUsers] = useState()
    const [checkLogin, setLogin] = useState(false)
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const [name, setName] = useState()
    const {socket, isConnected} = useSocket()

    useEffect(()=>{
        if (!socket) return

        socket.on('ping', data =>{
            console.log(data.msg)
        })
    }, [socket])

    async function login(){
        let obj = {
            email: email,
            password: password
        }
        let result = await fetch('http://localhost:4000/verifyUser',{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        })
        let response = await result.json()
        if (response.msg == 1){
            alert("Login exitoso")
            router.push(`/prueba2?name=${response.user[0].name}`)
            setUsers(response.user[0])
            setLogin(true)
        } else {
            alert("Email o contraseña incorrectos")
        }
    }

    function pingAll(){
        socket.emit('pingAll', {msg: "Hola"})
    }

    return (
        <>
            {checkLogin == false &&
            <Form 
            onClick={login} 
            text={"Inicar Sesion"} 
            onChange={e => setEmail(e.target.value)} 
            placeholder={"Email"}
            onChange2={e => setPassword(e.target.value)}
            placeholder2={"Password"}></Form>}
        </>
    )
}