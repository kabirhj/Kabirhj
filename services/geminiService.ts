
import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from '../types';

// This function simulates polling for the video generation operation to complete.
const pollOperation = async (operation: any): Promise<any> => {
    let currentOperation = operation;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    while (!currentOperation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
        try {
            currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
        } catch (error) {
            console.error("Polling failed:", error);
            throw new Error("Failed while checking video status. Please try again.");
        }
    }
    return currentOperation;
};

export const generateVideoFromImage = async (
    prompt: string,
    imageData: string,
    mimeType: string,
    aspectRatio: AspectRatio
): Promise<string> => {
    // A new instance is created to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    console.log('Starting video generation...');
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imageData,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    console.log('Polling for video completion...');
    const completedOperation = await pollOperation(operation);
    
    const downloadLink = completedOperation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
        console.error('No download link found in operation response:', completedOperation);
        throw new Error('Video generation finished, but no video URL was found.');
    }

    console.log('Fetching generated video...');
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch the generated video. Status: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
