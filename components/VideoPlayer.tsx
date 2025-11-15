import React, { useState } from 'react';

interface VideoPlayerProps {
    videoUrl: string;
    onGoBack: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onGoBack }) => {
    const [duration, setDuration] = useState<string | null>(null);

    const formatDuration = (seconds: number): string => {
        if (isNaN(seconds) || seconds < 0) return '00:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${paddedMinutes}:${paddedSeconds}`;
    };

    const handleMetadataLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setDuration(formatDuration(e.currentTarget.duration));
    };

    return (
        <div className="flex flex-col items-center text-center p-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Video is Ready!</h2>
            <div className="w-full max-w-2xl bg-black rounded-lg shadow-xl overflow-hidden mb-2">
                <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full aspect-video"
                    onLoadedMetadata={handleMetadataLoad}
                >
                    Your browser does not support the video tag.
                </video>
            </div>
            {duration && (
                <p className="text-sm text-gray-600 mb-4">
                    Video Duration: <span className="font-medium text-gray-800">{duration}</span>
                </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
                <a
                    href={videoUrl}
                    download="inspirational_video.mp4"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download MP4
                </a>
                <button
                    onClick={onGoBack}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Go Back & Edit
                </button>
            </div>
        </div>
    );
};

export { VideoPlayer };
