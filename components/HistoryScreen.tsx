import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './Icons';

interface HistoryScreenProps {
  history: GeneratedImage[];
}

export default function HistoryScreen({ history }: HistoryScreenProps) {
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
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 tracking-tighter">Generation History</h1>
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <p>No images generated yet.</p>
          <p className="text-sm">Start creating to see your history here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {history.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer">
              <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              {item.isUpscaled && (
                <div className="absolute top-2 left-2 bg-green-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    UPSCALED
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-end p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item.imageUrl, item.prompt);
                  }}
                  aria-label="Download image"
                  className="absolute top-2 right-2 p-2 bg-gray-800 bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
                <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3">
                  {item.prompt}
                </p>
                <p className="text-gray-300 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
                  {item.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}