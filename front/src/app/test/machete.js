/*
📘 Tema: Router en NextJS
*/

// 🧭 1. ¿Qué es el Router en Next.js?
// El Router nos permite navegar entre páginas de forma programática (por código JS)
// o usando enlaces (<Link>).

// - Link: navegación directa (botones o links normales).
// - useRouter: navegación programática (después de validaciones, formularios, etc.)

// Desde Next.js 13+ se usa "next/navigation" (App Router),
// antes se usaba "next/router" (Page Router).

// 💡 Siempre que uses useRouter, el componente debe tener "use client".

"use client";
import { useRouter } from "next/navigation";

export default function MiComponente() {
  const router = useRouter();

  const irAOtraPagina = () => {
    router.push("/otra-pagina"); // Navegación programática
  };

  return <button onClick={irAOtraPagina}>Ir a otra página</button>;
}

/*
🧩 3. Métodos del Router

router.push()      → Navega a una nueva página
router.back()      → Va a la página anterior
router.forward()   → Va hacia adelante
router.refresh()   → Refresca la página actual
router.replace()   → Cambia de página sin guardar la anterior en el historial
*/

// Ejemplos:
const router = useRouter();
router.push("/login");             // Navegación simple
router.push("/perfil?usuario=juan"); // Con query params
router.push(`/usuario/${userId}`);   // Con ruta dinámica

// ⬅️ Volver atrás
router.back();

// ➡️ Adelante
router.forward();

// 🔄 Refrescar la página
router.refresh();

// 🔁 Reemplazar la página actual
router.replace("/dashboard");

/*
🔍 4. useSearchParams - Parámetros de URL

Permite leer lo que viene después del "?" en la URL.
Ejemplo: /perfil?nombre=juan&edad=25
*/

"use client";
import { useSearchParams } from "next/navigation";

export default function MiComponente2() {
  const searchParams = useSearchParams();
  const nombre = searchParams.get("nombre"); // "juan"
  const edad = searchParams.get("edad");     // "25"

  return (
    <div>
      <h2>Perfil de {nombre}</h2>
      <p>Edad: {edad} años</p>
    </div>
  );
}

// Métodos útiles:
const usuario = searchParams.get("usuario");
const tieneUsuario = searchParams.has("usuario");
const todosLosParams = searchParams.toString();
searchParams.forEach((value, key) => console.log(`${key}: ${value}`));

/*
🔗 5. Diferencias entre Link y useRouter
*/

import Link from "next/link";

export default function Menu() {
  return (
    <nav>
      <Link href="/home">Inicio</Link>
      <Link href="/perfil">Perfil</Link>
      <Link href="/contacto">Contacto</Link>
    </nav>
  );
}

/*
✅ Usar Link cuando:
- Navegás directo (menús, links)
- No necesitás lógica previa
- Es importante el SEO

✅ Usar useRouter cuando:
- Navegás después de validaciones
- Hay lógica condicional antes de ir a otra página
- Formularios o pasos múltiples
*/

"use client";
import { useRouter } from "next/navigation";

export default function FormularioLogin() {
  const router = useRouter();

  const manejarLogin = async () => {
    const esValido = validarFormulario();
    if (esValido) {
      const exito = await enviarLogin();
      if (exito) router.push("/dashboard");
    }
  };

  return <button onClick={manejarLogin}>Iniciar Sesión</button>;
}





/*
📘 Tema: Hook useSocket en React
*/

// 🧩 1. Preparativos
// - Descargar useSocket.js y colocarlo en src/hooks
// - Configurar la IP del backend
// - Instalar dependencias:
//   npm i socket.io (backend)
//   npm i socket.io-client (frontend)

// ⚙️ 2. Introducción
// WebSocket permite comunicación bidireccional en tiempo real entre cliente y servidor.
// Ideal para chats, notificaciones, juegos, etc.

// 💻 3. Configuración del Backend
// Ejemplo de configuración con Express + Socket.IO:

const port = process.env.PORT || 4000;
const cors = require("cors");
const session = require("express-session");
app.use(cors());

const server = app.listen(port, () => {
  console.log(`Servidor NodeJS corriendo en http://localhost:${port}/`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const sessionMiddleware = session({
  secret: "supersarasa",
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

/*
🧠 Puntos importantes:
- Puerto por defecto: 4000
- CORS habilita los frontends 3000 y 3001
- Sesiones integradas con Socket.IO
*/

// 🛰️ 3.2 Eventos del Socket
io.on("connection", (socket) => {
  const req = socket.request;

  socket.on("joinRoom", (data) => {
    if (req.session.room) socket.leave(req.session.room);
    req.session.room = data.room;
    socket.join(req.session.room);
    io.to(req.session.room).emit("chat-messages", {
      user: req.session.user,
      room: req.session.room,
    });
  });

  socket.on("pingAll", (data) => {
    io.emit("pingAll", { event: "Ping to all", message: data });
  });

  socket.on("sendMessage", (data) => {
    io.to(req.session.room).emit("newMessage", {
      room: req.session.room,
      message: data,
    });
  });

  socket.on("disconnect", () => console.log("Disconnect"));
});

/*
Eventos:
- connection → se ejecuta al conectarse un cliente
- joinRoom → une a una sala específica
- pingAll → envía mensaje a todos
- sendMessage → mensaje solo dentro de la sala
- disconnect → al desconectarse
*/

// ⚛️ 4. Frontend (React)
import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";

export default function SocketPage() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;
    // Aquí se escuchan eventos del socket
  }, [socket]);

  return <h1>Socket funcionando</h1>;
}

/*
Eventos comunes:
- pingAll
- joinRoom
- sendMessage
- disconnect
*/

// 🟢 5. Ejemplos

// 5.1 PingAll
function pingAll() {
  socket.emit("pingAll", { msg: "Hola desde mi compu" });
}
socket.on("pingAll", (data) => console.log(data));

// 5.2 joinRoom
socket.emit("joinRoom", { room: "pio" });

// 5.3 sendMessage
const [message, setMessage] = useState("");
function sendMessage() {
  socket.emit("sendMessage", { message });
}

// 5.4 Evento personalizado
let contador = 0;
socket.on("eventoPersonalizado", () => {
  contador++;
  socket.emit("respuestaPersonalizada", { contador });
});

// Frontend:
function emitirEvento() {
  socket.emit("eventoPersonalizado");
}

useEffect(() => {
  socket.on("respuestaPersonalizada", (data) => {
    setContador(data.contador);
  });
}, [socket]);

/*
🧩 6. Múltiples puertos en el front:
- Si 3000 está ocupado, Next levanta en 3001.
- El backend ya acepta conexiones desde ambos.
- Podés probar pingAll o sendMessage entre dos clientes (3000 y 3001).
*/
