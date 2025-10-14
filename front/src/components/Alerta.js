"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Alerta(props, onClose) {
    
    return (
        <div className={"container"}>
            <h2>{props.text}</h2><br></br>
            <button onClick={onClose}>Cerrar</button>
        </div>
    )
}
