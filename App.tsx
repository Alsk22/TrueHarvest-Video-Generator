import React, { useState, useEffect, useCallback } from 'react';
import { generateAiDescription, generateInspirationalVideo, pollVideoStatus, synthesizeFinalExplanation } from './services/geminiService';
import type { VideoAspectRatio, AppState, VideoTheme } from './types';
import { ApiKeySelector } from './components/ApiKeySelector';
import { InputForm } from './components/InputForm';
import { LoadingScreen } from './components/LoadingScreen';
import { VideoPlayer } from './components/VideoPlayer';

// FIX: Removed conflicting global declaration for `window.aistudio`.
// The TypeScript error "Subsequent property declarations must have the same type"
// indicates that this property is already declared globally. Removing this
// duplicate declaration resolves the conflict.

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    verseText: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    verseReference: 'John 3:16',
    userDescription: 'A reminder of God\'s immense love for humanity and the gift of eternal life through His Son, Jesus Christ.',
    aspectRatio: '16:9',
    theme: 'Serene Nature',
    videoUrl: null,
    status: 'idle',
    loadingMessage: '',
    error: null,
    apiKeySelected: false
  });

  const checkApiKey = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setAppState(prev => ({ ...prev, apiKeySelected: hasKey }));
    } else {
        // Fallback for environments where aistudio is not available
        console.warn('aistudio is not available. Assuming API key is set in environment.');
        setAppState(prev => ({ ...prev, apiKeySelected: true }));
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const resetState = () => {
    setAppState(prev => ({
        ...prev,
        videoUrl: null,
        status: 'idle',
        loadingMessage: '',
        error: null,
    }));
  };
  
  const handleGenerateAiDescription = async (verseText: string, verseReference: string): Promise<string> => {
    setAppState(prev => ({ ...prev, error: null }));
    try {
        const description = await generateAiDescription(verseText, verseReference);
        return description;
    } catch (err: any) {
        console.error("Error generating AI description:", err);
        const errorMessage = err.message || 'Failed to generate AI description.';
        setAppState(prev => ({ ...prev, status: 'idle', error: errorMessage }));
        throw new Error(errorMessage);
    }
  };

  const handleSynthesize = async (userDescription: string, aiDescription: string): Promise<string> => {
    setAppState(prev => ({ ...prev, error: null }));
    try {
      const result = await synthesizeFinalExplanation(userDescription, aiDescription);
      return result;
    } catch (err: any) {
      console.error("Error synthesizing explanation:", err);
      const errorMessage = err.message || 'Failed to synthesize the final explanation.';
      setAppState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  const getThemePrompt = (theme: VideoTheme): string => {
    switch (theme) {
      case 'Serene Nature':
        return "The visual style should evoke 'Serene Nature'. Use lush green landscapes, tranquil water scenes, and majestic forests. The color palette should be dominated by natural greens, blues, and earthy tones.";
      case 'Golden Hour':
        return "The visual style should evoke the 'Golden Hour'. Use imagery of sunrises and sunsets, with long shadows and a warm, golden glow. The color palette should be rich with oranges, golds, soft yellows, and deep purples.";
      case 'Divine Light':
        return "The visual style should be 'Divine Light'. Use abstract visuals of soft, glowing light rays, lens flares, and ethereal particles. The color palette should be bright and airy, with lots of white, cream, and soft pastel colors.";
      case 'Classic Parchment':
        return "The visual style should be 'Classic Parchment'. Use visuals that mimic old manuscripts, scrolls, and historical illustrations. The color palette should be sepia-toned, with browns, creams, and aged paper textures. The on-screen text should have a classic, calligraphic font style.";
      default:
        return '';
    }
  };

  const handleGenerate = async (verseText: string, verseReference: string, userDescription: string, finalExplanation: string, aspectRatio: VideoAspectRatio, theme: VideoTheme) => {
    setAppState(prev => ({
        ...prev,
        status: 'loading',
        loadingMessage: 'Warming up the AI...',
        error: null,
        videoUrl: null,
        verseText,
        verseReference,
        userDescription,
        aspectRatio,
        theme,
    }));

    try {
        setAppState(prev => ({ ...prev, loadingMessage: 'Crafting your cinematic visuals...' }));
        
        const themeInstructions = getThemePrompt(theme);

        const videoPrompt = `
          Create a high-quality, inspirational Christian video with an aspect ratio of ${aspectRatio}.
          ${themeInstructions}
          The video should visually interpret the Bible verse: "${verseText} (${verseReference})".
          The user's personal reflection is: "${userDescription}". This provides context for the tone.
          The primary on-screen text for the video's narrative is this final, synthesized explanation: "${finalExplanation}".
          The video must feature calm, emotional, gospel-style background music that complements the chosen visual theme.
          Use cinematic visuals like serene nature scenes, a symbolic cross at sunrise, hands clasped in prayer, abstract soft light, and historical scenes of Bethlehem, all filtered through the lens of the chosen theme.
          The on-screen text should display the Bible verse reference (${verseReference}) and the final explanation, integrated with smooth transitions.
          The overall tone should be warm, with soft lighting, reflecting God's love.
          Conclude the video with the simple message: "Jesus Loves You."
        `;
        
        let operation = await generateInspirationalVideo(videoPrompt, aspectRatio);

        const loadingMessages = [
            "Composing the background music...",
            "Rendering your message of hope...",
            "Adding cinematic transitions...",
            "Polishing the final frames...",
            "Almost there, finalizing your video..."
        ];
        let messageIndex = 0;

        while (!operation.done) {
            setAppState(prev => ({ ...prev, loadingMessage: loadingMessages[messageIndex % loadingMessages.length] }));
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await pollVideoStatus(operation);
        }

        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
            setAppState(prev => ({ ...prev, loadingMessage: 'Fetching your video...' }));
            const downloadLink = operation.response.generatedVideos[0].video.uri;
            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAppState(prev => ({ ...prev, videoUrl: url, status: 'success' }));
        } else {
            throw new Error('Video generation completed, but no video URI was found.');
        }

    } catch (err: any) {
        console.error(err);
        const errorMessage = err.message || 'An unknown error occurred during video generation.';
        if (errorMessage.includes("Requested entity was not found.")) {
             setAppState(prev => ({ ...prev, status: 'error', error: "API Key validation failed. Please select your API key again.", apiKeySelected: false }));
        } else {
             setAppState(prev => ({ ...prev, status: 'error', error: errorMessage }));
        }
    }
  };

  const renderContent = () => {
    if (!appState.apiKeySelected) {
        return <ApiKeySelector onKeySelected={() => setAppState(prev => ({...prev, apiKeySelected: true}))} />;
    }
    
    switch (appState.status) {
        case 'loading':
            return <LoadingScreen message={appState.loadingMessage} />;
        case 'success':
            return appState.videoUrl ? <VideoPlayer videoUrl={appState.videoUrl} onGoBack={resetState} /> : null;
        case 'idle':
        case 'error':
        default:
            return <InputForm
                        initialState={{ verseText: appState.verseText, verseReference: appState.verseReference, userDescription: appState.userDescription, aspectRatio: appState.aspectRatio, theme: appState.theme }}
                        onGenerate={handleGenerate}
                        onGenerateAiDescription={handleGenerateAiDescription}
                        onSynthesize={handleSynthesize}
                        // FIX: When InputForm is rendered, the status is never 'loading'.
                        // TypeScript correctly identifies that `appState.status === 'loading'` is always false here.
                        // Passing `false` directly resolves the warning and is logically correct.
                        isLoading={false}
                        error={appState.error}
                    />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-gray-800">
      <main className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl shadow-gray-400/30 overflow-hidden">
        <div className="p-6 sm:p-8 md:p-12">
            <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">TrueHarvest Video Generator</h1>
                <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Transform scripture into a beautiful, shareable video message of hope and faith.</p>
            </header>
            {renderContent()}
        </div>
      </main>
      <footer className="text-center mt-8 text-gray-700 font-medium text-sm bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
        <p>Powered by Google Gemini. Video generation may take a few minutes.</p>
      </footer>
    </div>
  );
};

export default App;
