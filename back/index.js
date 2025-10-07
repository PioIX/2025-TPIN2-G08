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

		io.to(req.session.room).emit('joinRoom', { user: req.session.user, room: req.session.room });
	});

	socket.on('pingAll', data => {
		console.log("PING ALL: ", data);
		data.msj = "holaputo"
		io.emit('ping', {msg: data.msj});
	});

	socket.on('sendMessage', data => {
		console.log("La room es: " + req.session.room + " el mensaje es: " + data.msg)
		io.to(req.session.room).emit('newMessage',  data.msg );
	});

	socket.on('disconnect', () => {
		console.log("🔌 Usuario desconectado");
	})

	socket.on('nameEvent', data =>{
		if (data.msg == "hola"){
			data.msg = "xd"
		} else {
			data.msg = "no xd"
		}
		io.to(req.session.room).emit('nameEvent', data.msg)
	})
});
/*
	A PARTIR DE ACÁ LOS PEDIDOS HTTP (GET, POST, PUT, DELETE)
	A PARTIR DE ACÁ LOS PEDIDOS HTTP (GET, POST, PUT, DELETE)
	A PARTIR DE ACÁ LOS PEDIDOS HTTP (GET, POST, PUT, DELETE)
*/

app.post('/verifyUser', async function(req, res){
	let user
	try {
		console.log(req.body)
		user = await realizarQuery(`SELECT * FROM Users WHERE email = '${req.body.email}'`)
		if (user.length > 0){
			let user = await realizarQuery(`SELECT * FROM Users WHERE email = '${req.body.email}' AND password = '${req.body.password}'`)
			if (user.length > 0){
				res.send({user, msg: 1, error: false})
			} else {
				res.send({msg: -2, error: false})
			}
		} else {
			res.send({msg: -1, error: false})
		}
	} catch(e){
		res.send({msg: e.message, error: true})
	}
})

function esURLValida(str) {
	try {
    	new URL(str)
    	return true
	} catch (e) {
		return false
	}
}

app.post('/newUser', async function (req, res){
	try{
		console.log(req.body)
		if (!req.body.photo && esURLValida(req.body.photo) == false){
			req.body.photo = "https://preview.redd.it/why-wall-ilumination-thinks-its-a-whatsapp-default-profile-v0-5vsjfcznlwld1.png?width=360&format=png&auto=webp&s=29beb16ce4bce926b91bd2391ef854b9b103f831"
		}
		await realizarQuery(`INSERT INTO Users (photo, name, email, password) VALUES 
			('${req.body.photo}', '${req.body.name}', '${req.body.email}', '${req.body.password}')`)
		res.send({msg: 1, error: false})
	} catch(e){
		res.send({msg: e.message, error: true})
	}
})