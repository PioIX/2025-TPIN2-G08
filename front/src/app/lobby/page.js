"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function Lobby() {
    const [idLoggued, setId] = useState(0);
    const [name, setName] = useState("");
    const [medals, setMedals] = useState(0);
    const [photo, setPhoto] = useState(
        "https://static.vecteezy.com/system/resources/thumbnails/042/600/457/small_2x/loading-circles-flat-style-modern-preloaders-png.png"
    );
    const [users, setUsers] = useState([]);
    const [newFriendId, setNewFriend] = useState(0);
    const { socket } = useSocket();
    const [nameInvitation, setNameInvitation] = useState();
    const [userFriends, setFriends] = useState([]);
    const [requests, setRequests] = useState(false);
    const [invitationsUser, setInvitationsUser] = useState([]);
    const router = useRouter();
    const [showSeguro, setShowSeguro] = useState(false);
    const [advice, setAdvice] = useState(false);
    const [advice2, setAdvice2] = useState(false);
    const [showInconveniente, setShowInconveniente] = useState(false);
    const [inconveniente, setInconveniente] = useState("");
    const [bueno, setBueno] = useState(false);
    const [firstRender, setFirstRender] = useState(false);
    const [playInvitation, setPlayInvitation] = useState(false);
    const [fromId, setFromId] = useState(0);
    const [showFriendProfile, setShowFriendProfile] = useState(false);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [nameFriend, setNameFriend] = useState();
    const [medalsFriend, setMedalsFriend] = useState();
    const [photoFriend, setPhotoFriend] = useState();
    const [idFriend, setIdFriend] = useState();
    const [modalEditProfile, setEditProfile] = useState(false);
    const [newName, setNewName] = useState();
    const [newPhoto, setNewPhoto] = useState();
    const [record, setRecord] = useState([]);

    useEffect(() => {
        setId(localStorage.getItem("idLoggued"));
        user();
        friends();
        setFirstRender(true);
    }, []);

    useEffect(() => {
        if (firstRender) socket.emit("joinRoom", { room: "P" + idLoggued });
    }, [firstRender]);

    useEffect(() => {
        if (!socket) return;

        socket.on("solicitudBack", (data) => {
            if (data.rechazar == false && data.answer == false) {
                let obj = { id_user: data.idLoggued, name: data.name };
                setInvitationsUser([...invitationsUser, obj]);
            } else if (data.rechazar == true && data.answer == true) {
                setNameInvitation(data.name);
                setAdvice(true);
            } else if (data.rechazar == false && data.answer == true) {
                setNameInvitation(data.name);
                setAdvice2(true);
                friends();
            }
        });

        socket.on("invitacionBack", (data) => {
            if (data.rechazar == false && data.answer == false) {
                setNameInvitation(data.name);
                setPlayInvitation(true);
                setFromId(data.from);
            } else if (data.rechazar == true) {
                setNameInvitation(data.name);
                setFromId(data.from);
                setShowInconveniente(true);
                setInconveniente(`${data.name} rechazó tu invitación para jugar`);
                setBueno(false);
            } else if (data.rechazar == false && data.answer == true) {
                let id = parseInt(data.from);
                localStorage.setItem("idPlayer", id);
                router.replace("/game");
            }
        });
    }, [socket]);

    async function user() {
        const idLoggued = localStorage.getItem("idLoggued");
        let result = await fetch("http://localhost:4000/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idLoggued }),
        });
        let response = await result.json();
        if (response.msg == 1) {
            setName(response.user.name);
            setPhoto(response.user.photo);
            setMedals(response.user.medals);
        }
    }

    async function friends() {
        const idLoggued = localStorage.getItem("idLoggued");
        let result = await fetch("http://localhost:4000/friends", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idLoggued }),
        });
        let response = await result.json();
        if (response.msg == 1) setFriends(response.userFriends);
    }

    async function usersWithOutRelationWithLoggued() {
        const idLoggued = localStorage.getItem("idLoggued");
        let result = await fetch("http://localhost:4000/usersFriends", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idLoggued }),
        });
        let response = await result.json();
        if (response.msg == 1) {
            setUsers(response.usersWithOutRelation);
            setShowAddFriend(true);
            setShowFriendProfile(false);
        }
    }

    async function checkInvitation(to) {
        let result = await fetch("http://localhost:4000/checkinvitation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from: idLoggued, to }),
        });
        let response = await result.json();
        if (response.msg == 1) {
            socket.emit("solicitud", {
                idLoggued,
                room: "P" + to,
                name,
                rechazar: false,
                answer: false,
            });
            setShowInconveniente(true);
            setInconveniente("Invitación enviada");
            setBueno(true);
            setShowAddFriend(false);
        } else {
            setShowInconveniente(true);
            setInconveniente("Ya le has enviado una invitación a este usuario");
            setBueno(false);
            setShowAddFriend(false);
        }
    }

    async function friendProfile(idFriend) {
        let result = await fetch("http://localhost:4000/friendprofile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idFriend, idLoggued }),
        });
        let response = await result.json();
        if (response.msg == 1) {
            setNameFriend(response.friend[0].name);
            setPhotoFriend(response.friend[0].photo);
            setMedalsFriend(response.friend[0].medals);
            setIdFriend(response.friend[0].id_user);
            setRecord(response.record);
        }
    }

    function invitar(idFriend) {
        socket.emit("invitacionJugar", {
            room: "P" + idFriend,
            name,
            rechazar: false,
            answer: false,
            from: idLoggued,
        });
        setShowInconveniente(true);
        setInconveniente("Invitación enviada");
        setBueno(true);
    }

    return (
        <>
            {/* 🔹 MODALES */}
            {requests && (
                <div className="fondoRequests" onClick={() => setRequests(false)}>
                    <div className="modalRequests" onClick={(e) => e.stopPropagation()}>
                        {invitationsUser.length > 0 ? (
                            invitationsUser.map((u) => (
                                <div key={u.id_user}>
                                    Invitación de {u.name}
                                    <button
                                        className="tilde"
                                        onClick={() => {
                                            newFriend(u.id_user);
                                            setRequests(false);
                                        }}
                                    >
                                        ✔
                                    </button>
                                    <button
                                        className="cruz"
                                        onClick={() => {
                                            let rechazar = true;
                                            deleteInvitations(u.id_user, rechazar);
                                            setRequests(false);
                                        }}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No hay nuevas invitaciones</p>
                        )}
                        <button className="cerrarRequests" onClick={() => setRequests(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {showSeguro && (
                <div className="fondoSeguro" onClick={() => setShowSeguro(false)}>
                    <div className="modalSeguro" onClick={(e) => e.stopPropagation()}>
                        <p>¿Cerrar sesión?</p>
                        <div className="botonesSeguro">
                            <button
                                onClick={() => router.replace("/")}
                                className="botonesSeguroSi"
                            >
                                Sí
                            </button>
                            <button
                                onClick={() => setShowSeguro(false)}
                                className="botonesSeguroNo"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {requests && (
                <div className="fondoRequests" onClick={() => setRequests(false)}>
                    <div className="modalRequests" onClick={(e) => e.stopPropagation()}>
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
                        <button className="cerrarRequests" onClick={() => setRequests(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {advice && (
                <div className="modal-rechazo-solicitud">
                    <h2 className="mensaje-rechazo-solicitud">
                        {nameInvitation} rechazó tu solicitud
                    </h2>
                    <button
                        className="boton-rechazo-solicitud"
                        onClick={() => setAdvice(false)}
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {advice2 && (
                <div className="modal-acepta-solicitud">
                    <h2 className="mensaje-acepta-solicitud">
                        {nameInvitation} aceptó tu solicitud
                    </h2>
                    <button
                        className="boton-acepta-solicitud"
                        onClick={() => setAdvice2(false)}
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {showInconveniente && (
        bueno ? (
          <div
          className="cuadroCompleto"
          onClick={() => {
            setShowInconveniente(false);
            setInconveniente("");
          }}
        >
          <div
            className="conveniente"
          >
            <h2>{inconveniente}</h2>
            <button
              className="btn cerrarBueno"
              onClick={() => {
                setShowInconveniente(false);
                setInconveniente("");
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
        ) : (
          <div
          className="cuadroCompleto"
          onClick={() => {
            setShowInconveniente(false);
            setInconveniente("");
          }}
        >
          <div
            className="inconveniente"
          >
            <h2>{inconveniente}</h2>
            <button
              className="btn cerrarMalo"
              onClick={() => {
                setShowInconveniente(false);
                setInconveniente("");
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
        )
        
      )}

            {/* 🔹 ESTRUCTURA PRINCIPAL */}
            <div className="lobby">
                <div className="overlay" />
                <div className="lobby-box">
                    <div className="box-grid">
                        {/* IZQUIERDA */}
                        <div className="left-col">
                            <div className="profile">
                                <div className="avatar-wrapper" onClick={() => setEditProfile(true)}>
                                    <img src={photo} className="avatar" />
                                </div>
                                <img
                                    className="logOut"
                                    onClick={() => setShowSeguro(true)}
                                    src="https://cdn-icons-png.flaticon.com/512/126/126467.png"
                                />
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
                                    <div
                                        className="add-friend-icon"
                                        onClick={usersWithOutRelationWithLoggued}
                                    >
                                        +
                                    </div>
                                    <div
                                        className="notification-icon"
                                        onClick={() => {
                                            setRequests(true);
                                        }}
                                    >
                                        🕭
                                    </div>
                                    {invitationsUser.length > 0 && (
                                        <div
                                            className="circulo-notificacion"
                                            onClick={() => {
                                                setRequests(true);
                                            }}
                                        >
                                            🔴
                                        </div>
                                    )}
                                </div>

                                {userFriends.length > 0 ? (
                                    <ul>
                                        {userFriends.map((u) => (
                                            <li key={u.id_user}>
                                                <button
                                                    className="friend-button"
                                                    onClick={() => {
                                                        friendProfile(u.id_user);
                                                        setShowFriendProfile(true);
                                                        setShowAddFriend(false);
                                                    }}
                                                >
                                                    {u.name} - {u.email}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <h2 className="centrate">
                                        Agrega amigos para poder jugar con ellos
                                    </h2>
                                )}
                            </div>
                        </div>

                        {/* DERECHA */}
                        <div className="right-col">
                            <div className="title-right">BATALLA NAVAL</div>

                            <div className="panel-center">
                                {showAddFriend ? (
                                    <div className="panel-common add-friend-panel">
                                        <h2>Enviar solicitud de amistad</h2>
                                        {users.length > 0 ? (
                                            <>
                                                <div className="user-list">
                                                    {users.map((user) => (
                                                        <label
                                                            key={user.id_user}
                                                            className="user-itemFriends"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                onChange={(e) =>
                                                                    e.target.checked
                                                                        ? setNewFriend(user.id_user)
                                                                        : setNewFriend()
                                                                }
                                                            />
                                                            <div>
                                                                <div className="user-nameFriends">
                                                                    {user.name}
                                                                </div>
                                                                <div className="user-emailFriends">
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                                <button
                                                    className="btn confirm"
                                                    onClick={() => checkInvitation(newFriendId)}
                                                >
                                                    Agregar amigo
                                                </button>
                                                <button
                                                    className="btn cancel"
                                                    onClick={() => setShowAddFriend(false)}
                                                >
                                                    Cerrar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h3>No hay usuarios para agregar</h3>
                                                <button
                                                    className="btn cancel"
                                                    onClick={() => setShowAddFriend(false)}
                                                >
                                                    Cerrar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : showFriendProfile ? (
                                    <div className="panel-common friend-panel">
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
                                                        <p>
                                                            <strong>{name}:</strong>{" "}
                                                            {record.filter((r) => r.name === name).length} victorias
                                                        </p>
                                                        <p>
                                                            <strong>{nameFriend}:</strong>{" "}
                                                            {record.filter((r) => r.name === nameFriend).length} victorias
                                                        </p>
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
                                                                {record.map((r) => (
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
                                            <button
                                                className="btn play-friend-btn"
                                                onClick={() => {
                                                    invitar(idFriend);
                                                    setShowFriendProfile(false);
                                                    setShowInconveniente(true);
                                                    setInconveniente("Invitación enviada");
                                                    setBueno(true);
                                                }}
                                            >
                                                Jugar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="panel-common welcome-panel">
                                        <h2>¡Bienvenido!</h2>
                                        <p>Selecciona un amigo para ver su perfil</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
