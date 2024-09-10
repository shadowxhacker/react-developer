import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Post({ heading, param, button, createdAt, image }) {
    const [isTruncated, setIsTruncated] = useState(true);

    useEffect(() => {
        document.title = 'Agency - Blog';
    }, []);

    const navigate = useNavigate();

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const postDate = createdAt || Date.now();

    return (
        <div className="flex flex-col p-5 lg:px-48 lg:py-11">
            <div className="flex flex-col justify-center items-center bg-gray-100 p-5 mb-10 rounded-md shadow-md">
                
                {/* Display image if available */}
                {image && (
                    <img 
                        src={image} 
                        alt={heading} 
                        className="w-full h-auto max-w-[600px] mb-4 object-cover rounded-md"
                    />
                )}

                {/* Render HTML content in heading */}
                <div 
                    className="font-bold text-2xl mb-4 text-gray-800"
                    dangerouslySetInnerHTML={{ __html: heading }}
                />

                {/* Render HTML content in post */}
                <div 
                    className="my-3 text-gray-800 font-medium text-base"
                    dangerouslySetInnerHTML={{ __html: isTruncated ? param.substring(0, 300) + '...' : param }}
                />

                {param.length > 300 && (
                    <button
                        onClick={() => setIsTruncated(!isTruncated)}
                        className="text-blue-600 underline cursor-pointer mb-4"
                    >
                        {/* {isTruncated ? 'Read More' : 'Show Less'} */}
                    </button>
                )}

                <button
                    onClick={() => navigate('/posted', { state: { heading, param, postDate, image } })}
                    className="text-white w-44 font-semibold bg-blue-600 hover:bg-blue-800 p-2 my-1 rounded"
                >
                    {button}
                </button>

                <div className="mt-4 text-gray-600 text-sm">
                    <p>Created on: {formatDate(postDate)}</p>
                </div>
            </div>
        </div>
    );
}

export default Post;
