import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  UserCheck, 
  Plus, 
  Image as ImageIcon, 
  Send, 
  Flame, 
  CheckCircle,
  User,
  Edit3,
  X,
  Zap,
  Lock,
  Mail,
  Phone,
  Key,
  Calendar,
  LogOut,
  Trash2,
  Camera,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  CornerDownRight,
  Users,
  MapPin,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { gameSound } from '../utils/gameSound';

export interface NexusUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  dob: string;
  gender: string;
  hometown?: string;
  school?: string;
  occupation?: string;
}

export interface NexusCommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timeAgo: string;
}

export interface NexusComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  likedBy: string[]; // user IDs who liked this comment
  replies: NexusCommentReply[];
}

export interface NexusPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  timeAgo: string;
  reactions: {
    like: number;
    love: number;
    care: number;
    haha: number;
    wow: number;
    sad: number;
    fire: number;
  };
  userReactions: Record<string, 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'fire'>;
  comments: NexusComment[];
}

export interface FahadEntertainmentZoneProps {
  initialAuthMode?: 'login' | 'signup' | null;
  onAuthStateChange?: (isLoggedIn: boolean) => void;
}

export const FahadEntertainmentZone: React.FC<FahadEntertainmentZoneProps> = ({ initialAuthMode, onAuthStateChange }) => {
  // Current Logged-In User with Automatic Backwards Compatibility and Legacy Keys Migration
  const [currentUser, setCurrentUser] = useState<NexusUser | null>(() => {
    try {
      const stable = localStorage.getItem('nexus_stable_current_user');
      if (stable) return JSON.parse(stable);

      const legacyKeys = [
        'nexus_current_user_v6',
        'nexus_current_user_v5',
        'nexus_current_user_v4',
        'nexus_current_user_v3',
        'nexus_current_user_v2',
        'fahadgram_user_v1'
      ];
      for (const k of legacyKeys) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            localStorage.setItem('nexus_stable_current_user', val);
            return JSON.parse(val);
          } catch {}
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // Registered Users Database with Automatic Compatibility Migration
  const [usersDb, setUsersDb] = useState<NexusUser[]>(() => {
    try {
      const stable = localStorage.getItem('nexus_stable_users_db');
      if (stable) return JSON.parse(stable);

      const legacyKeys = [
        'nexus_users_db_v6',
        'nexus_users_db_v5',
        'nexus_users_db_v4',
        'nexus_users_db_v3',
        'nexus_users_db_v2',
        'fahadgram_users_v1'
      ];
      for (const k of legacyKeys) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            localStorage.setItem('nexus_stable_users_db', val);
            return JSON.parse(val);
          } catch {}
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Permanent Posts Database with Automatic Compatibility Migration
  const [posts, setPosts] = useState<NexusPost[]>(() => {
    try {
      const stable = localStorage.getItem('nexus_stable_posts_db');
      if (stable) return JSON.parse(stable);

      const legacyKeys = [
        'nexus_posts_db_v6',
        'nexus_posts_db_v5',
        'nexus_posts_db_v4',
        'nexus_posts_db_v3',
        'nexus_posts_db_v2',
        'fahadgram_posts_v1'
      ];
      for (const k of legacyKeys) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            localStorage.setItem('nexus_stable_posts_db', val);
            return JSON.parse(val);
          } catch {}
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // App Dedicated Workspace View
  const [isAppOpen, setIsAppOpen] = useState<boolean>(true);
  const [appActiveTab, setAppActiveTab] = useState<'timeline' | 'myposts' | 'users'>('timeline');

  // Search Queries inside Workspace
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [postSearchQuery, setPostSearchQuery] = useState('');

  // Modals & Popups
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [viewingPublicUser, setViewingPublicUser] = useState<NexusUser | null>(null);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null);

  // Sync Auth State to Parent
  useEffect(() => {
    onAuthStateChange?.(!!currentUser);
  }, [currentUser, onAuthStateChange]);

  // Handle Initial Auth Mode from external button
  useEffect(() => {
    if (!currentUser && initialAuthMode) {
      setAuthTab(initialAuthMode);
      setShowAuthModal(true);
    }
  }, [initialAuthMode, currentUser]);

  // Form Fields - Signup (Simplified as requested: Full Name, Identifier (Email or Phone), Password, DOB, Gender)
  const [formName, setFormName] = useState('');
  const [formIdentifier, setFormIdentifier] = useState(''); // Unified single field for signup (either Email or Phone)
  const [formPassword, setFormPassword] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formGender, setFormGender] = useState('male');
  const [formAvatar, setFormAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');

  // Login Form fields
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState(() => {
    try {
      return localStorage.getItem('nexus_remembered_username') || '';
    } catch {
      return '';
    }
  });
  const [loginPassword, setLoginPassword] = useState(() => {
    try {
      return localStorage.getItem('nexus_remembered_password') || '';
    } catch {
      return '';
    }
  });
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('nexus_remember_me') === 'true';
    } catch {
      return false;
    }
  });

  // Password Reset Flow
  const [resetEmailOrPhone, setResetEmailOrPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetStep, setResetStep] = useState<'identifier' | 'code' | 'newpass'>('identifier');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Post Creation
  const [postContent, setPostContent] = useState('');
  const [postImageBase64, setPostImageBase64] = useState<string | null>(null);

  // Active Reaction Picker
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);

  // Comments & Replies State
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeReplyInputId, setActiveReplyInputId] = useState<string | null>(null); // commentId
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({}); // commentId -> reply text

  // Toast banner
  const [toastText, setToastText] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Refs
  const postImageFileRef = useRef<HTMLInputElement | null>(null);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);

  const reactionConfigs = [
    { type: 'like', label: '👍 লাইক' },
    { type: 'love', label: '❤️ লাভ' },
    { type: 'care', label: '🥰 কেয়ার' },
    { type: 'haha', label: '😆 হাহা' },
    { type: 'wow', label: '😮 ওয়াও' },
    { type: 'sad', label: '😢 স্যাড' },
    { type: 'fire', label: '🔥 ফায়ার' }
  ];

  // Sync databases to stable persistent localStorage keys
  useEffect(() => {
    localStorage.setItem('nexus_stable_users_db', JSON.stringify(usersDb));
    localStorage.setItem('nexus_users_db_v6', JSON.stringify(usersDb));
  }, [usersDb]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nexus_stable_current_user', JSON.stringify(currentUser));
      localStorage.setItem('nexus_current_user_v6', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nexus_stable_current_user');
      localStorage.removeItem('nexus_current_user_v6');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nexus_stable_posts_db', JSON.stringify(posts));
    localStorage.setItem('nexus_posts_db_v6', JSON.stringify(posts));
  }, [posts]);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 3000);
  };

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Signup with strict validation (Either Email OR Phone Number)
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (formName.trim().length < 3) {
      setStatusMsg({ type: 'error', text: 'অনুগ্রহ করে সঠিক পূর্ণ নাম প্রদান করুন (কমপক্ষে ৩ অক্ষর)।' });
      gameSound.playBounce();
      return;
    }

    const inputVal = formIdentifier.trim();
    if (!inputVal) {
      setStatusMsg({ type: 'error', text: 'অনুগ্রহ করে সঠিক ইমেইল অথবা মোবাইল নম্বর প্রদান করুন।' });
      gameSound.playBounce();
      return;
    }

    // Determine input type
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^01[3-9]\d{8}$/;

    const isEmail = emailRegex.test(inputVal.toLowerCase());
    const isPhone = phoneRegex.test(inputVal);

    if (!isEmail && !isPhone) {
      setStatusMsg({ 
        type: 'error', 
        text: 'ভুল ফরম্যাট! সঠিক ইমেইল (যেমন: user@gmail.com) অথবা সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর (যেমন: 01712345678) প্রদান করুন।' 
      });
      gameSound.playBounce();
      return;
    }

    let emailVal = '';
    let phoneVal = '';

    if (isEmail) {
      emailVal = inputVal.toLowerCase();
      // Block disposable domains
      const tempEmailDomains = ['tempmail.com', 'mailinator.com', '10minutemail.com', 'yopmail.com', 'temp-mail.org', 'dispostable.com', 'guerrillamail.com', 'tempmail.net'];
      const emailDomain = emailVal.split('@')[1];
      if (tempEmailDomains.includes(emailDomain)) {
        setStatusMsg({ type: 'error', text: 'ফেক বা টেম্পোরারি ইমেইল ডোমেন ব্যবহার করা যাবে না। দয়া করে সঠিক ইমেইল দিন।' });
        gameSound.playBounce();
        return;
      }

      // Check duplicate Email
      const existsEmail = usersDb.find(u => u.email === emailVal);
      if (existsEmail) {
        setStatusMsg({ type: 'error', text: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে! লগইন করুন।' });
        gameSound.playBounce();
        return;
      }
    } else {
      phoneVal = inputVal;
      // Check duplicate Phone
      const existsPhone = usersDb.find(u => u.phone === phoneVal);
      if (existsPhone) {
        setStatusMsg({ type: 'error', text: 'এই মোবাইল নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে! লগইন করুন।' });
        gameSound.playBounce();
        return;
      }
    }

    if (!formDob) {
      setStatusMsg({ type: 'error', text: 'জন্ম তারিখ সঠিকভাবে পূরণ করতে হবে।' });
      gameSound.playBounce();
      return;
    }

    const age = calculateAge(formDob);
    if (age < 13 || age > 115) {
      setStatusMsg({ type: 'error', text: `NEXUS ব্যবহারের জন্য বয়স কমপক্ষে ১৩ বছর হতে হবে। আপনার বর্তমান বয়স: ${age} বছর।` });
      gameSound.playBounce();
      return;
    }

    if (formPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' });
      gameSound.playBounce();
      return;
    }

    // Save strictly authenticated user
    const newUser: NexusUser = {
      id: `usr_${Date.now()}`,
      name: formName.trim(),
      email: emailVal,
      phone: phoneVal,
      password: formPassword,
      avatar: formAvatar,
      bio: 'NEXUS সোশ্যাল মিডিয়ার সক্রিয় সদস্য!',
      joinedAt: new Date().toLocaleDateString('bn-BD'),
      dob: formDob,
      gender: formGender
      // Optional biodata (Hometown, School, Occupation) will be added later by the user in their profile!
    };

    setUsersDb([...usersDb, newUser]);
    setCurrentUser(newUser);
    setShowAuthModal(false);
    showToast('🎉 NEXUS অ্যাকাউন্ট সফলভাবে রেজিস্ট্রেশন হয়েছে!');
    gameSound.playScore();

    if (rememberMe) {
      localStorage.setItem('nexus_remembered_username', inputVal);
      localStorage.setItem('nexus_remembered_password', formPassword);
      localStorage.setItem('nexus_remember_me', 'true');
    }
  };

  // Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const credentialInput = loginEmailOrPhone.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^01[3-9]\d{8}$/;
    const isEmailFormat = emailRegex.test(credentialInput);
    const isPhoneFormat = phoneRegex.test(credentialInput);

    if (!isEmailFormat && !isPhoneFormat) {
      setStatusMsg({ 
        type: 'error', 
        text: 'অনুগ্রহ করে সঠিক ফরম্যাটের ইমেইল (যেমন: user@gmail.com) অথবা সঠিক ১১ ডিজিটের মোবাইল নম্বর (যেমন: 01712345678) প্রদান করুন।' 
      });
      gameSound.playBounce();
      return;
    }

    const user = usersDb.find(
      u => (u.email.toLowerCase() === credentialInput || u.phone === credentialInput) && u.password === loginPassword
    );

    if (!user) {
      setStatusMsg({ type: 'error', text: 'এই ইমেইল বা ফোন নম্বরের কোনো অ্যাকাউন্ট পাওয়া যায়নি অথবা পাসওয়ার্ড ভুল!' });
      gameSound.playBounce();
      return;
    }

    setCurrentUser(user);
    setShowAuthModal(false);
    setStatusMsg(null);
    showToast(`স্বাগতম, ${user.name}!`);
    gameSound.playScore();

    if (rememberMe) {
      localStorage.setItem('nexus_remembered_username', loginEmailOrPhone);
      localStorage.setItem('nexus_remembered_password', loginPassword);
      localStorage.setItem('nexus_remember_me', 'true');
    } else {
      localStorage.removeItem('nexus_remembered_username');
      localStorage.removeItem('nexus_remembered_password');
      localStorage.setItem('nexus_remember_me', 'false');
    }
  };

  // Reset Password Flow
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetStep === 'identifier') {
      const target = resetEmailOrPhone.trim().toLowerCase();
      const user = usersDb.find(u => u.email.toLowerCase() === target || u.phone === target);
      if (!user) {
        setStatusMsg({ type: 'error', text: 'এই ইমেইল বা ফোন নম্বরটি নিবন্ধিত নয়।' });
        gameSound.playBounce();
        return;
      }
      setResetStep('code');
      setStatusMsg({ type: 'success', text: 'আপনার নাম্বারে ৪ ডিজিটের কোড পাঠানো হয়েছে (কোড: 2026)।' });
      gameSound.playBounce();
    } else if (resetStep === 'code') {
      if (resetCode !== '2026') {
        setStatusMsg({ type: 'error', text: 'ভুল কোড! আবার চেষ্টা করুন (সদস্য কোড: 2026)।' });
        gameSound.playBounce();
        return;
      }
      setResetStep('newpass');
      setStatusMsg(null);
    } else if (resetStep === 'newpass') {
      if (newPasswordInput.length < 6) {
        setStatusMsg({ type: 'error', text: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।' });
        gameSound.playBounce();
        return;
      }

      setUsersDb(usersDb.map(u => {
        if (u.email.toLowerCase() === resetEmailOrPhone.trim().toLowerCase() || u.phone === resetEmailOrPhone.trim()) {
          return { ...u, password: newPasswordInput };
        }
        return u;
      }));

      setStatusMsg({ type: 'success', text: 'পাসওয়ার্ড পরিবর্তন সফল হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' });
      setAuthTab('login');
      setResetStep('identifier');
      setLoginPassword(newPasswordInput);
      gameSound.playScore();
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowProfileModal(false);
    showToast('লগ-আউট সম্পন্ন হয়েছে।');
    gameSound.playBounce();
  };

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setPostImageBase64(evt.target.result as string);
        gameSound.playBounce();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        const url = evt.target.result as string;
        setFormAvatar(url);
        if (currentUser) {
          const updated = { ...currentUser, avatar: url };
          setCurrentUser(updated);
          setUsersDb(usersDb.map(u => u.id === currentUser.id ? updated : u));
          showToast('📸 প্রোফাইল পিকচার সফলভাবে পরিবর্তন করা হয়েছে!');
        }
        gameSound.playBounce();
      }
    };
    reader.readAsDataURL(file);
  };

  // Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthTab('login');
      return;
    }

    if (!postContent.trim() && !postImageBase64) return;

    const newPost: NexusPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content: postContent.trim(),
      imageUrl: postImageBase64 || undefined,
      timeAgo: 'এখনই',
      reactions: { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, fire: 0 },
      userReactions: {},
      comments: []
    };

    setPosts([newPost, ...posts]);
    setPostContent('');
    setPostImageBase64(null);
    showToast('আপনার পোস্ট সফলভাবে প্রকাশিত হয়েছে!');
    gameSound.playScore();
  };

  // Confirm delete post
  const handleConfirmDeletePost = () => {
    if (!deleteConfirmPostId) return;
    setPosts(posts.filter(p => p.id !== deleteConfirmPostId));
    setDeleteConfirmPostId(null);
    showToast('পোস্টটি স্থায়ীভাবে মুছে ফেলা হয়েছে।');
    gameSound.playBounce();
  };

  // Reaction Handling
  const handleReact = (postId: string, reactionType: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'fire') => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthTab('login');
      return;
    }

    setPosts(posts.map(p => {
      if (p.id === postId) {
        const prevReaction = p.userReactions[currentUser.id];
        const newReactions = { ...p.reactions };
        const newUserReactions = { ...p.userReactions };

        if (prevReaction) {
          newReactions[prevReaction] = Math.max(0, newReactions[prevReaction] - 1);
        }

        if (prevReaction === reactionType) {
          delete newUserReactions[currentUser.id];
        } else {
          newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
          newUserReactions[currentUser.id] = reactionType;
        }

        return {
          ...p,
          reactions: newReactions,
          userReactions: newUserReactions
        };
      }
      return p;
    }));

    setActiveReactionPickerId(null);
    gameSound.playBounce();
  };

  // Comments
  const handleAddComment = (postId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthTab('login');
      return;
    }

    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newComment: NexusComment = {
      id: `cmt_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text: text.trim(),
      timeAgo: 'এখনই',
      likes: 0,
      likedBy: [],
      replies: []
    };

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setCommentInputs({ ...commentInputs, [postId]: '' });
    gameSound.playBounce();
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthTab('login');
      return;
    }

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id === commentId) {
              const hasLiked = c.likedBy.includes(currentUser.id);
              const newLikedBy = hasLiked
                ? c.likedBy.filter(id => id !== currentUser.id)
                : [...c.likedBy, currentUser.id];
              return {
                ...c,
                likes: newLikedBy.length,
                likedBy: newLikedBy
              };
            }
            return c;
          })
        };
      }
      return p;
    }));
    gameSound.playBounce();
  };

  const handleAddReply = (postId: string, commentId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      setAuthTab('login');
      return;
    }

    const replyText = replyInputs[commentId];
    if (!replyText || !replyText.trim()) return;

    const newReply: NexusCommentReply = {
      id: `rpl_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text: replyText.trim(),
      timeAgo: 'এখনই'
    };

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id === commentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply]
              };
            }
            return c;
          })
        };
      }
      return p;
    }));

    setReplyInputs({ ...replyInputs, [commentId]: '' });
    setActiveReplyInputId(null);
    gameSound.playBounce();
  };

  const handleSharePost = (postId: string) => {
    showToast('🔗 পোস্ট লিঙ্ক কপি করা হয়েছে! সোশ্যাল মিডিয়ায় শেয়ার করুন।');
    gameSound.playBounce();
  };

  const handleOpenPublicProfile = (userObj: { id: string; name: string; avatar: string }) => {
    const fullUser = usersDb.find(u => u.id === userObj.id) || {
      id: userObj.id,
      name: userObj.name,
      email: '', 
      phone: '', 
      password: '',
      avatar: userObj.avatar,
      bio: 'NEXUS সোশ্যাল নেটওয়ার্কের সম্মানিত সদস্য।',
      joinedAt: 'সক্রিয় সদস্য',
      dob: '2005-01-01',
      gender: 'অন্যান্য',
      hometown: undefined,
      school: undefined,
      occupation: undefined
    };

    setViewingPublicUser(fullUser);
    gameSound.playBounce();
  };

  let displayPosts = [...posts];

  if (appActiveTab === 'myposts') {
    if (currentUser) {
      displayPosts = displayPosts.filter(p => p.authorId === currentUser.id);
    } else {
      displayPosts = [];
    }
  } else if (appActiveTab === 'timeline') {
    // Sort Timeline posts by reach & engagement (Likes + Reactions + Comments count)
    displayPosts.sort((a, b) => {
      const reachA = Object.values(a.reactions || {}).reduce((sum, val) => sum + (val || 0), 0) + (a.comments?.length || 0);
      const reachB = Object.values(b.reactions || {}).reduce((sum, val) => sum + (val || 0), 0) + (b.comments?.length || 0);
      if (reachB !== reachA) {
        return reachB - reachA; // Highest reach / engagement first
      }
      return b.id.localeCompare(a.id); // Latest post first if reach is equal
    });
  }

  if (postSearchQuery.trim()) {
    const q = postSearchQuery.toLowerCase().trim();
    displayPosts = displayPosts.filter(p => 
      p.content.toLowerCase().includes(q) || 
      p.authorName.toLowerCase().includes(q)
    );
  }

  const filteredUsers = usersDb.filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q)) ||
      (u.hometown && u.hometown.toLowerCase().includes(q)) ||
      (u.school && u.school.toLowerCase().includes(q)) ||
      (u.occupation && u.occupation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* TOAST POPUP */}
      {toastText && (
        <div className="fixed top-24 right-4 z-50 bg-[#0c1328] border border-cyan-400 text-cyan-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold animate-bounce-subtle flex items-center gap-2 animate-fade-in">
          <Sparkles size={16} className="text-amber-400" />
          <span>{toastText}</span>
        </div>
      )}

      {/* GALLERY FILE SELECTORS */}
      <input type="file" accept="image/*" ref={postImageFileRef} onChange={handlePostImageSelect} className="hidden" />
      <input type="file" accept="image/*" ref={avatarFileRef} onChange={handleAvatarSelect} className="hidden" />

      {/* NEXUS SOCIAL WORKSPACE HEADER & NAVIGATION */}
      <div className="bg-[#080d1e]/95 border border-cyan-500/30 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs shadow">
            NX
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider leading-none">
              NEXUS Social
            </h2>
            <span className="text-[10px] text-cyan-400 font-mono">লাইভ সোশ্যাল নেটওয়ার্ক</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-[#040711] p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setAppActiveTab('timeline');
              gameSound.playBounce();
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              appActiveTab === 'timeline' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            টাইমলাইন
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                setShowAuthModal(true);
                setAuthTab('login');
                return;
              }
              setAppActiveTab('myposts');
              gameSound.playBounce();
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              appActiveTab === 'myposts' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            আমার পোস্টসমূহ
          </button>

          <button
            onClick={() => {
              setAppActiveTab('users');
              gameSound.playBounce();
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
              appActiveTab === 'users' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            ইউজারবৃন্দ ({usersDb.length})
          </button>
        </div>

        {/* User Status / Login / Profile Chip */}
        <div className="flex items-center gap-2">
          {!currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthTab('login');
                  setStatusMsg(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-gray-200 transition cursor-pointer"
              >
                লগইন
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthTab('signup');
                  setStatusMsg(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition shadow-md cursor-pointer active:scale-95"
              >
                সাইন-আপ
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowProfileModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#040711] border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <img src={currentUser.avatar} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-cyan-400" />
              <span>{currentUser.name}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto space-y-6">
            
            {/* POST COMPOSER */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#090d1a] border border-slate-800 shadow-2xl space-y-3">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt="User"
                    onClick={() => currentUser && handleOpenPublicProfile(currentUser)}
                    className="w-10 h-10 rounded-full object-cover border border-cyan-400 shrink-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={
                      currentUser 
                        ? `${currentUser.name}, আপনার মনে কী আছে? ছবিসহ স্থায়ী পোস্ট করুন...` 
                        : 'পোস্ট করতে অনুগ্রহ করে লগইন করুন...'
                    }
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[#040711] border border-slate-800 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                {postImageBase64 && (
                  <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 max-h-[240px] bg-black">
                    <img src={postImageBase64} alt="Device Attachment" className="w-full h-full object-cover max-h-[240px]" />
                    <button
                      type="button"
                      onClick={() => setPostImageBase64(null)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white hover:bg-red-600 flex items-center justify-center transition cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => postImageFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#040711] border border-slate-800 hover:border-cyan-500 text-xs text-gray-300 font-semibold transition cursor-pointer"
                  >
                    <ImageIcon size={15} className="text-emerald-400" />
                    <span>গ্যালারি থেকে ছবি আপলোড</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!postContent.trim() && !postImageBase64}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Send size={13} />
                    <span>পোস্ট করুন</span>
                  </button>
                </div>
              </form>
            </div>

            {/* TAB: USERS DIRECTORY */}
            {appActiveTab === 'users' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Users size={16} className="text-cyan-400" />
                    <span>সকল নিবন্ধিত ব্যবহারকারী ডিরেক্টরি ({usersDb.length}):</span>
                  </h3>

                  {/* Search Bar for Members */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="🔍 মেম্বারদের নাম লিখে খুঁজুন..."
                      className="w-full px-4 py-2 rounded-2xl bg-[#090d1a] border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition shadow"
                    />
                    {userSearchQuery && (
                      <button
                        onClick={() => setUserSearchQuery('')}
                        className="absolute right-3 top-2 text-gray-500 hover:text-white cursor-pointer text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {usersDb.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#090d1a] border border-slate-800 text-center text-xs text-gray-400">
                    এখনও কোনো ব্যবহারকারী নিবন্ধিত হয়নি।
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#090d1a] border border-slate-800 text-center text-xs text-gray-400">
                    "<strong>{userSearchQuery}</strong>" নামে কোনো মেম্বার খুঁজে পাওয়া যায়নি!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredUsers.map((u) => (
                      <div 
                        key={u.id}
                        onClick={() => handleOpenPublicProfile(u)}
                        className="p-3.5 rounded-2xl bg-[#090d1a] border border-slate-800 hover:border-cyan-500 transition cursor-pointer flex items-center gap-3 group animate-fade-in"
                      >
                        <img src={u.avatar} alt={u.name} className="w-11 h-11 rounded-full object-cover border-cyan-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-xs text-white group-hover:text-cyan-400 transition truncate">{u.name}</h4>
                          <div className="text-[10px] text-gray-400 space-y-0.5 mt-0.5">
                            <p className="font-semibold text-gray-400">বয়স: {calculateAge(u.dob)} বছর ({u.gender === 'male' ? 'পুরুষ' : 'মহিলা'})</p>
                            {u.hometown && <p className="truncate flex items-center gap-1 text-[9px] text-gray-500"><MapPin size={10} /> {u.hometown}</p>}
                          </div>
                          <span className="text-[9px] text-cyan-400 font-bold block mt-1">প্রোফাইল ও পোস্টসমূহ দেখুন ➔</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: TIMELINE */}
            {appActiveTab !== 'users' && (
              <div className="space-y-4">
                {/* Search Bar for Posts */}
                <div className="relative">
                  <input
                    type="text"
                    value={postSearchQuery}
                    onChange={(e) => setPostSearchQuery(e.target.value)}
                    placeholder="🔍 পোস্টের বিষয়বস্তু অথবা লেখকের নাম লিখে পোস্ট সার্চ করুন..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#090d1a] border border-slate-800 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition shadow"
                  />
                  {postSearchQuery && (
                    <button
                      onClick={() => setPostSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {displayPosts.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#090d1a] border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-gray-400">টাইমলাইনে কোনো পোস্ট নেই। প্রথম রিয়েল পোস্টটি প্রকাশ করুন!</p>
                  </div>
                ) : (
                  displayPosts.map((post) => {
                    const userReaction = currentUser ? post.userReactions[currentUser.id] : null;
                    const isMyPost = currentUser && currentUser.id === post.authorId;
                    const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);

                    return (
                      <div key={post.id} className="p-4 sm:p-5 rounded-3xl bg-[#090d1a] border border-slate-800 shadow-2xl space-y-3.5 relative overflow-hidden animate-fade-in">
                        {/* Post Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div 
                            onClick={() => handleOpenPublicProfile({ id: post.authorId, name: post.authorName, avatar: post.authorAvatar })}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border border-cyan-400 shrink-0 group-hover:scale-105 transition" />
                            <div>
                              <h4 className="font-extrabold text-sm text-white group-hover:text-cyan-400 transition flex items-center gap-1">
                                <span>{post.authorName}</span>
                                <CheckCircle size={13} className="text-cyan-400 fill-cyan-500/20" />
                              </h4>
                              <p className="text-[10px] text-gray-400">{post.timeAgo}</p>
                            </div>
                          </div>

                          {/* Delete */}
                          {isMyPost && (
                            <button
                              onClick={() => setDeleteConfirmPostId(post.id)}
                              className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {post.content && (
                          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal whitespace-pre-line">
                            {post.content}
                          </p>
                        )}

                        {post.imageUrl && (
                          <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 max-h-[420px] flex items-center justify-center">
                            <img src={post.imageUrl} alt="Nexus attachment" className="w-full h-full object-cover max-h-[420px]" />
                          </div>
                        )}

                        {totalReactions > 0 && (
                          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-slate-800/40">
                            <span className="font-bold text-cyan-300">
                              👍 ❤️ 🥰 😆 😮 🔥 {totalReactions} জন রিঅ্যাক্ট দিয়েছেন
                            </span>
                            <span>{post.comments.length} কমেন্ট</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 relative text-xs font-bold text-gray-300">
                          <div className="relative">
                            <button
                              onClick={() => setActiveReactionPickerId(activeReactionPickerId === post.id ? null : post.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                                userReaction ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <ThumbsUp size={15} className={userReaction ? 'fill-cyan-400' : ''} />
                              <span>
                                {userReaction === 'like' && '👍 লাইক'}
                                {userReaction === 'love' && '❤️ লাভ'}
                                {userReaction === 'care' && '🥰 কেয়ার'}
                                {userReaction === 'haha' && '😆 হাহা'}
                                {userReaction === 'wow' && '😮 ওয়াও'}
                                {userReaction === 'sad' && '😢 স্যাড'}
                                {userReaction === 'fire' && '🔥 ফায়ার'}
                                {!userReaction && 'রিঅ্যাক্ট দিন'}
                              </span>
                            </button>

                            {activeReactionPickerId === post.id && (
                              <div className="absolute left-0 bottom-10 z-30 bg-[#0c1222] border border-cyan-500/50 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 animate-bounce-subtle">
                                {reactionConfigs.map((r) => (
                                  <button
                                    key={r.type}
                                    onClick={() => handleReact(post.id, r.type as any)}
                                    className="px-2 py-1 rounded-xl hover:bg-slate-800 text-xs font-bold transition transform hover:scale-125 cursor-pointer shrink-0"
                                    title={r.label}
                                  >
                                    <span>{r.label.split(' ')[0]}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 hover:text-cyan-400 cursor-pointer">
                            <MessageSquare size={15} />
                            <span>কমেন্ট ({post.comments.length})</span>
                          </div>

                          <button
                            onClick={() => handleSharePost(post.id)}
                            className="flex items-center gap-1.5 hover:text-cyan-400 cursor-pointer"
                          >
                            <Share2 size={15} />
                            <span>শেয়ার</span>
                          </button>
                        </div>

                        {/* Comments & Replies */}
                        <div className="pt-2 space-y-2.5 border-t border-slate-800/40">
                          {post.comments.length > 0 && (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                              {post.comments.map((comment) => {
                                const isCommentLiked = currentUser && comment.likedBy.includes(currentUser.id);

                                return (
                                  <div key={comment.id} className="p-3 rounded-2xl bg-[#040711] border border-slate-800/80 space-y-2">
                                    <div className="flex items-start gap-2.5">
                                      <img 
                                        src={comment.authorAvatar} 
                                        alt={comment.authorName} 
                                        onClick={() => handleOpenPublicProfile({ id: comment.authorId, name: comment.authorName, avatar: comment.authorAvatar })}
                                        className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0 mt-0.5 cursor-pointer" 
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                          <span 
                                            onClick={() => handleOpenPublicProfile({ id: comment.authorId, name: comment.authorName, avatar: comment.authorAvatar })}
                                            className="font-extrabold text-xs text-cyan-400 hover:underline cursor-pointer"
                                          >
                                            {comment.authorName}
                                          </span>
                                          <span className="text-[9px] text-gray-500">{comment.timeAgo}</span>
                                        </div>
                                        <p className="text-xs text-gray-200 mt-0.5">{comment.text}</p>

                                        {/* Actions */}
                                        <div className="flex items-center gap-4 mt-2 text-[11px] font-bold">
                                          <button
                                            onClick={() => handleLikeComment(post.id, comment.id)}
                                            className={`flex items-center gap-1 transition cursor-pointer ${
                                              isCommentLiked ? 'text-cyan-400 font-extrabold' : 'text-gray-400 hover:text-white'
                                            }`}
                                          >
                                            <ThumbsUp size={12} className={isCommentLiked ? 'fill-cyan-400' : ''} />
                                            <span>{comment.likes > 0 ? `${comment.likes} লাইক` : 'লাইক'}</span>
                                          </button>

                                          <button
                                            onClick={() => setActiveReplyInputId(activeReplyInputId === comment.id ? null : comment.id)}
                                            className="text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition cursor-pointer"
                                          >
                                            <CornerDownRight size={12} />
                                            <span>রিপ্লাই</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Replies List */}
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="ml-8 pl-3 border-l-2 border-slate-800 space-y-2 pt-1">
                                        {comment.replies.map((reply) => (
                                          <div key={reply.id} className="flex items-start gap-2 bg-[#080d1e] p-2 rounded-xl">
                                            <img src={reply.authorAvatar} alt={reply.authorName} className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center justify-between">
                                                <span className="font-bold text-[11px] text-amber-300">{reply.authorName}</span>
                                                <span className="text-[9px] text-gray-500">{reply.timeAgo}</span>
                                              </div>
                                              <p className="text-xs text-gray-300">{reply.text}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Reply Form */}
                                    {activeReplyInputId === comment.id && (
                                      <div className="ml-8 pt-1 flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={replyInputs[comment.id] || ''}
                                          onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              handleAddReply(post.id, comment.id);
                                            }
                                          }}
                                          placeholder="উত্তর লিখুন..."
                                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#080d1e] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                                        />
                                        <button
                                          onClick={() => handleAddReply(post.id, comment.id)}
                                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
                                        >
                                          রিপ্লাই
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Comment input */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              placeholder="মন্তব্য করুন..."
                              className="flex-1 px-3.5 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs cursor-pointer shadow-md"
                            >
                              কমেন্ট
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmPostId && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setDeleteConfirmPostId(null)}
        >
          <div 
            className="w-full max-w-sm bg-[#0c1220] border border-red-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4 my-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle size={26} />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">পোস্ট মুছে ফেলার নিশ্চিতকরণ</h3>
              <p className="text-xs text-gray-300 mt-1">
                Are you sure you want to delete this post?<br />
                আপনি কি নিশ্চিত যে এই পোস্টটি মুছে ফেলতে চান?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmPostId(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-gray-300 font-bold text-xs cursor-pointer"
              >
                বাতিল করুন
              </button>

              <button
                onClick={handleConfirmDeletePost}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs cursor-pointer shadow-lg"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLIC USER PROFILE DIALOG */}
      {viewingPublicUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setViewingPublicUser(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#0c1220] border border-cyan-500/50 rounded-3xl p-6 shadow-2xl relative text-left my-auto space-y-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <User size={18} className="text-cyan-400" />
                <span>NEXUS ইউজার প্রোফাইল তথ্য</span>
              </h3>
              <button
                onClick={() => setViewingPublicUser(null)}
                className="w-8 h-8 rounded-full bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#040711] border border-slate-800">
              <img src={viewingPublicUser.avatar} alt={viewingPublicUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400 shrink-0 shadow-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <h4 className="font-extrabold text-base text-white flex items-center gap-1.5">
                  <span>{viewingPublicUser.name}</span>
                  <CheckCircle size={14} className="text-cyan-400" />
                </h4>
                
                <div className="space-y-1.5 text-xs text-gray-300">
                  <p className="font-semibold text-emerald-400 block text-[11px]">🛡️ NEXUS ভেরিফাইড প্রোফাইল</p>
                  <p className="font-normal text-gray-300 italic">"{viewingPublicUser.bio || 'কোনো বায়ো নেই'}"</p>
                  
                  <div className="flex flex-wrap gap-2 pt-1 font-semibold text-[10px] text-gray-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">বয়স: {calculateAge(viewingPublicUser.dob)} বছর</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 uppercase">জেন্ডার: {viewingPublicUser.gender === 'male' ? 'পুরুষ' : 'মহিলা'}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">নিবন্ধিত: {viewingPublicUser.joinedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Biodata Fields (Hometown, School, Occupation) */}
            {(viewingPublicUser.hometown || viewingPublicUser.school || viewingPublicUser.occupation) && (
              <div className="p-3.5 rounded-2xl bg-[#040711] border border-slate-800/80 space-y-2.5 text-xs text-gray-200">
                <h4 className="font-black text-cyan-400 border-b border-slate-800 pb-1.5">ব্যক্তিগত পরিচিতি (Biodata):</h4>
                
                {viewingPublicUser.hometown && (
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-orange-400 shrink-0" />
                    <span>কোথা থেকে এসেছে: <strong className="text-white">{viewingPublicUser.hometown}</strong></span>
                  </p>
                )}

                {viewingPublicUser.school && (
                  <p className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-indigo-400 shrink-0" />
                    <span>শিক্ষাপ্রতিষ্ঠান: <strong className="text-white">{viewingPublicUser.school}</strong></span>
                  </p>
                )}

                {viewingPublicUser.occupation && (
                  <p className="flex items-center gap-2">
                    <Briefcase size={14} className="text-emerald-400 shrink-0" />
                    <span>বর্তমান পেশা/কাজ: <strong className="text-white">{viewingPublicUser.occupation}</strong></span>
                  </p>
                )}
              </div>
            )}

            {/* Public Posts Section */}
            <div>
              <h4 className="font-extrabold text-xs text-gray-300 mb-2">
                {viewingPublicUser.name} এর শেয়ারকৃত পোস্টসমূহ ({posts.filter(p => p.authorId === viewingPublicUser.id).length}):
              </h4>

              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {posts.filter(p => p.authorId === viewingPublicUser.id).length === 0 ? (
                  <p className="text-xs text-gray-500 italic p-3 text-center bg-[#040711] rounded-xl">
                    এই ইউজার এখনও কোনো পোস্ট প্রকাশ করেননি।
                  </p>
                ) : (
                  posts.filter(p => p.authorId === viewingPublicUser.id).map(post => (
                    <div key={post.id} className="p-3 rounded-2xl bg-[#040711] border border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-gray-500 block font-mono">{post.timeAgo}</span>
                      <p className="text-xs text-gray-200">{post.content}</p>
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="post" className="w-full h-32 object-cover rounded-xl mt-1" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEXUS AUTH MODAL */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#0c1220] border border-cyan-500/50 rounded-3xl p-6 shadow-2xl relative text-left my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xs shadow">
                  NX
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white uppercase tracking-wider">
                    {authTab === 'login' && 'NEXUS অ্যাকাউন্ট লগইন'}
                    {authTab === 'signup' && 'NEXUS নতুন অ্যাকাউন্ট'}
                    {authTab === 'reset' && 'পাসওয়ার্ড রিসেট'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    ইমেইল আইডি বা মোবাইল নম্বর ভেরিফাইড সিস্টেমে প্রবেশ করুন
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {statusMsg && (
              <div className={`p-3 rounded-2xl text-xs font-bold mb-3 ${
                statusMsg.type === 'error' ? 'bg-red-950/80 border border-red-500/40 text-red-300' : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
              }`}>
                {statusMsg.text}
              </div>
            )}

            {/* LOGIN FORM */}
            {authTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">নিবন্ধিত ইমেইল বা মোবাইল নম্বর:</label>
                  <input
                    type="text"
                    required
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                    placeholder="user@gmail.com বা 017xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">পাসওয়ার্ড:</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pb-1">
                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#040711] border-slate-800 accent-cyan-500"
                    />
                    <span>লগইন তথ্য সেভ রাখুন (Auto-Save)</span>
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('reset');
                      setResetStep('identifier');
                      setStatusMsg(null);
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('signup');
                      setStatusMsg(null);
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    নতুন অ্যাকাউন্ট খুলুন
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
                >
                  লগইন করুন
                </button>
              </form>
            )}

            {/* SIGNUP FORM WITH SIMPLIFIED UNIFIED IDENTIFIER (EITHER EMAIL OR MOBILE) */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">পূর্ণ নাম (Full Name):</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="কমপক্ষে ৩ অক্ষর"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">ইমেইল অথবা মোবাইল নম্বর (যেকোনো একটি):</label>
                  <input
                    type="text"
                    required
                    value={formIdentifier}
                    onChange={(e) => setFormIdentifier(e.target.value)}
                    placeholder="যেমন: name@gmail.com অথবা 017xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর):</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">জন্ম তারিখ (Age 13+):</label>
                    <input
                      type="date"
                      required
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">জেন্ডার:</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="male">পুরুষ (Male)</option>
                      <option value="female">মহিলা (Female)</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#040711] border-slate-800 accent-cyan-500"
                    />
                    <span>লগইন তথ্য সেভ রাখুন (Auto-Save)</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setStatusMsg(null);
                    }}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    আগে থেকেই অ্যাকাউন্ট আছে?
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
                  >
                    রেজিস্ট্রেশন করুন
                  </button>
                </div>
              </form>
            )}

            {/* RESET PASSWORD */}
            {authTab === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {resetStep === 'identifier' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">নিবন্ধিত ইমেইল বা ফোন নম্বর দিন:</label>
                    <input
                      type="text"
                      required
                      value={resetEmailOrPhone}
                      onChange={(e) => setResetEmailOrPhone(e.target.value)}
                      placeholder="user@gmail.com বা 017xxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {resetStep === 'code' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">৪ ডিজিট কোড লিখুন (কোড: 2026):</label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white font-mono text-center tracking-widest text-base focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {resetStep === 'newpass' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">নতুন সিকিউর পাসওয়ার্ড দিন:</label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setResetStep('identifier');
                      setStatusMsg(null);
                    }}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    লগইন ফর্মে ফিরে যান
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
                  >
                    {resetStep === 'identifier' && 'কোড পাঠান'}
                    {resetStep === 'code' && 'ভেরিফাই করুন'}
                    {resetStep === 'newpass' && 'পাসওয়ার্ড সেভ করুন'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {showProfileModal && currentUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#0c1220] border border-cyan-500/50 rounded-3xl p-6 shadow-2xl relative text-left my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <User size={18} className="text-cyan-400" />
                <span>আমার NEXUS প্রোফাইল (ব্যক্তিগত তথ্য)</span>
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#040711] border border-slate-800">
                <div className="relative">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400" />
                  <button
                    onClick={() => avatarFileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1 rounded-full bg-cyan-500 text-slate-950 hover:scale-110 transition shadow cursor-pointer"
                    title="গ্যালারি থেকে ছবি পরিবর্তন করুন"
                  >
                    <Camera size={12} />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm text-white">{currentUser.name}</h4>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5 space-y-0.5">
                    {currentUser.email && <p className="text-cyan-300">📧 ইমেইল: {currentUser.email}</p>}
                    {currentUser.phone && <p className="text-cyan-300">📞 ফোন: {currentUser.phone}</p>}
                    <p className="text-emerald-400 font-bold">🔑 পাসওয়ার্ড: {currentUser.password}</p>
                    <p>🎂 বয়স: {calculateAge(currentUser.dob)} বছর (জন্ম: {currentUser.dob})</p>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">যোগদান: {currentUser.joinedAt}</p>
                </div>
              </div>

              {/* Bio Edit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">বায়ো পরিবর্তন করুন:</label>
                <input
                  type="text"
                  value={currentUser.bio}
                  onChange={(e) => {
                    const updated = { ...currentUser, bio: e.target.value };
                    setCurrentUser(updated);
                    setUsersDb(usersDb.map(u => u.id === currentUser.id ? updated : u));
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Hometown Edit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">কোথা থেকে এসেছেন (Hometown):</label>
                <input
                  type="text"
                  value={currentUser.hometown || ''}
                  onChange={(e) => {
                    const updated = { ...currentUser, hometown: e.target.value };
                    setCurrentUser(updated);
                    setUsersDb(usersDb.map(u => u.id === currentUser.id ? updated : u));
                  }}
                  placeholder="যেমন: ঢাকা, বাংলাদেশ"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* School Edit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">शिक्षাপ্রতিষ্ঠান (School/College):</label>
                <input
                  type="text"
                  value={currentUser.school || ''}
                  onChange={(e) => {
                    const updated = { ...currentUser, school: e.target.value };
                    setCurrentUser(updated);
                    setUsersDb(usersDb.map(u => u.id === currentUser.id ? updated : u));
                  }}
                  placeholder="যেমন: সরকারি কলেজ"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Occupation Edit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">বর্তমান পেশা (Occupation):</label>
                <input
                  type="text"
                  value={currentUser.occupation || ''}
                  onChange={(e) => {
                    const updated = { ...currentUser, occupation: e.target.value };
                    setCurrentUser(updated);
                    setUsersDb(usersDb.map(u => u.id === currentUser.id ? updated : u));
                  }}
                  placeholder="যেমন: ছাত্র, গ্রাফিক ডিজাইনার"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040711] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white font-extrabold text-xs transition border border-red-500/30 cursor-pointer"
                >
                  লগ-আউট করুন
                </button>

                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs cursor-pointer shadow"
                >
                  সম্পন্ন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
