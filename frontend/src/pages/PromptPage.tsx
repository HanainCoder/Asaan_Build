import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Mic, MicOff, Send, Sparkles, Lightbulb } from 'lucide-react';

export function PromptPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [voiceError, setVoiceError] = useState('');
  const [blockedError, setBlockedError] = useState('');  //  ADD THIS

  const recognitionRef = useRef<any>(null);

  const examplePrompts = [
    {
      en: 'Create a restaurant menu website with online ordering',
      ur: 'ریستوران کے لیے آن لائن آرڈرنگ کی ویب سائٹ بنائیں',
    },
    {
      en: 'Build an e-commerce store for handmade crafts',
      ur: 'دستکاری کی مصنوعات کے لیے ای کامرس سٹور بنائیں',
    },
    {
      en: 'Design a portfolio website for a photographer',
      ur: 'فوٹوگرافر کے لیے پورٹ فولیو ویب سائٹ ڈیزائن کریں',
    },
    {
      en: 'Create a blog platform with comments',
      ur: 'کمنٹس کے ساتھ بلاگ پلیٹ فارم بنائیں',
    },
  ];

  // cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // reuse prompt from history page
  useEffect(() => {
    const reusedPrompt = localStorage.getItem('reusePrompt');
    if (reusedPrompt) {
      setPrompt(reusedPrompt);
      localStorage.removeItem('reusePrompt');
    }
  }, []);

  const handleMicClick = () => {
    setVoiceError('');

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
      setVoiceError('Voice input not supported. Please use Chrome or Edge.');
      return;
    }

    // @ts-ignore
    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = voiceLang;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError('');
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPrompt(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setVoiceError('Microphone access denied. Allow microphone in browser settings.');
      } else if (event.error === 'no-speech') {
        setVoiceError('No speech detected. Please try again.');
      } else {
        setVoiceError(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!prompt.trim() || isGenerating) return;
  if (!user) return alert('You must be logged in!');

  setBlockedError(''); // clear previous error

  //  Check with backend before navigating
  setIsGenerating(true);
  try {
    const checkRes = await fetch('http://localhost:5000/api/generateLandingStream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, checkOnly: true }),
    });

    if (!checkRes.ok) {
      const data = await checkRes.json();
      if (data.error === 'blocked') {
        setBlockedError(data.message);
        setIsGenerating(false);
        return; // stop here, don't navigate
      }
    }
  } catch (err) {
    // if check fails, still allow (don't block user for network errors)
  }

  navigate(`/code/${Date.now()}`, {
    state: { prompt, userId: user.id },
  });
};

  const useExample = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col p-6 lg:p-8">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                <Sparkles className="size-8 text-white" />
              </div>
              <h1 className="mb-3">{t('describeYourAppIdea')}</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Tell us what you want to build in your own words. Support for English,
                Urdu, and Roman Urdu.
              </p>
            </div>

            {/* Prompt Input */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('textInput')}
                  className="w-full p-6 resize-none focus:outline-none min-h-[200px]"
                  dir="auto"
                />

                {/* voice error */}
                {voiceError && (
                  <div className="px-6 py-2 bg-red-50 text-red-600 text-sm border-t border-red-100">
                    {voiceError}
                  </div>
                )}
                {blockedError && (
  <div className="px-6 py-3 bg-red-50 border-t border-red-200 flex items-start gap-2">
    <span className="text-red-500 text-lg">⚠️</span>
    <div>
      <p className="text-red-700 text-sm font-medium">یہ ویب سائٹ نہیں بنائی جا سکتی</p>
      <p className="text-red-500 text-xs mt-0.5">{blockedError}</p>
      <p className="text-red-400 text-xs">AsaanBuild only builds legal and positive websites.</p>
    </div>
  </div>
)}

                <div className="p-4 bg-gray-50 flex items-center justify-between gap-4 border-t">

                  {/* left: language picker + mic */}
                  <div className="flex items-center gap-2">
                    <select
                      value={voiceLang}
                      onChange={(e) => setVoiceLang(e.target.value)}
                      disabled={isListening}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none disabled:opacity-50"
                    >
                      <option value="en-US">English / Roman Urdu</option>
                      <option value="ur-PK">اردو (Urdu)</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isListening
                          ? 'bg-red-100 text-red-600'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className={`size-5 animate-pulse`} />
                          <span className="hidden sm:inline text-sm font-medium">
                            Listening... (tap to stop)
                          </span>
                        </>
                      ) : (
                        <>
                          <Mic className="size-5" />
                          <span className="hidden sm:inline text-sm">
                            {t('voicePrompt')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* right: submit */}
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{t('submitPrompt')}</span>
                    <Send className="size-5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Example Prompts */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="size-5 text-yellow-600" />
                <h2>{t('examplePrompts')}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExample(language === 'en' ? example.en : example.ur)}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all group"
                  >
                    <p className="text-sm text-gray-700 group-hover:text-blue-700">
                      {language === 'en' ? example.en : example.ur}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <h3 className="mb-3">💡 Tips for better results</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Be specific about the features you want</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Mention your target audience</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Include design preferences (colors, style)</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Use English, Urdu, or Roman Urdu — voice works in all three</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>For voice input, use Chrome or Edge browser</li>
              </ul>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}