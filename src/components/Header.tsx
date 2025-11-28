import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sparkles, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenu?: boolean;
}

export function Header({ onMenuClick, showMenu = false }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="w-full flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
            >
              <Menu className="size-5" />
            </button>
          )}
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            className="flex items-center gap-2 group"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="size-5 text-white" />
            </div>
            <span className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AsaanBuild
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t('login')}
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-shadow"
              >
                {t('signUp')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
