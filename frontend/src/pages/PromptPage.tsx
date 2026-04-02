import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';   //  ADDED
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Mic, Send, Sparkles, Lightbulb } from 'lucide-react';

export function PromptPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();       // ✅ GET LOGGED-IN USER
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);

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

  const handleMicClick = () => {
    setIsListening(!isListening);

    if (!isListening) {
      setTimeout(() => {
        setPrompt('Create an e-commerce website for selling books');
        setIsListening(false);
      }, 2000);
    }
  };

  
  //   SAVE PROMPT FUNCTION
 
const [isGenerating, setIsGenerating] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!prompt.trim() || isGenerating) return;
  if (!user) return alert("You must be logged in!");

  setIsGenerating(true); //  block further submissions

  navigate(`/code/${Date.now()}`, { 
    state: { prompt, userId: user.id } 
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
                <div className="p-4 bg-gray-50 flex items-center justify-between gap-4 border-t">
                  <button
                    type="button"
                    onClick={handleMicClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isListening
                        ? 'bg-red-100 text-red-600'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Mic className={`size-5 ${isListening ? 'animate-pulse' : ''}`} />
                    <span className="hidden sm:inline">
                      {isListening ? 'Listening...' : t('voicePrompt')}
                    </span>
                  </button>

                  <button
                    type="submit"
                    disabled={!prompt.trim()}
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
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Be specific about the features</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Mention your target audience</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Include design preferences</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 mt-1">•</span>Use English, Urdu, or Roman Urdu</li>
              </ul>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
