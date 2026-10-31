import React, { useState } from 'react';

export default function AuthModal({ isOpen, onLoginSuccess, lang, isDark }) {
  const [mode, setMode] = useState('register'); // 'register' or 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [village, setVillage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialOrUpper = /[!@#$%^&*(),.?":{}|<>]|[A-Z]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasSpecialOrUpper;

  // Mobile validation
  const isMobileValid = /^[6-9]\d{9}$/.test(mobile.trim());

  // Email validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) {
        setError(lang === 'gu' ? 'કૃપા કરીને તમારું નામ દાખલ કરો.' : 'Please enter your full name.');
        return;
      }
      if (!isEmailValid) {
        setError(lang === 'gu' ? 'કૃપા કરીને સાચો Gmail / Email દાખલ કરો.' : 'Please enter a valid Gmail / Email address.');
        return;
      }
      if (!isMobileValid) {
        setError(lang === 'gu' ? 'કૃપા કરીને ૧૦ અંકનો સાચો મોબાઇલ નંબર દાખલ કરો.' : 'Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!isPasswordValid) {
        setError(lang === 'gu' ? 'પાસવર્ડ આપેલી તમામ શરતો મુજબ હોવો જોઈએ.' : 'Password must satisfy all conditions below.');
        return;
      }

      const userData = {
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        village: village.trim() || 'Gujarat',
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem('khedut_user', JSON.stringify(userData));
      onLoginSuccess(userData);
    } else {
      // Login mode
      if (!mobile.trim() && !email.trim()) {
        setError(lang === 'gu' ? 'કૃપા કરીને મોબાઇલ નંબર અથવા Gmail દાખલ કરો.' : 'Please enter mobile number or Gmail.');
        return;
      }
      if (password.length < 6) {
        setError(lang === 'gu' ? 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.' : 'Password must be at least 6 characters.');
        return;
      }

      const saved = localStorage.getItem('khedut_user');
      let userData = saved ? JSON.parse(saved) : null;
      if (!userData) {
        userData = {
          name: email.split('@')[0] || 'Farmer Friend',
          email: email.trim(),
          mobile: mobile.trim(),
          village: 'Gujarat',
          loggedInAt: new Date().toISOString()
        };
      }
      localStorage.setItem('khedut_user', JSON.stringify(userData));
      onLoginSuccess(userData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className={`rounded-3xl max-w-md w-full shadow-2xl border overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        
        {/* MODAL HEADER WITH YD LOGO & ENGLISH FOUNDER NAME */}
        <div className="bg-gradient-to-r from-green-800 via-emerald-800 to-green-700 text-white p-6 text-center relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border-2 border-amber-300 flex items-center justify-center shadow-lg mb-3">
            <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" stroke="#facc15" strokeWidth="3" strokeDasharray="4 2" />
              <path d="M28 28 L42 50 L42 72 M56 28 L42 50" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M56 28 L56 72 C70 72 76 62 76 50 C76 38 70 28 56 28 Z" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M50 14 Q52 8 58 10 Q54 14 50 14" fill="#facc15" />
            </svg>
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {lang === 'gu' ? 'ગુજરાત ખેડૂત સહાય પોર્ટલ' : 'Gujarat Khedut Sahay Portal'}
          </h3>
          <p className="text-xs text-amber-200 font-semibold mt-1">
            Founder: Yash Dadhaniya (Village: Buri)
          </p>

          <p className="text-[11px] text-emerald-100 mt-2">
            {lang === 'gu'
              ? 'પોર્ટલની તમામ યોજનાઓ જોવા માટે કૃપા કરીને તમારી માહિતી દાખલ કરો'
              : 'Please enter your details to access all government schemes'}
          </p>
        </div>

        {/* TABS: CREATE ACCOUNT vs SIGN IN */}
        <div className={`flex border-b text-xs font-bold ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3.5 text-center transition border-b-2 ${
              mode === 'register'
                ? 'border-green-600 text-green-500 bg-slate-800/60 dark:bg-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📝 {lang === 'gu' ? 'ખાતું બનાવો (Create Account)' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3.5 text-center transition border-b-2 ${
              mode === 'login'
                ? 'border-green-600 text-green-500 bg-slate-800/60 dark:bg-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔐 {lang === 'gu' ? 'સાઇન ઇન (Sign In)' : 'Sign In'}
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                👤 {lang === 'gu' ? 'તમારું પૂરું નામ (Full Name) *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'gu' ? 'દા.ત. રમેશભાઈ પટેલ' : 'e.g. Ramesh Patel'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              ✉️ {lang === 'gu' ? 'જીમેઈલ / ઈમેઈલ (Gmail Address) *' : 'Gmail / Email Address *'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              📱 {lang === 'gu' ? 'મોબાઇલ નંબર (Mobile Number) *' : 'Mobile Number *'}
            </label>
            <div className="flex">
              <span className={`inline-flex items-center px-3 rounded-l-xl border border-r-0 text-xs font-semibold ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-500'
              }`}>
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className={`w-full px-3.5 py-2.5 rounded-r-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                🏡 {lang === 'gu' ? 'ગામનું નામ (Village Name - વૈકલ્પિક)' : 'Village Name (Optional)'}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Buri"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          )}

          {/* PASSWORD FIELD WITH CONDITIONS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                🔒 {lang === 'gu' ? 'પાસવર્ડ (Password) *' : 'Password *'}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-green-500 hover:text-green-400"
              >
                {showPassword ? '👁️ છુપાવો' : '👁️ બતાવો'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:border-green-600 outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            />

            {/* PASSWORD REQUIREMENTS */}
            {mode === 'register' && (
              <div className={`mt-2.5 p-3 rounded-xl border text-[11px] space-y-1.5 ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {lang === 'gu' ? 'પાસવર્ડ શરતો (Password Conditions):' : 'Password Requirements:'}
                </div>
                
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <span>{hasMinLength ? '✅' : '⚪'}</span>
                  <span>{lang === 'gu' ? 'ઓછામાં ઓછા ૮ અક્ષર (Min 8 characters)' : 'At least 8 characters'}</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <span>{hasNumber ? '✅' : '⚪'}</span>
                  <span>{lang === 'gu' ? 'ઓછામાં ઓછો ૧ અંક (At least 1 number 0-9)' : 'At least 1 number (0-9)'}</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasSpecialOrUpper ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <span>{hasSpecialOrUpper ? '✅' : '⚪'}</span>
                  <span>{lang === 'gu' ? '૧ ખાસ ચિહ્ન અથવા કેપિટલ અક્ષર (@, #, $ કે A-Z)' : '1 special char or capital letter (@,#,$,A-Z)'}</span>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-green-600/20 transition flex items-center justify-center gap-2 mt-4"
          >
            <span>
              {mode === 'register'
                ? (lang === 'gu' ? 'ખાતું બનાવી પોર્ટલ ખોલો ➔' : 'Create Account & Enter Portal ➔')
                : (lang === 'gu' ? 'સાઇન ઇન કરી પોર્ટલ ખોલો ➔' : 'Sign In & Enter Portal ➔')}
            </span>
          </button>
        </form>

        {/* FOOTER NOTICE */}
        <div className={`p-3 border-t text-center text-[11px] ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
        }`}>
          🌾 Courtesy: Yash Dadhaniya (Village: Buri) | Gujarat Khedut Sahay
        </div>

      </div>
    </div>
  );
}
