import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, GeneratedImage } from '../types';
import { generateImageFromText, generateImageWithReference, upscaleImage } from '../services/geminiService';
import { UploadIcon, XIcon, SparklesIcon, DownloadIcon, UpscaleIcon, CheckCircleIcon } from './Icons';

interface MainScreenProps {
  user: User;
  addImageToHistory: (image: GeneratedImage) => void;
  deductCredits: (amount: number) => void;
  updateImageInHistory: (imageId: string, newImageUrl: string) => void;
  recordFreeGeneration: () => void;
}

const Loader: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
        <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <p className="mt-6 text-lg text-white font-medium tracking-wide text-center px-4">{message}</p>
    </div>
);

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};


export default function MainScreen({ user, addImageToHistory, deductCredits, updateImageInHistory, recordFreeGeneration }: MainScreenProps) {
    const [prompt, setPrompt] = useState('');
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("A.K ai is thinking...");
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
    const [isUpscaling, setIsUpscaling] = useState(false);

    const isFreePlan = user.plan === 'Free';
    const dailyLimit = 10;
    const generationsLeft = dailyLimit - user.dailyGenerations;

    const generationCost = useMemo(() => (referenceImage ? 20 : 10), [referenceImage]);
    const upscaleCost = 5;

    const canGenerate = isFreePlan ? generationsLeft > 0 : user.credits >= generationCost;

    useEffect(() => {
        if (isLoading) {
            const messages = [
                "Consulting the digital muse...",
                "Painting with algorithms...",
                "Brewing high-resolution pixels...",
                "This might take a moment...",
                "Finalizing the details..."
            ];
            let messageIndex = 0;
            setLoadingMessage(messages[messageIndex]);
    
            const interval = setInterval(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                setLoadingMessage(messages[messageIndex]);
            }, 2500);
    
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReferenceImage(file);
            setReferenceImagePreview(URL.createObjectURL(file));
        }
    };

    const clearReferenceImage = () => {
        setReferenceImage(null);
        setReferenceImagePreview(null);
    };

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || !canGenerate) {
            if(!canGenerate) setError(isFreePlan ? `You've reached your daily limit of ${dailyLimit} free generations.` : "Not enough credits!");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentImage(null);

        try {
            let imageUrl: string;
            if (referenceImage) {
                const imageBase64 = await fileToBase64(referenceImage);
                imageUrl = await generateImageWithReference(prompt, imageBase64, referenceImage.type);
            } else {
                imageUrl = await generateImageFromText(prompt, aspectRatio);
            }

            const newImage: GeneratedImage = {
                id: new Date().toISOString(),
                prompt,
                imageUrl,
                timestamp: new Date().toLocaleString(),
                referenceImageUrl: referenceImagePreview || undefined,
                isUpscaled: false,
            };
            setCurrentImage(newImage);
            addImageToHistory(newImage);
            
            if (isFreePlan) {
                recordFreeGeneration();
            } else {
                deductCredits(generationCost);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, referenceImage, user, generationCost, addImageToHistory, deductCredits, recordFreeGeneration, referenceImagePreview, aspectRatio, canGenerate, isFreePlan]);
    
    const handleUpscale = useCallback(async () => {
        if (!currentImage || user.credits < upscaleCost) {
          if (user.credits < upscaleCost) setError(`Not enough credits for upscaling! (${upscaleCost} required)`);
          return;
        }
        
        setIsUpscaling(true);
        setError(null);
    
        try {
          const upscaledImageUrl = await upscaleImage(currentImage.imageUrl);
          
          const updatedImage: GeneratedImage = {
            ...currentImage,
            imageUrl: upscaledImageUrl,
            isUpscaled: true,
          };
    
          setCurrentImage(updatedImage);
          updateImageInHistory(currentImage.id, upscaledImageUrl);
          deductCredits(upscaleCost);
    
        } catch (e) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred during upscale.');
        } finally {
          setIsUpscaling(false);
        }
      }, [currentImage, user.credits, upscaleCost, updateImageInHistory, deductCredits]);

    const handleDownload = (imageUrl: string, promptText: string) => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        const safePrompt = promptText.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 30);
        const extension = imageUrl.startsWith('data:image/jpeg') ? 'jpeg' : 'png';
        link.download = `ak_ai_${safePrompt || 'generated'}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const aspectRatios: { value: '1:1' | '16:9' | '9:16'; label: string }[] = [
        { value: '1:1', label: 'Square' },
        { value: '16:9', label: 'Landscape' },
        { value: '9:16', label: 'Portrait' },
    ];

    return (
        <div className="p-4 flex flex-col h-full relative">
            {isLoading && <Loader message={loadingMessage} />}
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold tracking-tighter">A.K ai</h1>
                <div className="text-right">
                    {isFreePlan ? (
                        <div className="bg-gray-800 text-green-400 font-semibold px-3 py-1 rounded-full text-sm">
                            {generationsLeft} / {dailyLimit} Free Today
                        </div>
                    ) : (
                        <div className="bg-gray-800 text-green-400 font-semibold px-3 py-1 rounded-full text-sm">
                            {user.credits} Credits
                        </div>
                    )}
                </div>
            </header>
            
            <div className="flex-grow flex flex-col justify-center">
                {currentImage ? (
                    <div className="relative group w-full aspect-square rounded-lg overflow-hidden shadow-2xl shadow-green-500/20">
                        <img src={currentImage.imageUrl} alt="Generated art" className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 right-4 flex items-center gap-x-2">
                          {!currentImage.isUpscaled && (
                            <button
                              onClick={handleUpscale}
                              disabled={isUpscaling || user.credits < upscaleCost}
                              className="flex items-center justify-center bg-gray-800/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                              aria-label="Upscale image"
                            >
                              {isUpscaling ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Upscaling...
                                </>
                              ) : (
                                <>
                                  <UpscaleIcon className="w-5 h-5 mr-2" />
                                  <span>Upscale ({upscaleCost} Cr)</span>
                                </>
                              )}
                            </button>
                          )}
                          {currentImage.isUpscaled && (
                            <div className="flex items-center bg-green-500/30 backdrop-blur-sm text-green-300 text-sm font-semibold px-3 py-2 rounded-full">
                              <CheckCircleIcon className="w-5 h-5 mr-1.5" />
                              Upscaled
                            </div>
                          )}
                          <button
                              onClick={() => handleDownload(currentImage.imageUrl, currentImage.prompt)}
                              className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-transform transform hover:scale-110 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
                              aria-label="Download image"
                          >
                              <DownloadIcon className="w-6 h-6" />
                          </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                        <SparklesIcon className="w-16 h-16"/>
                    </div>
                )}
            </div>

            {error && <p className="text-red-400 text-center my-2">{error}</p>}
            
            <div className="mt-auto pt-4">
                 {referenceImagePreview && (
                    <div className="relative w-20 h-20 mb-2 rounded-lg overflow-hidden">
                        <img src={referenceImagePreview} alt="Reference" className="w-full h-full object-cover" />
                        <button onClick={clearReferenceImage} className="absolute top-0 right-0 bg-black bg-opacity-50 rounded-full p-0.5 m-1 text-white">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {!referenceImagePreview && (
                    <div className="mb-3">
                        <div className="grid grid-cols-3 gap-2">
                            {aspectRatios.map((ratio) => (
                                <button
                                    key={ratio.value}
                                    onClick={() => setAspectRatio(ratio.value)}
                                    className={`py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                        aspectRatio === ratio.value
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {ratio.label} ({ratio.value})
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A futuristic city on a distant planet..."
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pr-24 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                    />
                     <label htmlFor="file-upload" className="absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer text-gray-400 hover:text-white">
                        <UploadIcon className="w-6 h-6" />
                        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim() || !canGenerate}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
                >
                    Generate
                    <span className="ml-2 bg-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {isFreePlan ? 'FREE' : `${generationCost} Cr`}
                    </span>
                </button>
            </div>
        </div>
    );
}