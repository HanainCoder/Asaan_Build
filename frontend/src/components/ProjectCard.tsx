import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Folder } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectCardProps {
  name: string;
  date: string;
  status: string;
  thumbnail?: string;
  onOpen?: () => void;

  // INLINE RENAME receives newName
  onRename?: (newName: string) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({
  name,
  date,
  status,
  thumbnail,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: ProjectCardProps) {

  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  // 🔥 Inline rename state
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus rename input
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  const saveRename = () => {
    if (tempName.trim() !== "" && onRename) {
      onRename(tempName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 relative
    transition-all duration-300 ease-out overflow-hidden group

    hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]
    hover:border-blue-300 hover:border-opacity-50
    hover:rotate-[0.5deg]">

      {/*  TOP THUMBNAIL SECTION  */}
      <div className="w-full h-40 bg-gray-100 relative">
        {thumbnail ? (
          <img src={thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <Folder className="size-10 text-white" />
          </div>
        )}

        {/* Menu Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg bg-white/80 backdrop-blur hover:bg-white transition opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="size-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
              <button
                onClick={() => {
                  onOpen?.();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                {t('open')}
              </button>

              {/* RENAME CLICK */}
              <button
                onClick={() => {
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                {t('rename')}
              </button>

              <button
                onClick={() => {
                  onDuplicate?.();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                {t('duplicate')}
              </button>

              <button
                onClick={() => {
                  onDelete?.();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
              >
                {t('delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/*  BOTTOM SECTION  */}
      <div className="p-6">

        {/* 🔥 Inline Rename Input OR Text */}
        {isRenaming ? (
          <input
            ref={inputRef}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => e.key === "Enter" && saveRename()}
            className="w-full px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
          />
        ) : (
          <h3 className="mb-2 text-lg font-medium">{name}</h3>
        )}

        <p className="text-sm text-gray-600 mb-3">{date}</p>

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
