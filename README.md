# 2025-TPIN2-G08

Creamos el juego Batalla Naval. Primero nos encargamos del inicio de sesión y registro. 

<img src="/imagenes readme/login.png">

Luego, cuando ya inicia sesión (a menos que sea el administrador, que puede elegir si jugar o administrar las cuentas que existen) aparece la pantalla del lobby, donde aparecen tus amigos y si queres agregar más. A ellos les podes mandar invitaciones, y si la acepta, a los dos simultáneamente los envia a la pantalla del juego, en el que cada unno tiene que preparar sus barcos. 

<img src="/imagenes readme/lobby.png">

Al ya terminar esto, se ejecuta la pantalla, también simultáneo, donde por turnos se empieza a tirar explosiones a los barcos. 
El primer turno empieza al azar, y se va cambiando cuando el usuario erra el tiro, si lo adivina tiene otra oportunidad. Esa función del tiro se envía al sokcet, que revisa si esa casilla tiene un barco o no y devuelve ese resultado, y dependiendo de eso sale un png de una explosión o un png de una explosiòn en el agua en respectiva caslla. Los barcos tienen una variable que indica que tan hundido está el barco, la cual va subiendo por cada explosión que recibe hasta que llega hasta el número que le respecte (el tamaño del barco: 2, 3, 4, o 5). Son un solo barco de 2, 4 y 5 casillas y dos barcos de 3 casillas. Cuando se hunden los barcos, se termina la partida y se modifcan las medallas con un sistema de puntos que se le restan o suman al jugador dependiendo de si pierde o gana, y estas medallas aparecen en el perfil. También el jugador puede rendirse si quere, y el sistema de medallas funciona igual.