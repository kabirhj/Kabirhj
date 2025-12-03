
import React, { useState, useEffect } from 'react';

const messages = [
    "Warming up the AI artists...",
    "Choreographing pixel movements...",
    "Rendering digital magic...",
    "This can take a few minutes...",
    "Composing the video symphony...",
    "Almost there, adding the final touches...",
    "Teaching pixels to dance...",
    "Brewing a fresh pot of creativity...",
];

export const LoadingIndicator: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-semibold text-gray-300">Generating Your Video</p>
            <p className="text-gray-400 transition-opacity duration-500">{messages[messageIndex]}</p>
        </div>
    );
};
