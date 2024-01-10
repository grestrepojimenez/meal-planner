import React from 'react'


export default function DateString() {
    const spanishDate = new Date().toLocaleDateString('es-co', { weekday: "long", month: "long", day: "numeric" })
    return (
        <h3 className='text-clamp-20 capitalize text-center'>{spanishDate}</h3>
    )
}
