
import React, { useState } from 'react';

interface ApiKeySelectorProps {
    onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
    const [isOpening, setIsOpening] = useState(false);

    const handleSelectKey = async () => {
        if (!window.aistudio) {
            alert('Aistudio environment not found.');
            return;
        }
        setIsOpening(true);
        try {
            await window.aistudio.openSelectKey();
            // Assume selection is successful and let the parent component handle the state change.
            onKeySelected();
        } catch (error) {
            console.error('Error opening select key dialog:', error);
            alert('Could not open the API key selection dialog. Please try again.');
        } finally {
            setIsOpening(false);
        }
    };

    return (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h2m4 0V5a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6" />
                </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">API Key Required for Video Generation</h2>
            <p className="mt-2 text-gray-600">
                This feature uses the Veo video generation model, which requires you to select your own API key.
                Your key is used only for this session to process your request.
            </p>
            <div className="mt-6">
                <button
                    onClick={handleSelectKey}
                    disabled={isOpening}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isOpening ? 'Opening Dialog...' : 'Select Your API Key'}
                </button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
                For more information on billing and API keys, please visit the{' '}
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                    official documentation
                </a>.
            </p>
        </div>
    );
};

export { ApiKeySelector };
