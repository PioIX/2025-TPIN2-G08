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



socket.on("pingAll", (data) =>{
    console.log(data)
})

socket.emit("pingAll", {msg: "Hola a todos"})

export default function ChatRoom() {
  const { socket } = useSocket();
  const searchParams = useSearchParams();
  const room = searchParams.get("room");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Al montar, unirse a la sala y escuchar nuevos mensajes
  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", { room });

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

  }, [socket, room]);

  // Función para enviar mensajes
  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("sendMessage", { message });
      setMessage("");
    }
  };

  return (
    <>
      <div>
        <h2>Sala: {room}</h2>
        <div>
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribí un mensaje"
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </>
  );
}