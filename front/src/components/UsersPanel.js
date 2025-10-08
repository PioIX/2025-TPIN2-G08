"use client"

export default function UsersPanel(props){
    return (
        <>
            <div>
                {props.array.map((user, index) => {
                    return <button key={index} onClick={props.onClick}>{user.name}</button>
                })}
            </div>
        </>
    )
}