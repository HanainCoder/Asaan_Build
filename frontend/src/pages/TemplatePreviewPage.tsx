import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { templates } from '@/data/templates';
import { ArrowLeft, Check, Eye } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function TemplatePreviewPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const template = templates.find((t) => t.id === Number(id));

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
            {/* Back Button */}
            <button
              onClick={() => navigate('/templates')}
              className="flex items-center gap-2 mb-6 px-4 py-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="size-5" />
              <span>{t('back')}</span>
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Template Preview */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                  <div className="aspect-video bg-gray-100">
                    <ImageWithFallback
                      src={template.image}
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="mb-2">{template.title}</h1>
                        <p className="text-gray-600">{template.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm shrink-0 ml-4">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Preview Button */}
                <button
                  onClick={() => navigate(`/preview/${template.id}`)}
                  className="w-full mt-4 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="size-5" />
                  {t('previewLive')}
                </button>
              </div>

              {/* Details Panel */}
              <div className="space-y-6">
                {/* Features */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="mb-4">{t('features')}</h2>
                  <ul className="space-y-3">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="p-1 bg-green-100 rounded-full shrink-0 mt-0.5">
                          <Check className="size-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pages */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="mb-4">{t('pages')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {template.pages.map((page, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      >
                        {page}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h2 className="mb-4">{t('techStack')}</h2>
                  <div className="space-y-2">
                    {template.techStack.map((tech, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
                      >
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => navigate(`/preview/${template.id}`)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  {t('selectThisTemplate')}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
