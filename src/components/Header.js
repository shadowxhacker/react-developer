import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineAccountCircle, MdCardTravel, MdOutlineContacts } from "react-icons/md";
import { SiSimplelogin } from "react-icons/si";
import { FcAbout } from "react-icons/fc";
import { FaHome, FaConnectdevelop } from "react-icons/fa";

function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className="sticky top-0 z-50 h-[70px] w-full bg-[#101010]">
            <div className="flex px-5 border-b md:shadow-lg justify-between items-center h-full">
                {/* Logo */}
                <div className="text-2xl font-bold text-cyan-300">
                    <Link to="/">
                        <FaConnectdevelop className='text-[50px]' />
                    </Link>
                </div>

                {/* Navigation menu for small devices */}
                <ul className={`hidden lg:flex lg:items-center lg:static lg:gap-6 ${isOpen ? 'flex' : 'hidden'}`}>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                        <Link className="block py-2 px-3" to="/" onClick={() => setIsOpen(false)}>
                            <FaHome className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                        <Link className="block py-2 px-3" to="/about" onClick={() => setIsOpen(false)}>
                            <FcAbout className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                        <Link className="block py-2 px-3" to="/orders" onClick={() => setIsOpen(false)}>
                            <MdCardTravel className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                        <Link className="block py-2 px-3" to="/contact" onClick={() => setIsOpen(false)}>
                            <MdOutlineContacts className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                        <Link className="block py-2 px-3" to="/signup" onClick={() => setIsOpen(false)}>
                            <SiSimplelogin className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300">
                        <Link className="block py-2 px-3" to="/profile" onClick={() => setIsOpen(false)}>
                            <MdOutlineAccountCircle className="text-3xl" />
                        </Link>
                    </li>
                </ul>

                {/* Mobile menu button */}
                <div className="lg:hidden flex items-center">
                    <button
                        onClick={toggleMenu}
                        className="text-cyan-300 focus:outline-none"
                        aria-label="Toggle navigation"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Navigation menu for small devices with sliding functionality */}
            <div className={`lg:hidden overflow-x-auto whitespace-nowrap bg-zinc-800 ${isOpen ? 'block' : 'hidden'} py-4`}>
                <ul className="flex">
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300 flex-shrink-0">
                        <Link className="block py-2 px-3" to="/" onClick={() => setIsOpen(false)}>
                            <FaHome className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300 flex-shrink-0">
                        <Link className="block py-2 px-3" to="/about" onClick={() => setIsOpen(false)}>
                            <FcAbout className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300 flex-shrink-0">
                        <Link className="block py-2 px-3" to="/orders" onClick={() => setIsOpen(false)}>
                            <MdCardTravel className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300 flex-shrink-0">
                        <Link className="block py-2 px-3" to="/contact" onClick={() => setIsOpen(false)}>
                            <MdOutlineContacts className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300 flex-shrink-0">
                        <Link className="block py-2 px-3" to="/singup" onClick={() => setIsOpen(false)}>
                            <SiSimplelogin className="text-3xl" />
                        </Link>
                    </li>
                    <li className="list-none text-[1.4rem] font-medium hover:bg-cyan-300 hover:text-gray-800 rounded-lg p-[8px] text-cyan-300 flex-shrink-0">
                        <Link className="block py-2 px-3" to="/profile" onClick={() => setIsOpen(false)}>
                            <MdOutlineAccountCircle className="text-3xl" />
                        </Link>
                    </li>
                </ul>
            </div>
        </header>
    );
}

export default Header;
