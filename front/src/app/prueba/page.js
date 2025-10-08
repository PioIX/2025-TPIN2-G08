"use client"

//Importando lo necesario
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSocket } from "@/hooks/useSocket"
import UsersPanel from "@/components/UsersPanel"

export default function Test(){

    //Declarando las variables y hooks
    const router = useRouter()
    const searchParams = useSearchParams()
    const [users, setUsers] = useState([])
    const {socket, isConnected} = useSocket

    useEffect(()=>{
        if (!socket) return
        // Aca entra cada vez que se recibe un evento del socket
    })

    //useEffect para que se ejecute apenas se renderice la pagina
    useEffect(()=>{
        get()
    }, [])

    //Cambia la pagina y pasa por la query el nombre del usuario
    function newRout(name){
        router.push(`/prueba2?name=${name}`)
    }

    //Fetch que trae los usuarios
    async function get(){
        let result = await fetch('http://localhost:4000/users',{
            method: "GET"
        })
        let response = await result.json()
        setUsers(response.users)
    }

    return (
        <>
            {users.length == 0 ? <h1>Cargando datos...</h1>:
            <div>
                <h1> Panel de usuarios </h1>
                <UsersPanel array={users} onClick={e => {newRout(e.target.textContent)}}></UsersPanel>
            </div>}
        </>
    )
}