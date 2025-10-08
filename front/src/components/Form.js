"use client"
import styles from "@/components/Form.module.css"

export default function Form(props){
    return (
        <>
            <div className={`${styles.form} ${styles.center} ${styles.como}`}>
            <input onChange={props.onChange} placeholder={props.placeholder}></input>
            <input onChange={props.onChange2} placeholder={props.placeholder2}></input>
            <button onClick={props.onClick}>{props.text}</button>
            </div>
        </>
    )
}