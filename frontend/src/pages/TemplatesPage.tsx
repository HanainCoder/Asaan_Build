import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { TemplateCard } from '../components/TemplateCard';
import { templates } from '@/data/templates';
import { Filter } from 'lucide-react';

export function TemplatesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Business', 'E-commerce', 'Education', 'Portfolio', 'Custom'];

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2">{t('selectTemplate')}</h1>
              <p className="text-gray-600">
                Choose a template that best matches your app idea
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Filter className="size-5" />
                <span>Filter:</span>
              </div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white border border-gray-200 hover:border-blue-600 text-gray-700'
                  }`}
                >
                  {t(category.toLowerCase())}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  title={template.title}
                  description={template.description}
                  image={template.image}
                  category={template.category}
                  onPreview={() => navigate(`/template/${template.id}`)}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No templates found in this category</p>
              </div>
            )}

            {/* Custom Template Option */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h2 className="mb-3 text-white">Don't see what you're looking for?</h2>
              <p className="mb-6 text-blue-100">
                Let our AI generate a custom template based on your specific requirements
              </p>
              <button
                onClick={() => navigate('/prompt')}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-shadow"
              >
                Create Custom Template
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
