import React from 'react';

export default function Helplines({ t, isDark }) {
  return (
    <section id="helplines" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className={`rounded-3xl p-6 sm:p-10 text-white shadow-xl ${
        isDark
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 border border-green-800'
          : 'bg-gradient-to-r from-emerald-800 to-green-900'
      }`}>
        <div className="max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
            ૨૪ x ૭ ખેડૂત માર્ગદર્શન સેવા
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-3">
            {t.helplineTitle}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            કોઈપણ યોજના, i-Khedut અરજી, GAIC પ્રોસેસિંગ સબસિડી કે હવામાન માહિતી માટે નીચે આપેલા ટોલ-ફ્રી નંબરો પર સંપર્ક કરો:
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">{t.kisanCallCenter}</div>
              <div className="text-lg font-black mt-1 text-white">1800-180-1551</div>
              <div className="text-[10px] text-emerald-300 mt-1">સવારે ૬ થી રાત્રે ૧૦ (નિઃશુલ્ક)</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">{t.ikhedutHelp}</div>
              <div className="text-lg font-black mt-1 text-white">079-23256114</div>
              <div className="text-[10px] text-emerald-300 mt-1">કૃષિ ભવન, ગાંધીનગર</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">{t.gaicHelp}</div>
              <div className="text-lg font-black mt-1 text-white">079-23240208</div>
              <div className="text-[10px] text-emerald-300 mt-1">GAIC એગ્રો પ્રોસેસિંગ સેલ</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">{t.ggrcHelp}</div>
              <div className="text-lg font-black mt-1 text-white">1800-233-2652</div>
              <div className="text-[10px] text-emerald-300 mt-1">GGRC ટપક સિંચાઈ ટોલ ફ્રી</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
