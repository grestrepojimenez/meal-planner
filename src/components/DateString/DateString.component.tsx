import React from 'react'

export default function DateString() {
    const spanishDate = new Date().toLocaleDateString('es-co', { 
        weekday: "long", 
        month: "long", 
        day: "numeric",
        year: "numeric"
    })
    
    const time = new Date().toLocaleTimeString('es-co', {
        hour: '2-digit',
        minute: '2-digit'
    })
    
    return (
        <div className='text-center space-y-2'>
            <h3 className='text-clamp-20 font-bold text-gray-800 capitalize'>
                {spanishDate}
            </h3>
        </div>
    )
}
