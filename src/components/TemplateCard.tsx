import React from 'react';
import { Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TemplateCardProps {
  title: string;
  description: string;
  image: string;
  category: string;
  onPreview: () => void;
}

export function TemplateCard({
  title,
  description,
  image,
  category,
  onPreview,
}: TemplateCardProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <button
            onClick={onPreview}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Eye className="size-4" />
            {t('previewTemplate')}
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="truncate">{title}</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs shrink-0 ml-2">
            {category}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
