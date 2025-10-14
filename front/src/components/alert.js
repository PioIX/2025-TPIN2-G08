"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function alert(props) {
    
    return (
        <div>
            <h2>{props.mensaje}</h2>
        </div>
    )
}
