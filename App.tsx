import React, { useState } from 'react';
import { extractEventDetails } from './services/geminiService';
import { CalendarEvent } from './types';
import EventEditor from './components/EventEditor';
import InputSection from './components/InputSection';
import { Calendar, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventData, setEventData] = useState<CalendarEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!inputText.trim() && !selectedImage) return;

    setIsProcessing(true);
    setError(null);
    setEventData(null);

    try {
      const result = await extractEventDetails(inputText, selectedImage);
      setEventData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to extract event details. Please try again or check your API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setEventData(null);
    setInputText('');
    setSelectedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              SendToCal
            </h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            AI-Powered Calendar Helper
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input */}
          <section className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Input Event
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Paste an email, message, or screenshot containing event details. The AI will extract the structured data for you.
              </p>
              
              <InputSection 
                value={inputText} 
                image={selectedImage}
                onChange={setInputText} 
                onImageChange={setSelectedImage}
                onSubmit={handleProcess}
                isLoading={isProcessing}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Tips Section */}
            {!eventData && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-blue-900 font-semibold text-sm mb-2">Try pasting something like:</h3>
                <p className="text-blue-800 text-sm italic">
                  "Let's meet for a project sync next Tuesday at 2pm at the Starbucks on 4th street." 
                </p>
                <p className="text-blue-800 text-sm italic mt-2">
                  or <strong>paste a screenshot</strong> of an event flyer!
                </p>
              </div>
            )}
          </section>

          {/* Right Column: Output */}
          <section className="space-y-6">
            <div className={`transition-all duration-500 ease-in-out ${eventData ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
              {eventData ? (
                <EventEditor 
                  initialData={eventData} 
                  onReset={handleReset}
                />
              ) : (
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-80 flex flex-col items-center justify-center text-gray-400">
                  <Calendar className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Event preview will appear here</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          Powered by Gemini 2.5 Flash
        </div>
      </footer>
    </div>
  );
};

export default App;