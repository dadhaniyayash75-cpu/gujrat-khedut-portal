import React, { useState, useMemo, useEffect } from 'react';
import { i18n } from './data/translations';
import { SCHEMES_DATA } from './data/schemesData';
import Navbar from './components/Navbar';
import MandiTicker from './components/MandiTicker';
import Hero from './components/Hero';
import CreatorCard from './components/CreatorCard';
import GovtPortalsGrid from './components/GovtPortalsGrid';
import HowToApply from './components/HowToApply';
import SchemeFilters from './components/SchemeFilters';
import SchemeCard from './components/SchemeCard';
import SchemeModal from './components/SchemeModal';
import EligibilityQuiz from './components/EligibilityQuiz';
import Helplines from './components/Helplines';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

export default function App() {
  const [lang, setLang] = useState('gu'); // 'gu' or 'en'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGovt, setSelectedGovt] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});

  // Theme State: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('khedut_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('khedut_theme', nextTheme);
  };

  // Auth & Popup State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('khedut_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAuthOpen(true);
    }
  }, [user]);

  // Calculator / Quiz state
  const [quizLand, setQuizLand] = useState('');
  const [quizInterest, setQuizInterest] = useState('');
  const [quizResultCount, setQuizResultCount] = useState(null);

  const t = i18n[lang];

  const toggleLanguage = () => {
    setLang(prev => (prev === 'gu' ? 'en' : 'gu'));
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('khedut_user');
    setUser(null);
    setIsAuthOpen(true);
  };

  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATA.filter(scheme => {
      if (selectedGovt !== 'all' && scheme.govType !== selectedGovt) {
        return false;
      }
      if (selectedCategory !== 'all' && scheme.categoryKey !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const titleGu = scheme.title_gu.toLowerCase();
        const titleEn = scheme.title_en.toLowerCase();
        const benefitGu = scheme.benefit_gu.toLowerCase();
        const benefitEn = scheme.benefit_en.toLowerCase();
        return (
          titleGu.includes(query) ||
          titleEn.includes(query) ||
          benefitGu.includes(query) ||
          benefitEn.includes(query)
        );
      }
      return true;
    });
  }, [selectedGovt, selectedCategory, searchTerm]);

  const handleShareWhatsapp = (scheme) => {
    const title = lang === 'gu' ? scheme.title_gu : scheme.title_en;
    const benefit = lang === 'gu' ? scheme.benefit_gu : scheme.benefit_en;
    const text = `🌾 *${title}*\n\n✅ લાભ: ${benefit}\n\n🔗 સત્તાવાર વિગત: ${scheme.portalUrl}\n\nCourtesy: Yash Dadhaniya (Village: Buri) - Gujarat Khedut Sahay Portal.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleToggleDoc = (schemeId, docIndex) => {
    const key = `${schemeId}-${docIndex}`;
    setCheckedDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunQuiz = () => {
    if (!quizInterest && !quizLand) return;
    if (quizInterest) {
      setSelectedCategory(quizInterest);
    }
    const matched = SCHEMES_DATA.filter(s => {
      if (quizInterest && quizInterest !== 'all') {
        return s.categoryKey === quizInterest;
      }
      return true;
    });
    setQuizResultCount(matched.length);
    const el = document.getElementById('schemes-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedGovt('all');
    setSelectedCategory('all');
    setQuizLand('');
    setQuizInterest('');
    setQuizResultCount(null);
  };

  const hasActiveFilters = selectedGovt !== 'all' || selectedCategory !== 'all' || searchTerm !== '';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* AUTH POPUP MODAL (Appears on open) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        isDark={isDark}
      />

      {/* NAVBAR WITH YD LOGO & THEME SWITCHER */}
      <Navbar
        lang={lang}
        toggleLanguage={toggleLanguage}
        t={t}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        isDark={isDark}
      />

      {/* APMC MANDI TICKER */}
      <MandiTicker lang={lang} isDark={isDark} />

      {/* USER WELCOME BANNER (IF LOGGED IN) */}
      {user && (
        <div className={`py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b ${
          isDark 
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <span>👋</span>
          <span>
            {lang === 'gu'
              ? `નમસ્તે, ${user.name}! (મો. ${user.mobile}) - ગુજરાત ખેડૂત સહાય પોર્ટલ પર તમારું સ્વાગત છે.`
              : `Welcome, ${user.name}! (Mob: ${user.mobile}) to Gujarat Khedut Sahay Portal.`}
          </span>
        </div>
      )}

      {/* HERO BANNER */}
      <Hero
        lang={lang}
        t={t}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isDark={isDark}
      />

      {/* PROMINENT CREATOR CARD: Yash Dadhaniya (Village: Buri) */}
      <CreatorCard lang={lang} isDark={isDark} />

      {/* OFFICIAL GUJARAT GOVT PORTALS: i-Khedut, GAIC, Agri Dept */}
      <GovtPortalsGrid lang={lang} isDark={isDark} />

      {/* HOW TO APPLY 4-STEP GUIDE */}
      <HowToApply lang={lang} isDark={isDark} />

      {/* SCHEMES EXPLORER */}
      <section id="schemes-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <SchemeFilters
          t={t}
          selectedGovt={selectedGovt}
          setSelectedGovt={setSelectedGovt}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          totalFound={filteredSchemes.length}
          hasActiveFilters={hasActiveFilters}
          onReset={resetAllFilters}
          isDark={isDark}
        />

        {filteredSchemes.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="text-4xl mb-3">🔍</div>
            <h4 className="text-lg font-bold">કોઈ યોજના મળી નથી / No schemes match</h4>
            <p className="text-xs text-slate-400 mt-1">કૃપા કરીને અલગ કીવર્ડ શોધો અથવા ફિલ્ટર બદલો.</p>
            <button
              onClick={resetAllFilters}
              className="mt-4 text-xs font-semibold bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map(scheme => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                lang={lang}
                t={t}
                onSelect={setSelectedScheme}
                onShareWhatsapp={handleShareWhatsapp}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </section>

      {/* ELIGIBILITY CALCULATOR */}
      <EligibilityQuiz
        t={t}
        quizLand={quizLand}
        setQuizLand={setQuizLand}
        quizInterest={quizInterest}
        setQuizInterest={setQuizInterest}
        quizResultCount={quizResultCount}
        onRunQuiz={handleRunQuiz}
        isDark={isDark}
      />

      {/* HELPLINES */}
      <Helplines t={t} isDark={isDark} />

      {/* FOOTER */}
      <Footer t={t} lang={lang} isDark={isDark} />

      {/* DETAIL MODAL */}
      <SchemeModal
        scheme={selectedScheme}
        lang={lang}
        t={t}
        onClose={() => setSelectedScheme(null)}
        checkedDocs={checkedDocs}
        onToggleDoc={handleToggleDoc}
        onShareWhatsapp={handleShareWhatsapp}
        isDark={isDark}
      />
    </div>
  );
}
