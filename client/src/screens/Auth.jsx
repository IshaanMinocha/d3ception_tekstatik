import React from 'react'
import { Link } from 'react-router-dom'

function Auth() {
    return (
        <>
            <div>Auth</div>
            <Link to="/dashboard" className='border-2 border-black text-2xl'>Dashboard</Link>
            <Link to="/imgto3d" className='border-2 border-black text-2xl'>Image to 3D</Link>
        </>

    )
}

export default Auth