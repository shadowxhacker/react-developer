import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <header className="sticky top-0 z-50 h-20 w-full bg-zinc-800">
                <div className="flex justify-between items-center h-full px-4">
                    <div className="text-2xl font-bold text-cyan-300">
                        <Link to="/">
                        <img className='w-[70px]' src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhvPjLztXFmfFOr9vVoIIIdztMoXAa0URHIJsZPRcVrAIhr5-K726iaCQtr8ixr_mhLWM81d6ErO_1Xg5I54jQFPE4PFFCOcgedDsJJQ-55Ywue2F-19OhrOv7eNBCBlGUJbdSXJB2yNefVCOJ5uYunYZxZ_JKVZrlLHpfJZsn1sC68NkeXJs-96JKx30BX/s320/WhatsApp_Image_2024-09-09_at_11.03.41_PM-removebg-preview.png" alt="Logo" />
                        </Link>
                    </div>
                    <div className="sm:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-cyan-300 focus:outline-none"
                        >
                            {/* Hamburger Icon */}
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                    </div>
                    <ul className={`sm:flex flex-col sm:flex-row items-center sm:items-start absolute sm:static top-20 left-0 w-full bg-zinc-800 sm:bg-transparent sm:w-auto sm:h-auto pb-5 transition-all duration-300 ease-in-out ${isOpen ? 'block' : 'hidden'}`}>
                        <li className="list-none text-[1.4rem] sm:text-[1.6rem] mt-3 sm:mt-0 font-medium text-cyan-300">
                            <Link className="block sm:inline px-5 sm:pr-10" to="/" onClick={toggleMenu}>Home</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.6rem] mt-3 sm:mt-0 font-medium text-cyan-300">
                            <Link className="block sm:inline px-5 sm:pr-10" to="/orders" onClick={toggleMenu}>Orders</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.6rem] mt-3 sm:mt-0 font-medium text-cyan-300">
                            <Link className="block sm:inline px-5 sm:pr-10" to="/about" onClick={toggleMenu}>About</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.6rem] mt-3 sm:mt-0 font-medium text-cyan-300">
                            <Link className="block sm:inline px-5 sm:pr-10" to="/contact" onClick={toggleMenu}>Contact</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.6rem] mt-3 sm:mt-0 font-medium text-cyan-300">
                            <Link className="block sm:inline px-5 sm:pr-10" to="/blog" onClick={toggleMenu}>Blog</Link>
                        </li>
                    </ul>
                </div>
            </header>
        </>
    );
}

export default Header;
