import React from 'react';
import { useNavigate } from 'react-router-dom';

const Gallery = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10">
            <h1 className="text-4xl font-zentry mb-6">Gallery / Media Room</h1>
            <p className="text-lg text-gray-300 mb-10 text-center max-w-2xl">
                Explore our immersive media collection. This section is under construction and will feature stunning visuals of our wildlife.
            </p>
            <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-50 text-black font-general text-sm uppercase rounded-md hover:bg-blue-100 transition-colors"
            >
                Back to Map
            </button>
        </div>
    );
};

export default Gallery;
