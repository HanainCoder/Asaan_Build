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
      question: 'How do I create my first app?',
      answer:
        'Navigate to the "Create New App" section, describe your app idea in English or Urdu, and our AI will generate a custom template for you. You can then preview, customize, and deploy your app.',
    },
    {
      id: 2,
      question: 'Can I use Urdu for app generation?',
      answer:
        'Yes! AsaanBuild supports full Urdu input with RTL (Right-to-Left) support. You can describe your app in Urdu, Roman Urdu, or English.',
    },
    {
      id: 3,
      question: 'What technologies are used?',
      answer:
        'We use React for frontend, Node.js/Express for backend, and PostgreSQL for database. All generated code is production-ready and follows industry best practices.',
    },
    {
      id: 4,
      question: 'Can I export my code?',
      answer:
        'Absolutely! You can download your complete source code as a ZIP file or export directly to GitHub. You own all the code we generate.',
    },
    {
      id: 5,
      question: 'Is there a limit to how many apps I can create?',
      answer:
        'The number of apps you can create depends on your subscription plan. Free users can create up to 3 apps, while premium users have unlimited access.',
    },
    {
      id: 6,
      question: 'How do I deploy my generated app?',
      answer:
        'After generating your app, you can download the code and deploy it to platforms like Vercel, Netlify, or AWS. We also provide deployment guides in the documentation.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    alert('Thank you for your message! Our support team will get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
