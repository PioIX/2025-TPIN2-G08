"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";


export default function logIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [showAdministracion, setShowAdministracion] = useState(true); /*cambiar esto*/
  const [showInconveniente, setShowInconveniente] = useState(false);
  const [inconveniente, setInconveniente] = useState("");
  const [bueno, setBueno] = useState(false);
  const [allUsers, setUsers] = useState([]);
  const [deleteId, setDeleteId] = useState([]);
  const { socket, isConnected } = useSocket()
  const [id, setId] = useState(0)

  useEffect(() => {
    if (showAdministracion) {
      users();
    }
  }, [showAdministracion]);

  useEffect(() => {
    if (!socket) return

  }, [socket])

  async function login(dataUser) {
    let result = await fetch("http://localhost:4000/verifyUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataUser),
    });
    let response = await result.json();
    return response;
  }

  async function objLogin() {
    let obj = {
      email: email,
      password: password,
    };
    let response = await login(obj);
    if (response.msg == 1) {
      localStorage.setItem("idLoggued", response.user[0].id_user);
      if (response.user[0].admin == 1) {
        setShowAdminOption(true);
        setId(response.user[0].id_user)
      } else {
        socket.emit('joinRoom', { room: "P" + response.user[0].id_user })
        router.replace(`/lobby`);
      }
      setEmail("");
      setPassword("")
    } else if (response.msg == -1) {
      /*alert("El email ingresado no es valido")*/
      console.log("El email ingresado no es válido");
      setShowInconveniente(true)
      setInconveniente("El email ingresado no es válido")
      setBueno(false)
    } else if (response.msg == -2) {
      /*alert("La contraseña ingresada no es valida")*/
      console.log("La contraseña ingresada no es válida");
      setShowInconveniente(true)
      setInconveniente("La contraseña ingresada no es válida")
      setBueno(false)
    }
  }

  async function users() {
    const idLoggued = localStorage.getItem("idLoggued");
    let result = await fetch("http://localhost:4000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idLoggued: idLoggued }),
    });
    let response = await result.json();
    let users = response.users;
    setUsers(users);
  }

  async function deleteUsers(deleteUsers) {
    let result = await fetch("http://localhost:4000/deleteUsers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deleteUsers),
    });
    let response = await result.json();
    if (response.msg == 1) {
      setBueno(true)
      setShowInconveniente(true)
      setInconveniente("Usuarios eliminados con exito")
      setDeleteId([]);
      setShowAdministracion(false);
    } else {
      console.log(response.msg);
      setBueno(false)
      setShowInconveniente(true)
      setInconveniente("Algo ocurrio")
    }
  }

  async function objDelete() {
    let obj = {
      idDelete: deleteId,
    };
    await deleteUsers(obj);
  }

  return (
    <>
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ACA VAN TODOS LOS MODAL */}
      {/* ⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇⬇ */}

      {showAdminOption && (
        <div className="modalAdministracion">
          <button className="btnVolver" onClick={() => setShowAdminOption(false)}>
            ← Volver
          </button>
          <div className="modalAdmin">
            <h2>¡Bienvenido!</h2>
            <button className="btn jugar" onClick={() => { socket.emit('joinRoom', { room: "P" + id }); router.replace(`/lobby`); }}>
              Jugar
            </button>
            <button
              className="btn admin"
              onClick={() => (
                setShowAdminOption(false), setShowAdministracion(true)
              )}
            >
              Administrar
            </button>
          </div>
        </div>
      )}

      {/* ------------------------*/}

      {showAdministracion && (
        <div className="modalAdministracion">
          <button className="btnVolver" onClick={() => setShowAdministracion(false)}>
            Volver
          </button>
          <div className="modalAdmin">
            <h2>Elige el usuario que quiera eliminar</h2>
            {allUsers && allUsers.length > 0 ? (
              <div className="user-listDelete">
                {allUsers.map((user) => {
                  return (
                    <label className="user-itemDelete" key={user.id_user}>
                      <input
                        type="checkbox"
                        checked={deleteId.includes(user.id_user)}  // Marca el checkbox si el id está en deleteId
                        onChange={(e) => {
                          console.log("onChange input");
                          if (e.target.checked) {
                            setDeleteId((prev) => [...prev, user.id_user]);
                          } else {
                            setDeleteId((prev) =>
                              prev.filter((id) => id !== user.id_user)
                            );
                          }
                        }}
                      ></input>
                      <span className="user-nameDelete">{user.name}</span>
                      <span className="user-emailDelete"> - {user.email}</span>
                    </label>
                  );
                })}
                
              </div>
            ) : (
              <h3>No hay usuarios para eliminar</h3>
            )}
            <button className="btn jugar" onClick={objDelete}>
              Aceptar
            </button>
            <button
              className="btn admin"
              onClick={() => {
                setShowAdministracion(false)
                setShowAdminOption(true)
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showInconveniente && (
        bueno ? (
          <div
          className="cuadroCompleto"
          onClick={() => {
            setShowInconveniente(false);
            setInconveniente("");
          }}
        >
          <div
            className="conveniente"
          >
            <h2>{inconveniente}</h2>
            <button
              className="btn cerrarBueno"
              onClick={() => {
                setShowInconveniente(false);
                setInconveniente("");
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
        ) : (
          <div
          className="cuadroCompleto"
          onClick={() => {
            setShowInconveniente(false);
            setInconveniente("");
          }}
        >
          <div
            className="inconveniente"
          >
            <h2>{inconveniente}</h2>
            <button
              className="btn cerrarMalo"
              onClick={() => {
                setShowInconveniente(false);
                setInconveniente("");
              }}
            >
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

      <div className={"container"}>
        <img src="/LogoBN.svg"></img>
        <div className={"form"}>
          <h2 className={"subTitle"}>Iniciar Sesión</h2>
          <div className="input-container">
            <input
            type="email"
            className={"input"}
            placeholder="Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-container">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙉" : "🙈"}
            </span>
          </div>
          <div className={"buttons"}>
            <button className={"button"} type="button" onClick={objLogin}>
              Iniciar Sesión
            </button>
            <a
              className={"link"}
              type="button"
              onClick={() => router.push(`/register`)}
            >
              Registrarse
            </a>
          </div>
        </div>
      </div>

      {/* ⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆⬆*/}
      {/* ACA VA LA PAGINA PRINCIPAL */}
      {/* ACA VA LA PAGINA PRINCIPAL */}
    </>
  );
}
