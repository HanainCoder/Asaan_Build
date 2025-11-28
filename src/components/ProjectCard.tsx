import React from 'react';
import { MoreVertical, Folder } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectCardProps {
  name: string;
  date: string;
  status: string;
  onOpen?: () => void;
  onRename?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({
  name,
  date,
  status,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: ProjectCardProps) {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <Folder className="size-6 text-white" />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="size-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
              <button
                onClick={onOpen}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                {t('open')}
              </button>
              <button
                onClick={onRename}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                {t('rename')}
              </button>
              <button
                onClick={onDuplicate}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                {t('duplicate')}
              </button>
              <button
                onClick={onDelete}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
              >
                {t('delete')}
              </button>
            </div>
          )}
        </div>
      </div>
      <h3 className="mb-2">{name}</h3>
      <p className="text-sm text-gray-600 mb-2">{date}</p>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs ${
            status === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
