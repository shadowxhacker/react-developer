import React from 'react';

function Post({ heading, param, button, createdAt}) {

    // Function to format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    // Use current date if createdAt is not provided
    const postDate = createdAt || Date.now();

    return (
        <div className="flex flex-col p-5 lg:px-48 lg:py-11">
            <div className="bg-gray-100 p-5 mb-10">
                <h1 className="font-bold text-2xl mb-2">{heading}</h1>
                <p className="my-3 text-gray-800 font-semibold text-[18px]">{param}</p>
                <button className="text-white font-semibold bg-blue-600 hover:bg-blue-800 p-2 my-1 rounded">
                    {button}
                </button>
                <div className="mt-4 text-gray-600">
                    <p>Created on: {formatDate(postDate)}</p>
                </div>
            </div>
        </div>
    );
}

export default Post;
