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
	const [verticalHorizontal, setVerticalHorizontal] = useState("")
	const [otherReady, setOtherReady] = useState(false)
	const [ready, setReady] = useState(false)
	const [isDisabled, setIsDisabled] = useState(false)
	const [isDisabled2, setIsDisabled2] = useState(false)
	const [isDisabled3, setIsDisabled3] = useState(false)
	const [isDisabled4, setIsDisabled4] = useState(false)
	const [isDisabled5, setIsDisabled5] = useState(false)
	const [turno, setTurno] = useState(false)
	const [cellsEnemy, setCellsEnemy] = useState([])
	const [yaSeRindio, setYaSeRindio] = useState(false)
	const [shipsSunk, setShipsSunk] = useState([]);
	const [shipsLost, setShipsLost] = useState([]);
	const [win, setWin] = useState(false)
	const [lose, setLose] = useState(false)


	const ERROR = -3 // El usuario selecciono la misma casilla 2 veces
	const ERROR2 = -2; // El usuario intento ubicar el barco diagonalmente
	const ERROR3 = -1 // Intento poner un barco donde habia ya puesto otro
	const SIGASIGA = 0; // Las casillas son validas respecto al barco seleccionado
	const VALIDAR_BARCO_HORIZONTAL = 1; // El barco no esta puesto verticalmente por lo que hay que verificar que sea horizontal
	const BARCO_VERTICAL = 2; // El barco esta puesto verticalmente
	const BARCO_HORIZONTAL = 3; // El barco esta puesto horizontalmente
	const duelMode = (!positionsShips && ready && otherReady); // cuando ambos ya pusieron barcos

	// Barcos:
	//Barco 2x1 = 2
	//Barco 3x1 = 3
	//Barco 3x1 = 3.1
	//Barco 4x1 = 4
	//Barco 5x1 = 5

	function positions() {
		let myCells = [];
		let enemyCells = [];
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
			myCells.push({
				posicion: posicion, ship: false, typeOfShip: null, touched: null, shipIndex: null, shipLength: 0, shipOrientation: null
			});
			enemyCells.push({
				posicion: posicion, ship: false, typeOfShip: null, touched: null, shipIndex: null, shipLength: 0, shipOrientation: null
			})
		}
		setCells(myCells);
		setCellsEnemy(enemyCells)
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
		socket.on("checkRoom", data => {
			console.log(data)
			setRoom(data.room)
		});

		socket.on("neverSurrender", data => {
			if (data.rendirse == true && data.to == idLoggued) {
				setHeGaveUp(true);
				setYaSeRindio(true);
				setFriendName(data.name);
			}
		});

		socket.on('firstTurn', data => {
			console.log(data)
			if (data.firstTurn == idLoggued) {
				console.log("Mi turno")
				setTurno(true)
			}
		})

		socket.on('ready', data => {
			if (data.ready == true && data.from != idLoggued) {
				setOtherReady(true)
			}
		})

		socket.on('atackBack', data => {
			if (data.to == idLoggued) {
				atackedCells(data.celda, data.room)
			}
		})

		socket.on('answerAtack', async data => {
			if (data.to == idLoggued) {
				console.log(data)
				let prevCells = [...cellsEnemy]
				let prevShipsSunk = [...shipsSunk]
				for (let i = 0; i < prevCells.length; i++) {
					if (prevCells[i].posicion == data.cellsAtacked) {
						if (data.touched) {
							prevCells[i].touched = true
							prevCells[i].typeOfShip = data.typeOfShip
							prevCells[i].ship = true
							if (data.hundido) {
								for (let j = 0; j < prevCells.length; j++) {
									if (prevCells[j].typeOfShip == data.typeOfShip) {
										prevCells[j].hundido = true
									}
								}
								prevShipsSunk.push(data.typeOfShip)
								if (prevShipsSunk.length == 2) {
									setWin(true)
									await insertGame(idLoggued, idPlayer)
								}
							}
						} else {
							prevCells[i].touched = false
							setTurno(false)
						}
					}
				}
				console.log(prevCells)
				console.log(prevShipsSunk)
				setShipsSunk(prevShipsSunk)
				setCellsEnemy(prevCells)
			}
		})
	}, [socket]);

	useEffect(() => {
		if (firstRender) {
			let room
			let numIdLoggued = parseInt(idLoggued);
			let numIdPlayer = parseInt(idPlayer);
			if (numIdLoggued < numIdPlayer) {
				room = "G" + numIdLoggued + numIdPlayer
				socket.emit("joinRoom", { room: room });
				setRoom("G" + numIdLoggued + numIdPlayer);
			} else {
				room = "G" + numIdPlayer + numIdLoggued
				socket.emit("joinRoom", { room: room });
				setRoom("G" + numIdPlayer + numIdLoggued);
			}
		}
	}, [firstRender]);

	useEffect(() => {
		if (ready && otherReady) {
			console.log("Ambos listos")
			if (idLoggued < idPlayer) {
				socket.emit('startMatch', { room: room, idPlayer1: idLoggued, idPlayer2: idPlayer })
			}
		}
	}, [ready, otherReady])

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
		if (respuestaValidaciones == ERROR3) {
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
						setVerticalHorizontal("horizontal")
						if (alreadyPlacedShips.length == 1) {
							setPosible(false)
						} else {
							setPosible(true)
						}
					}
				} else {
					setVerticalHorizontal("vertical")
					if (alreadyPlacedShips.length == 1) {
						setPosible(false)
					} else {
						setPosible(true)
					}
				}
			} else if (respuestaValidaciones == ERROR) {
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

	function changePosition(celda) {
		if (shipSelected > 0) {
			setClickedCells((prev) => [...prev, celda]);
		} else {
			setInconveniente("Seleccione algun barco")
			setBueno(true)
			setShowInconveniente(true)
		}
	}

	function validarHorizontal(letraPrimerCelda, numeroPrimerCelda, letraSegundaCelda, numeroSegundaCelda, shipSelected) {
		let respuesta = ERROR;
		letraSegundaCelda = String(letraSegundaCelda).toUpperCase();
		letraPrimerCelda = String(letraPrimerCelda).toUpperCase();
		if (shipSelected == 2) {
			for (let i = 0; i <= 9; i++) {
				if (i == numeroPrimerCelda) {
					if (numeroSegundaCelda == i + 1 || numeroSegundaCelda == i - 1) {
						respuesta = BARCO_HORIZONTAL;
					}
				}
			}
		} else if (shipSelected == 3 || shipSelected == 3.1) {
			for (let i = 0; i <= 9; i++) {
				if (i == numeroPrimerCelda) {
					if (numeroSegundaCelda == i + 2 || numeroSegundaCelda == i - 2) {
						respuesta = BARCO_HORIZONTAL;
					}
				}
			}
		} else if (shipSelected == 4) {
			for (let i = 0; i <= 9; i++) {
				if (i == numeroPrimerCelda) {
					if (numeroSegundaCelda == i + 3 || numeroSegundaCelda == i - 3) {
						respuesta = BARCO_HORIZONTAL;
					}
				}
			}
		} else if (shipSelected == 5) {
			for (let i = 0; i <= 9; i++) {
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
		} else if (celda1 == celda2) {
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
			if (shipSelected == 2) {
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
			} else if (shipSelected == 3 || shipSelected == 3.1) {
				for (let i = 0; i < letras.length; i++) {
					if (letras[i] == letraPrimerCelda) {
						if (letraSegundaCelda == letras[i - 2] || letraSegundaCelda == letras[i + 2]) {
							respuesta = BARCO_VERTICAL
						}
					}
				}
				if (respuesta != BARCO_VERTICAL) {
					respuesta = VALIDAR_BARCO_HORIZONTAL
				}
			} else if (shipSelected == 4) {
				for (let i = 0; i < letras.length; i++) {
					if (letras[i] == letraPrimerCelda) {
						if (letraSegundaCelda == letras[i - 3] || letraSegundaCelda == letras[i + 3]) {
							respuesta = BARCO_VERTICAL
						}
					}
				}
				if (respuesta != BARCO_VERTICAL) {
					respuesta = VALIDAR_BARCO_HORIZONTAL
				}
			} else if (shipSelected == 5) {
				for (let i = 0; i < letras.length; i++) {
					if (letras[i] == letraPrimerCelda) {
						if (letraSegundaCelda == letras[i - 4] || letraSegundaCelda == letras[i + 4]) {
							respuesta = BARCO_VERTICAL
						}
					}
				}
				if (respuesta != BARCO_VERTICAL) {
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

	async function insertGame(idWinner, idLoser) {
		let result = await fetch("http://localhost:4000/insertGame", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ date: new Date(), idWinner: idWinner, idLoser: idLoser }),
		});
		await result.json();
	}

	function setShips() {
		setClickedCells([])
		setPosible(false)
		if (verticalHorizontal == "vertical") {
			confirmPositionVertical()
		} else if (verticalHorizontal == "horizontal") {
			confirmPositionHorizontal()
		}
		if (shipSelected == 2) {
			setIsDisabled2(true)
		} else if (shipSelected == 3 || shipSelected == 3.1) {
			setIsDisabled3(true)
		} else if (shipSelected == 4) {
			setIsDisabled4(true)
		} else {
			setIsDisabled5(true)
		}
		let array = [...alreadyPlacedShips]
		array.push(shipSelected)
		setAlreadyPlacedShips(array)
		setShipSelected(0)
	}

	function confirmPositionVertical() {
		let letras = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
		let prevCells = [...cells];
		let cantidadDeCasillas = 0
		for (let i = 0; i < prevCells.length; i++) {
			if (prevCells[i].posicion == clickedCells[0]) {
				let letra1 = clickedCells[0].slice(0, 1);
				let letra2 = clickedCells[1].slice(0, 1);
				let index1 = letras.indexOf(letra1);
				let index2 = letras.indexOf(letra2);
				if (index2 > index1) {
					for (let k = 0; k < shipSelected; k++) {
						prevCells[i + cantidadDeCasillas].ship = true
						prevCells[i + cantidadDeCasillas].typeOfShip = shipSelected
						prevCells[i + cantidadDeCasillas].timesTouched = 0
						prevCells[i + cantidadDeCasillas].hundido = false
						prevCells[i + cantidadDeCasillas].shipIndex = k;
						prevCells[i + cantidadDeCasillas].shipLength = shipSelected;
						prevCells[i + cantidadDeCasillas].shipOrientation = "vertical";
						cantidadDeCasillas += 10
					}
				} else {
					for (let k = 0; k < shipSelected; k++) {
						prevCells[i - cantidadDeCasillas].ship = true
						prevCells[i - cantidadDeCasillas].typeOfShip = shipSelected
						prevCells[i - cantidadDeCasillas].timesTouched = 0
						prevCells[i - cantidadDeCasillas].hundido = false
						prevCells[i - cantidadDeCasillas].shipIndex = k;
						prevCells[i - cantidadDeCasillas].shipLength = shipSelected;
						prevCells[i - cantidadDeCasillas].shipOrientation = "vertical";
						cantidadDeCasillas += 10
					}
				}
			}
		}
		setCells(prevCells)
	}

	function confirmPositionHorizontal() {
		let cantidadDeCasillas = 0
		let prevCells = [...cells]
		let numeroPrimerCelda
		let numeroSegundaCelda
		for (let i = 0; i < prevCells.length; i++) {
			if (prevCells[i].posicion == clickedCells[0]) {
				numeroPrimerCelda = parseInt(prevCells[i].posicion.slice(1, 2))
				numeroSegundaCelda = parseInt(clickedCells[1].slice(1, 2))
				console.log("Primer celda: ", numeroPrimerCelda)
				console.log("Segunda celda: ", numeroSegundaCelda)
				if (numeroPrimerCelda < numeroSegundaCelda) {
					for (let j = 0; j < shipSelected; j++) {
						prevCells[i + cantidadDeCasillas].ship = true
						prevCells[i + cantidadDeCasillas].typeOfShip = shipSelected
						prevCells[i + cantidadDeCasillas].timesTouched = 0
						prevCells[i + cantidadDeCasillas].hundido = false
						console.log(prevCells[i])
						prevCells[i + cantidadDeCasillas].shipIndex = j;
						prevCells[i + cantidadDeCasillas].shipLength = shipSelected;
						prevCells[i + cantidadDeCasillas].shipOrientation = "horizontal";
						cantidadDeCasillas += 1
					}
				} else {
					for (let j = 0; j < shipSelected; j++) {
						prevCells[i - cantidadDeCasillas].ship = true
						prevCells[i - cantidadDeCasillas].typeOfShip = shipSelected
						prevCells[i - cantidadDeCasillas].timesTouched = 0
						prevCells[i - cantidadDeCasillas].hundido = false
						prevCells[i - cantidadDeCasillas].shipIndex = j;
						prevCells[i - cantidadDeCasillas].shipLength = shipSelected;
						prevCells[i - cantidadDeCasillas].shipOrientation = "horizontal";
						cantidadDeCasillas += 1
					}
				}
			}
		}
		setCells(prevCells)
	}


	useEffect(() => {
		if (alreadyPlacedShips.length == 2) {
			setPositionsShips(false)
		}
	}, [alreadyPlacedShips]);

	function validarCeldasRepetidas() {
		let respuesta
		for (let i = 0; i < cells.length; i++) {
			if (cells[i].posicion == clickedCells[0]) {
				if (cells[i].ship == true) {
					respuesta = ERROR3
				}
			} else if (cells[i].posicion == clickedCells[1]) {
				if (cells[i].ship == true) {
					respuesta = ERROR3
				}
			}
		}
		return respuesta
	}

	function atack(posicionAtacar) {
		console.log("Ataque")
		socket.emit('atack', { celda: posicionAtacar, from: idLoggued, to: idPlayer, room: room })
	}

	function atackedCells(atackedCell, room) {
		let hundido = false
		let touched = false
		let typeOfShip = 0
		let prevCells = [...cells]
		let prevShipsLost = [...shipsLost]
		for (let i = 0; i < prevCells.length; i++) {
			if (prevCells[i].posicion == atackedCell) {
				if (prevCells[i].ship == true) {
					prevCells[i].touched = true
					for (let j = 0; j < prevCells.length; j++) {
						if (prevCells[i].typeOfShip == prevCells[j].typeOfShip) {
							prevCells[j].timesTouched += 1
						}
					}
					hundido = checkHundido(prevCells[i])
					if (hundido) {
						prevShipsLost.push(prevCells[i].typeOfShip)
						if (prevShipsLost.length == 2) {
							setLose(true)
						}
					}
					touched = true
					typeOfShip = prevCells[i].typeOfShip
				} else {
					prevCells[i].touched = false
					setTurno(true)
				}
			}
		}
		console.log(prevShipsLost)
		setShipsLost(prevShipsLost)
		setCells(prevCells)
		socket.emit('touched/notTouched', { from: idLoggued, to: idPlayer, room: room, touched: touched, cellsAtacked: atackedCell, hundido: hundido, typeOfShip: typeOfShip })
	}

	function checkHundido(posicionBarco) {
		let barcoHundido = false
		if (posicionBarco.typeOfShip == 1) {
			if (posicionBarco.timesTouched == 2) {
				posicionBarco.hundido = true
				barcoHundido = true
			}
		} else if (posicionBarco.typeOfShip == 2 || posicionBarco.typeOfShip == 3) {
			if (posicionBarco.timesTouched == 3) {
				posicionBarco.hundido = true
				barcoHundido = true
			}
		} else if (posicionBarco.typeOfShip == 4) {
			if (posicionBarco.timesTouched == 4) {
				posicionBarco.hundido = true
				barcoHundido = true
			}
		} else if (posicionBarco.typeOfShip == 5) {
			if (posicionBarco.timesTouched == 5) {
				posicionBarco.hundido = true
				barcoHundido = true
			}
		}
		return barcoHundido
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
							await insertGame(idPlayer, idLoggued);
							socket.emit("rendirse", { rendirse: true, room: room, name: name, to: idPlayer });
							router.replace("/lobby");
						}}>
							Rendirse
						</button>
						<button className="btn-no" onClick={() => setRendirse(false)}>
							Cancelar
						</button>
					</div>
				</div>
			)}

			{/*---------------------------*/}

			{win &&
				<div className="popup-gave-up">
					<div className="popup-gave-up-container">
						<h2 className="gaveUp-popup-title">¡Victoria!</h2>
						<div className="gaveUp-popup-medal-container">
							<div className="gaveUp-medal">
								<div className="gaveUp-medal-emoji">🎖️</div>
							</div>
							<div className="gaveUp-medal-count">+30 Medallas</div>
						</div>
						<div className="gaveUp-popup-buttons">
							<button className="gaveUp-popup-button" onClick={() => router.replace("/lobby")}>
								Volver al Lobby
							</button>
						</div>
					</div>
				</div>
			}

			{/*---------------------------*/}

			{lose &&
				<div className="popup-gave-up">
					<div className="popup-gave-up-container">
						<h2 className="gaveUp-popup-title">Derrota</h2>
						<div className="gaveUp-popup-medal-container">
							<div className="gaveUp-medal">
								<div className="gaveUp-medal-emoji">🎖️</div>
							</div>
							<div className="gaveUp-medal-count">+30 Medallas</div>
						</div>
						<div className="gaveUp-popup-buttons">
							<button className="gaveUp-popup-button" onClick={() => router.replace("/lobby")}>
								Volver al Lobby
							</button>
						</div>
					</div>
				</div>
			}

			{/*---------------------------*/}

			{heGaveUp && (
				<div className="popup-gave-up">
					<div className="popup-gave-up-container">
						<h2 className="gaveUp-popup-title">¡Victoria!</h2>
						<p className="gaveUp-popup-message">{friendName} se rindió, ¡ganaste la partida!</p>
						<div className="gaveUp-popup-medal-container">
							<div className="gaveUp-medal">
								<div className="gaveUp-medal-emoji">🎖️</div>
							</div>
							<div className="gaveUp-medal-count">+30 Medallas</div>
						</div>
						<div className="gaveUp-popup-buttons">
							<button className="gaveUp-popup-button" onClick={() => router.replace("/lobby")}>
								Volver al Lobby
							</button>
						</div>
					</div>
				</div>
			)}


			{/*---------------------------*/}

			{showInconveniente && (
				bueno ? (
					<div className="cuadroCompleto" onClick={() => {
						setShowInconveniente(false);
						setInconveniente("");
					}}>
						<div className="conveniente">
							<h2>{inconveniente}</h2>
							<button className="btn cerrarBueno" onClick={() => {
								setShowInconveniente(false);
								setInconveniente("");
							}}>
								Cerrar
							</button>
						</div>
					</div>
				) : (
					<div className="cuadroCompleto" onClick={() => {
						setShowInconveniente(false);
						setInconveniente("");
					}}>
						<div className="inconveniente">
							<h2>{inconveniente}</h2>
							<button className="btn cerrarMalo" onClick={() => {
								setShowInconveniente(false);
								setInconveniente("");
							}}>
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
				{!yaSeRindio && <button className="surrender" onClick={() => setRendirse(true)}>🏳️</button>}

				<div className="top-bar">
					<h1 className="game-title">BATALLA NAVAL</h1>
				</div>

				<div className={`game-main ${duelMode ? "duel-mode" : ""}`}>
					{!duelMode && (
						<aside className="game-aside left-aside">
							<div className="info-card">
								<div className="avatar-wrapper aside-avatar">
									<img src={photo || "/default-avatar.png"} alt="avatar" className="avatar" />
								</div>
								<div className="player-meta">
									<div className="player-name">{name || "Tú"}</div>
									<div className="player-medals">🎖️ {medals ?? 0}</div>
								</div>
							</div>

							<div className="ships-select">
								<h4>Colocar barcos</h4>
								<div className="ship-images-col">
									<button onClick={() => { setShipSelected(2); setClickedCells([]); setPosible(false) }} disabled={isDisabled2} className={`ship-btn ${shipSelected == 2 ? 'active' : ''}`}>
										<img src="/Barco 2x1.png" alt="2" />
									</button>
									<button onClick={() => { setShipSelected(4); setClickedCells([]); setPosible(false) }} disabled={isDisabled4} className={`ship-btn ${shipSelected == 4 ? 'active' : ''}`}>
										<img src="/Barco 4x1.png" alt="4" />
									</button>
								</div>

								<div className="play-button-container aside-play">
									{posible ? (
										<button className="btn jugar" onClick={setShips}>Listo</button>
									) : (alreadyPlacedShips.length == 1 && clickedCells.length == 2) ? (
										<button className="btn jugar" onClick={() => { setShips(); socket.emit('match', { ready: true, to: room, from: idLoggued }); setReady(true); }}>Empezar</button>
									) : (
										<button className="btn" disabled>Selecciona casillas</button>
									)}
								</div>
							</div>
						</aside>
					)}
					<main className="game-panel">
						{positionsShips == true && ready == false ? (
							<div className="boards center-boards">
								<section className="board-section">
									<div className="board player-board">
										{cells.map((u, index) => {
											const isSelected = clickedCells.includes(u.posicion);
											const hasShip = u.ship === true;
											return (
												<button
													key={index}
													onClick={() => changePosition(u.posicion)}
													id={u.posicion}
													className={`cell ${isSelected ? "cell-selected" : ""} ${hasShip ? "cell-ship" : ""}`}
													aria-pressed={isSelected}
												>
													{u.posicion}
												</button>
											)
										})}
									</div>
								</section>
							</div>
						) : positionsShips == false && ready == true && otherReady == false ? (
							<div className="message-panel">Esperando al otro jugador…</div>
						) : positionsShips == false && ready == true && otherReady == true && (
							<div className="boards duel-boards">
								<section className="board-section">

									{turno ?
										<h2 className="this-turn"> {name}</h2>
										: <h2 className="no-turn">{name}</h2>}

									<div className="board player-board">
										{(() => {
											const ships = [];
											cells.forEach((c, i) => {
												if (c.ship && c.shipIndex === 0) {
													ships.push({ startIndex: i, length: c.shipLength, orient: c.shipOrientation || "horizontal", type: c.typeOfShip });
												}
											});
											return ships.map((s, si) => {
												const row = Math.floor(s.startIndex / 10);
												const col = s.startIndex % 10;
												const imgName = `/Barco ${s.type}x1.png`;
												const widthCalc = `calc(${s.length} * var(--cell-size) + ${s.length - 1} * var(--gap, 6px))`;
												const heightCalc = `calc(${s.length} * var(--cell-size) + ${s.length - 1} * var(--gap, 6px))`;
												const left = `calc(var(--board-padding, 12px) + ${col} * var(--cell-size) + ${col} * var(--gap, 6px))`;
												const top = `calc(var(--board-padding, 12px) + ${row} * var(--cell-size) + ${row} * var(--gap, 6px))`;
												return (
													<div
														key={"ship-" + si}
														className="ship-overlay"
														style={{
															left,
															top,
															width: s.orient === "horizontal" ? widthCalc : "calc(var(--cell-size))",
															height: s.orient === "horizontal" ? "calc(var(--cell-size))" : heightCalc,
														}}
														aria-hidden="true"
													>
														<img
															src={imgName}
															alt="barco"
															className="ship-overlay-img"
															style={{
																transform: s.orient === "horizontal" ? "rotate(90deg)" : "none",
																transformOrigin: "center center",
															}}
														/>
													</div>
												);
											});
										})()}

										{cells.map((c, index) => {
											const isSelected = clickedCells.includes(c.posicion);
											const hasShip = c.ship === true;
											return (
												<div key={index} id={c.posicion} className={`cell ${isSelected ? "cell-selected" : ""} ${hasShip ? "cell-ship" : ""}`}>
													<span className="cell-content">
														{c.touched == null ? c.posicion
															: c.touched == false ? <img src="https://png.pngtree.com/png-vector/20240905/ourmid/pngtree-water-splash-clipart-blue-splashing-graphic-element-now-png-image_13758663.png" alt="agua" />
																: <img src="https://png.pngtree.com/png-clipart/20250127/original/pngtree-realistic-explosion-illustration-png-image_19688709.png" alt="impacto" />}
													</span>
												</div>
											);
										})}
									</div>
								</section>

								<section className="board-section">
									{turno ?
										<h2 className="no-turn"> Rival</h2>
										: <h2 className="this-turn">Rival</h2>}
									<div className="board enemy-board">
										{cellsEnemy.map((c, index) => (
											<button onClick={() => atack(c.posicion)} key={index} id={c.posicion} className={"cell"} disabled={c.touched != null || turno == false}>
												{c.touched == null ? c.posicion
													: c.touched == false ? <img src="https://png.pngtree.com/png-vector/20240905/ourmid/pngtree-water-splash-clipart-blue-splashing-graphic-element-now-png-image_13758663.png" alt="agua" />
														: <img src="https://png.pngtree.com/png-clipart/20250127/original/pngtree-realistic-explosion-illustration-png-image_19688709.png" alt="impacto" />}
											</button>
										))}
									</div>
								</section>


							</div>
						)}
					</main>

					{!duelMode && (
						<aside className="game-aside right-aside">
							<div className="info-card">
								<div className="player-meta">
									<div className="player-name">{friendName || "Rival"}</div>
									<div className="player-medals">🎖️ {shipsLost.length}</div>
								</div>
							</div>
						</aside>
					)}
				</div>
			</div>
		</>
	);
}