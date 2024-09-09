import React from 'react'

function Button(props) {
    const name = props.name;
    return (
        <>
           <a
            target='_blank' 
            href='https://www.linkedin.com/in/taha-a-624401268/'
            className="block py-2 px-4 text-center text-white font-medium bg-indigo-600 duration-150 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-lg hover:shadow-none">
            {name}
        </a>
        </>
    )
}

export default Button
