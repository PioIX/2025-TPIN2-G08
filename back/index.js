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

		io.to(req.session.room).emit('checkRoom', { msg: "Unidos a la room " + req.session.room});
	});

	socket.on('disconnect', () => {
		console.log("🔌 Usuario desconectado");
	})

	socket.on('solicitud', async data =>{
		if (data.rechazar == true){
			io.to(data.room).emit('solicitudBack', data)
		} else if(data.rechazar == false && data.answer == false){
			io.to(data.room).emit('solicitudBack', data)
			idFriend = parseInt(data.room.slice(1, 3))
			await realizarQuery(`INSERT INTO Requests (fromUser, toUser) VALUES
				(${data.idLoggued}, ${idFriend})`)
		} else {
			io.to(data.room).emit('solicitudBack', data)
		}
	})

	socket.on('invitacionJugar', data => {
		io.to(data.room).emit('invitacionBack', data)
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
				if(!user[0].photo || esURLValida(user[0].photo) == false){
					user[0].photo = "https://preview.redd.it/why-wall-ilumination-thinks-its-a-whatsapp-default-profile-v0-5vsjfcznlwld1.png?width=360&format=png&auto=webp&s=29beb16ce4bce926b91bd2391ef854b9b103f831"
				}
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
		if (!req.body.photo || esURLValida(req.body.photo) == false){
			req.body.photo = "https://preview.redd.it/why-wall-ilumination-thinks-its-a-whatsapp-default-profile-v0-5vsjfcznlwld1.png?width=360&format=png&auto=webp&s=29beb16ce4bce926b91bd2391ef854b9b103f831"
		}
		await realizarQuery(`INSERT INTO Users (photo, name, email, password) VALUES 
			('${req.body.photo}', '${req.body.name}', '${req.body.email}', '${req.body.password}')`)
		res.send({msg: 1, error: false})
	} catch(e){
		res.send({msg: e.message, error: true})
	}
})

app.post('/users', async function (req, res){
	try {
		console.log(req.body)
		let users = await realizarQuery(`SELECT * FROM Users WHERE id_user <> ${req.body.idLoggued}`)
		if (users.length > 0){
			res.send({users, msg: 1, error: false})
		} else {
			res.send({msg: 0, error: false})
		}
	} catch(e){
		res.send({msg: -1, error: true})
	}
})

app.post('/deleteUsers', async function (req, res){
	try {
		console.log(req.body)
		for (let i = 0; i < req.body.idDelete.length; i++){
			await realizarQuery(`DELETE FROM Users WHERE id_user = ${req.body.idDelete[i]}`)
		}
		res.send({msg: 1, error: false})
	} catch(e) {
		res.send({msg: e.message, error: true})
	}
})

app.post('/newFriend', async function(req, res){
	try{
		console.log(req.body)
		await realizarQuery(`INSERT INTO Friends (id_user, id_friend) VALUES
			(${req.body.idLoggued}, ${req.body.idFriend})`)
		res.send({msg: 1, error: false})
	} catch(e){
		res.send({msg: e.message, error: true})
	}
})

app.post('/usersFriends', async function(req, res){
	let userRelation
	let usersWithRelation = []
	let usersWithOutRelation = []
	try {
		console.log(req.body)
		let users = await realizarQuery(`SELECT id_user, email, name FROM Users WHERE id_user <> ${req.body.idLoggued}`)
		userRelation = await realizarQuery(`
			SELECT id_user, id_friend
			FROM Friends
			WHERE id_user = ${req.body.idLoggued} OR id_friend = ${req.body.idLoggued}`)
		for (let i = 0; i < userRelation.length; i++){
			if (userRelation[i].id_user != req.body.idLoggued){
				usersWithRelation.push(userRelation[i].id_user)
			} else {
				usersWithRelation.push(userRelation[i].id_friend)
			}
		}
		for (let i = 0; i < users.length; i++){
			if (usersWithRelation.includes(users[i].id_user) == false){
				usersWithOutRelation.push(users[i])
			}
		}
		res.send({usersWithOutRelation, msg: 1, error: false})
	} catch(e){
		res.send({msg: e.message, error: true})
	}
})

app.post('/friends', async function(req, res){
	let userRelations
	let idUserFriend = []
	let userFriends = []
	try {
		console.log(req.body)
		userRelations = await realizarQuery(`
			SELECT id_user, id_friend
			FROM Friends
			WHERE id_user = ${req.body.idLoggued} OR id_friend = ${req.body.idLoggued}`)
		for (let i = 0; i < userRelations.length; i++){
			if (userRelations[i].id_user != req.body.idLoggued){
				idUserFriend.push(userRelations[i].id_user)
			} else {
				idUserFriend.push(userRelations[i].id_friend)
			}
		}
		for (let i = 0; i < idUserFriend.length; i++){
			userFriends = userFriends.concat(await realizarQuery(`
				SELECT Users.id_user, Users.email, Users.name
				FROM Users
				WHERE Users.id_user = ${idUserFriend[i]}`))
		}
		res.send({userFriends, msg: 1, error: false})
	} catch(e){
		res.send({msg: e.message, error: true})
	}
})

app.post('/invitations', async function(req, res){
	let fromUsers = []
	try{
		console.log(req.body)
		let invitations = await realizarQuery(`SELECT fromUser FROM Requests WHERE toUser = ${req.body.idLoggued}`)
		console.log(invitations)
		for (let i = 0; i < invitations.length; i++){
			fromUsers = fromUsers.concat(await realizarQuery(`
				SELECT email, name, id_user
				FROM Users
				WHERE id_user = ${invitations[i].fromUser}`))
		}
		res.send({fromUsers, msg: 1, error: false})
	} catch(e) {
		res.send({msg: e.message, error: true})
	}
})

app.post('/deleteinvitations', async function(req, res){
	try {
		console.log(req.body)
		await realizarQuery(`DELETE FROM Requests WHERE toUser = ${req.body.idLoggued} AND fromUser = ${req.body.from}`)
		res.send({msg: 1, error: false})
	} catch(e){
		res.send({msg: e.message, error: true})
	}
})

app.post('/checkinvitation', async function(req, res){
	try {
		let check = await realizarQuery(`SELECT * FROM Requests WHERE fromUser = ${req.body.from} AND toUser = ${req.body.to}`)
		if (check.length > 0){
			res.send({msg: -1, error: false})
		} else {
			res.send({msg: 1, error: false})
		}
	} catch(e){
		res.send({msg: e.message, error: true})
	}
})

app.post('/friendprofile', async function(req, res){
	try {
		let friend = await realizarQuery(`SELECT id_user, email, name, photo, medals FROM Users WHERE id_user = ${req.body.idFriend}`)
		res.send({friend, msg: 1, error: false})
	} catch(e) {
		res.send({msg: e.message, error: true})
	}
})