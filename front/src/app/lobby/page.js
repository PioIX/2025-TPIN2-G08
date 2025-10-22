"use client";

import { useState, useEffect, useEffectEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    const [nameInvitation, setNameInvitation] = useState()
    const [userFriends, setFriends] = useState([])
    const [requests, setRequests] = useState(false)
    const [invitationsUser, setInvitationsUser] = useState([])
    const router = useRouter();
    const [showSeguro, setShowSeguro] = useState(false);
    const [Seguro, setSeguro] = useState(false);
    const [advice, setAdvice] = useState(false)
    const [advice2, setAdvice2] = useState(false)
    const [showInconveniente, setShowInconveniente] = useState(false);
    const [inconveniente, setInconveniente] = useState("");
    const [firstRender, setFirstRender] = useState(false)
    const [playInvitation, setPlayInvitation] = useState(false)
    const [fromId, setFromId] = useState(0)
    const [showFriendProfile, setShowFriendProfile] = useState(false);
    const [emailFriend, setEmailFriend] = useState()
    const [nameFriend, setNameFriend] = useState()
    const [medalsFriend, setMedalsFriend] = useState()
    const [photoFriend, setPhotoFriend] = useState()
    const [idFriend, setIdFriend] = useState()


    useEffect(() => {
        setId(localStorage.getItem("idLoggued"));
        setName(localStorage.getItem("name"));
        setMedals(localStorage.getItem("medals"));
        setPhoto(localStorage.getItem("photo"));
        friends()
        setFirstRender(true)
    }, []);

    useEffect(() => {
        if (firstRender) {
            socket.emit('joinRoom', { room: "P" + idLoggued })
        }
    }, [firstRender])
    useEffect(() => {
        if (nameInvitation) {
            setInconveniente(`${nameInvitation} rechazó tu invitación para jugar`)
        }
    }, [nameInvitation])
    useEffect(() => {
        if (!socket) return

        socket.on('solicitudBack', data => {
            if (data.rechazar == false && data.answer == false) {
                let obj = {
                    id_user: data.idLoggued,
                    name: data.name
                }
                setInvitationsUser([...invitationsUser, obj])
            } else if (data.rechazar == true && data.answer == true) {
                setNameInvitation(data.name)
                setAdvice(true)
            } else if (data.rechazar == false && data.answer == true) {
                setNameInvitation(data.name)
                setAdvice2(true)
                friends()
            }
        })

        socket.on('invitacionBack', data => {
            if (data.rechazar == false && data.answer == false) {
                setNameInvitation(data.name)
                setPlayInvitation(true)
                let fromId = data.from
                setFromId(fromId)
            } else if (data.rechazar == true) {
                console.log(data)  
                setNameInvitation(data.name)
                let fromId = data.from
                setFromId(fromId)
                setShowInconveniente(true)
            } else if (data.rechazar == false && data.answer == true) {
                let fromId = data.from
                socket.emit('joinRoom', { room: "G" + idLoggued + fromId })
                router.replace("/game")
                
            }
        })

        socket.on('checkRoom', data => {
            console.log(data)
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

    async function checkInvitation(to) {
        let result = await fetch('http://localhost:4000/checkinvitation', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ from: idLoggued, to: to })
        })
        let response = await result.json()
        if (response.msg == 1) {
            socket.emit('solicitud', { idLoggued: idLoggued, room: "P" + to, name: name, rechazar: false, answer: false })
            setShowInconveniente(true)
            setInconveniente("Invitacion enviada")
            setShowModalNewFriend(false);
        } else {
            setShowInconveniente(true)
            setInconveniente("Ya le has enviado una invitacion a este usuario")
            setShowModalNewFriend(false)
        }
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
            setShowInconveniente(true)
            setInconveniente("Amigo agregado")
            socket.emit('solicitud', { room: "P" + idNewFriend, name: name, rechazar: false, answer: true })
            await friends()
            let rechazar = false
            await deleteInvitations(idNewFriend, rechazar)
            setRequests(false)
        } else {
            console.log(response.msg)
        }
    }

    async function deleteInvitations(fromUser, rechazar) {
        let result = await fetch('http://localhost:4000/deleteinvitations', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idLoggued: idLoggued, from: fromUser })
        })
        let response = await result.json()
        if (response.msg == 1 && rechazar == true) {
            socket.emit('solicitud', { name: name, room: "P" + fromUser, rechazar: true, answer: true })
            setRequests(false)
        }
    }

    async function invitations() {
        let result = await fetch('http://localhost:4000/invitations', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idLoggued: idLoggued })
        })
        let response = await result.json()
        if (response.msg == 1) {
            setInvitationsUser(response.fromUsers)
            setRequests(true)
        }
    }

    async function friendProfile(idFriend) {
        let result = await fetch('http://localhost:4000/friendprofile', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idFriend: idFriend })
        })
        let response = await result.json()
        if (response.msg == 1) {
            setNameFriend(response.friend[0].name)
            setEmailFriend(response.friend[0].email)
            setPhotoFriend(response.friend[0].photo)
            setMedalsFriend(response.friend[0].medals)
            setIdFriend(response.friend[0].id_user)
        }
    }

    function invitar(idFriend) {
        socket.emit('invitacionJugar', { room: "P" + idFriend, name: name, rechazar: false, answer: false, from: idLoggued })
        setShowInconveniente(true)
        setInconveniente("Invitacion enviada")
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
                                <button className="btn confirm" onClick={() => checkInvitation(newFriendId)}>Agregar amigo</button>
                                <button className="btn cancel" onClick={() =>setShowModalNewFriend(false)}>Cerrar</button>
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

            {requests && (
                <div className="requests-modal">
                    {invitationsUser.length > 0 ? (
                        invitationsUser.map(u => (
                            <div key={u.id_user}>
                                Invitación de {u.name}
                                <button className="tilde" onClick={() => { newFriend(u.id_user); setRequests(false) }}>✔</button>
                                <button className="cruz" onClick={() => { let rechazar = true; deleteInvitations(u.id_user, rechazar) }}>✖</button>
                            </div>
                        ))
                    ) : (
                        <p>No hay nuevas invitaciones</p>
                    )}
                    <button className="cerrar-requests" onClick={() => setRequests(false)}>Cerrar</button>
                </div>
            )}

            {/*---------------------------*/}

            {advice &&
                <div className="modal-rechazo-solicitud">
                    <h2 className="mensaje-rechazo-solicitud">{nameInvitation} rechazo tu solicitud de amistad</h2>
                    <button className="boton-rechazo-solicitud" onClick={() => { setRequests(false); setAdvice(false) }}> Cerrar </button>
                </div>}

            {/*---------------------------*/}

            {showSeguro && 
                <div className="modalSeguroMini" onClick={() => setShowSeguro(false)}>
                    <div className="contenidoMini" onClick={(e) => e.stopPropagation()}>
                        <p>¿Cerrar sesión?</p>
                        <div className="botonesMini">
                            <button onClick={() => setSeguro(true)}>Sí</button>
                            <button onClick={() => {
                                setShowSeguro(false)
                                setSeguro(true)
                            }}>No</button>
                        </div>
                    </div>
                </div>
            }
            {advice2 &&
                <div className="modal-acepta-solicitud">
                    <h2 className="mensaje-acepta-solicitud">{nameInvitation} aceptó tu solicitud de amistad</h2>
                    <button className="boton-acepta-solicitud" onClick={() => { setRequests(false); setAdvice2(false) }}> Cerrar </button>
                </div>}

            {/*---------------------------*/}

            {showInconveniente && (
                <div className="cuadroCompleto"
                    onClick={() => {
                        setShowInconveniente(false);
                        setInconveniente("");
                    }}>
                    <div className="inconveniente">
                        <h2>{inconveniente}</h2>
                        <button
                            className="btn cerrar"
                            onClick={() => {
                                setShowInconveniente(false);
                                setInconveniente("");
                            }}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/*---------------------------*/}

            {playInvitation && (
                <div className="modal-play-invitation">
                    <h2 className="titulo-modal">Invitación de partida</h2>
                    <p className="texto-modal">
                        <strong>{nameInvitation}</strong> te invita a jugar una partida de <b>Batalla Naval</b>.
                    </p>

                    <div className="botones-modal">
                        <button
                            className="btn aceptar"
                            onClick={async () => {
                                await socket.emit('invitacionJugar', {
                                    room: "P" + fromId,
                                    name: name,
                                    rechazar: false,
                                    answer: true,
                                    from: idLoggued
                                });
                                await socket.emit('joinRoom', { room: "G" + fromId + idLoggued });
                                setPlayInvitation(false);
                                router.replace("/game");
                            }}
                        >
                            JUGAR
                        </button>

                        <button
                            className="btn rechazar"
                            onClick={() => {
                                socket.emit('invitacionJugar', {
                                    room: "P" + fromId,
                                    name: name,
                                    rechazar: true,
                                    answer: true,
                                    from: idLoggued
                                });
                                setPlayInvitation(false);
                            }}
                        >
                            RECHAZAR
                        </button>
                    </div>
                </div>
            )}


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
                                <img className="logOut" onClick={() => setShowSeguro(true)} src="https://cdn-icons-png.flaticon.com/512/126/126467.png"></img>
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

                                <div className="header-icons">
                                    <div className="add-friend-icon" onClick={usersWithOutRelationWithLoggued}>
                                        +
                                    </div>
                                    <div className="notification-icon" onClick={() => { invitations(); setRequests(true) }}>
                                        🕭
                                    </div>
                                    {invitationsUser.length > 0 && <div className="circulo-notificacion" onClick={() => { invitations(); setRequests(true) }}>🔴</div>}
                                </div>
                                {userFriends.length > 0 ?
                                    <ul>
                                        {userFriends.map(u => {
                                            return (
                                                <li key={u.id_user}>
                                                    <button
                                                        className="friend-button"
                                                        onClick={() => { friendProfile(u.id_user); setShowFriendProfile(true) }}>
                                                        {u.name} - {u.email}
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul> :
                                    <h2 className="centrate">Agrega amigos para poder jugar con ellos</h2>}
                            </div>
                        </div>

                        <div className="right-col">
                            <div className="title-right">BATALLA NAVAL</div>


                            <div className="panel-center">
                                {showFriendProfile ? (

                                    <div className="friend-panel" role="dialog" aria-modal="true">

                                        <div className="profile">
                                            <div className="avatar-wrapper">
                                                <img src={photoFriend} className="avatar" />
                                            </div>
                                            <div className="profile-info">
                                                <div className="username">{nameFriend}</div>

                                                <div className="medals-stack">
                                                    <div className="medal">
                                                        <div className="medal-emoji">🎖️</div>
                                                        <div className="medal-count">{medalsFriend}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>Acá va el historial de partidas</div>
                                        <div className="friend-actions">
                                            <button
                                                className="btn play-friend-btn"
                                                onClick={() => { invitar(idFriend); setShowFriendProfile(false); }}
                                            >
                                                Jugar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="friend-panel welcome">
                                        <h2>Bienvenido!</h2>
                                        <p>Selecciona un amigo para ver su perfil</p>
                                    </div>
                                )}
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
