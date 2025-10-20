"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Juego() {
  const router = useRouter();
  const [rendirse, setRendirse] = useState(false);

  const cells = [];
  for (let i = 0; i < 100; i++) {
    cells.push(<div className="cell" key={i}></div>);
  }


  return (

    <>
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}


      {/* Modal de confirmación */}
      {rendirse && (
        <div className="popup-rendicion">
          <h3>¿Seguro que querés rendirte?</h3>
          <p>Perderás la partida actual</p>
          <div className="popup-botones">
            <button className="btn-si" onClick={()=> router.replace("/lobby")}>Rendirse</button>
            <button className="btn-no" onClick={() => setRendirse(false)}>Cancelar</button>
          </div>
        </div>
      )}


      {/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ACA VAN TODOS LOS MODAL */}




      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}


      <div className="game-container">

        <button className="surrender" onClick={()=>setRendirse(true)}>🏳️</button>

     
        <div className="top-bar">
          <h1 className="game-title">BATALLA NAVAL</h1>
        </div>

     
        <div className="boards">
          <div className="board-section">
            <h2>Tablero enemigo</h2>
            <div className="board enemy-board">{cells}</div>
          </div>

          <div className="board-section">
            <h2>Tu tablero</h2>
            <div className="board player-board">{cells}</div>
          </div>
        </div>
      </div>


      {/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ACA VA LA PAGINA PRINCIPAL */}
    </>
  );
}
