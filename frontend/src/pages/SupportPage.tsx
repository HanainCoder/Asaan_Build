import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import {
  HelpCircle,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Code,
  Zap,
} from 'lucide-react';

export function SupportPage() {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const faqs = [
  {
    id: 1,
    question: 'Apna pehla app kaise banao?',
    answer:
      '“Create New App” section mein jao, apni app ka idea English, Urdu ya Roman Urdu mein likho. Hamara AI aap ke liye custom template generate karega. Aap usay preview, customize aur deploy kar sakte hain.',
  },
  {
    id: 2,
    question: 'Kya main Urdu mein app generate kar sakta hoon?',
    answer:
      'Ji haan! AsaanBuild poori tarah Urdu, Roman Urdu aur English support karta hai. Aap apni app ka idea kisi bhi zubaan mein de sakte hain.',
  },
  {
    id: 3,
    question: 'AsaanBuild kin technologies ka istemaal karta hai?',
    answer:
      'Frontend ke liye React, backend ke liye Node.js/Express aur database ke liye PostgreSQL use hota hai. Saara generated code industry best practices par based hota hai.',
  },
  {
    id: 4,
    question: 'Kya main apna code export kar sakta hoon?',
    answer:
      'Bilkul! Aap pura source code ZIP file ki form mein download kar sakte hain ya seedha GitHub par export kar sakte hain. Generated code par poora haq aapka hota hai.',
  },
  {
    id: 5,
    question: 'Kya main unlimited apps bana sakta hoon?',
    answer:
      'Yeh aapke subscription plan par depend karta hai. Free users 3 apps bana sakte hain, jabke premium users unlimited apps create kar sakte hain.',
  },
  {
    id: 6,
    question: 'Apni generated app ko deploy kaise karun?',
    answer:
      'App generate karne ke baad aap code download karke Vercel, Netlify, ya AWS par deploy kar sakte hain. Hum documentation mein complete deployment guides bhi dete hain.',
  },
];


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    alert('Thank you for your message! Our support team will get back to you soon.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-317">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                <HelpCircle className="size-8 text-white" />
              </div>
              <h1 className="mb-3">{t('support')}</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get help, find answers to common questions, and learn how to use AsaanBuild
              </p>
            </div>

            {/* How to Use Guide */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
              <h2 className="mb-6">{t('howToUse')}</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Sparkles className="size-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2">Step 1: Describe Your Idea</h3>
                    <p className="text-gray-600">
                      Go to "Create New App" and describe your app idea in your own words.
                      You can use English, Urdu, or Roman Urdu.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Code className="size-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2">Step 2: Select a Template</h3>
                    <p className="text-gray-600">
                      Review AI-generated templates that match your requirements. Preview
                      each template and select the one that best fits your needs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <Zap className="size-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2">Step 3: Generate & Deploy</h3>
                    <p className="text-gray-600">
                      View the live preview, download the source code, and deploy your app.
                      You can export to GitHub or download as a ZIP file.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
              <h2 className="mb-6">{t('faqs')}</h2>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                      }
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-left">{faq.question}</span>
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="size-5 text-gray-400 shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="size-5 text-gray-400 shrink-0 ml-2" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="p-4 pt-0 text-gray-600 border-t">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="size-6" />
                <h2 className="text-white">{t('contactSupport')}</h2>
              </div>
              <p className="mb-6 text-blue-100">
                Can't find what you're looking for? Send us a message and we'll get back
                to you as soon as possible.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="support-message" className="block mb-2 text-blue-100">
                    Your Message
                  </label>
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white resize-none min-h-[120px]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <span>Send Message</span>
                  <Send className="size-5" />
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-blue-400">
                <p className="text-sm text-blue-100 mb-2">Other ways to reach us:</p>
                <p className="text-sm">Email: support@asaanbuild.com</p>
                <p className="text-sm">Response time: Within 24 hours</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
