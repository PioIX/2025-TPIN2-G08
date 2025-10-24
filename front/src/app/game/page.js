"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function Juego() {
  const router = useRouter();
  const [rendirse, setRendirse] = useState(false);
  const [ship, setShip] = useState(true);
  const [idLoggued, setId] = useState();
  const { socket, isConnected } = useSocket();
  const [firstRender, setFirsRender] = useState(false);
  const [barcoSeleccionado, setBarcoSeleccionado] = useState(0);
  const [idPlayer, setIdPlayer] = useState()
  const [room, setRoom] = useState()
  const [heGaveUp, setHeGaveUp] = useState(false)
  const [name, setName] = useState()
  const [medals, setMedals] = useState()
  const [photo, setPhoto] = useState()
  const [friendName, setFriendName] = useState()
  const [cells, setCells] = useState([])
  const [position1, setPosition1] = useState()
  const [position2, setPosition2] = useState()

  // Barcos:
  //Barco 2x1 = 1
  //Barco 4x1 = 2

  function positions() {
    let newCells = []
    let posicionLetra = ""
    let posicion
    let posicionNum
    let guardoNum
    let contador = 0
    for (let i = 0; i < 100; i++) {
      if (i + 1 >= 1 && i + 1 <= 10) {
        posicionLetra = "A"
      } else if (i + 1 >= 11 && i + 1 <= 20) {
        posicionLetra = "B"
      } else if (i + 1 >= 21 && i + 1 <= 30) {
        posicionLetra = "C"
      } else if (i + 1 >= 31 && i + 1 <= 40) {
        posicionLetra = "D"
      } else if (i + 1 >= 41 && i + 1 <= 50) {
        posicionLetra = "E"
      } else if (i + 1 >= 51 && i + 1 <= 60) {
        posicionLetra = "F"
      } else if (i + 1 >= 61 && i + 1 <= 70) {
        posicionLetra = "G"
      } else if (i + 1 >= 71 && i + 1 <= 80) {
        posicionLetra = "H"
      } else if (i + 1 >= 81 && i + 1 <= 90) {
        posicionLetra = "I"
      } else if (i + 1 >= 91 && i + 1 <= 100) {
        posicionLetra = "J"
      }
      guardoNum = (i).toString()
      posicionNum = guardoNum.slice(guardoNum.length - 1)
      posicion = posicionLetra + posicionNum
      newCells.push(<div className="cell" key={i + 1} id={posicion}
        onClick={(e) => {
          handlePosition(e.target.id)
        }}>{posicion}</div>);
    }
    setCells(newCells)
  }

  useEffect(() => {
    setId(localStorage.getItem("idLoggued"));
    setIdPlayer(localStorage.getItem("idPlayer"))
    user()
    positions()
    setFirsRender(true);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("checkRoom", data => {
      console.log(data);
    });

    socket.on('neverSurrender', data => {
      if (data.rendirse == true && data.to == idLoggued) {
        setHeGaveUp(true)
        setFriendName(data.name)
      }
    })
  }, [socket]);

  useEffect(() => {
    if (firstRender) {
      let numIdLoggued = parseInt(idLoggued)
      let numIdPlayer = parseInt(idPlayer)
      if (numIdLoggued < numIdPlayer) {
        socket.emit("joinRoom", { room: "G" + numIdLoggued + numIdPlayer });
        setRoom("G" + numIdLoggued + numIdPlayer)
      } else {
        socket.emit("joinRoom", { room: "G" + numIdPlayer + numIdLoggued });
        setRoom("G" + numIdPlayer + numIdLoggued)
      }
    }
  }, [firstRender]);

  function handlePosition(posicion) {
    console.log(barcoSeleccionado)
    if (barcoSeleccionado > 0 && barcoSeleccionado == 1) {
      console.log("Entre en el if")
      contador += 1
      setClicks(contador)
      if (contador == 1) {
        setPosition1(posicion)
      } else if (contador == 2) {
        setPosition2(posicion)
      }
    }
    if (barcoSeleccionado > 0 && barcoSeleccionado == 2) {

    }
  }

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

  async function insertGame() {
    let result = await fetch('http://localhost:4000/insertGame', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ date: new Date, idWinner: idPlayer, idPlayer: idLoggued })
    })
    await result.json()
  }

  return (
    <>
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}

      {rendirse && (
        <div className="popup-rendicion">
          <h3>¿Seguro que querés rendirte?</h3>
          <p>Perderás la partida actual</p>
          <div className="popup-botones">
            <button className="btn-si" onClick={async () => {
              await insertGame()
              socket.emit('rendirse', { rendirse: true, room: room, name: name, to: idPlayer })
              router.replace("/lobby")
            }}>Rendirse</button>
            <button className="btn-no" onClick={() => setRendirse(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/*---------------------------*/}

      {heGaveUp &&
        <div>
          <h2>{friendName} se rindio, por lo que ganaste la partida</h2>
          <div className="medal">
            <div className="medal-emoji">🎖️</div>
            <div className="medal-count">+30</div>
          </div>
          <button onClick={() => router.replace("/lobby")}> OK </button>
        </div>}

      {/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ACA VAN TODOS LOS MODAL */}

      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}
        
      <div className="game-container">
        
        <button className="surrender" onClick={() => setRendirse(true)}>🏳️</button>
        <div className="top-bar">
          <h1 className="game-title">BATALLA NAVAL</h1>
        </div>

        {ship ? (
          <div className="boards">
            <div className="board-section">
              <h2>Tu tablero</h2>
              <div className="board player-board">{cells}</div>
            </div>

            <div className="ship-images">
              <img
                onClick={() => {
                  setBarcoSeleccionado(1);
                }}
                src="/Barco 2x1.png"
                alt="Barco 2x1"
                className={`ship-image2x1 ${barcoSeleccionado == 1 ? 'ship-image-selected' : ''}`}
              />
              <img
                onClick={ () => {
                  setBarcoSeleccionado(2);
                }}
                src="/Barco 4x1.png"
                alt="Barco 4x1"
                className={`ship-image4x1 ${barcoSeleccionado == 2 ? 'ship-image-selected' : ''}`}
              />
            </div>

            <div className="play-button-container">
              <button className="btn-jugar" onClick={() => setShip(false)}>Jugar</button>
            </div>
          </div>
        ) : (
          <div className="boards">
            <div className="board-section">
              <h2>Tu tablero</h2>
              <div className="board player-board">{cells}</div>
            </div>

            <div className="board-section">
              <h2>Tablero enemigo</h2>
              <div className="board enemy-board">{cells}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}