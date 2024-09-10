import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Posted() {
    const location = useLocation();
    const { heading, param, postDate, image } = location.state || {};

    const navigate = useNavigate();

    return (
        <div className="w-full min-h-screen bg-gray-100 flex justify-center p-4">
            <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl bg-white shadow-lg border border-cyan-700 mt-10 mb-10 p-6 rounded-xl min-h-[200px]">
                
                {/* Navigate back button */}
                <div 
                    className="absolute bottom-4 right-4 text-gray-200 text-xl sm:text-2xl font-bold cursor-pointer bg-slate-500 h-9 pl-2 pr-2 rounded-full transition-all duration-300 hover:w-10 hover:bg-fuchsia-500"
                    onClick={() => navigate('/blog')}
                >
                    &larr;
                </div>

                {/* Display Image if available */}
                {image && (
                    <img 
                        src={image} 
                        alt={heading} 
                        className="w-full h-auto object-cover rounded-lg mb-4"
                    />
                )}

                {/* Heading */}
                <h1 className="text-gray-800 font-semibold text-2xl sm:text-3xl mt-5">
                    {heading || 'Default Heading'}
                </h1>

                {/* Param (HTML Content) */}
                <div 
                    className="text-gray-800 font-medium text-base sm:text-lg mt-5 mb-8"
                    dangerouslySetInnerHTML={{ __html: param || 'No additional information available.' }}
                />

                {/* Post Date */}
                <p className="text-gray-600 text-sm mt-2">
                    Created on: {new Date(postDate).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}

export default Posted;
