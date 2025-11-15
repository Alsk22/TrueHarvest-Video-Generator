import React, { useState } from 'react';
import type { VideoAspectRatio, VideoTheme } from '../types';

interface InputFormProps {
    initialState: {
        verseText: string;
        verseReference: string;
        userDescription: string;
        aspectRatio: VideoAspectRatio;
        theme: VideoTheme;
    };
    onGenerate: (verseText: string, verseReference: string, userDescription: string, finalExplanation: string, aspectRatio: VideoAspectRatio, theme: VideoTheme) => void;
    onGenerateAiDescription: (verseText: string, verseReference: string) => Promise<string>;
    onSynthesize: (userDescription: string, aiDescription: string) => Promise<string>;
    isLoading: boolean;
    error: string | null;
}

const themeOptions: { name: VideoTheme; description: string; gradient: string }[] = [
    { name: 'Serene Nature', description: 'Lush landscapes, tranquil waters.', gradient: 'from-green-200 to-blue-200' },
    { name: 'Golden Hour', description: 'Warm, glowing light of sunrise/sunset.', gradient: 'from-yellow-200 to-orange-300' },
    { name: 'Divine Light', description: 'Ethereal, soft light rays and particles.', gradient: 'from-white to-yellow-100' },
    { name: 'Classic Parchment', description: 'Aged paper, sepia tones, classic fonts.', gradient: 'from-amber-100 to-yellow-200' },
];

// FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'".
const FormStep: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white/60 p-6 rounded-xl shadow-lg border border-gray-200/50">
        <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                {icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);


const InputForm: React.FC<InputFormProps> = ({ initialState, onGenerate, onGenerateAiDescription, onSynthesize, isLoading, error }) => {
    const [verseText, setVerseText] = useState(initialState.verseText);
    const [verseReference, setVerseReference] = useState(initialState.verseReference);
    const [userDescription, setUserDescription] = useState(initialState.userDescription);
    const [finalExplanation, setFinalExplanation] = useState('');
    const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(initialState.aspectRatio);
    const [theme, setTheme] = useState<VideoTheme>(initialState.theme);
    const [aiDescription, setAiDescription] = useState('');
    const [isGeneratingAiDesc, setIsGeneratingAiDesc] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    const handleGenerateAiClick = async () => {
        if (!verseText.trim() || !verseReference.trim()) {
            alert("Please enter the full Bible verse and its reference first.");
            return;
        }
        setIsGeneratingAiDesc(true);
        setAiDescription('');
        setFinalExplanation(''); // Clear previous final explanation
        try {
            const desc = await onGenerateAiDescription(verseText, verseReference);
            setAiDescription(desc);
        } catch (e) {
            console.error(e);
            // Error is handled and displayed at the App level
        } finally {
            setIsGeneratingAiDesc(false);
        }
    };

    const handleSynthesizeClick = async () => {
        setIsSynthesizing(true);
        try {
            const result = await onSynthesize(userDescription, aiDescription);
            setFinalExplanation(result);
        } catch (e) {
            console.error(e);
            // Error is handled at the App level
        } finally {
            setIsSynthesizing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!finalExplanation.trim()) {
            alert('Please generate the final explanation before creating the video.');
            return;
        }
        onGenerate(verseText, verseReference, userDescription, finalExplanation, aspectRatio, theme);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg shadow" role="alert">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}
            
            <FormStep icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} title="Step 1: The Scripture">
                <div>
                    <label htmlFor="verseText" className="block text-sm font-medium text-gray-700 mb-1">Full Verse Text</label>
                    <textarea id="verseText" value={verseText} onChange={(e) => setVerseText(e.target.value)} rows={4} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., For God so loved the world..." required />
                </div>
                <div>
                    <label htmlFor="verseReference" className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <input type="text" id="verseReference" value={verseReference} onChange={(e) => setVerseReference(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., John 3:16" required />
                </div>
            </FormStep>

            <FormStep icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} title="Step 2: Your Reflection">
                 <textarea id="userDescription" rows={3} value={userDescription} onChange={(e) => setUserDescription(e.target.value)} className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Share your personal thoughts. This helps the AI understand your perspective." required />
                 <button type="button" onClick={handleGenerateAiClick} disabled={isGeneratingAiDesc} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-wait transition-colors">
                    {isGeneratingAiDesc ? 'Generating...' : 'Get AI Suggestion'}
                 </button>
            </FormStep>
            
            {isGeneratingAiDesc && <div className="p-4 text-sm text-blue-700 bg-blue-100 rounded-lg flex items-center shadow"><svg className="w-5 h-5 mr-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating AI suggestion...</div>}
            
            {aiDescription && (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
                        <h3 className="text-sm font-semibold text-gray-800">AI-Powered Suggestion:</h3>
                        <p className="mt-1 text-sm text-gray-600">{aiDescription}</p>
                    </div>

                    <FormStep icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>} title="Step 3: The Final Message">
                        <p className="text-sm text-gray-600">Now, let's combine the heart of your reflection with the AI's clarity to create the perfect on-screen text for your video.</p>
                        <div className="text-center">
                            <button type="button" onClick={handleSynthesizeClick} disabled={isSynthesizing || isGeneratingAiDesc} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-wait transition-colors">
                                {isSynthesizing ? 'Creating...' : '✨ Combine & Refine Final Text'}
                            </button>
                        </div>
                        <textarea id="finalExplanation" rows={3} value={finalExplanation} onChange={(e) => setFinalExplanation(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Click the button above to generate a short, combined explanation for your video." required />
                    </FormStep>
                </div>
            )}

            <FormStep icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} title="Step 4: Video Style">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {themeOptions.map((opt) => (
                            <button key={opt.name} type="button" onClick={() => setTheme(opt.name)} className={`p-3 border rounded-lg text-left transition-all duration-200 ${theme === opt.name ? 'border-blue-500 ring-2 ring-blue-500' : 'bg-white hover:bg-gray-50 hover:border-gray-300'}`}>
                                <div className={`w-full h-10 rounded-md mb-2 bg-gradient-to-br ${opt.gradient}`}></div>
                                <span className="font-semibold text-sm text-gray-800 block">{opt.name}</span>
                                <span className="text-xs text-gray-500">{opt.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setAspectRatio('16:9')} className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${aspectRatio === '16:9' ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'bg-white hover:bg-gray-50 hover:border-gray-300'}`}>
                            <div className="w-20 h-11 bg-gray-300 rounded-sm mb-2 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg></div>
                            <span className="font-medium text-sm text-gray-700">16:9 (Landscape)</span>
                        </button>
                        <button type="button" onClick={() => setAspectRatio('9:16')} className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${aspectRatio === '9:16' ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'bg-white hover:bg-gray-50 hover:border-gray-300'}`}>
                            <div className="w-11 h-20 bg-gray-300 rounded-sm mb-2 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4v.01M12 4v.01M16 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                            <span className="font-medium text-sm text-gray-700">9:16 (Portrait)</span>
                        </button>
                    </div>
                </div>
            </FormStep>

            <div className="pt-4">
                <button type="submit" disabled={isLoading || !finalExplanation} className="w-full flex items-center justify-center gap-3 py-4 px-4 border border-transparent rounded-md shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {isLoading ? 'Generating Video...' : 'Create My Video'}
                </button>
            </div>
        </form>
    );
};

export { InputForm };
