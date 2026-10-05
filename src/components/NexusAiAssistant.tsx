import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  ImageIcon, 
  RefreshCw, 
  AlertTriangle, 
  Copy, 
  Check, 
  Brain, 
  Camera, 
  X, 
  Zap, 
  Terminal, 
  Download,
  Paintbrush,
  User,
  LogOut,
  History,
  Trash2,
  CheckCircle2,
  Chrome
} from 'lucide-react';
import { gameSound } from '../utils/gameSound';

// Interfaces for permanent AI Accounts & Chat Logs
interface AiUser {
  id: string;
  name: string;
  username: string; // validated email
  password?: string; // optional for OAuth users
}

interface AiChatMessage {
  id: string;
  userId: string;
  prompt: string;
  imageInput?: string | null;
  resultType: 'text' | 'image';
  resultValue: string;
  timestamp: string;
}

export const NexusAiAssistant: React.FC = () => {
  // Page/Workspace view state
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 1. Permanent AI Accounts & Sessions States
  const [aiUsersDb, setAiUsersDb] = useState<AiUser[]>(() => {
    try {
      const saved = localStorage.getItem('sonexas_ai_users_db');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [aiCurrentUser, setAiCurrentUser] = useState<AiUser | null>(() => {
    try {
      const saved = localStorage.getItem('sonexas_ai_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [aiChatHistory, setAiChatHistory] = useState<AiChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('sonexas_ai_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Account Form states
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Google Account Chooser Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('mahamudulhasan112023@gmail.com');
  const [googleCustomName, setGoogleCustomName] = useState('Mahamudul Hasan');

  // Unified Prompt Input
  const [prompt, setPrompt] = useState('');

  // Vision Image input
  const [image, setImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState('image/png');

  // Loading and result states
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'solve' | 'generate' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Temporary single-turn display states (for guest users)
  const [guestTextResult, setGuestTextResult] = useState<string | null>(null);
  const [guestImageResult, setGuestImageResult] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [guestCopied, setGuestCopied] = useState(false);

  // File input ref
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Suggestions
  const suggestionPrompts = [
    { label: "🌐 লাইভ তথ্য: আজকের শীর্ষ খবর সার্চ করো", text: "আজকের দেশী ও আন্তর্জাতিক শীর্ষ সংবাদগুলো গুগল থেকে লাইভ সার্চ করে জানান।" },
    { label: "🌤️ রিয়েল-টাইম: আজকের আবহাওয়া রিপোর্ট", text: "আজকের আবহাওয়া কেমন থাকবে গুগল সার্চ করে আপডেট জানান।" },
    { label: "📝 সমাধান: পড়াশোনায় মনোযোগের টিপস", text: "পড়াশোনায় গভীর মনোযোগ ধরে রাখার ৩টি বৈজ্ঞানিক কৌশল বলুন।" },
    { label: "📷 ছবি বিশ্লেষণ: ছবি আপলোড করে প্রশ্ন করুন", text: "আপলোডকৃত ছবিটি ভালোভাবে পর্যবেক্ষণ করে মূল বিষয়টি বুঝিয়ে বলুন।" }
  ];

  // Sync databases to localStorage
  useEffect(() => {
    localStorage.setItem('sonexas_ai_users_db', JSON.stringify(aiUsersDb));
  }, [aiUsersDb]);

  useEffect(() => {
    if (aiCurrentUser) {
      localStorage.setItem('sonexas_ai_current_user', JSON.stringify(aiCurrentUser));
    } else {
      localStorage.removeItem('sonexas_ai_current_user');
    }
  }, [aiCurrentUser]);

  useEffect(() => {
    localStorage.setItem('sonexas_ai_chat_history', JSON.stringify(aiChatHistory));
  }, [aiChatHistory]);

  // Google OAuth flow postMessage & custom event listeners
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS' && event.data?.googleUser) {
        processGoogleUser(event.data.googleUser);
      }
    };

    const handleOAuthEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        processGoogleUser(customEvent.detail);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    window.addEventListener('google-login-success', handleOAuthEvent);
    
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
      window.removeEventListener('google-login-success', handleOAuthEvent);
    };
  }, [aiUsersDb]);

  const processGoogleUser = (gUser: any) => {
    if (!gUser || !gUser.email) return;

    const email = gUser.email.toLowerCase();
    let user = aiUsersDb.find(u => u.username === email);

    if (!user) {
      user = {
        id: `g_usr_${Date.now()}`,
        name: gUser.name || gUser.given_name || "Google User",
        username: email
      };
      setAiUsersDb(prev => [...prev, user!]);
    }

    setAiCurrentUser(user);
    setAuthSuccess(`🎉 গুগল সাইন-ইন সফল হয়েছে! স্বাগতম, ${user.name}!`);
    gameSound.playScore();
  };

  const handleGoogleLogin = () => {
    setAuthError(null);
    setAuthSuccess(null);
    setShowGoogleModal(true);
    gameSound.playBounce();
  };

  const confirmGoogleSignIn = (name: string, email: string) => {
    processGoogleUser({
      name: name || 'Google User',
      email: email || 'mahamudulhasan112023@gmail.com'
    });
    setShowGoogleModal(false);
  };

  const handleCopyText = (content: string, id: string = 'guest') => {
    navigator.clipboard.writeText(content);
    if (id === 'guest') {
      setGuestCopied(true);
      setTimeout(() => setGuestCopied(false), 2000);
    } else {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    gameSound.playScore();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setImage(evt.target.result as string);
        gameSound.playBounce();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const name = authName.trim();
    const username = authUsername.trim().toLowerCase();
    const password = authPassword;

    if (name.length < 3) {
      setAuthError("নাম কমপক্ষে ৩ অক্ষরের হতে হবে।");
      gameSound.playBounce();
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(username)) {
      setAuthError("ভুল ইমেইল! সঠিক ইমেইল এড্রেস দিন (যেমন: user@gmail.com)।");
      gameSound.playBounce();
      return;
    }

    if (password.length < 6) {
      setAuthError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      gameSound.playBounce();
      return;
    }

    const exists = aiUsersDb.find(u => u.username === username);
    if (exists) {
      setAuthError("এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে!");
      gameSound.playBounce();
      return;
    }

    const newUser: AiUser = {
      id: `ai_usr_${Date.now()}`,
      name,
      username,
      password
    };

    setAiUsersDb([...aiUsersDb, newUser]);
    setAiCurrentUser(newUser);
    setAuthSuccess("🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");
    setAuthName('');
    setAuthUsername('');
    setAuthPassword('');
    gameSound.playScore();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const username = authUsername.trim().toLowerCase();
    const password = authPassword;

    const user = aiUsersDb.find(u => u.username === username && u.password === password);
    if (!user) {
      setAuthError("ভুল ইমেইল অথবা পাসওয়ার্ড!");
      gameSound.playBounce();
      return;
    }

    setAiCurrentUser(user);
    setAuthSuccess(`স্বাগতম, ${user.name}!`);
    setAuthUsername('');
    setAuthPassword('');
    gameSound.playScore();
  };

  const handleLogout = () => {
    setAiCurrentUser(null);
    setGuestTextResult(null);
    setGuestImageResult(null);
    setAuthSuccess(null);
    gameSound.playBounce();
  };

  const handleClearHistory = () => {
    if (!aiCurrentUser) return;
    setAiChatHistory(aiChatHistory.filter(c => c.userId !== aiCurrentUser.id));
    gameSound.playBounce();
  };

  const handleSolve = async () => {
    if (!prompt.trim() && !image) {
      setErrorMsg("অনুগ্রহ করে কিছু লিখুন অথবা একটি ছবি যুক্ত করুন।");
      gameSound.playBounce();
      return;
    }

    setLoading(true);
    setLoadingType('solve');
    setErrorMsg(null);
    setGuestTextResult(null);
    setGuestImageResult(null);
    gameSound.playStart();

    try {
      let finalResult = '';
      if (image) {
        const response = await fetch("/api/gemini/solve-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Image: image,
            mimeType: imageMimeType,
            prompt: prompt.trim() || "এই ছবিতে কী রয়েছে এবং ছবির সমস্যাটির সমাধান কী?"
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "এআই সার্ভার ছবি বিশ্লেষণ করতে ব্যর্থ হয়েছে।");
        }
        finalResult = data.result;
      } else {
        const response = await fetch("/api/gemini/solve-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "এআই সার্ভার কাজ করছে না।");
        }
        finalResult = data.result;
      }

      const activeUserId = aiCurrentUser ? aiCurrentUser.id : 'guest';
      const newMsg: AiChatMessage = {
        id: `msg_${Date.now()}`,
        userId: activeUserId,
        prompt: prompt.trim() || (image ? "📷 আপলোডকৃত ছবি বিশ্লেষণ" : "কোনো প্রম্পট নেই"),
        imageInput: image,
        resultType: 'text',
        resultValue: finalResult,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatHistory(prev => [...prev, newMsg]);
      setGuestTextResult(finalResult);
      setPrompt('');
      setImage(null);
      gameSound.playScore();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "এআই সার্ভারে সমস্যা হয়েছে।");
      gameSound.playBounce();
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setErrorMsg("ছবি তৈরি করার জন্য বিবরণ (prompt) লিখুন।");
      gameSound.playBounce();
      return;
    }

    setLoading(true);
    setLoadingType('generate');
    setErrorMsg(null);
    setGuestTextResult(null);
    setGuestImageResult(null);
    gameSound.playStart();

    try {
      const response = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "এআই ফটো তৈরি করতে ব্যর্থ হয়েছে।");
      }

      const generatedUrl = data.imageUrl;
      const activeUserId = aiCurrentUser ? aiCurrentUser.id : 'guest';
      const newMsg: AiChatMessage = {
        id: `msg_${Date.now()}`,
        userId: activeUserId,
        prompt: `🎨 জেনারেট প্রম্পট: ${prompt.trim()}`,
        imageInput: null,
        resultType: 'image',
        resultValue: generatedUrl,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatHistory(prev => [...prev, newMsg]);
      setGuestImageResult(generatedUrl);
      setPrompt('');
      gameSound.playScore();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "এআই ফটো সার্ভার কাজ করছে না।");
      gameSound.playBounce();
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const loggedInChats = aiCurrentUser 
    ? aiChatHistory.filter(c => c.userId === aiCurrentUser.id) 
    : aiChatHistory.filter(c => c.userId === 'guest');

  // IF AI PORTAL CLOSED: Render sleek card on main page
  if (!isAiOpen) {
    return (
      <section id="sonexas-ai" className="mt-16 pb-12 scroll-mt-24">
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#110926] via-[#09061c] to-[#160c33] border border-purple-500/40 shadow-2xl space-y-4 relative overflow-hidden transition-all duration-500 hover:scale-[1.002] hover:border-purple-500/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-pink-700 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/20 shrink-0 animate-pulse">
                <Brain className="w-7 h-7 text-white" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-200 to-indigo-400 bg-clip-text text-transparent uppercase">
                    Sonexas AI
                  </span>
                  <span className="text-[10px] bg-purple-950 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-normal">
                    Super Assistant
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  স্মার্ট চ্যাট, ছবি জেনারেশন এবং এআই সমাধান কেন্দ্র।
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsAiOpen(true);
                  gameSound.playStart();
                }}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black text-xs transition shadow-xl shadow-purple-500/30 flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
              >
                <span>আস্ক এআই (Open Assistant) ➔</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // IF AI PORTAL OPEN: Full Screen Chat Workspace with Top Header having "Create Account / Login" button
  return (
    <div className="fixed inset-0 z-50 bg-[#050812] overflow-y-auto flex flex-col animate-fade-in text-left">
      
      {/* Workspace Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#18092d] via-[#090514] to-[#0c0d22] border-b border-purple-500/40 px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
            SX
          </div>
          <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
            Sonexas AI সমাধান কেন্দ্র
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Account / Login Button in Header */}
          <button
            onClick={() => {
              setShowAuthModal(true);
              gameSound.playScore();
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <User size={13} />
            <span>ক্রিয়েট অ্যাকাউন্ট / লগইন</span>
          </button>

          {/* Exit App Button */}
          <button
            onClick={() => {
              setIsAiOpen(false);
              gameSound.playBounce();
            }}
            className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <X size={15} />
            <span>বন্ধ করুন</span>
          </button>
        </div>
      </div>

      {/* Main Container: Chat Workspace Full Width */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between items-stretch">
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {/* ACTIVE INTERACTIVE CHAT WORKSPACE (12 cols full width for messages first) */}
        <div className="flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-[#090d1a] border border-cyan-500/40 shadow-2xl flex-1 space-y-5 relative overflow-hidden">
          
          {/* Header Title inside */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-sm text-cyan-300 flex items-center gap-1.5">
              <Brain size={16} />
              <span>সোনেক্সাস এআই মেসেজ ওয়ার্কস্পেস</span>
            </h3>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* CHAT AREA STREAM */}
          <div className="flex-1 overflow-y-auto max-h-[460px] min-h-[280px] space-y-4 pr-1 my-2 scroll-smooth">
            
            {(() => {
              const activeUserId = aiCurrentUser ? aiCurrentUser.id : 'guest';
              const activeChats = aiChatHistory.filter(c => c.userId === activeUserId);

              if (activeChats.length === 0) {
                return (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 animate-bounce">
                      <Sparkles size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-white">স্বাগতম সোনেক্সাস এআই ইন্টারঅ্যাক্টিভ চ্যাট বক্সে!</h4>
                    <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                      আজকের খবর, আবহাওয়া, যেকোনো প্রশ্ন বা ওয়েবসাইট সার্চ করতে নিচে টাইপ করুন। অথবা ছবি যুক্ত করে প্রশ্ন করুন!
                    </p>
                  </div>
                );
              }

              return activeChats.map((c) => (
                <div key={c.id} className="space-y-3 animate-fade-in">
                  {/* User Prompt Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 text-slate-950 font-bold text-xs shadow-lg space-y-2">
                      {c.imageInput && (
                        <div className="rounded-xl overflow-hidden border border-white/20 max-h-40 bg-black">
                          <img src={c.imageInput} alt="User Upload" className="w-full h-auto object-cover max-h-40" />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{c.prompt}</p>
                      <span className="text-[9px] opacity-80 block text-right font-mono">{c.timestamp}</span>
                    </div>
                  </div>

                  {/* Sonexas AI Response Bubble */}
                  <div className="flex justify-start">
                    <div className="max-w-[90%] sm:max-w-[85%] p-4 rounded-2xl bg-[#040711] border border-cyan-500/30 text-gray-200 text-xs sm:text-sm space-y-2.5 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase flex items-center gap-1.5">
                          <Brain size={12} className="text-cyan-400" />
                          <span>Sonexas AI রেসপন্স:</span>
                        </span>

                        <button
                          onClick={() => handleCopyText(c.resultValue, c.id)}
                          className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-gray-400 hover:text-white flex items-center gap-1 text-[10px] font-bold transition cursor-pointer"
                        >
                          {copiedId === c.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          <span>{copiedId === c.id ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                        </button>
                      </div>

                      <div className="leading-relaxed whitespace-pre-wrap font-sans text-gray-200">
                        {c.resultValue}
                      </div>
                    </div>
                  </div>
                </div>
              ));
            })()}

          </div>

          {/* SUGGESTION PILLS */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {suggestionPrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(s.text);
                  gameSound.playBounce();
                }}
                className="px-3 py-1.5 rounded-full bg-[#040711] hover:bg-slate-800 border border-slate-800 text-[11px] text-gray-300 whitespace-nowrap transition cursor-pointer shrink-0"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* UPLOADED IMAGE PREVIEW */}
          {image && (
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#040711] border border-cyan-500/30">
              <img src={image} alt="Preview" className="w-12 h-12 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">ছবি যুক্ত করা হয়েছে</span>
                <span className="text-[10px] text-gray-400">এআই এই ছবির প্রশ্নের উত্তর দেবে</span>
              </div>
              <button onClick={() => setImage(null)} className="p-1 rounded-lg text-red-400 hover:bg-red-950/50">
                <X size={15} />
              </button>
            </div>
          )}

          {/* INPUT & ACTION BAR */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSolve();
                  }
                }}
                placeholder="যেকোনো প্রশ্ন বা খবরের সার্চ ইনপুট লিখুন অথবা ছবি আপলোড করে প্রশ্ন করুন..."
                rows={2}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#040711] border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition resize-none"
              />

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  title="ছবি আপলোড করুন"
                  className="p-3 rounded-2xl bg-slate-900 border border-cyan-500/40 hover:bg-slate-800 text-cyan-400 transition cursor-pointer flex items-center justify-center shadow"
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500">Enter চেপে উত্তর নিন</span>

              <button
                onClick={handleSolve}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 font-black text-xs hover:scale-[1.02] active:scale-95 transition cursor-pointer shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>প্রসেসিং হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>মেসেজ পাঠান</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ACCOUNT AUTH MODAL (Pop-up when "ক্রিয়েট অ্যাকাউন্ট / লগইন" button in header is clicked) */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#090d1a] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-cyan-400 flex items-center gap-2">
                <User size={16} />
                <span>Sonexas AI অ্যাকাউন্ট ও লগইন</span>
              </h3>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {!aiCurrentUser ? (
              <div className="space-y-4">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  কথোপকথনসহ আপনার সব হিস্ট্রি আজীবনের জন্য স্থায়ীভাবে সংরক্ষণ করতে একটি এআই অ্যাকাউন্ট তৈরি করুন অথবা লগইন করুন।
                </p>

                {authError && (
                  <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] font-bold">
                    {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                    {authSuccess}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-extrabold text-xs hover:bg-gray-100 transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Chrome size={15} className="text-red-500" />
                  <span>গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করুন</span>
                </button>

                <div className="flex items-center gap-2 my-2 text-gray-500 text-[10px] font-bold justify-center">
                  <span className="w-8 h-[1px] bg-slate-800" />
                  <span>অথবা ইমেইল দিয়ে খুলুন</span>
                  <span className="w-8 h-[1px] bg-slate-800" />
                </div>

                <div className="flex bg-[#040711] p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition ${authMode === 'signup' ? 'bg-cyan-500 text-slate-950' : 'text-gray-400'}`}
                  >
                    সাইন-আপ
                  </button>
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition ${authMode === 'login' ? 'bg-cyan-500 text-slate-950' : 'text-gray-400'}`}
                  >
                    লগইন
                  </button>
                </div>

                {authMode === 'signup' ? (
                  <form onSubmit={handleSignup} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">পূর্ণ নাম:</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="আপনার নাম"
                        className="w-full px-3 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">সঠিক ইমেইল এড্রেস:</label>
                      <input
                        type="text"
                        required
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        placeholder="যেমন: example@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর):</label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                    >
                      স্থায়ী অ্যাকাউন্ট তৈরি করুন
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">নিবন্ধিত ইমেইল:</label>
                      <input
                        type="text"
                        required
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        placeholder="যেমন: example@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">পাসওয়ার্ড:</label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                    >
                      লগইন করুন
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs">
                      {aiCurrentUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{aiCurrentUser.name}</h4>
                      <span className="text-[10px] text-emerald-400 font-bold block">🛡️ {aiCurrentUser.username}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <LogOut size={13} />
                    <span>লগ-আউট</span>
                  </button>
                </div>

                {authSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                    {authSuccess}
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-[#040711] border border-slate-800 flex items-center justify-between text-xs text-gray-300">
                  <span className="font-bold">সংরক্ষিত মেসেজ:</span>
                  <span className="font-black text-cyan-400">{loggedInChats.length} টি</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                  >
                    <Trash2 size={13} /> ইতিহাস মুছুন
                  </button>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOOGLE ONE-TAP / ACCOUNT SELECTOR MODAL */}
      {showGoogleModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowGoogleModal(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#0e1628] border border-cyan-500/50 rounded-3xl p-6 shadow-2xl relative text-left my-auto space-y-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">
                  <Chrome size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Google দিয়ে সাইন-ইন</h3>
                  <p className="text-[10px] text-gray-400">আপনার গুগল অ্যাকাউন্টটি নির্বাচন করুন</p>
                </div>
              </div>

              <button
                onClick={() => setShowGoogleModal(false)}
                className="w-7 h-7 rounded-full bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Quick 1-Click Primary Google Account Option */}
            <div className="p-3.5 rounded-2xl bg-[#040711] border border-cyan-500/40 hover:border-cyan-400 transition cursor-pointer flex items-center justify-between gap-3 shadow-md group"
                 onClick={() => confirmGoogleSignIn(googleCustomName, googleCustomEmail)}>
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="Google Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400 shrink-0" 
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-white group-hover:text-cyan-400 transition truncate">{googleCustomName}</h4>
                  <p className="text-[10px] text-gray-400 truncate">{googleCustomEmail}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-cyan-500 text-slate-950 font-black text-[10px] shrink-0">
                কন্টিনিউ ➔
              </span>
            </div>

            {/* Custom Google Email Option */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <label className="block text-[10px] font-bold text-gray-400">অথবা অন্য ইমেইল ইনপুট দিন:</label>
              <input
                type="email"
                value={googleCustomEmail}
                onChange={(e) => setGoogleCustomEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="w-full px-3 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => confirmGoogleSignIn(googleCustomName || 'Google User', googleCustomEmail)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs hover:scale-[1.01] active:scale-95 transition cursor-pointer shadow-lg"
              >
                এই অ্যাকাউন্টে কন্টিনিউ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
