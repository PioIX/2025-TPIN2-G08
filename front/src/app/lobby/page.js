"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Lobby() {
    const [idLoggued, setId] = useState(0);
    const [name, setName] = useState("");
    const [medals, setMedals] = useState(0);
    const [photo, setPhoto] = useState("https://static.vecteezy.com/system/resources/thumbnails/042/600/457/small_2x/loading-circles-flat-style-modern-preloaders-png.png");
    const [users, setUsers] = useState([]);
    const [showModalNewFriend, setShowModalNewFriend] = useState(false);
    const [newFriendId, setNewFriend] = useState(0);

    useEffect(() => {
        setId(localStorage.getItem("idLoggued"));
        setName(localStorage.getItem("name"));
        setMedals(localStorage.getItem("medals"));
        setPhoto(localStorage.getItem("photo"));
    }, []);

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
        setUsers(response.users);
    }
}

    async function newFriend() {
        let result = await fetch("http://localhost:4000/newFriend", {
            method: "POST",
            headers: {
            "Content-Type": "appication/json",
            },
        body: JSON.stringify({ idLoggued: idLoggued, idFriend: newFriendId }),
    });
    let response = await result.json();
    if (response.msg == 1) {
        alert("Amigo agregado");
        setShowModalNewFriend(false);
    }
}

return (
    <>
        {/* ACA VAN TODOS LOS MODAL */}
        {/* ACA VAN TODOS LOS MODAL */}
        {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}
            {showModalNewFriend && users && users.length > 0 ? (
        <div>
            {users.map((user) => {
            return (
                <label key={user.id_user}>
                <input
                    type="checkbox"
                    onChange={(e) => {
                    if (e.target.checked) {
                        setNewFriend(user.id_user);
                    } else {
                        setNewFriend();
                    }
                    }}
                ></input>
                {user.name} - {user.email}
                </label>
            );
            })}
            <button onClick={newFriend}> Agregar amigo</button>
        </div>
        ) : (
        <div>
            <h3>No hay usuarios para agregar</h3>
            <button onClick={setShowModalNewFriend(false)}> Cerrar </button>
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
                <ul>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                    <li>Capitan america</li>
                    <li>Nadal</li>
                    <li>Bolt</li>
                </ul>
                <button onCLick={usersWithOutRelationWithLoggued} type="button">
                    Agregar amigos
                </button>
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
