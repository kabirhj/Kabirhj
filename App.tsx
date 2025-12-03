
import React, { useState, useEffect, useCallback } from 'react';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { VideoGenerator } from './components/VideoGenerator';

// Assume window.aistudio is available in the execution context
// FIX: Defined an AIStudio interface to avoid type conflicts with other global declarations.
interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}
declare global {
    interface Window {
        aistudio?: AIStudio;
    }
}

const App: React.FC = () => {
    const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
        } else {
            // Fallback for local development if aistudio is not available
            console.warn("window.aistudio is not available. Assuming API key is set via environment variables.");
            setIsKeySelected(true);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleKeySelected = () => {
        setIsKeySelected(true);
    };
    
    const handleResetKey = () => {
        setIsKeySelected(false);
    }

    if (isKeySelected === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            {!isKeySelected ? (
                <ApiKeyPrompt onKeySelected={handleKeySelected} />
            ) : (
                <VideoGenerator onApiKeyError={handleResetKey} />
            )}
        </div>
    );
};

export default App;
