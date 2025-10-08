"use client"

import { useSearchParams, useRouter } from "next/navigation"
import {useState, useEffect} from "react"
import { useSocket } from "@/hooks/useSocket"

export default function prueba2(){

    const searchParams = useSearchParams()
    const router = useRouter()
    const [name, setName] = useState()
    const {socket, isConnected} = useSocket()

    useEffect(()=>{
        setName(searchParams.get("name"))
    },[])

    useEffect(()=>{
        if (!socket) return

        socket.on('ping', data =>{
            console.log(data.msg)
        })
    },[socket])

    function volver(){
        router.push("/prueba")
    }

    function pingAll(){
        socket.emit('pingAll', {msg: "Hola"})
    }

    return (
        <>
        {name ? <h2>Tu nombre es {name}</h2> : <h2>Algo fallo</h2>}
        <button onClick={volver} type="button"> Volver </button>
        <button onClick={pingAll} type="button"> pingAll </button>
        </>
    )
}