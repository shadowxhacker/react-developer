import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";

function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <header className="sticky top-0 z-50 h-[70px] w-full bg-zinc-800">
                <div className="flex px-5 border-b md:shadow-lg justify-between items-center h-full">
                    {/* Logo */}
                    <div className="text-2xl font-bold text-cyan-300">
                        <Link to="/">
                            <img className='w-[60px]' src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhvPjLztXFmfFOr9vVoIIIdztMoXAa0URHIJsZPRcVrAIhr5-K726iaCQtr8ixr_mhLWM81d6ErO_1Xg5I54jQFPE4PFFCOcgedDsJJQ-55Ywue2F-19OhrOv7eNBCBlGUJbdSXJB2yNefVCOJ5uYunYZxZ_JKVZrlLHpfJZsn1sC68NkeXJs-96JKx30BX/s320/WhatsApp_Image_2024-09-09_at_11.03.41_PM-removebg-preview.png" alt="Logo" />
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="sm:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-cyan-300 focus:outline-none"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Navigation menu */}
                    <ul className={`sm:flex flex-col sm:flex-row items-center sm:items-center absolute sm:static top-16 left-0 w-full bg-zinc-800 sm:bg-transparent sm:w-auto sm:h-auto pb-4 sm:pb-0 transition-all duration-300 ease-in-out ${isOpen ? 'block' : 'hidden'}`}>
                        <li className="list-none text-[1.4rem] sm:text-[1.4rem] mt-3 sm:mt-0 font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                            <Link className="block sm:inline px-3" to="/" onClick={toggleMenu}>Blog</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.4rem] mt-3 sm:mt-0 font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                            <Link className="block sm:inline px-3" to="/home" onClick={toggleMenu}>Home</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.4rem] mt-3 sm:mt-0 font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                            <Link className="block sm:inline px-3" to="/about" onClick={toggleMenu}>About</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.4rem] mt-3 sm:mt-0 font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                            <Link className="block sm:inline px-3" to="/orders" onClick={toggleMenu}>Orders</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.4rem] mt-3 sm:mt-0 font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                            <Link className="block sm:inline px-3" to="/contact" onClick={toggleMenu}>Contact</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.4rem] mt-3 sm:mt-0 font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                            <Link className="block sm:inline px-3" to="/singup" onClick={toggleMenu}>Sign Up</Link>
                        </li>
                        <li className="list-none text-[1.4rem] sm:text-[1.4rem] mt-3 sm:mt-0 font-medium  rounded-lg p-[8px] text-cyan-300">
                            <Link className="block sm:inline px-3" to="/profile" onClick={toggleMenu}>
                                <CgProfile className="text-2xl" />
                            </Link>
                        </li>
                    </ul>
                </div>
            </header>
        </>
    );
}

export default Header;
