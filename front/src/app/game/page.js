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
  
  const cells = [];
  for (let i = 0; i < 100; i++) {
    cells.push(<div className="cell" key={i}
    onClick={()=>{
      if(elegirPosicionBarco2x1){
        
      }
      if(elegirPosicionBarco4x1){

      }

    }
    }
    ></div>);
  }

  useEffect(() => {
    setId(localStorage.getItem("idLoggued"));
    setFirsRender(true);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("checkRoom", (data) => {
      console.log(data);
    });
  }, [socket]);

  useEffect(() => {
    if (firstRender) {
      socket.emit("joinRoom", { room: "P" + idLoggued });
    }
  }, [firstRender]);

  return (
    <>
      {/* Modal de confirmación */}
      {rendirse && (
        <div className="popup-rendicion">
          <h3>¿Seguro que querés rendirte?</h3>
          <p>Perderás la partida actual</p>
          <div className="popup-botones">
            <button className="btn-si" onClick={() => router.replace("/lobby")}>Rendirse</button>
            <button className="btn-no" onClick={() => setRendirse(false)}>Cancelar</button>
          </div>
        </div>
      )}

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
