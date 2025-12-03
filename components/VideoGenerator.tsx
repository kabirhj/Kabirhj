
import React, { useState, useCallback, useEffect } from 'react';
import { AspectRatio, UploadedImage } from '../types';
import { generateVideoFromImage } from '../services/geminiService';
import { LoadingIndicator } from './LoadingIndicator';

interface VideoGeneratorProps {
    onApiKeyError: () => void;
}

const AspectRatioIcon: React.FC<{ ratio: AspectRatio }> = ({ ratio }) => {
    const isLandscape = ratio === '16:9';
    return (
        <div className={`border-2 border-current rounded-sm flex items-center justify-center ${isLandscape ? 'w-8 h-5' : 'w-5 h-8'}`}>
            <span className="text-xs font-mono">{ratio}</span>
        </div>
    );
};

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onApiKeyError }) => {
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
    const [prompt, setPrompt] = useState<string>('আকাশে উড়তেছি');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = (e.target?.result as string).split(',')[1];
                setUploadedImage({
                    base64,
                    mimeType: file.type,
                    name: file.name,
                });
                setGeneratedVideoUrl(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!uploadedImage || !prompt) {
            setError('Please upload an image and provide a prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);

        try {
            const videoUrl = await generateVideoFromImage(prompt, uploadedImage.base64, uploadedImage.mimeType, aspectRatio);
            setGeneratedVideoUrl(videoUrl);
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.message || 'An unknown error occurred.';
            setError(errorMessage);
            if (errorMessage.includes('Requested entity was not found')) {
                onApiKeyError();
            }
        } finally {
            setIsLoading(false);
        }
    }, [uploadedImage, prompt, aspectRatio, onApiKeyError]);
    
    useEffect(() => {
        return () => {
            if (generatedVideoUrl) {
                URL.revokeObjectURL(generatedVideoUrl);
            }
        };
    }, [generatedVideoUrl]);

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Animate Image with Veo</h1>
                <p className="text-gray-400 mt-2">Bring your static images to life with the power of AI video generation.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Controls */}
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col space-y-6">
                    <div>
                        <label className="text-lg font-semibold text-gray-300 mb-2 block">1. Upload Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500 px-2">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">{uploadedImage ? uploadedImage.name : 'PNG, JPG, GIF up to 10MB'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="prompt" className="text-lg font-semibold text-gray-300 mb-2 block">2. Describe the Animation</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A gentle breeze rustles the leaves"
                            rows={3}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                    
                    <div>
                        <label className="text-lg font-semibold text-gray-300 mb-3 block">3. Choose Aspect Ratio</label>
                        <div className="flex space-x-4">
                            {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition ${aspectRatio === ratio ? 'border-blue-500 bg-blue-900/50' : 'border-gray-600 hover:border-gray-500'}`}>
                                    <AspectRatioIcon ratio={ratio} />
                                    <span className="font-medium">{ratio === '16:9' ? 'Landscape' : 'Portrait'}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !uploadedImage}
                        className="w-full mt-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : 'Animate Image'}
                    </button>
                </div>

                {/* Right Column: Display */}
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[400px]">
                    {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg text-center">{error}</div>}
                    
                    {isLoading && <LoadingIndicator />}
                    
                    {!isLoading && !error && generatedVideoUrl && (
                        <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-auto max-h-full rounded-lg" />
                    )}

                    {!isLoading && !error && !generatedVideoUrl && uploadedImage && (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            <img src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`} alt="Preview" className="max-w-full max-h-full rounded-lg object-contain" />
                             <p className="text-gray-400 mt-4">Ready to animate!</p>
                        </div>
                    )}

                    {!isLoading && !error && !generatedVideoUrl && !uploadedImage && (
                        <div className="text-center text-gray-500">
                            <p className="text-xl">Your generated video will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
