import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  MessageSquare, 
  Copy, 
  Check, 
  Instagram, 
  CheckCircle,
  Smartphone,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { gameSound } from '../utils/gameSound';

// Custom icons for Telegram and WhatsApp
const TelegramIcon = () => (
  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.5 2.5L2 10.5l6 2.5 2 7 3.5-4.5 5.5 4 2.5-17zM9.5 13l7.5-6.5-9 8.5-.5 3 2.5-5z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.753-1.458L0 24zm6.59-4.846c1.785.962 3.534 1.468 5.34 1.468 5.405 0 9.808-4.36 9.81-9.715.002-2.595-1.005-5.035-2.836-6.868C17.08 2.206 14.646.998 12.008.998 6.602.998 2.2 5.358 2.197 10.714c-.001 1.833.513 3.616 1.49 5.204l-.995 3.636 1.01-.97c.504.485 1.545 1.134 2.943 1.57z"/>
  </svg>
);

export const ContactSection: React.FC = () => {
  // Form State
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [service, setService] = useState('মেটা মার্কেটিং (Meta Marketing / Facebook Ads)');
  const [message, setMessage] = useState('');
  
  // Validation Error State
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Copied State Tracker
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    gameSound.playScore();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setFormError('দয়া করে আপনার নাম লিখুন!');
      gameSound.playBounce();
      return;
    }

    if (!emailOrPhone.trim()) {
      setFormError('দয়া করে সঠিক ইমেইল অথবা ফোন নম্বর দিন!');
      gameSound.playBounce();
      return;
    }

    // Validate email or phone format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;

    const isEmailValid = emailRegex.test(emailOrPhone.trim());
    const isPhoneValid = phoneRegex.test(emailOrPhone.trim());

    if (!isEmailValid && !isPhoneValid) {
      setFormError('সঠিক ইমেইল (যেমন: client@gmail.com) অথবা সঠিক ফোন নম্বর (যেমন: +8801887811709) প্রদান করুন!');
      gameSound.playBounce();
      return;
    }

    if (!message.trim()) {
      setFormError('দয়া করে আপনার মেসেজ লিখুন!');
      gameSound.playBounce();
      return;
    }

    // Success
    setSuccessMsg('মেসেজ প্রস্তুত হচ্ছে! ইমেইল ক্লায়েন্ট খোলা হচ্ছে...');
    gameSound.playStart();

    const subject = encodeURIComponent(`Project Inquiry: ${service} by ${name}`);
    const body = encodeURIComponent(
      `Hi Fahad,\n\nI would like to inquire about your ${service} service.\n\nMy Details:\nName: ${name}\nEmail/Phone: ${emailOrPhone}\n\nMessage:\n${message}\n\nBest regards,\n${name}`
    );

    setTimeout(() => {
      window.location.href = `mailto:mahamudul.visuals@gmail.com?subject=${subject}&body=${body}`;
    }, 600);
  };

  return (
    <section id="contact-portal" className="mt-16 pb-12 scroll-mt-24 text-left max-w-5xl mx-auto px-4 sm:px-6 relative">
      
      {/* Top Badge Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/20 text-orange-400 text-[10px] sm:text-xs font-black uppercase tracking-widest animate-pulse">
          <span>✨ GET IN TOUCH</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
          Let's Create Something <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-pink-500 bg-clip-text text-transparent">Amazing</span>
        </h2>
        <p className="text-xs text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
          প্রিমিয়াম কিছু তৈরি করতে এবং যেকোনো জটিল সমস্যার তাৎক্ষণিক সমাধান পেতে নিচে থাকা নম্বরে বা সরাসরি আমাদের সাথে যোগাযোগ করুন।
        </p>
      </div>

      {/* Grid Layout - Borderless & Clean */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT SIDE: "Send a Quick Message" Form Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="p-5 rounded-2xl bg-[#080d19] border-0 shadow-xl space-y-4 flex-1 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] group">
            
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-orange-500/15 transition" />

            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-orange-400 transition">Send a Quick Message</h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                আপনার সঠিক তথ্য দিয়ে সরাসরি আমাদের মেইলে মেসেজ পাঠান।
              </p>
            </div>

            {/* ERROR / SUCCESS ALERTS */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-950/80 text-red-200 text-[11px] flex items-center gap-2 animate-shake">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-200 text-[11px] flex items-center gap-2 animate-fade-in">
                <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Your Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border-0 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Your Email or Phone <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. client@gmail.com or +8801887811709"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border-0 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Service Needed
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040711] border-0 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition font-medium"
                >
                  <option value="মেটা মার্কেটিং (Meta Marketing / Facebook Ads)">🎯 মেটা মার্কেটিং (Meta Marketing / Facebook Ads)</option>
                  <option value="ডিজিটাল মার্কেটিং সম্পর্কিত সকল কাজ (Digital Marketing)">📈 ডিজিটাল মার্কেটিং সম্পর্কিত সকল কাজ</option>
                  <option value="ইউটিউব ও সোশ্যাল মিডিয়া অর্গানিক বুস্ট (Organic Social Boost)">🚀 ইউটিউব ও সোশ্যাল মিডিয়া অর্গানিক বুস্ট</option>
                  <option value="প্রোফেশনাল ভিডিও এডিটিং (Professional Video Editing)">🎬 প্রোফেশনাল ভিডিও এডিটিং</option>
                  <option value="ক্রিয়েটিভ গ্রাফিক ডিজাইন (Creative Graphic Design)">🎨 ক্রিয়েটিভ গ্রাফিক ডিজাইন</option>
                  <option value="এআই সম্পর্কিত তথ্য ও জটিল সমস্যার সমাধান (AI & Tech Support)">🤖 এআই সম্পর্কিত তথ্য ও জটিল সমস্যার সমাধান</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Your Message <span className="text-orange-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your project, timeline, and vision..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border-0 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 transition resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Mail size={13} />
                <span>Send via Email</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: 4 gorgeous contact cards (7 cols) with borderless soft neon glow */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            
            {/* CARD 1: WhatsApp */}
            <div className="p-4.5 rounded-2xl bg-[#080d19] border-0 shadow-md flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/15 transition" />
              
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 flex items-center justify-center group-hover:scale-110 transition">
                  <WhatsAppIcon />
                </div>
                <button
                  onClick={() => handleCopy('+8801887811709', 'whatsapp')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border-0 hover:bg-slate-800 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedId === 'whatsapp' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  <span>{copiedId === 'whatsapp' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-white group-hover:text-emerald-400 transition">WhatsApp</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono">+880 1887-811709</p>
              </div>

              <a
                href="https://wa.me/8801887811709"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-slate-900 border-0 hover:bg-emerald-600 hover:text-slate-950 text-xs font-bold text-center text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer transition duration-300 shadow"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink size={11} />
              </a>
            </div>

            {/* CARD 2: Telegram */}
            <div className="p-4.5 rounded-2xl bg-[#080d19] border-0 shadow-md flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/15 transition" />

              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/60 flex items-center justify-center group-hover:scale-110 transition">
                  <TelegramIcon />
                </div>
                <button
                  onClick={() => handleCopy('@mh0_0o1', 'telegram')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border-0 hover:bg-slate-800 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedId === 'telegram' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  <span>{copiedId === 'telegram' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-white group-hover:text-cyan-400 transition">Telegram</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono">@mh0_0o1</p>
              </div>

              <a
                href="https://t.me/mh0_0o1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-slate-900 border-0 hover:bg-cyan-600 hover:text-slate-950 text-xs font-bold text-center text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer transition duration-300 shadow"
              >
                <span>Chat on Telegram</span>
                <ExternalLink size={11} />
              </a>
            </div>

            {/* CARD 3: Instagram */}
            <div className="p-4.5 rounded-2xl bg-[#080d19] border-0 shadow-md flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-pink-500/15 transition" />

              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-pink-950/60 flex items-center justify-center group-hover:scale-110 transition">
                  <Instagram className="w-5 h-5 text-pink-400" />
                </div>
                <button
                  onClick={() => handleCopy('@mh002088', 'instagram')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border-0 hover:bg-slate-800 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedId === 'instagram' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  <span>{copiedId === 'instagram' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-white group-hover:text-pink-400 transition">Instagram</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono">@mh002088</p>
              </div>

              <a
                href="https://instagram.com/mh002088"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-slate-900 border-0 hover:bg-pink-600 hover:text-slate-950 text-xs font-bold text-center text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer transition duration-300 shadow"
              >
                <span>Visit Profile</span>
                <ExternalLink size={11} />
              </a>
            </div>

            {/* CARD 4: Direct Email */}
            <div className="p-4.5 rounded-2xl bg-[#080d19] border-0 shadow-md flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/15 transition" />

              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-950/60 flex items-center justify-center group-hover:scale-110 transition">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <button
                  onClick={() => handleCopy('mahamudul.visuals@gmail.com', 'direct_email')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border-0 hover:bg-slate-800 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedId === 'direct_email' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  <span>{copiedId === 'direct_email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-white group-hover:text-purple-400 transition">Direct Email</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono truncate max-w-full">mahamudul.visuals@gmail.com</p>
              </div>

              <a
                href="mailto:mahamudul.visuals@gmail.com"
                className="w-full py-2 rounded-xl bg-slate-900 border-0 hover:bg-purple-600 hover:text-slate-950 text-xs font-bold text-center text-gray-300 flex items-center justify-center gap-1.5 cursor-pointer transition duration-300 shadow"
              >
                <span>Send Email</span>
                <ExternalLink size={11} />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
