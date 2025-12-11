import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Github, Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 NEW
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || "Login failed";
      setError(msg);

      //  If user is not found → go to Register Page
      if (msg.toLowerCase().includes("user not found")) {
        setTimeout(() => {
          navigate('/register');
        }, 1200);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* left side */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl" />
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1603354351149-e97b9124020d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHJvYm90JTIwY29kaW5nfGVufDF8fHx8MTc2MzU0NjI5MHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="AI Building Apps"
              className="relative rounded-3xl shadow-2xl"
            />
          </div>
        </div>
{/* right side */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="size-6 text-white" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AsaanBuild
              </span>
            </div>

            <h1 className="mb-2">{t('login')}</h1>
            <p className="text-gray-600">Welcome back! Continue building.</p>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 bg-red-100 border border-red-300 p-2 rounded mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* email */}
            <div>
              <label className="block mb-2 text-gray-700">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* PASSWORD WITH EYE TOGGLE */}
            <div>
              <label className="block mb-2 text-gray-700">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-400 rounded-lg 
                 bg-[#e7f0fe]   /*  light sky blue background */
                 focus:ring-2 focus:ring-blue-600"
                  placeholder="••••••••"
                  required
                />

                {/*  Eye Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
             appearance-none border-none outline-none
             bg-transparent hover:bg-transparent focus:bg-transparent
             text-gray-700 p-0 m-0"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              {t('signIn')}
            </button>
          </form>

          {/* register */}
          <p className="mt-8 text-center text-gray-600">
            {t('dontHaveAccount')}{' '}
            <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline">
              {t('signUp')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
