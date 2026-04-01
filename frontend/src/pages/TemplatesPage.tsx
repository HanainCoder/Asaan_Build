import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Wand2, Eye, X, Loader2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail_color: string;
  badge: 'new' | 'popular' | null;
  preview_html?: string;  // ← sirf yeh add karo
}

const CATEGORIES = ['All', 'Business', 'Portfolio', 'Event', 'Shop', 'Restaurant'];

// ── Page ───────────────────────────────────────────────────────────
export function TemplatesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [templates, setTemplates]         = useState<Template[]>([]);
  const [filtered, setFiltered]           = useState<Template[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(true);

  // Preview modal
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [extraInstructions, setExtraInstructions] = useState('');

  // Generation loading
  const [generating, setGenerating]       = useState(false);
  const [generatingId, setGeneratingId]   = useState<string | null>(null);

  // ── Fetch templates on mount ──────────────────────────────────────
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res  = await fetch('http://localhost:5000/api/templates');
        const data = await res.json();
        if (data.success) {
          setTemplates(data.templates);
          setFiltered(data.templates);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // ── Filter whenever category or search changes ────────────────────
  useEffect(() => {
    let list = templates;
    if (activeCategory !== 'All') {
      list = list.filter(t => t.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [activeCategory, searchQuery, templates]);

  // ── Stream helper (mirrors your existing generate page logic) ─────
  const streamFromTemplate = async (
    templateId: string,
    extra?: string
  ): Promise<string> => {
    const res = await fetch('http://localhost:5000/api/generateFromTemplate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ templateId, extraInstructions: extra || '' }),
    });

    const reader  = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullCode  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullCode += decoder.decode(value);
    }
    return fullCode;
  };

  // ── "Use Template" — generate + save + go to editor ──────────────
  const handleUseTemplate = (template: Template, extra?: string) => {
  if (!userId) { navigate('/login'); return; }
  setPreviewTemplate(null);

  navigate(`/code/${Date.now()}`, {
    state: {
      prompt: extra
        ? `${template.title} template. ${extra}`
        : `${template.title} template`,
      userId: userId,
      templateId: template.id,           // ← yeh add karo
      extraInstructions: extra || '',    // ← yeh add karo
    }
  });
};

  // ── "Customize First" — go to prompt page with templateId ─────────
  const handleCustomizeFirst = (templateId: string) => {
    navigate(`/prompt?templateId=${templateId}`);
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} showMenu />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 lg:p-8">
          <div className="w-full">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="mb-2">Template Gallery</h1>
                <p className="text-gray-600">
                  Pick a ready-made template and generate your page instantly
                </p>
              </div>
              <button
                onClick={() => navigate('/prompt')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow whitespace-nowrap"
              >
                Start from Scratch
              </button>
            </div>

            {/* ── Search + Category filters ── */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      activeCategory === cat
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Loading state ── */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* ── Template grid ── */}
            {!loading && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {filtered.length} template{filtered.length !== 1 ? 's' : ''} found
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isGenerating={generatingId === template.id}
                      onPreview={() => {
                        setPreviewTemplate(template);
                        setExtraInstructions('');
                      }}
                      onUse={() => handleUseTemplate(template)}
                    />
                  ))}
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <p className="text-gray-500 mb-4">No templates found for "{searchQuery}"</p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ── Global generating overlay ── */}
      {generating && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-80 text-center">
            <Loader2 className="size-10 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating your page...</h3>
            <p className="text-gray-500 text-sm">This usually takes 10–20 seconds</p>
          </div>
        </div>
      )}

      {/* ── Preview / Customize modal ── */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{previewTemplate.title}</h2>
                <p className="text-sm text-gray-500">{previewTemplate.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* Colour thumbnail preview */}
            {/* Live preview */}
<div className="w-full h-48 rounded-lg mb-4 overflow-hidden border border-gray-200 relative">
  {previewTemplate.preview_html ? (
    <iframe
      srcDoc={previewTemplate.preview_html}
      scrolling="no"
      className="absolute top-0 left-0 border-0 pointer-events-none"
      style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: 'top left' }}
    />
  ) : (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: previewTemplate.thumbnail_color }}
    >
      <span className="text-sm font-medium opacity-70">{previewTemplate.title}</span>
    </div>
  )}
</div>

            {/* Extra instructions input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extra instructions{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Use dark theme, add a WhatsApp button, make it in Urdu..."
                value={extraInstructions}
                onChange={e => setExtraInstructions(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none text-sm"
              />
            </div>

            {/* Modal action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleUseTemplate(previewTemplate, extraInstructions)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow text-sm font-medium"
              >
                <Wand2 className="size-4" />
                Generate Now
              </button>
              <button
                onClick={() => handleCustomizeFirst(previewTemplate.id)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Customize Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Template Card Component ────────────────────────────────────────
interface TemplateCardProps {
  template:    Template;
  isGenerating: boolean;
  onPreview:   () => void;
  onUse:       () => void;
}

function TemplateCard({ template, isGenerating, onPreview, onUse }: TemplateCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

      {/* Thumbnail */}
      <div className="h-36 relative overflow-hidden">
  {template.preview_html ? (
    <iframe
      srcDoc={template.preview_html}
      scrolling="no"
      className="absolute top-0 left-0 w-full h-full border-0 pointer-events-none"
      style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
    />
  ) : (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: template.thumbnail_color }}
    >
      <span className="text-sm font-semibold opacity-60">{template.title}</span>
    </div>
  )}

  {/* Badge */}
  {template.badge && (
    <span className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-xs font-semibold ${
      template.badge === 'popular'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-green-100 text-green-700'
    }`}>
      {template.badge === 'popular' ? 'Popular' : 'New'}
    </span>
  )}
</div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900">{template.title}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
            {template.category}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">{template.description}</p>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onPreview}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Eye className="size-4" />
            Preview
          </button>
          <button
            onClick={onUse}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-shadow text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><Loader2 className="size-4 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="size-4" /> Use Template</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}