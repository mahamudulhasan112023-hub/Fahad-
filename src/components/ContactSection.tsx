import React, { useState } from 'react';
import { 
  Mail, 
  Instagram, 
  CheckCircle,
  ExternalLink,
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;

    const isEmailValid = emailRegex.test(emailOrPhone.trim());
    const isPhoneValid = phoneRegex.test(emailOrPhone.trim());

    if (!isEmailValid && !isPhoneValid) {
      setFormError('সঠিক ইমেইল অথবা ফোন নম্বর প্রদান করুন!');
      gameSound.playBounce();
      return;
    }

    if (!message.trim()) {
      setFormError('দয়া করে আপনার মেসেজ লিখুন!');
      gameSound.playBounce();
      return;
    }

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
    <section id="contact-portal" className="mt-14 pb-10 scroll-mt-24 text-left max-w-4xl mx-auto px-4 sm:px-6 relative">
      
      {/* Top Header - Compact & Sleek */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-950/30 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
          <span>✨ GET IN TOUCH</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
          Let's Create Something <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">Amazing</span>
        </h2>
        <p className="text-[11px] text-gray-400 max-w-xl mx-auto leading-relaxed">
          যেকোনো কাজ বা আলোচনার জন্য সরাসরি মেসেজ দিন বা নিচের লিংকে যোগাযোগ করুন।
        </p>
      </div>

      {/* Main Grid: Compact Form & Sleek Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        
        {/* LEFT SIDE: Send a Quick Message Form */}
        <div className="md:col-span-6 flex flex-col">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#080d19] border border-slate-800/80 shadow-lg space-y-3.5 flex-1 relative overflow-hidden">
            <div>
              <h3 className="text-base font-bold text-white">Send a Quick Message</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                আপনার তথ্য দিয়ে সরাসরি মেইলে মেসেজ পাঠান।
              </p>
            </div>

            {/* ERROR / SUCCESS ALERTS */}
            {formError && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/30 text-red-200 text-[10px] flex items-center gap-2">
                <AlertCircle size={13} className="text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-[10px] flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-2.5">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                  Your Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#040711] border border-slate-800 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                  Your Email or Phone <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. client@gmail.com"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#040711] border border-slate-800 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                  Service Needed
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#040711] border border-slate-800 text-[11px] text-white focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="মেটা মার্কেটিং (Meta Marketing / Facebook Ads)">🎯 মেটা মার্কেটিং (Meta Marketing)</option>
                  <option value="ডিজিটাল মার্কেটিং সম্পর্কিত সকল কাজ (Digital Marketing)">📈 ডিজিটাল মার্কেটিং</option>
                  <option value="ইউটিউব ও সোশ্যাল মিডিয়া অর্গানিক বুস্ট (Organic Social Boost)">🚀 সোশ্যাল মিডিয়া বুস্ট</option>
                  <option value="প্রোফেশনাল ভিডিও এডিটিং (Professional Video Editing)">🎬 প্রোফেশনাল ভিডিও এডিটিং</option>
                  <option value="ক্রিয়েটিভ গ্রাফিক ডিজাইন (Creative Graphic Design)">🎨 ক্রিয়েটিভ গ্রাফিক ডিজাইন</option>
                  <option value="এআই সম্পর্কিত তথ্য ও সমাধান (AI & Tech Support)">🤖 এআই সম্পর্কিত তথ্য ও সমাধান</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                  Your Message <span className="text-orange-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your project..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#040711] border border-slate-800 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs transition shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Mail size={13} />
                <span>Send via Email</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: 4 Compact Direct Link Cards (No numbers/emails exposed) */}
        <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* CARD 1: WhatsApp */}
          <a
            href="https://wa.me/8801887811709"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800/80 hover:border-emerald-500/50 shadow-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-950/10 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition">
                <WhatsAppIcon />
              </div>
              <ExternalLink size={12} className="text-gray-500 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition">WhatsApp</h4>
              <p className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">Chat on WhatsApp</p>
            </div>
          </a>

          {/* CARD 2: Telegram */}
          <a
            href="https://t.me/mh0_0o1"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800/80 hover:border-cyan-500/50 shadow-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-cyan-950/10 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition">
                <TelegramIcon />
              </div>
              <ExternalLink size={12} className="text-gray-500 group-hover:text-cyan-400 transition" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-cyan-400 transition">Telegram</h4>
              <p className="text-[10px] text-cyan-400/80 mt-0.5 font-medium">Chat on Telegram</p>
            </div>
          </a>

          {/* CARD 3: Instagram */}
          <a
            href="https://instagram.com/mh002088"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800/80 hover:border-pink-500/50 shadow-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-pink-950/10 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-pink-950/60 border border-pink-500/30 flex items-center justify-center group-hover:scale-110 transition">
                <Instagram className="w-4 h-4 text-pink-400" />
              </div>
              <ExternalLink size={12} className="text-gray-500 group-hover:text-pink-400 transition" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-pink-400 transition">Instagram</h4>
              <p className="text-[10px] text-pink-400/80 mt-0.5 font-medium">Visit Profile</p>
            </div>
          </a>

          {/* CARD 4: Direct Email */}
          <a
            href="mailto:mahamudul.visuals@gmail.com"
            className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800/80 hover:border-purple-500/50 shadow-md flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-purple-950/10 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition">
                <Mail className="w-4 h-4 text-purple-400" />
              </div>
              <ExternalLink size={12} className="text-gray-500 group-hover:text-purple-400 transition" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-purple-400 transition">Direct Email</h4>
              <p className="text-[10px] text-purple-400/80 mt-0.5 font-medium">Send Email</p>
            </div>
          </a>

        </div>

      </div>
    </section>
  );
};
