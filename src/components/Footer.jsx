import React from 'react';

export default function Footer({ t, lang, isDark }) {
  return (
    <footer className={`text-xs py-10 border-t transition-colors mt-auto ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-400'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* BRAND AND CREATOR IN ENGLISH */}
          <div>
            <div className="flex items-center gap-3 text-white font-bold text-base mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-800 to-green-950 border border-amber-400 p-1 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" stroke="#facc15" strokeWidth="3" strokeDasharray="3 2" />
                  <path d="M28 28 L42 50 L42 72 M56 28 L42 50" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M56 28 L56 72 C70 72 76 62 76 50 C76 38 70 28 56 28 Z" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="text-white font-black">{t.portalName}</div>
                <div className="text-[11px] text-amber-300 font-semibold">
                  Founder: Yash Dadhaniya (Village: Buri)
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mt-2">
              Created & Developed by <b>Yash Dadhaniya (Village: Buri, Gujarat)</b> to empower farmers with transparent access to i-Khedut, GAIC, and Central government agricultural schemes.
            </p>
          </div>

          {/* OFFICIAL LINKS */}
          <div>
            <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Official Government Portals
            </h5>
            <ul className="space-y-2">
              <li>
                <a href="https://ikhedut.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition flex items-center gap-1">
                  ➔ i-Khedut Portal (ikhedut.gujarat.gov.in)
                </a>
              </li>
              <li>
                <a href="https://gaic.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition flex items-center gap-1">
                  ➔ GAIC Agro Industries (gaic.gujarat.gov.in)
                </a>
              </li>
              <li>
                <a href="https://agri.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition flex items-center gap-1">
                  ➔ Department of Agriculture (agri.gujarat.gov.in)
                </a>
              </li>
              <li>
                <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition flex items-center gap-1">
                  ➔ PM-Kisan Portal (pmkisan.gov.in)
                </a>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h5 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Farmer Support & Contact
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              For online application assistance, farmers can visit their nearest Gram Panchayat VCE (Village Computer Entrepreneur) center.
            </p>
            <div className="text-white font-semibold text-xs">
              Kisan Call Center: 1800-180-1551
            </div>
            <div className="mt-2 text-[11px] text-amber-300">
              Courtesy: Yash Dadhaniya, Village: Buri (Gujarat, India)
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>{t.disclaimer}</p>
          <p>© 2026 Gujarat Khedut Sahay Portal • Yash Dadhaniya (Village: Buri).</p>
        </div>
      </div>
    </footer>
  );
}
