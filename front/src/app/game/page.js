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
  const [elegirPosicionBarco2x1, setElegirPosicionBarco2x1] = useState(false);
  const [elegirPosicionBarco4x1, setElegirPosicionBarco4x1] = useState(false);
  const [barcoSeleccionado, setBarcoSeleccionado] = useState(null);
  const [idPlayer, setIdPlayer] = useState()
  const [room, setRoom] = useState()
  const [heGaveUp, setHeGaveUp] = useState(false)
  
  const cells = [];
  let posicionLetra = ""
  for (let i = 0; i < 100; i++) {
      if(i +1 >= 1 && i+1 <= 10){
        posicionLetra = "A"
      }else if(i +1 >= 11 && i+1 <= 20){
        posicionLetra = "B"
      }else if(i +1 >= 21 && i+1 <= 30){
        posicionLetra = "C"
      }else if(i +1 >= 31 && i+1 <= 40){
        posicionLetra = "D"
      }else if(i +1 >= 41 && i+1 <= 50){
        posicionLetra = "E"
      }else if(i +1 >= 51 && i+1 <= 60){
        posicionLetra = "F"
      }else if(i +1 >= 61 && i+1 <= 70){
        posicionLetra = "G"
      }else if(i +1 >= 71 && i+1 <= 80){
        posicionLetra = "H"
      }else if(i +1 >= 81 && i+1 <= 90){
         posicionLetra = "I"
      }else if(i +1 >= 91 && i+1 <= 100){
         posicionLetra = "J"
      }

      let guardoNum = (i+1).toString()
      let posicionNum = guardoNum.slice(guardoNum.length -1)
      let posicion = posicionLetra + posicionNum
    cells.push(<div className="cell" key={i+1} id={posicionNum}
    onClick={()=>{
      if(elegirPosicionBarco2x1){
        
      }
      if(elegirPosicionBarco4x1){

      }

    }
    }
    >{posicion}</div>);
  }

  useEffect(() => {
    setId(localStorage.getItem("idLoggued"));
    setIdPlayer(localStorage.getItem("idPlayer"))
    setFirsRender(true);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("checkRoom", (data) => {
      console.log(data);
    });

    socket.on('neverSurrender', data => {
      if (data.rechzar){
        setHeGaveUp(true)
      }
    })
  }, [socket]);

  useEffect(() => {
    if (firstRender) {
      let numIdLoggued = parseInt(idLoggued)
      let numIdPlayer = parseInt(idPlayer)
      if(numIdLoggued < numIdPlayer){
        socket.emit("joinRoom", { room: "G" + numIdLoggued + numIdPlayer});
        setRoom("G" + numIdLoggued + numIdPlayer)
      } else {
        socket.emit("joinRoom", { room: "G" + numIdPlayer + numIdLoggued});
        setRoom("G" + numIdPlayer + numIdLoggued)
      }
    }
  }, [firstRender]);

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
            <button className="btn-si" onClick={() => {router.replace("/lobby"); socket.emit('rendirse', {rendirse: true, room: room})}}>Rendirse</button>
            <button className="btn-no" onClick={() => setRendirse(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/*---------------------------*/}

      {heGaveUp && 
      <div>
        <h2></h2>
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
                  setElegirPosicionBarco4x1(false); 
                  setElegirPosicionBarco2x1(true); 
                  setBarcoSeleccionado('2x1');
                }} 
                src="/Barco 2x1.png" 
                alt="Barco 2x1" 
                className={`ship-image2x1 ${barcoSeleccionado === '2x1' ? 'ship-image-selected' : ''}`}
              />
              <img 
                onClick={() => {
                  setElegirPosicionBarco4x1(true); 
                  setElegirPosicionBarco2x1(false); 
                  setBarcoSeleccionado('4x1');
                }} 
                src="/Barco 4x1.png" 
                alt="Barco 4x1" 
                className={`ship-image4x1 ${barcoSeleccionado === '4x1' ? 'ship-image-selected' : ''}`}
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
