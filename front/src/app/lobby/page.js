"use client";

import { useState, useEffect } from "react";
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
    const [nameInvitation, setNameInvitation] = useState()
    const [userFriends, setFriends] = useState([])
    const [requests, setRequests] = useState(false)
    const [invitationsUser, setInvitationsUser] = useState([])
    const router = useRouter();
    const [showSeguro, setShowSeguro] = useState(false);
    const [advice, setAdvice] = useState(false)
    const [advice2, setAdvice2] = useState(false)
    const [showInconveniente, setShowInconveniente] = useState(false);
    const [inconveniente, setInconveniente] = useState("");
    const [bueno, setBueno] = useState(false);
    const [firstRender, setFirstRender] = useState(false)
    const [playInvitation, setPlayInvitation] = useState(false)
    const [fromId, setFromId] = useState(0)
    const [showFriendProfile, setShowFriendProfile] = useState(false);
    const [nameFriend, setNameFriend] = useState()
    const [medalsFriend, setMedalsFriend] = useState()
    const [photoFriend, setPhotoFriend] = useState()
    const [idFriend, setIdFriend] = useState()
    const [modalEditProfile, setEditProfile] = useState(false)
    const [newName, setNewName] = useState()
    const [newPhoto, setNewPhoto] = useState()
    const [filter, setFilter] = useState("");
    const [record, setRecord] = useState([])


    useEffect(() => {
        setId(localStorage.getItem("idLoggued"));
        user()
        friends()
        setFirstRender(true)
    }, []);

    useEffect(() => {
        if (firstRender) {
            socket.emit('joinRoom', { room: "P" + idLoggued })
        }
    }, [firstRender])

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
                setFromId(data.from)
            } else if (data.rechazar == true) {
                setNameInvitation(data.name)
                let fromId = data.from
                setFromId(fromId)
                setShowInconveniente(true)
                setInconveniente(`${data.name} rechazó tu invitación para jugar`)
                setBueno(false)
            } else if (data.rechazar == false && data.answer == true) {
                data.room.slice(1, 3)
                let id = parseInt(data.from)
                localStorage.setItem("idPlayer", id)
                router.replace("/game")
            }
        })

        socket.on('checkRoom', data => {
            console.log(data)
        })
    }, [socket])

    async function user() {
        const idLoggued = localStorage.getItem("idLoggued")
        let result = await fetch('http://localhost:4000/user', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idLoggued: idLoggued })
        })
        let response = await result.json()
        if (response.msg == 1) {
            setName(response.user.name)
            setPhoto(response.user.photo)
            setMedals(response.user.medals)
        }
    }

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
            setInconveniente("Invitación enviada")
            setShowModalNewFriend(false);
            setFilter("")
            setBueno(true)
        } else {
            setShowInconveniente(true)
            setInconveniente("Ya le has enviado una invitación a este usuario")
            setShowModalNewFriend(false)
            setFilter("")
            setBueno(false)
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
            setBueno(true)
            socket.emit('solicitud', { room: "P" + idNewFriend, name: name, rechazar: false, answer: true })
            await friends()
            let rechazar = false
            await deleteInvitations(idNewFriend, rechazar)
            setRequests(false)
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
            body: JSON.stringify({ idFriend: idFriend, idLoggued: idLoggued })
        })
        let response = await result.json()
        if (response.msg == 1) {
            setNameFriend(response.friend[0].name)
            setPhotoFriend(response.friend[0].photo)
            setMedalsFriend(response.friend[0].medals)
            setIdFriend(response.friend[0].id_user)
            setRecord(response.record)
        }
    }

    function invitar(idFriend) {
        socket.emit('invitacionJugar', { room: "P" + idFriend, name: name, rechazar: false, answer: false, from: idLoggued })
        setInconveniente("Invitación enviada")
        setBueno(true)
        setShowInconveniente(true)
    }

    async function editProfile() {
        if (!newName && !newPhoto) {
            setInconveniente("Complete el campo del nombre o del mail")
            setShowInconveniente(true)
            setBueno(false)
            return -1
        }
        let result = await fetch("http://localhost:4000/editProfile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idLoggued: idLoggued, name: newName, photo: newPhoto })
        })
        let response = await result.json()

        if (response.msg == 1) {
            setName(response.name)
            setPhoto(response.photo)
            setInconveniente("Datos Guardados")
            setShowInconveniente(true)
            setBueno(true)
            setEditProfile(false)
            setNewName()
            setNewPhoto()
        } else if (response.msg == 1.1) {
            setName(response.name)
            setInconveniente("Datos Guardados")
            setShowInconveniente(true)
            setBueno(true)
            setEditProfile(false)
            setNewName()
            setNewPhoto()
        } else if (response.msg == 2) {
            setName(response.name)
            setInconveniente("Datos Guardados")
            setShowInconveniente(true)
            setBueno(true)
            setEditProfile(false)
            setNewName()
            setNewPhoto()
        } else if (response.msg == 3) {
            setPhoto(response.photo)
            setInconveniente("Datos Guardados")
            setShowInconveniente(true)
            setBueno(true)
            setEditProfile(false)
            setNewName()
            setNewPhoto()
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
                                <input type="text" placeholder="Buscar nombre de usuario..." value={filter} onChange={(e) => setFilter(e.target.value)}
                                    className="search-user-input"/>
                                <div className="user-list">
                                    {users .filter(u => u.name.toLowerCase().includes(filter.toLowerCase()))
                                        .map((user) => (
                                            <label key={user.id_user} className="user-itemFriends">
                                                <input type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) setNewFriend(user.id_user);
                                                        else setNewFriend();
                                                    }}/>
                                                <div className="user-info">
                                                    <div className="user-nameFriends">{user.name}</div>
                                                    <div className="user-emailFriends">{user.email}</div>
                                                </div>
                                            </label>
                                        ))}
                                </div>

                                <div className="modal-buttons">
                                    <button className="btn confirm" onClick={() => checkInvitation(newFriendId)}>
                                        Enviar Solicitud
                                    </button>
                                    <button className="btn cancel" onClick={() => {setShowModalNewFriend(false), setFilter("")}}>
                                        Cancelar
                                    </button>
                                </div>
                            </>

                        ) : (
                            <>
                                <h3>No hay usuarios para agregar</h3>
                                <div className="modal-buttons">
                                    <button className="btn cancel" onClick={() => {setShowModalNewFriend(false), setFilter("")}}>
                                        Cerrar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/*---------------------------*/}

            {requests && (
                <div className="notif-overlay" onClick={() => setRequests(false)}>
                    <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="notif-title">Solicitudes de amistad</h2>
                        {invitationsUser.length > 0 ? (
                            <div className="notif-list">
                                {invitationsUser.map(u => (
                                    <div key={u.id_user} className="notif-card">
                                        <div className="notif-info">
                                            <img
                                                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                                                alt="User avatar"
                                                className="notif-avatar"
                                            />
                                            <span className="notif-name">{u.name}</span>
                                        </div>
                                        <div className="notif-actions">
                                            <button
                                                className="notif-btn accept"
                                                onClick={() => { newFriend(u.id_user); setRequests(false); }}>
                                                ✔
                                            </button>
                                            <button
                                                className="notif-btn reject"
                                                onClick={() => { let rechazar = true; deleteInvitations(u.id_user, rechazar); }}>
                                                ✖
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="notif-empty">No hay nuevas invitaciones</p>
                        )}
                        <button className="notif-close" onClick={() => setRequests(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {/*---------------------------*/}

            {advice &&
                <div className="modal-rechazo-solicitud">
                    <h2 className="mensaje-rechazo-solicitud">{nameInvitation} rechazo tu solicitud de amistad</h2>
                    <button className="boton-rechazo-solicitud" onClick={() => { setRequests(false); setAdvice(false) }}> Cerrar </button>
                </div>
            }

            {/*---------------------------*/}

            {showSeguro && (
                <div className="modal-logout" onClick={() => setShowSeguro(false)}>
                    <div className="modal-logout-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Cerrar Sesión</h2>
                        <p>¿Estás seguro?</p>
                        <div className="modal-logout-buttons">
                            <button onClick={() => router.replace("/")}>Sí</button>
                            <button onClick={() => setShowSeguro(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {/*---------------------------*/}

            {advice2 &&
                <div className="modal-acepta-solicitud">
                    <h2 className="mensaje-acepta-solicitud">{nameInvitation} aceptó tu solicitud de amistad</h2>
                    <button className="boton-acepta-solicitud" onClick={() => { setRequests(false); setAdvice2(false) }}> Cerrar </button>
                </div>
            }

            {/*---------------------------*/}

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
                                setPlayInvitation(false);
                                localStorage.setItem("idPlayer", fromId)
                                router.replace("/game")
                            }}>
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
                            }}>
                            RECHAZAR
                        </button>
                    </div>
                </div>
            )}

            {/*---------------------------*/}

            {modalEditProfile && (
                <div className="modal-edit-profile" onClick={() => setEditProfile(false)}>
                    <div className="modal-edit-profile-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Editar perfil</h2>
                        <input
                            placeholder="Nuevo nombre"
                            type="text"
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <input
                            placeholder="URL de nueva foto"
                            type="text"
                            onChange={(e) => setNewPhoto(e.target.value)}
                        />
                        <button onClick={editProfile}>Guardar cambios</button>
                        <button onClick={() => { setNewName(); setNewPhoto(); setEditProfile(false); }}>
                            Cancelar
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
                                <div className="avatar-wrapper" onClick={() => setEditProfile(true)}>
                                    <img src={photo} alt="Avatar" className="avatar" />
                                </div>
                                <img className="logOut" onClick={() => setShowSeguro(true)} src="https://cdn-icons-png.flaticon.com/512/126/126467.png"></img>
                                <div className="profile-info">
                                    <div className="username">{name}</div>
                                    <div className="medal">
                                        <div className="medal-emoji">🎖️</div>
                                        <div className="medal-count">{medals}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="friends">
                                <h3>👥 Amigos</h3>
                                <div className="header-icons">
                                    <div className="add-friend-icon" onClick={usersWithOutRelationWithLoggued}> + </div>
                                    <div className="notification-icon" onClick={() => { invitations(); setRequests(true) }}> 🕭 </div>
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

                            <div className="panel-center">
                                {showFriendProfile ? (
                                    <div className="friend-panel" role="dialog" aria-modal="true">
                                        <div className="profile">
                                            <div className="avatar-wrapper">
                                                <img src={photoFriend} className="avatar" />
                                            </div>
                                            <div className="profile-info">
                                                <div className="username">{nameFriend}</div>
                                                <div className="medal">
                                                    <div className="medal-emoji">🎖️</div>
                                                    <div className="medal-count">{medalsFriend}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="record">
                                            <h3>Historial</h3>
                                            {record.length > 0 ? (
                                                <>
                                                    <div className="stats">
                                                        <p><strong>{name}:</strong> {record.filter(r => r.name === name).length} victorias</p>
                                                        <p><strong>{nameFriend}:</strong> {record.filter(r => r.name === nameFriend).length} victorias</p>
                                                    </div>
                                                    <div className="table">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Fecha</th>
                                                                    <th>Ganador</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {record.map(r => (
                                                                    <tr key={r.id_game}>
                                                                        <td>{r.date}</td>
                                                                        <td>{r.name}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </>
                                            ) : (
                                                <h4>Aún no ha jugado partidas con {nameFriend}</h4>
                                            )}
                                        </div>
                                        <div className="friend-actions">
                                            <button className="btn play-friend-btn"
                                                onClick={() => { invitar(idFriend); setShowFriendProfile(false); }}>
                                                Jugar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="friend-panel welcome">
                                        <img src="/LogoBN.svg" alt="Bienvenido" className="welcome-image"/>
                                        <h2 className="welcome-message">¡Bienvenido {name}!</h2>
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