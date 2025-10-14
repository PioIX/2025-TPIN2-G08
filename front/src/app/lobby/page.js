"use client";

import { useState, useEffect, useEffectEvent } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function Lobby() {
    const [idLoggued, setId] = useState(0);
    const [name, setName] = useState("");
    const [medals, setMedals] = useState(0);
    const [photo, setPhoto] = useState("https://static.vecteezy.com/system/resources/thumbnails/042/600/457/small_2x/loading-circles-flat-style-modern-preloaders-png.png");
    const [users, setUsers] = useState([]);
    const [showModalNewFriend, setShowModalNewFriend] = useState(false);
    const [newFriendId, setNewFriend] = useState(0);
    const { socket, isConnected } = useSocket()
    const [invitation, setInvitation] = useState(false)
    const [nameInvitation, setNameInvitation] = useState()
    const [otherId, setOtherId] = useState(0)
    const [rejectInvitation, setRejectInvitation] = useState(false)
    const [aceptInvitation, setAceptInvitation] = useState(false)
    const [userFriends, setFriends] = useState([])
    const [requests, setRequests] = useState(false)

    useEffect(() => {
        setId(localStorage.getItem("idLoggued"));
        setName(localStorage.getItem("name"));
        setMedals(localStorage.getItem("medals"));
        setPhoto(localStorage.getItem("photo"));
        friends()
    }, []);

    useEffect(() => {
        if (!socket) return

        socket.on('solicitud', data => {
            if (data.idLoggued == idLoggued) return
            if (data.idFriend == idLoggued && data.rechazar == false && data.answer == false) {
                setInvitation(true)
                setNameInvitation(data.name)
                setOtherId(data.idLoggued)
            } else if (data.idFriend != idLoggued && data.rechazar == true && data.answer == true) {
                setRejectInvitation(true)
                setNameInvitation(data.name)
            } else if (data.idFriend != idLoggued && data.rechazar == false && data.answer == true) {
                setAceptInvitation(true)
                setNameInvitation(data.name)
            }
        })
    }, [socket])

    async function friends() {
        const idLoggued = localStorage.getItem("idLoggued")
        let result = await fetch('http://localhost:4000/friends', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idLoggued: idLoggued })
        })
        let response = await result.json()
        if (response.msg == 1) {
            setFriends(response.userFriends)
        }
    }

    async function usersWithOutRelationWithLoggued() {
        let result = await fetch("http://localhost:4000/usersFriends", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ idLoggued: idLoggued }),
        });
        let response = await result.json();
        if (response.msg == 1) {
            setShowModalNewFriend(true)
            setUsers(response.usersWithOutRelation);
        }
    }

    function emitInvitation(idNewFriend) {
        socket.emit('solicitud', { idLoggued: idLoggued, idFriend: idNewFriend, name: name, rechazar: false, answer: false })
        alert("Invitacion enviada")
        setShowModalNewFriend(false);
    }

    function deleteInvitation() {
        socket.emit('solicitud', { rechazar: true, name: name, idFriend: idLoggued, answer: true })
        setInvitation(false)
    }

    async function newFriend(idNewFriend) {
        const idLoggued = localStorage.getItem("idLoggued")
        let result = await fetch("http://localhost:4000/newFriend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ idLoggued: idLoggued, idFriend: idNewFriend }),
        });
        let response = await result.json();
        if (response.msg == 1) {
            alert("Amigo agregado");
            setInvitation(false)
            socket.emit('solicitud', { rechazar: false, idFriend: idLoggued, answer: true, name: name })
            await friends()
        } else {
            console.log(response.msg)
        }
    }

    return (
        <>
            {/* ACA VAN TODOS LOS MODAL */}
            {/* ACA VAN TODOS LOS MODAL */}
            {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}

            {showModalNewFriend && (
                <div className="modal-overlay">
                    <div className="modal-new-friend">
                        {users.length > 0 ? (
                            <>
                                <h2>Enviar solicitud de amistad</h2>
                                <div className="user-list">
                                    {users.map((user) => (
                                        <label key={user.id_user} className="user-item">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewFriend(user.id_user);
                                                    } else {
                                                        setNewFriend();
                                                    }
                                                }}
                                            />
                                            <div>
                                                <div className="user-name">{user.name}</div>
                                                <div className="user-email">{user.email}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button className="btn confirm" onClick={() => emitInvitation(newFriendId)}>Agregar amigo</button>
                                <button className="btn cancel" onClick={() => setShowModalNewFriend(false)}>Cerrar</button>
                            </>
                        ) : (
                            <>
                                <h3>No hay usuarios para agregar</h3>
                                <button className="btn cancel" onClick={() => setShowModalNewFriend(false)}>Cerrar</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/*---------------------------*/}

            {requests &&
                <div>
                    {invitation &&
                        <div>
                            <h2>Invitacion recibida de {nameInvitation}</h2>
                            <button onClick={() => { newFriend(otherId) }}>Aceptar</button>
                            <button onClick={deleteInvitation}>Rechazar</button>
                        </div>}
                    {rejectInvitation &&
                        <div>
                            <h2>Invitacion rechazada de {nameInvitation}</h2>
                            <button onClick={() => setRejectInvitation(false)}> OK </button>
                        </div>}
                    {aceptInvitation &&
                        <div>
                            <h2>Invitacion aceptada de {nameInvitation}</h2>
                            <button onClick={() => { setAceptInvitation(false); friends() }}> OK </button>
                        </div>}
                </div>
            }

            
            {/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
            {/* ACA VAN TODOS LOS MODAL */}
            {/* ACA VAN TODOS LOS MODAL */}

            {/* ACA VA LA PAGINA PRINCIPAL */}
            {/* ACA VA LA PAGINA PRINCIPAL */}
            {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}
            <div className="lobby">
                <div className="overlay" />

                <div className="lobby-box">
                    <div className="box-grid">
                        <div className="left-col">
                            <div className="profile">
                                <div className="avatar-wrapper">
                                    <img src={photo} alt="Avatar" className="avatar" />
                                </div>
                                <div className="profile-info">
                                    <div className="username">{name}</div>

                                    <div className="medals-stack">
                                        <div className="medal">
                                            <div className="medal-emoji">🎖️</div>
                                            <div className="medal-count">{medals}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="friends">
                                <h3>👥 Amigos</h3>

                                <div className="add-friend-icon" onClick={usersWithOutRelationWithLoggued}>
                                    +
                                </div>

                                {userFriends.length > 0 ?
                                    <li>
                                        {userFriends.map(u => {
                                            return <ul key={u.id_user}>{u.name} - {u.email}</ul>
                                        })}
                                    </li> :

                                    <h2 className="centrate">Agrega amigos para poder jugar con ellos</h2>}
                                <button onClick={() => setRequests(true)}>Solicitudes</button>
                            </div>
                        </div>

                        <div className="right-col">
                            <div className="title-right">BATALLA NAVAL</div>

                            <div className="board">
                                <img
                                    src="https://www.shutterstock.com/image-vector/sea-battle-board-game-vector-600nw-1672369615.jpg"
                                    alt="Tablero Batalla Naval"
                                />
                            </div>

                            <div className="play-area">
                                <button className="play-btn">¡Jugar!</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
            {/* ACA VA LA PAGINA PRINCIPAL */}
            {/* ACA VA LA PAGINA PRINCIPAL */}
        </>
    );
}
