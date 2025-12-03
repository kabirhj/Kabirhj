
import React, { useCallback } from 'react';

interface ApiKeyPromptProps {
    onKeySelected: () => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onKeySelected }) => {
    const handleSelectKey = useCallback(async () => {
        if (window.aistudio) {
            try {
                await window.aistudio.openSelectKey();
                // Assume success and proceed to the app, per instructions.
                onKeySelected();
            } catch (error) {
                console.error("Error opening API key selection:", error);
                // Optionally handle the error, e.g., show a message to the user.
            }
        }
    }, [onKeySelected]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full p-8 bg-gray-800 rounded-2xl shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-4 text-white">API Key Required</h1>
                <p className="text-gray-300 mb-6">
                    This application uses Google's Veo model for video generation, which requires a paid Google Cloud project. Please select an API key to continue.
                </p>
                <button
                    onClick={handleSelectKey}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Select API Key
                </button>
                <p className="text-xs text-gray-400 mt-4">
                    For more information on billing, please visit{' '}
                    <a
                        href="https://ai.google.dev/gemini-api/docs/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                    >
                        ai.google.dev/gemini-api/docs/billing
                    </a>.
                </p>
            </div>
        </div>
    );
};
