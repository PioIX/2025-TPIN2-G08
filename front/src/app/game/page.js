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
	const [barcoSeleccionado, setBarcoSeleccionado] = useState(0);
	const [idPlayer, setIdPlayer] = useState()
	const [room, setRoom] = useState()
	const [heGaveUp, setHeGaveUp] = useState(false)
	const [name, setName] = useState()
	const [medals, setMedals] = useState()
	const [photo, setPhoto] = useState()
	const [friendName, setFriendName] = useState()
	const [cells, setCells] = useState([])
	const [clickedCells, setClickedCells] = useState([])
	const [showInconveniente, setShowInconveniente] = useState(false);
	const [inconveniente, setInconveniente] = useState("");
	const [bueno, setBueno] = useState(false);
	const [position1, setPosition1] = useState()

	const ERROR = -1
	const SIGASIGA = 0
	const VALIDAR_BARCO_HORIZONTAL = 1
	const BARCO_VERTICAL = 2
	const BARCO_HORIZONTAL = 3

	// Barcos:
	//Barco 2x1 = 1
	//Barco 4x1 = 2

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
			newCells.push({ posicion: posicion });
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
		if (barcoSeleccionado > 0) {
			setClickedCells((prev) => [...prev, celda]);
		} else {
			alert("Sleccione algun barco")
		}
	}

	useEffect(() => {
		console.log("barcoSelec: ", barcoSeleccionado)
	}, [barcoSeleccionado])

	useEffect(() => {
		let respuestaValidaciones;
		let letra
		let numero
		console.log(clickedCells);
		if (clickedCells.length > 2) {
			let array = [...clickedCells]
			array.shift()
			setClickedCells(array)
		}
		if (barcoSeleccionado == 1 && clickedCells.length == 2) {
			letra = clickedCells[1].slice(0, 1)
			numero = clickedCells[1].slice(1, 2)
			respuestaValidaciones = validarDiagonal(clickedCells[0].slice(0, 1), clickedCells[0].slice(1, 2), letra, numero)
			if (respuestaValidaciones == SIGASIGA) {
				respuestaValidaciones = validarVertical(clickedCells[0].slice(0, 1), clickedCells[0].slice(1, 2), letra, numero)
				if (respuestaValidaciones == BARCO_VERTICAL) {
					alert("Barco 2x1 en vertical")
				} else {
					respuestaValidaciones = validarHorizontal(clickedCells[0].slice(0, 1), clickedCells[0].slice(1, 2), letra, numero)
					if (respuestaValidaciones == BARCO_HORIZONTAL) {
						alert("Barco 2x1 horizontal")
					} else {
						alert("casillas distantes")
					}
				}
			} else {
				alert("No puede poner el barco en diagonal")
			}
		} else if (barcoSeleccionado == 2 && clickedCells.length == 2) {

		}
			
	}, [clickedCells]);

	function validarHorizontal(letraPrimerCelda, numeroPrimerCelda, letraSegundaCelda, numeroSegundaCelda) {
		let respuesta = ERROR
		letraSegundaCelda = String(letraSegundaCelda).toUpperCase()
		letraPrimerCelda = String(letraPrimerCelda).toUpperCase()
		if (letraPrimerCelda == letraSegundaCelda) {
			if ((numeroPrimerCelda == 0 && numeroSegundaCelda == 1) ||
				(numeroPrimerCelda == 8 && numeroSegundaCelda == 9) ||
				(numeroPrimerCelda == 9 && numeroSegundaCelda == 8) ||
				(numeroPrimerCelda == 1 && numeroSegundaCelda == 0)) {
				respuesta = BARCO_HORIZONTAL
			} else {
				for (let i = 1; i < 8; i++){
					if (i == numeroPrimerCelda){
						if (numeroSegundaCelda == i+1 || numeroSegundaCelda == i-1){
							respuesta = BARCO_HORIZONTAL
						}
					}
				}
			}
		}
		return respuesta
	}

	function validarDiagonal(letraPrimerCelda, numeroPrimerCelda, letraSegundaCelda, numeroSegundaCelda) {
		let respuesta = ERROR
		letraSegundaCelda = String(letraSegundaCelda).toUpperCase()
		letraPrimerCelda = String(letraPrimerCelda).toUpperCase()
		if (letraPrimerCelda != letraSegundaCelda && numeroPrimerCelda != numeroSegundaCelda) {
			respuesta = ERROR
		} else {
			respuesta = SIGASIGA
		}
		return respuesta
	}

	function validarVertical(letraPrimerCelda, numeroPrimerCelda, letraSegundaCelda, numeroSegundaCelda) {
		let respuesta = ERROR
		let letras = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
		letraSegundaCelda = String(letraSegundaCelda).toUpperCase()
		letraPrimerCelda = String(letraPrimerCelda).toUpperCase()
		if (numeroPrimerCelda == numeroSegundaCelda) {
			if (letraPrimerCelda != letraSegundaCelda) {
				if ((letras[0] == letraPrimerCelda && letras[1] == letraSegundaCelda) || (letras[1] == letraPrimerCelda && letras[0] == letraSegundaCelda)
					|| (letras[9] == letraPrimerCelda && letras[8] == letraSegundaCelda) || (letras[8] == letraPrimerCelda && letras[9] == letraSegundaCelda)) {
					console.log("HOLA")
					respuesta = BARCO_VERTICAL
				} else {
					for (let i = 2; i < letras.length - 2; i++) {
						if (letras[i] == letraPrimerCelda) {
							if (letraSegundaCelda == letras[i - 1] || letraSegundaCelda == letras[i + 1]) {
								respuesta = BARCO_VERTICAL
							}
						}
					}
					if (respuesta != BARCO_VERTICAL) {
						respuesta = VALIDAR_BARCO_HORIZONTAL
					}
				}
			} else {
				respuesta = VALIDAR_BARCO_HORIZONTAL
			}
		} else {
			respuesta = VALIDAR_BARCO_HORIZONTAL
		}
		return respuesta
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
			body: JSON.stringify({
				date: new Date(),
				idWinner: idPlayer,
				idPlayer: idLoggued,
			}),
		});
		await result.json();
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
						<button
							className="btn-si"
							onClick={async () => {
								await insertGame();
								socket.emit("rendirse", {
									rendirse: true,
									room: room,
									name: name,
									to: idPlayer,
								});
								router.replace("/lobby");
							}}
						>
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

			{/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
			{/* ACA VAN TODOS LOS MODAL */}
			{/* ACA VAN TODOS LOS MODAL */}

			{/* ACA VA LA PAGINA PRINCIPAL */}
			{/* ACA VA LA PAGINA PRINCIPAL */}
			{/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}

			<div className="game-container">
				<button className="surrender" onClick={() => setRendirse(true)}>
					🏳️
				</button>
				<div className="top-bar">
					<h1 className="game-title">BATALLA NAVAL</h1>
				</div>

				{positionsShips ? (
					<div className="boards">
						<div className="board-section">
							<h2>Tu tablero</h2>
							<div className="board player-board">
								{cells.map((u, index) =>
									<button key={index} onClick={() => changePosition(u.posicion)} id={u.posicion} className={"cell"}>
										{u.posicion}
									</button>)}
							</div>
						</div>

						<div className="ship-images">
							<img
								onClick={() => {
									setBarcoSeleccionado(1);
								}}
								src="/Barco 2x1.png"
								alt="Barco 2x1"
								className={`ship-image2x1 ${barcoSeleccionado == 1 ? "ship-image-selected" : ""
									}`}
							/>
							<img
								onClick={() => {
									setBarcoSeleccionado(2);
								}}
								src="/Barco 4x1.png"
								alt="Barco 4x1"
								className={`ship-image4x1 ${barcoSeleccionado == 2 ? "ship-image-selected" : ""
									}`}
							/>
						</div>

						<div className="play-button-container">
							<button className="btn-jugar" onClick={() => setPositionsShips(false)}>
								¡Listo!
							</button>
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