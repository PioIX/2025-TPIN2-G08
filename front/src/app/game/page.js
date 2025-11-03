"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function Juego() {
	const router = useRouter();
	const [rendirse, setRendirse] = useState(false);
	const [positionsShips, setPositionsShips] = useState(true);
	const [idLoggued, setId] = useState();
	const { socket, isConnected } = useSocket();
	const [firstRender, setFirsRender] = useState(false);
	const [shipSelected, setShipSelected] = useState(0);
	const [idPlayer, setIdPlayer] = useState();
	const [room, setRoom] = useState();
	const [heGaveUp, setHeGaveUp] = useState(false);
	const [name, setName] = useState();
	const [medals, setMedals] = useState();
	const [photo, setPhoto] = useState();
	const [friendName, setFriendName] = useState();
	const [cells, setCells] = useState([]);
	const [clickedCells, setClickedCells] = useState([]);
	const [showInconveniente, setShowInconveniente] = useState(false);
	const [inconveniente, setInconveniente] = useState("");
	const [bueno, setBueno] = useState(false);
	const [posible, setPosible] = useState(false)
	const [alreadyPlacedShips, setAlreadyPlacedShips] = useState([])

	const ERROR = -3 // El usuario selecciono la misma casilla 2 veces
	const ERROR2 = -2; // El usuario intento ubicar el barco diagonalmente
	const ERROR3 = -1 // Intento poner un barco donde habia ya puesto otro
	const SIGASIGA = 0; // Las casillas son validas respecto al barco seleccionado
	const VALIDAR_BARCO_HORIZONTAL = 1; // El barco no esta puesto verticalmente por lo que hay que verificar que sea horizontal
	const BARCO_VERTICAL = 2; // El barco esta puesto verticalmente
	const BARCO_HORIZONTAL = 3; // El barco esta puesto horizontalmente

	// Barcos:
	//Barco 2x1 = 1
	//Barco 3x1 = 2
	//Barco 4x1 = 3
	//Barco 5x1 = 4

	function positions() {
		let newCells = [];
		let posicionLetra = "";
		let posicion;
		let posicionNum;
		let guardoNum;
		for (let i = 0; i < 100; i++) {
			if (i + 1 >= 1 && i + 1 <= 10) {
				posicionLetra = "A";
			} else if (i + 1 >= 11 && i + 1 <= 20) {
				posicionLetra = "B";
			} else if (i + 1 >= 21 && i + 1 <= 30) {
				posicionLetra = "C";
			} else if (i + 1 >= 31 && i + 1 <= 40) {
				posicionLetra = "D";
			} else if (i + 1 >= 41 && i + 1 <= 50) {
				posicionLetra = "E";
			} else if (i + 1 >= 51 && i + 1 <= 60) {
				posicionLetra = "F";
			} else if (i + 1 >= 61 && i + 1 <= 70) {
				posicionLetra = "G";
			} else if (i + 1 >= 71 && i + 1 <= 80) {
				posicionLetra = "H";
			} else if (i + 1 >= 81 && i + 1 <= 90) {
				posicionLetra = "I";
			} else if (i + 1 >= 91 && i + 1 <= 100) {
				posicionLetra = "J";
			}
			guardoNum = i.toString();
			posicionNum = guardoNum.slice(guardoNum.length - 1);
			posicion = posicionLetra + posicionNum;
			newCells.push({ posicion: posicion, ship: false, typeOfShip: null});
		}
		setCells(newCells);
	}

	useEffect(() => {
		setId(localStorage.getItem("idLoggued"));
		setIdPlayer(localStorage.getItem("idPlayer"));
		user();
		positions();
		setFirsRender(true);
	}, []);

	useEffect(() => {
		if (!socket) return;
		socket.on("checkRoom", (data) => {
			console.log(data);
		});

		socket.on("neverSurrender", (data) => {
			if (data.rendirse == true && data.to == idLoggued) {
				setHeGaveUp(true);
				setFriendName(data.name);
			}
		});
	}, [socket]);

	useEffect(() => {
		if (firstRender) {
			let numIdLoggued = parseInt(idLoggued);
			let numIdPlayer = parseInt(idPlayer);
			if (numIdLoggued < numIdPlayer) {
				socket.emit("joinRoom", { room: "G" + numIdLoggued + numIdPlayer });
				setRoom("G" + numIdLoggued + numIdPlayer);
			} else {
				socket.emit("joinRoom", { room: "G" + numIdPlayer + numIdLoggued });
				setRoom("G" + numIdPlayer + numIdLoggued);
			}
		}
	}, [firstRender]);

	function changePosition(celda) {
		if (shipSelected > 0) {
			setClickedCells((prev) => [...prev, celda]);
		} else {
			setInconveniente("Seleccione algun barco")
			setBueno(true)
			setShowInconveniente(true)
		}
	}

	useEffect(() => {
		let respuestaValidaciones;
		let letra;
		let numero;
		console.log(clickedCells);
		if (clickedCells.length > 2) {
			let array = [...clickedCells];
			array.shift();
			setClickedCells(array);
		}
		respuestaValidaciones = validarCeldasRepetidas()
		if(respuestaValidaciones == ERROR3){
			setClickedCells([])
			setInconveniente("Ya hay en esa casilla un barco")
			setShowInconveniente(true)
		}
		if (clickedCells.length == 2) {
			letra = clickedCells[1].slice(0, 1);
			numero = clickedCells[1].slice(1, 2);
			respuestaValidaciones = validarDiagonalYMismaCasilla(clickedCells[0].slice(0, 1), clickedCells[0].slice(1, 2), letra, numero);
			if (respuestaValidaciones == SIGASIGA) {
				respuestaValidaciones = validarVertical(clickedCells[0].slice(0, 1), clickedCells[0].slice(1, 2), letra, numero, shipSelected);
				if (respuestaValidaciones != BARCO_VERTICAL) {
					respuestaValidaciones = validarHorizontal(clickedCells[0].slice(0, 1), clickedCells[0].slice(1, 2), letra, numero, shipSelected);
					if (respuestaValidaciones != BARCO_HORIZONTAL) {
						setClickedCells([])
						setInconveniente("Las casillas son muy distantes o no cumplen con el largo del barco");
						setShowInconveniente(true)
					} else {
						if (alreadyPlacedShips.length == 1) {
							setPosible(false)
						} else {
							setPosible(true)
						}
					}
				} else {
					if (alreadyPlacedShips.length == 1) {
						setPosible(false)
					} else {
						setPosible(true)
					}
				}
			} else if(respuestaValidaciones == ERROR){
				setClickedCells([])
				setInconveniente("Seleccione 2 casillas distintas")
				setShowInconveniente(true)
			} else {
				setClickedCells([])
				setInconveniente("No puede posicionar el barco en diagonal")
				setShowInconveniente(true)
			}
		}
	}, [clickedCells]);

	function validarHorizontal(letraPrimerCelda, numeroPrimerCelda, letraSegundaCelda, numeroSegundaCelda, shipSelected) {
		let respuesta = ERROR;
		letraSegundaCelda = String(letraSegundaCelda).toUpperCase();
		letraPrimerCelda = String(letraPrimerCelda).toUpperCase();
		if(shipSelected == 1){
			for (let i = 0; i < 9; i++) {
				if (i == numeroPrimerCelda) {
					if (numeroSegundaCelda == i + 1 || numeroSegundaCelda == i - 1) {
						respuesta = BARCO_HORIZONTAL;
					}
				}
			}
		} else if(shipSelected == 2){
			for (let i = 0; i < 9; i++) {
				if (i == numeroPrimerCelda) {
					if (numeroSegundaCelda == i + 2 || numeroSegundaCelda == i - 2) {
						respuesta = BARCO_HORIZONTAL;
					}
				}
			}
		} else if(shipSelected == 3){
			for (let i = 0; i < 9; i++) {
				if (i == numeroPrimerCelda) {
					if (numeroSegundaCelda == i + 3 || numeroSegundaCelda == i - 3) {
						respuesta = BARCO_HORIZONTAL;
					}
				}
			}
		} else if(shipSelected == 4){
			for (let i = 0; i < 9; i++) {
				if (i == numeroPrimerCelda) {
					if (numeroSegundaCelda == i + 4 || numeroSegundaCelda == i - 4) {
						respuesta = BARCO_HORIZONTAL;
					}
				}
			}
		}
		return respuesta;
	}

	function validarDiagonalYMismaCasilla(letraPrimerCelda, numeroPrimerCelda, letraSegundaCelda, numeroSegundaCelda) {
		let respuesta = ERROR2;
		let celda1 = letraPrimerCelda + numeroPrimerCelda
		let celda2 = letraSegundaCelda + numeroSegundaCelda
		letraSegundaCelda = String(letraSegundaCelda).toUpperCase();
		letraPrimerCelda = String(letraPrimerCelda).toUpperCase();
		if (letraPrimerCelda != letraSegundaCelda && numeroPrimerCelda != numeroSegundaCelda) {
			respuesta = ERROR2;
		} else if( celda1 == celda2){
			respuesta = ERROR;
		} else {
			respuesta = SIGASIGA
		}
		return respuesta;
	}

	function validarVertical(letraPrimerCelda, numeroPrimerCelda, letraSegundaCelda, numeroSegundaCelda, shipSelected) {
		let respuesta = ERROR;
		let letras = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
		letraSegundaCelda = String(letraSegundaCelda).toUpperCase();
		letraPrimerCelda = String(letraPrimerCelda).toUpperCase();
		if ((numeroPrimerCelda == numeroSegundaCelda) && (letraPrimerCelda != letraSegundaCelda)) {
			if (shipSelected == 1) {
				for (let i = 0; i < letras.length; i++) {
					if (letras[i] == letraPrimerCelda) {
						if (letraSegundaCelda == letras[i - 1] || letraSegundaCelda == letras[i + 1]) {
							respuesta = BARCO_VERTICAL;
						}
					}
				}
				if (respuesta != BARCO_VERTICAL) {
					respuesta = VALIDAR_BARCO_HORIZONTAL;
				}
			} else if (shipSelected == 2){
				for (let i = 0; i < letras.length; i++){
					if (letras[i] == letraPrimerCelda){
						if(letraSegundaCelda == letras[i-2] || letraSegundaCelda == letras[i+2]){
							respuesta = BARCO_VERTICAL
						}
					}
				}
				if(respuesta != BARCO_VERTICAL){
					respuesta = VALIDAR_BARCO_HORIZONTAL
				}
			} else if(shipSelected == 3){
				for (let i = 0; i < letras.length; i++){
					if (letras[i] == letraPrimerCelda){
						if(letraSegundaCelda == letras[i-3] || letraSegundaCelda == letras[i+3]){
							respuesta = BARCO_VERTICAL
						}
					}
				}
				if(respuesta != BARCO_VERTICAL){
					respuesta = VALIDAR_BARCO_HORIZONTAL
				}
			} else if(shipSelected == 4){
				for (let i = 0; i < letras.length; i++){
					if (letras[i] == letraPrimerCelda){
						if(letraSegundaCelda == letras[i-4] || letraSegundaCelda == letras[i+4]){
							respuesta = BARCO_VERTICAL
						}
					}
				}
				if(respuesta != BARCO_VERTICAL){
					respuesta = VALIDAR_BARCO_HORIZONTAL
				}
			}
		} else {
			respuesta = VALIDAR_BARCO_HORIZONTAL;
		}
		return respuesta;
	}

	async function user() {
		const idLoggued = localStorage.getItem("idLoggued");
		let result = await fetch("http://localhost:4000/user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ idLoggued: idLoggued }),
		});
		let response = await result.json();
		if (response.msg == 1) {
			setName(response.user.name);
			setPhoto(response.user.photo);
			setMedals(response.user.medals);
		}
	}

	async function insertGame() {
		let result = await fetch("http://localhost:4000/insertGame", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({date: new Date(), idWinner: idPlayer, idPlayer: idLoggued}),
		});
		await result.json();
	}

	function setShips(){
		setClickedCells([])
		setPosible(false)
		for (let i = 0; i < cells.length; i++){
			if (cells[i].posicion == clickedCells[0]){
				cells[i].ship = true
				cells[i].typeOfShip = shipSelected
			} else if(cells[i].posicion == clickedCells[1]){
				cells[i].ship = true
				cells[i].typeOfShip = shipSelected
			}
		}
		setCells(cells)
		let array =[...alreadyPlacedShips]
		array.push(shipSelected)
		setAlreadyPlacedShips(array)
		setShipSelected(0)
		console.log(cells)
		console.log(alreadyPlacedShips)
	}

	useEffect(() => {
		if(alreadyPlacedShips.length == 2){
			setPositionsShips(false)
		}
	}, [alreadyPlacedShips]);

	function validarCeldasRepetidas(){
		let respuesta
		for (let i = 0; i < cells.length; i++){
			if(cells[i].posicion == clickedCells[0]){
				if(cells[i].ship == true){
					respuesta = ERROR3
				}
			} else if(cells[i].posicion == clickedCells[1]){
				if(cells[i].ship == true){
					respuesta = ERROR3
				}
			}
		}
		return respuesta
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
						<button className="btn-si" onClick={async () => {await insertGame();
							socket.emit("rendirse", {rendirse: true, room: room, name: name, to: idPlayer});
							router.replace("/lobby");}}>
							Rendirse
						</button>
						<button className="btn-no" onClick={() => setRendirse(false)}>
							Cancelar
						</button>
					</div>
				</div>
			)}

			{/*---------------------------*/}

			{heGaveUp && (
				<div>
					<h3>{friendName} se rindio, por lo que ganaste la partida</h3>
					<div className="medal">
						<div className="medal-emoji">🎖️</div>
						<div className="medal-count">+30</div>
					</div>
					<button onClick={() => router.replace("/lobby")}> OK </button>
				</div>
			)}

			{/*---------------------------*/}

			{showInconveniente && (
                bueno ? (
                    <div className="cuadroCompleto"onClick={() => {
                            setShowInconveniente(false);
                            setInconveniente("");}}>
                        <div className="conveniente">
                            <h2>{inconveniente}</h2>
                            <button className="btn cerrarBueno" onClick={() => {
                                    setShowInconveniente(false);
                                    setInconveniente("");}}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="cuadroCompleto" onClick={() => {
                            setShowInconveniente(false);
                            setInconveniente("");}}>
                        <div className="inconveniente">
                            <h2>{inconveniente}</h2>
                            <button className="btn cerrarMalo" onClick={() => {
                                    setShowInconveniente(false);
                                    setInconveniente("");}}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                )
			)}

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

				{positionsShips ? (
					<div className="boards">
						<div className="board-section">
							<h2>Tu tablero</h2>
							<div className="board player-board">
								{cells.map((u, index) => (
									<button key={index} onClick={() => changePosition(u.posicion)} id={u.posicion} className={"cell"}>
										{u.posicion}
									</button>
								))}
							</div>
						</div>
						<div className="ship-images">
							<img onClick={() => {setShipSelected(1); setClickedCells([]); setPosible(false)}} src="/Barco 2x1.png" alt="Barco 2x1"
							className={`ship-image2x1 ${shipSelected == 1 ? "ship-image-selected" : ""}`}/>
							<img onClick={() => { setShipSelected(3); setClickedCells([]); setPosible(false) }} src="/Barco 4x1.png" alt="Barco 4x1"
							className={`ship-image4x1 ${shipSelected == 2 ? "ship-image-selected" : ""}`}/>
						</div>
						<div className="play-button-container">
							{posible ?
								<button onClick={setShips}> Listo </button>
							: alreadyPlacedShips.length == 1 && clickedCells.length == 2 &&
								<button onClick={setShips}> Empezar partida </button>
							}
						</div>
					</div>
				) : (
					<div className="boards">
						<div className="board-section">
							<h2>Tu tablero</h2>
							<div className="board player-board">{
								cells.map((c, index) => (
									<div key={index} id={c.posicion} className={"cell"}>
										{c.posicion}
									</div>
								))}
							</div>
						</div>
						<div className="board-section">
							<h2>Tablero enemigo</h2>
							<div className="board enemy-board">{
								cells.map((c, index) => (
									<div key={index} id={c.posicion} className={"cell"}>
										{c.posicion}
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}