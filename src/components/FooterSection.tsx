import React, { useState } from 'react';
import { 
  ArrowUp, 
  Mail, 
  Instagram, 
  Sparkles
} from 'lucide-react';
import { gameSound } from '../utils/gameSound';

// Custom icons for X (Twitter), Telegram, WhatsApp
const XIcon = () => (
  <svg className="w-4 h-4 text-gray-200 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.5 2.5L2 10.5l6 2.5 2 7 3.5-4.5 5.5 4 2.5-17zM9.5 13l7.5-6.5-9 8.5-.5 3 2.5-5z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.753-1.458L0 24zm6.59-4.846c1.785.962 3.534 1.468 5.34 1.468 5.405 0 9.808-4.36 9.81-9.715.002-2.595-1.005-5.035-2.836-6.868C17.08 2.206 14.646.998 12.008.998 6.602.998 2.2 5.358 2.197 10.714c-.001 1.833.513 3.616 1.49 5.204l-.995 3.636 1.01-.97c.504.485 1.545 1.134 2.943 1.57z"/>
  </svg>
);

export const FooterSection: React.FC = () => {
  const [clickedSocial, setClickedSocial] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    gameSound.playStart();
  };

  const handleNavClick = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      gameSound.playScore();
    }
  };

  const handleSocialClick = (name: string) => {
    setClickedSocial(name);
    gameSound.score();
    setTimeout(() => setClickedSocial(null), 1000);
  };

  return (
    <footer className="relative bg-[#040711] text-gray-400 py-12 px-4 sm:px-8 mt-20 text-left overflow-hidden border-0">
      
      {/* Custom Running Glowing Border CSS Keyframes */}
      <style>{`
        @keyframes running-border {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-running-border {
          background-size: 300% 300%;
          animation: running-border 3s ease infinite;
        }
      `}</style>

      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
        
        {/* LEFT COLUMN: Profile Info (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-orange-500 to-amber-400 shadow-lg shadow-orange-600/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                <span className="font-black text-white text-base">FH</span>
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">Fahad</h3>
              <p className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                VISUALIZER & DIGITAL MARKETER
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Empowering brands through high-impact video edits, strategic digital marketing, and result-driven campaigns.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-400 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Available for worldwide remote contracts</span>
          </div>
        </div>

        {/* MIDDLE COLUMN: Quick Navigation arranged strictly in 3 lines */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Quick Navigation</h4>
          <div className="space-y-2 text-xs">
            {/* Line 1 */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => handleNavClick('hero')} className="hover:text-orange-400 active:scale-95 transition cursor-pointer">Home</button>
              <span className="text-slate-700">•</span>
              <button onClick={() => handleNavClick('content-tabs')} className="hover:text-orange-400 active:scale-95 transition cursor-pointer">Videos</button>
              <span className="text-slate-700">•</span>
              <button onClick={() => handleNavClick('games')} className="hover:text-orange-400 active:scale-95 transition cursor-pointer">Games</button>
            </div>
            {/* Line 2 */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => handleNavClick('community-forum')} className="hover:text-orange-400 active:scale-95 transition cursor-pointer">Community Group</button>
              <span className="text-slate-700">•</span>
              <button onClick={() => handleNavClick('nexus-ai')} className="hover:text-orange-400 active:scale-95 transition cursor-pointer">Nexus</button>
              <span className="text-slate-700">•</span>
              <button onClick={() => handleNavClick('sonexas-ai')} className="hover:text-orange-400 active:scale-95 transition cursor-pointer">Sonexas AI</button>
            </div>
            {/* Line 3 */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => handleNavClick('contact-portal')} className="hover:text-orange-400 active:scale-95 transition cursor-pointer">Contact Me</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Connect With Me with Running Colors Border Animation */}
        <div className="md:col-span-3 space-y-4 flex flex-col md:items-end">
          <div className="space-y-3 w-full md:w-auto">
            <h4 className="text-xs font-black text-white uppercase tracking-wider md:text-right">Connect With Me</h4>
            
            <div className="flex items-center gap-2.5 flex-wrap md:justify-end">
              {/* X (Twitter) */}
              <a 
                href="https://x.com/MahamudulH95331" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('x')}
                title="X (Twitter)"
                className={`relative group w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 cursor-pointer p-[2px] animate-running-border ${
                  clickedSocial === 'x' 
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 scale-110 shadow-cyan-500/50' 
                    : 'hover:bg-gradient-to-r hover:from-cyan-500 hover:via-indigo-500 hover:to-purple-500 hover:shadow-cyan-500/40'
                }`}
              >
                <div className="w-full h-full bg-[#0b101d] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                  <XIcon />
                </div>
              </a>

              {/* Telegram */}
              <a 
                href="https://t.me/mh0_0o1" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('telegram')}
                title="Telegram"
                className={`relative group w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 cursor-pointer p-[2px] animate-running-border ${
                  clickedSocial === 'telegram' 
                    ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 scale-110 shadow-sky-500/50' 
                    : 'hover:bg-gradient-to-r hover:from-sky-400 hover:via-cyan-500 hover:to-blue-600 hover:shadow-sky-500/40'
                }`}
              >
                <div className="w-full h-full bg-[#0b101d] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                  <TelegramIcon />
                </div>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/8801887811709" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('whatsapp')}
                title="WhatsApp"
                className={`relative group w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 cursor-pointer p-[2px] animate-running-border ${
                  clickedSocial === 'whatsapp' 
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-green-600 scale-110 shadow-emerald-500/50' 
                    : 'hover:bg-gradient-to-r hover:from-emerald-400 hover:via-teal-500 hover:to-green-600 hover:shadow-emerald-500/40'
                }`}
              >
                <div className="w-full h-full bg-[#0b101d] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                  <WhatsAppIcon />
                </div>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/mh002088" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleSocialClick('instagram')}
                title="Instagram"
                className={`relative group w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 cursor-pointer p-[2px] animate-running-border ${
                  clickedSocial === 'instagram' 
                    ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 scale-110 shadow-pink-500/50' 
                    : 'hover:bg-gradient-to-r hover:from-pink-500 hover:via-rose-500 hover:to-amber-500 hover:shadow-pink-500/40'
                }`}
              >
                <div className="w-full h-full bg-[#0b101d] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 group-hover:text-white transition-all duration-300" />
                </div>
              </a>

              {/* Email */}
              <a 
                href="mailto:mahamudul.visuals@gmail.com" 
                onClick={() => handleSocialClick('email')}
                title="Email"
                className={`relative group w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 cursor-pointer p-[2px] animate-running-border ${
                  clickedSocial === 'email' 
                    ? 'bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 scale-110 shadow-purple-500/50' 
                    : 'hover:bg-gradient-to-r hover:from-purple-500 hover:via-violet-500 hover:to-fuchsia-500 hover:shadow-purple-500/40'
                }`}
              >
                <div className="w-full h-full bg-[#0b101d] rounded-[14px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                  <Mail className="w-4 h-4 text-purple-400 group-hover:scale-110 group-hover:text-white transition-all duration-300" />
                </div>
              </a>
            </div>
          </div>

          {/* Compact Smart Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border-0 hover:bg-slate-800 active:scale-95 text-[10px] font-bold text-gray-300 hover:text-white transition cursor-pointer shadow w-auto self-start md:self-end"
          >
            <span>Back to Top</span>
            <ArrowUp size={10} className="text-orange-500" />
          </button>
        </div>

      </div>

      {/* Bottom Copyright & Credit Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-0 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
        <p>© 2026 Fahad | All rights reserved.</p>
        <div className="inline-flex items-center gap-1.5 text-gray-400">
          <Sparkles size={12} className="text-orange-500" />
          <span>Crafted with passion & precision</span>
        </div>
      </div>

    </footer>
  );
};
