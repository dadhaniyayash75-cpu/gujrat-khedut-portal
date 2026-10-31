import React from 'react';
import { MANDI_DATA } from '../data/mandiData';

export default function MandiTicker({ lang, isDark }) {
  return (
    <section className={`border-b py-2.5 px-4 overflow-hidden transition-colors ${
      isDark 
        ? 'bg-amber-950/40 border-amber-800/60' 
        : 'bg-amber-50 border-amber-200/80'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
          <span className="animate-pulse">●</span> {lang === "gu" ? "બજાર ભાવ" : "Mandi Rates"}
        </div>
        <div className="overflow-x-auto custom-scrollbar flex items-center gap-4 text-xs font-medium whitespace-nowrap">
          {MANDI_DATA.map((item, idx) => (
            <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1 rounded border shadow-2xs ${
              isDark 
                ? 'bg-slate-800 border-amber-900/50 text-slate-200' 
                : 'bg-white border-amber-200/60 text-slate-700'
            }`}>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === "gu" ? item.yard_gu : item.yard_en}:
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                {lang === "gu" ? item.crop_gu : item.crop_en}
              </span>
              <span className="font-bold text-green-500">{item.max}</span>
              <span className="text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                {item.trend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
