import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ur';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Auth
    register: 'Register',
    login: 'Login',
    email: 'Email',
    password: 'Password',
    signInWithGoogle: 'Sign in with Google',
    signInWithGithub: 'Sign in with GitHub',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    signUp: 'Sign Up',
    signIn: 'Sign In',
    buildAppsWithAI: 'Build Apps with AI',
    urduSupport: 'Full Urdu Support',
    
    // Dashboard
    dashboard: 'Dashboard',
    createNewApp: 'Create New App',
    myProjects: 'My Projects',
    settings: 'Settings',
    logout: 'Logout',
    totalProjects: 'Total Projects',
    recentActivity: 'Recent Activity',
    lastGeneratedApp: 'Last Generated App',
    
    // Prompt
    describeYourAppIdea: 'Describe Your App Idea',
    textInput: 'Type your app idea in English, Urdu, or Roman Urdu...',
    voicePrompt: 'Use voice input',
    submitPrompt: 'Submit Prompt',
    examplePrompts: 'Example Prompts',
    examplePrompt1: 'Create a restaurant menu website with online ordering',
    examplePrompt2: 'Build an e-commerce store for handmade crafts',
    
    // Templates
    selectTemplate: 'Select a Template',
    business: 'Business',
    ecommerce: 'E-commerce',
    education: 'Education',
    portfolio: 'Portfolio',
    custom: 'Custom',
    previewTemplate: 'Preview Template',
    
    // Preview
    features: 'Features',
    pages: 'Pages',
    techStack: 'Tech Stack',
    selectThisTemplate: 'Select Template',
    back: 'Back',
    previewLive: 'Preview Live',
    
    // Code Viewer
    sourceCode: 'Source Code',
    frontendCode: 'Frontend Code',
    backendCode: 'Backend Code',
    databaseSchema: 'Database Schema',
    copyCode: 'Copy Code',
    downloadZip: 'Download ZIP',
    exportToGithub: 'Export to GitHub',
    
    // Projects
    searchProjects: 'Search projects...',
    open: 'Open',
    rename: 'Rename',
    duplicate: 'Duplicate',
    delete: 'Delete',
    
    // Settings
    updateProfile: 'Update Profile',
    interfacePreferences: 'Interface Preferences',
    notifications: 'Notifications',
    
    // Support
    support: 'Support & Help',
    contactSupport: 'Contact Support',
    faqs: 'FAQs',
    howToUse: 'How to Use',
    
    // Common
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    generatingApp: 'Generating your app...',
//version control
// Version Control
versionControlTitle: "Version Control",
versionControlSubtitle: "Click a version to open it in Code Viewer.",
totalVersions: "Total Versions",
mostVersioned: "Most Versioned",
restoredVersions: "Restored Versions",
promptEdited: "Prompt Edited",
codeEdited: "Code Edited",
compare: "Compare",
clear: "Clear",
restore: "Restore",

download: "Download",
preview: "Preview",
noVersions: "No versions found",
allSaved: "All Saved",
aiModified: "AI Modified",
manualDev: "Manual Development",
recovered: "Recovered",
version: "Version",

//// Templates Gallery
templatesGalleryTitle: "Template Gallery",
templatesGallerySubtitle: "Pick a ready-made template and generate your page instantly",

thisMonth: "This Month",
totalVersion: "Total Versions",
lastActive: "Last Active",

// Prompt History
promptHistoryTitle: "Prompt History",
promptHistorySubtitle: "Track, improve, and reuse your AI prompts",
  },

 
 

  ur: {
    // Auth
    register: 'رجسٹر کریں',
    login: 'لاگ ان',
    email: 'ای میل',
    password: 'پاسورڈ',
    signInWithGoogle: 'گوگل سے سائن ان کریں',
    signInWithGithub: 'گٹ ہب سے سائن ان کریں',
    forgotPassword: 'پاسورڈ بھول گئے؟',
    dontHaveAccount: 'اکاؤنٹ نہیں ہے؟',
    alreadyHaveAccount: 'پہلے سے اکاؤنٹ ہے؟',
    signUp: 'سائن اپ کریں',
    signIn: 'سائن ان کریں',
    buildAppsWithAI: 'AI سے ایپس بنائیں',
    urduSupport: 'مکمل اردو سپورٹ',
    
    // Dashboard
    dashboard: 'ڈیش بورڈ',
    createNewApp: 'نئی ایپ بنائیں',
    myProjects: 'میرے پروجیکٹس',
    settings: 'ترتیبات',
    logout: 'لاگ آؤٹ',
    totalProjects: 'کل پروجیکٹس',
    recentActivity: 'حالیہ سرگرمی',
    lastGeneratedApp: 'آخری بنائی گئی ایپ',
    
    // Prompt
    describeYourAppIdea: 'اپنی ایپ کا خیال بیان کریں',
    textInput: 'اپنی ایپ کا خیال اردو، انگلش، یا رومن اردو میں لکھیں...',
    voicePrompt: 'آواز سے لکھیں',
    submitPrompt: 'جمع کرائیں',
    examplePrompts: 'مثالیں',
    examplePrompt1: 'ریستوران کے لیے آن لائن آرڈرنگ کی ویب سائٹ بنائیں',
    examplePrompt2: 'دستکاری کی مصنوعات کے لیے ای کامرس سٹور بنائیں',
    
    // Templates
    selectTemplate: 'ٹیمپلیٹ منتخب کریں',
    business: 'کاروبار',
    ecommerce: 'ای کامرس',
    education: 'تعلیم',
    portfolio: 'پورٹ فولیو',
    custom: 'حسب ضرورت',
    previewTemplate: 'ٹیمپلیٹ دیکھیں',
    
    // Preview
    features: 'خصوصیات',
    pages: 'صفحات',
    techStack: 'ٹیکنالوجی',
    selectThisTemplate: 'ٹیمپلیٹ منتخب کریں',
    back: 'واپس',
    previewLive: 'لائیو دیکھیں',
    
    // Code Viewer
    sourceCode: 'سورس کوڈ',
    frontendCode: 'فرنٹ اینڈ کوڈ',
    backendCode: 'بیک اینڈ کوڈ',
    databaseSchema: 'ڈیٹا بیس اسکیما',
    copyCode: 'کوڈ کاپی کریں',
    downloadZip: 'ZIP ڈاؤن لوڈ کریں',
    exportToGithub: 'GitHub پر ایکسپورٹ کریں',
    
    // Projects
    searchProjects: 'پروجیکٹس تلاش کریں...',
    open: 'کھولیں',
    rename: 'نام تبدیل کریں',
    duplicate: 'نقل بنائیں',
    delete: 'حذف کریں',
    
    // Settings
    updateProfile: 'پروفائل اپ ڈیٹ کریں',
    interfacePreferences: 'انٹرفیس کی ترجیحات',
    notifications: 'اطلاعات',
    
    // Support
    support: 'سپورٹ اور مدد',
    contactSupport: 'سپورٹ سے رابطہ کریں',
    faqs: 'عمومی سوالات',
    howToUse: 'استعمال کا طریقہ',
    
    // Common
    cancel: 'منسوخ کریں',
    save: 'محفوظ کریں',
    loading: 'لوڈ ہو رہا ہے...',
    generatingApp: 'آپ کی ایپ بنائی جا رہی ہے...',
    
    //version control
   // Version Control
versionControlTitle: "ورژن کنٹرول",
versionControlSubtitle: "ورژن کھولنے کے لیے اس پر کلک کریں۔",
totalVersions: "کل ورژنز",
mostVersioned: "سب سے زیادہ ورژن",
restoredVersions: "بحال شدہ ورژنز",
promptEdited: "AI میں تبدیلی",
codeEdited: "کوڈ میں تبدیلی",
compare: "موازنہ کریں",
clear: "صاف کریں",
restore: "بحال کریں",
download: "ڈاؤن لوڈ",
preview: "پیش نظارہ",
noVersions: "کوئی ورژن موجود نہیں",
allSaved: "تمام محفوظ",
aiModified: "AI کی تبدیلی",
manualDev: "دستی ترقی",
recovered: "بحال شدہ",
version: "ورژن",

// Templates Gallery
templatesGalleryTitle: "ٹیمپلیٹ گیلری",
templatesGallerySubtitle: "تیار شدہ ٹیمپلیٹ منتخب کریں اور فوری طور پر اپنی ویب سائٹ بنائیں",

// Stats Cards (Urdu)
thisMonth: "اس مہینے",
totalVersion: "کل ورژنز",
lastActive: "آخری سرگرمی",

// Prompt History (Urdu)
promptHistoryTitle: "پرومپٹ ہسٹری",
promptHistorySubtitle: "اپنے اے آئی پرومپٹس کو ٹریک کریں، بہتر بنائیں اور دوبارہ استعمال کریں",

  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
  const saved = localStorage.getItem('language');
  return saved === 'ur' || saved === 'en' ? saved : 'en';
});
  const direction: Direction = language === 'ur' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
