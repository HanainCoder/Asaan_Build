import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { templates } from '@/data/templates';
import { ArrowLeft, Copy, Download, Github, Check } from 'lucide-react';

export function CodeViewerPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'database'>('frontend');
  const [copied, setCopied] = useState(false);

  const template = templates.find((t) => t.id === Number(id));

  const codeExamples = {
    frontend: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;`,
    backend: `import express from 'express';
import cors from 'cors';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { authRouter } from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    database: `-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                onClick={() => navigate(`/preview/${template.id}`)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="size-5" />
                <span>{t('back')}</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="size-5 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-5" />
                      <span>{t('copyCode')}</span>
                    </>
                  )}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="size-5" />
                  <span>{t('downloadZip')}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow">
                  <Github className="size-5" />
                  <span>{t('exportToGithub')}</span>
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Code Viewer */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Tabs */}
                  <div className="flex border-b">
                    <button
                      onClick={() => setActiveTab('frontend')}
                      className={`flex-1 px-6 py-4 transition-colors ${
                        activeTab === 'frontend'
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {t('frontendCode')} (React)
                    </button>
                    <button
                      onClick={() => setActiveTab('backend')}
                      className={`flex-1 px-6 py-4 transition-colors ${
                        activeTab === 'backend'
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {t('backendCode')} (Node.js)
                    </button>
                    <button
                      onClick={() => setActiveTab('database')}
                      className={`flex-1 px-6 py-4 transition-colors ${
                        activeTab === 'database'
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {t('databaseSchema')} (SQL)
                    </button>
                  </div>

                  {/* Code Content */}
                  <div className="p-6 bg-gray-900 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono">
                      <code>{codeExamples[activeTab]}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Project Info */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="mb-4">{template.title}</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>
                      <p className="text-gray-500 mb-1">Category</p>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {template.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Generated</p>
                      <p>Nov 19, 2025</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="size-2 bg-green-500 rounded-full" />
                        <span>Ready to Deploy</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="mb-4">{t('techStack')}</h3>
                  <div className="space-y-2">
                    {template.techStack.map((tech, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-gray-50 rounded-lg text-sm"
                      >
                        {tech}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="mb-3">Next Steps</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">1.</span>
                      <span>Download or export to GitHub</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">2.</span>
                      <span>Install dependencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">3.</span>
                      <span>Configure environment variables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">4.</span>
                      <span>Deploy your application</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
