"use client"

//Importando todo lo necesario
import { useSearchParams, useRouter } from "next/navigation"
import {useState, useEffect} from "react"
import { useSocket } from "@/hooks/useSocket"
import clsx from "clsx"
import styles from "@/app/prueba2/page.module.css"

export default function prueba2(){

    //Declarando variables y hooks
    const searchParams = useSearchParams()
    const router = useRouter()
    const [name, setName] = useState()
    const {socket, isConnected} = useSocket()

    //useEffect que se ejecuta al primer render y obtiene de la query el nombre del usuario
    useEffect(()=>{
        setName(searchParams.get("name"))
    },[])

    //useEffect con la finalidad de ejecutar los evento socket
    useEffect(()=>{
        if (!socket) return

        socket.on('ping', data =>{
            console.log(data.msg)
        })
    },[socket])
    
    //Cambia a la pagina anterior
    function volver(){
        router.push("/prueba")
    }

    function pingAll(){
        socket.emit('pingAll', {msg: "Hola"})
    }

    return (
        <>
        {/*Dependiendo del nombre cambia el color*/}{name ? <h2 className={clsx(name == "Agustin" ? [styles.agustin]:[styles.iñaki])}>Tu nombre es {name}</h2> : <h2>Cargando...</h2>}
        <button onClick={volver} type="button"> Volver </button>
        <button onClick={pingAll} type="button"> pingAll </button>
        </>
    )
}