import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { templates } from '@/data/templates';
import {
  ArrowLeft,
  RefreshCw,
  Check,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';

export function LivePreviewPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const template = templates.find((t) => t.id === Number(id));

  useEffect(() => {
    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsGenerating(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const logs = [
    { id: 1, message: 'Analyzing requirements...', status: 'complete' },
    { id: 2, message: 'Generating frontend code...', status: 'complete' },
    { id: 3, message: 'Creating backend API...', status: 'complete' },
    { id: 4, message: 'Setting up database...', status: 'complete' },
    { id: 5, message: 'Configuring deployment...', status: 'complete' },
    { id: 6, message: 'Building application...', status: isGenerating ? 'progress' : 'complete' },
  ];

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate(`/template/${template.id}`)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="size-5" />
                <span>{t('back')}</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`p-2 rounded-lg ${
                    device === 'desktop' ? 'bg-blue-600 text-white' : 'hover:bg-white'
                  }`}
                >
                  <Monitor className="size-5" />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`p-2 rounded-lg ${
                    device === 'tablet' ? 'bg-blue-600 text-white' : 'hover:bg-white'
                  }`}
                >
                  <Tablet className="size-5" />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`p-2 rounded-lg ${
                    device === 'mobile' ? 'bg-blue-600 text-white' : 'hover:bg-white'
                  }`}
                >
                  <Smartphone className="size-5" />
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Preview Area */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2>Live Preview</h2>
                    {!isGenerating && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="size-5" />
                        <span className="text-sm">Ready</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-100 rounded-xl p-4 overflow-x-auto">
                    <div className={`mx-auto transition-all ${deviceWidths[device]}`}>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {isGenerating ? (
                          <div className="aspect-video flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="size-12 text-blue-600 animate-spin mx-auto mb-4" />
                              <p className="text-gray-600 mb-2">{t('generatingApp')}</p>
                              <div className="w-64 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="text-sm text-gray-500 mt-2">{progress}%</p>
                            </div>
                          </div>
                        ) : (
                          <iframe
                            src="about:blank"
                            className="w-full aspect-video"
                            title="App Preview"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Status Logs */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="mb-4">Generation Status</h3>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3">
                        {log.status === 'complete' ? (
                          <Check className="size-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <Loader2 className="size-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm text-gray-700">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="size-5" />
                    Regenerate App
                  </button>
                  <button
                    onClick={() => navigate(`/code/${template.id}`)}
                    disabled={isGenerating}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View Source Code
                  </button>
                </div>

                {/* Template Info */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="mb-3">{template.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.techStack.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white rounded text-xs text-gray-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
