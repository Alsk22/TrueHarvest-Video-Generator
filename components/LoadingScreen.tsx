import React from 'react';

interface LoadingScreenProps {
    message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-4 md:p-12 space-y-6">
            {/* Video Preview Container */}
            <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                {/* Spinner and Messages */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-40 p-4">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-2xl font-semibold mt-6">Creating Your Masterpiece</h2>
                    <p className="text-gray-200 animate-pulse mt-2 max-w-sm">{message}</p>
                </div>

                {/* Watermark */}
                <div className="absolute bottom-4 right-4 text-white text-base font-semibold opacity-40 pointer-events-none select-none">
                    TrueHarvest Video Generator
                </div>
            </div>
            <p className="text-sm text-gray-500">This process can take a few minutes. Please don't close this window.</p>
        </div>
    );
};

export { LoadingScreen };