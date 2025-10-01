// ------------------------------
// 📦 IMPORTACIONES
// ------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const { realizarQuery } = require('./modulos/mysql');

// ------------------------------
// 🚀 INICIALIZACIÓN
// ------------------------------
const app = express();
const port = process.env.PORT || 4000;

// ------------------------------
// 🔐 CONFIGURACIÓN DE SESIONES
// ------------------------------
const sessionMiddleware = session({
	secret: "supersarasa",
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,      // true si usas HTTPS
		httpOnly: true,
		sameSite: 'lax'     // 'none' si frontend y backend están en dominios distintos
	}
});

// ------------------------------
// ⚙️ MIDDLEWARES
// ------------------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({
	origin: ["http://localhost:3000", "http://localhost:3001"],
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true
}));

app.use(sessionMiddleware);

// ------------------------------
// 🚪 ENDPOINT DE PRUEBA
// ------------------------------
app.get('/', (req, res) => {
	res.status(200).send({ message: 'GET Home route working fine!' });
});

// ------------------------------
// 🚀 INICIAR SERVIDOR
// ------------------------------
const server = app.listen(port, () => {
	console.log(`Servidor NodeJS corriendo en http://localhost:${port}/`);
});

// ------------------------------
// 🔌 SOCKET.IO CONFIG
// ------------------------------
const io = require('socket.io')(server, {
	cors: {
		origin: ["http://localhost:3000", "http://localhost:3001"],
		methods: ["GET", "POST", "DELETE", "PUT"],
		credentials: true
	}
});

io.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

// ------------------------------
// 📡 SOCKET.IO EVENTOS
// ------------------------------
/*
	A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
	A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
	A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
*/

io.on("connection", (socket) => {
	const req = socket.request;

	socket.on('joinRoom', data => {
		console.log("🚀 ~ io.on ~ req.session.room:", req.session.room)
		if (req.session.room != undefined) {
			socket.leave(req.session.room);
		}
		req.session.room = data.room;
		socket.join(req.session.room);

		io.to(req.session.room).emit('chat-messages', { user: req.session.user, room: req.session.room });
	});

	socket.on('pingAll', data => {
		console.log("PING ALL: ", data);
		io.emit('pingAll', { event: "Ping to all", message: data });
	});

	socket.on('sendMessage', async data => {
		console.log("Usuario es:", data.obj.id_usuario, "Y room:", req.session.room, "msg:", data.obj.texto)
		io.to(req.session.room).emit('newMessage', { room: req.session.room, message: data.obj });
		await realizarQuery(`INSERT INTO Mensajes (fechayhora, texto, id_chat, id_usuario) VALUES
			('${data.obj.fechayhora}','${data.obj.texto}', ${data.obj.id_chat}, ${data.obj.id_usuario})`)
	});

	socket.on('disconnect', () => {
		console.log("🔌 Usuario desconectado");
	})
});
/*
	A PARTIR DE ACÁ LOS PEDIDOS HTTP (GET, POST, PUT, DELETE)
	A PARTIR DE ACÁ LOS PEDIDOS HTTP (GET, POST, PUT, DELETE)
	A PARTIR DE ACÁ LOS PEDIDOS HTTP (GET, POST, PUT, DELETE)
*/

app.post("/emailuserswithoutchat", async function (req, res) {
	let chatsIndividuales
	let usuariosxChat
	let usuariosSinChat = []
	let usuarios
	let usuariosConChat = []
	try {
		console.log(req.body)
		chatsIndividuales = await realizarQuery(`
			SELECT Chat.id_chat, UsuariosPorChat.id_usuario
			FROM Chat
			INNER JOIN UsuariosPorChat ON Chat.id_chat = UsuariosPorChat.id_chat
			WHERE UsuariosPorChat.id_usuario = ${req.body.idLoggued} AND Chat.grupo = 0;`)
		for (let i = 0; i < chatsIndividuales.length; i++) {
			usuariosxChat = await realizarQuery(`SELECT id_usuario FROM UsuariosPorChat WHERE id_chat = ${chatsIndividuales[i].id_chat}`)
			for (let j = 0; j < usuariosxChat.length; j++) {
				if (usuariosxChat[j].id_usuario != req.body.idLoggued) {
					usuariosConChat.push(usuariosxChat[j].id_usuario)
					usuarios = await realizarQuery(`SELECT id_usuario, email, nombre FROM Usuarios WHERE id_usuario <> ${req.body.idLoggued}`)
				}
			}
		}
		usuarios = await realizarQuery(`SELECT id_usuario, email, nombre, foto FROM Usuarios WHERE id_usuario <> ${req.body.idLoggued}`)
		for (let i = 0; i < usuarios.length; i++) {
			let tieneChat = false
			for (let j = 0; j < usuariosConChat.length; j++) {
				if (usuarios[i].id_usuario == usuariosConChat[j]) {
					tieneChat = true
				}
			}
			if (tieneChat == false) {
				usuariosSinChat.push(usuarios[i])
			}
		}
		res.send({ usuariosSinChat, msg: 1, error: false })
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

app.post('/emailuserswithchat', async function (req, res) {
	let chatsIndividuales
	let usuario
	let respuesta = []
	try {
		console.log(req.body)
		chatsIndividuales = await realizarQuery(`
			SELECT Chat.id_chat
			FROM Chat
			INNER JOIN UsuariosPorChat ON Chat.id_chat = UsuariosPorChat.id_chat
			WHERE UsuariosPorChat.id_usuario = ${req.body.idLoggued} AND Chat.grupo = 0`)
		if (chatsIndividuales.length > 0) {
			for (let i = 0; i < chatsIndividuales.length; i++) {
				usuario = await realizarQuery(`
					SELECT Usuarios.email, Usuarios.nombre, Usuarios.id_usuario
					FROM Usuarios
					INNER JOIN UsuariosPorChat ON Usuarios.id_usuario = UsuariosPorChat.id_usuario
					WHERE UsuariosPorChat.id_chat = ${chatsIndividuales[i].id_chat} AND UsuariosPorChat.id_usuario <> ${req.body.idLoggued}`)
				respuesta = respuesta.concat(usuario)
			}
		}
		res.send({ respuesta, msg: 1, error: false })
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

//Registra un nuevo usuario en la base de datos
app.post('/newuser', async function (req, res) {
	let user = []
	try {
		console.log(req.body)
		user = await realizarQuery(`SELECT * FROM Usuarios WHERE email = '${req.body.email}'`)
		if (user.length == 0) {
			if (req.body.foto == "") {
				req.body.foto = "https://preview.redd.it/why-wall-ilumination-thinks-its-a-whatsapp-default-profile-v0-5vsjfcznlwld1.png?width=360&format=png&auto=webp&s=29beb16ce4bce926b91bd2391ef854b9b103f831"
			}
			await realizarQuery(`
				INSERT INTO Usuarios (foto, descripcion, nombre, email, contraseña) VALUES
				('${req.body.foto}','${req.body.descripcion}','${req.body.nombre}','${req.body.email}','${req.body.contraseña}'); 
			`);
			res.send({
				msg: 1,
				error: false
			})
		} else if (user.length > 0) {
			res.send({ msg: -1, error: false })
		}
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

//Elimina a un usuario por el id
app.delete("/deleteuser", async function (req, res) {
	let deleteuser
	try {
		console.log(req.body)
		deleteuser = await realizarQuery(`DELETE FROM Usuarios WHERE id_usuario ${req.body.id_usuario}`)
		res.send({ deleteuser: deleteuser, msg: "Usuario eliminado", error: false })
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

//Verifica el mail de la contraseña del usuario, si esta en la base de datos manda al front al usuario, si el mail no existe devuelve -1 y si el mail si existe pero la contraseña es incorrecta devuelve -2
app.post('/verifyuser', async function (req, res) {
	let user = []
	try {
		user = await realizarQuery(`SELECT email FROM Usuarios WHERE email = '${req.body.email}'`)
		if (user.length == 0) {
			res.send({ msg: -1, error: false })
		} else if (user.length > 0) {
			user = await realizarQuery(`SELECT * FROM Usuarios WHERE email = '${req.body.email}' AND contraseña = '${req.body.contraseña}'`)
			if (user.length == 0) {
				res.send({ msg: -2, error: false })
			}
			if (user.length == 1) {
				res.send({
					user,
					msg: 1,
					error: false
				})
			}
		}
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

// Valida que la URL sea valida
function esUrlValida(url) {
	try {
		new URL(url);
		return true;
	} catch (e) {
		return false;
	}
}
//Trae los chats del usuario logueado
app.post('/chats', async function (req, res) {
	let chats;
	let usuariosxChat;
	let usuario;
	let grupo
	let respuesta = [];
	try {
		console.log(req.body)
		chats = await realizarQuery(`
			SELECT Chat.*
			FROM Chat
			INNER JOIN UsuariosPorChat ON Chat.id_chat = UsuariosPorChat.id_chat
			WHERE UsuariosPorChat.id_usuario = ${req.body.id_usuario};`)
		if (chats.length > 0) {
			for (let i = 0; i < chats.length; i++) {
				let obj = {
					id_chat: chats[i].id_chat,
					nombre: "",
					descripcion: "",
					foto: "",
					grupo: ""
				}
				if (chats[i].grupo == 0) {
					usuariosxChat = await realizarQuery(`
						SELECT Usuarios.id_usuario, Usuarios.nombre, Usuarios.descripcion, Usuarios.foto
						FROM Usuarios
						INNER JOIN UsuariosPorChat ON Usuarios.id_usuario = UsuariosPorChat.id_usuario
						INNER JOIN Chat ON UsuariosPorChat.id_chat = Chat.id_chat
						WHERE Chat.id_chat = ${chats[i].id_chat};`)
					for (let j = 0; j < usuariosxChat.length; j++) {
						if (usuariosxChat[j].id_usuario != req.body.id_usuario) {
							usuario = usuariosxChat[j]
						}
					}

					if (usuario != undefined) {
						obj.nombre = usuario.nombre;
						obj.descripcion = usuario.descripcion;
						obj.foto = usuario.foto
						if (obj.foto == "" || !esUrlValida(obj.foto)) {
							obj.foto = "https://preview.redd.it/why-wall-ilumination-thinks-its-a-whatsapp-default-profile-v0-5vsjfcznlwld1.png?width=360&format=png&auto=webp&s=29beb16ce4bce926b91bd2391ef854b9b103f831"
						}
						obj.grupo = 0
					}

					obj.grupo = 0;
				} else if (chats[i].grupo == 1) {
					grupo = chats[i]
					if (grupo != undefined) {
						obj.nombre = grupo.nombre;
						obj.descripcion = grupo.descripcion;
						obj.foto = grupo.foto
						if (obj.foto == "" || !esUrlValida(obj.foto)) {
							obj.foto = "https://st5.depositphotos.com/19428878/66513/v/450/depositphotos_665136296-stock-illustration-group-profile-avatar-icon-vector.jpg"
						}
						obj.grupo = grupo.grupo
					}
				}
				respuesta.push(obj)
			}
		} else {
			return res.send({ msg: -1, error: false })
		}
		res.send({ respuesta, msg: 1, error: false })
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

//Trae los mensajes del chat seleccionado
app.post('/bringmessage', async function (req, res) {
	let messages = []
	try {
		console.log(req.body)
		messages = await realizarQuery(`
			SELECT Mensajes.*, Usuarios.nombre 
			FROM Mensajes 
			INNER JOIN Usuarios ON Mensajes.id_usuario = Usuarios.id_usuario
			WHERE id_chat = ${req.body.id_chat}`)
		res.send({ messages, msg: 1, error: false })
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

app.post('/newchat', async function (req, res) {
	let otroUsuario
	try {
		console.log(req.body)
		otroUsuario = await realizarQuery(`SELECT * FROM Usuarios WHERE id_usuario = ${req.body.id_usuario}`)
		if (otroUsuario.length > 0) {
			let newChat = await realizarQuery(`INSERT INTO Chat (nombre, foto, descripcion) VALUES
				("", "", "")`)
			let idNewChat = newChat.insertId
			await realizarQuery(`INSERT INTO UsuariosPorChat (id_usuario, id_chat) VALUES
				(${req.body.id_usuario}, ${idNewChat}),
				(${req.body.id_Loggued}, ${idNewChat})`)
			res.send({ msg: 1, error: false })
		} else {
			res.send({ msg: -1, error: false })
		}
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

app.post('/newgroup', async function (req, res) {
	let otrosUsuarios = []
	try {
		console.log(req.body)
		if (req.body.groupName == "") {
			req.body.groupName = "Grupo"
		}
		for (let i = 0; i < req.body.ids.length; i++) {
			let resultado = await realizarQuery(`SELECT * FROM Usuarios WHERE id_usuario = ${req.body.ids[i]}`)
			otrosUsuarios.push(...resultado)
		}
		if (otrosUsuarios.length >= 3) {
			let newChat = await realizarQuery(`INSERT INTO Chat (nombre, foto, descripcion, grupo) VALUES
				('${req.body.groupName}','${req.body.photo}','${req.body.description}', 1)`)
			let newId = newChat.insertId
			for (i = 0; i < req.body.ids.length; i++) {
				await realizarQuery(`INSERT INTO UsuariosPorChat (id_chat, id_usuario) VALUES
				(${newId}, ${req.body.ids[i]})`)
			}
			res.send({ msg: 1, error: false })
		} else {
			res.send({ msg: -1, error: false })
		}
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})


// falta hecer que esto funcione bien
app.put('/newinfo', async function (req, res) {
	try {
		console.log(req.body)
		if (req.body.newName && req.body.newPhoto && req.body.newDesc) {
			await realizarQuery(`UPDATE Usuarios SET 
				foto = '${req.body.newPhoto}',
				descripcion = '${req.body.newDesc}', 
				nombre = '${req.body.newName}' 
				WHERE id_usuario = ${req.body.idLoggued};`)
		} else if (req.body.newPhoto && req.body.newName) {
			await realizarQuery(`UPDATE Usuarios SET 
				foto = '${req.body.newPhoto}',
				nombre = '${req.body.newName}'
				WHERE id_usuario = ${req.body.idLoggued}`)
		} else if (req.body.newPhoto && req.body.newDesc) {
			await realizarQuery(`UPDATE Usuarios SET
				foto = '${req.body.newPhoto}',
				descripcion = '${req.body.newDesc}' 
				WHERE id_usuario = ${req.body.idLoggued}`)
		} else if (req.body.newName && req.body.newDesc) {
			await realizarQuery(`UPDATE Usuarios SET 
				nombre = '${req.body.newName}',
				descripcion = '${req.body.newDesc}'
				WHERE id_usuario = ${req.body.idLoggued}`)
		} else if (req.body.newPhoto) {
			await realizarQuery(`UPDATE Usuarios SET
				foto = '${req.body.newPhoto}'
				WHERE id_usuario = ${req.body.idLoggued}`)
		} else if (req.body.newName) {
			await realizarQuery(`UPDATE Usuarios SET
				nombre = '${req.body.newName}'
				WHERE id_usuario = ${req.body.idLoggued}`)
		} else if (req.body.newDesc) {
			await realizarQuery(`UPDATE Usuarios SET 
				descripcion = '${req.body.newDesc}' 
				WHERE id_usuario = ${req.body.idLoggued}`)
		}
		res.send({ msg: 1, error: false })
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})

app.put('/editGrp', async function (req, res) {
	try {
		console.log(req.body)
		if (req.body.newName && req.body.newPhoto && req.body.newDesc) {
			await realizarQuery(`UPDATE Chat SET 
				foto = '${req.body.newPhoto}',
				descripcion = '${req.body.newDesc}', 
				nombre = '${req.body.newName}' 
				WHERE id_chat = ${req.body.id_chat};`)
		} else if (req.body.newPhoto && req.body.newName) {
			await realizarQuery(`UPDATE Chat SET 
				foto = '${req.body.newPhoto}',
				nombre = '${req.body.newName}'
				WHERE id_chat= ${req.body.id_chat}`)
		} else if (req.body.newPhoto && req.body.newDesc) {
			await realizarQuery(`UPDATE Chat SET
				foto = '${req.body.newPhoto}',
				descripcion = '${req.body.newDesc}' 
				WHERE id_chat = ${req.body.id_chat}`)
		} else if (req.body.newName && req.body.newDesc) {
			await realizarQuery(`UPDATE Chat SET 
				nombre = '${req.body.newName}',
				descripcion = '${req.body.newDesc}'
				WHERE id_chat = ${req.body.id_chat}`)
		} else if (req.body.newPhoto) {
			await realizarQuery(`UPDATE Chat SET
				foto = '${req.body.newPhoto}'
				WHERE id_chat = ${req.body.id_chat}`)
		} else if (req.body.newName) {
			await realizarQuery(`UPDATE Chat SET
				nombre = '${req.body.newName}'
				WHERE id_chat = ${req.body.id_chat}`)
		} else if (req.body.newDesc) {
			await realizarQuery(`UPDATE Chat SET 
				descripcion = '${req.body.newDesc}' 
				WHERE id_chat = ${req.body.id_chat}`)
		}
		res.send({ msg: 1, error: false })
	} catch (e) {
		res.send({ msg: e.message, error: true })
	}
})