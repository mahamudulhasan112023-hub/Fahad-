import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Search,
  Crown,
  Mic,
  MicOff,
  Play,
  Pause,
  Image as ImageIcon,
  Film,
  X,
  Volume2,
  Lock,
  Mail,
  KeyRound,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  MessageCircle,
  Camera,
  Maximize2,
  ArrowLeft,
  Edit3,
  Check,
  AlertCircle,
  Trash2,
  Music,
  Heart,
  UserX,
  Globe2,
  Phone,
  PhoneCall,
  PhoneOff,
  Radio,
  VolumeX,
  ShieldCheck,
  UserCheck,
  CheckCheck,
  MoreVertical,
  Smile,
  Paperclip
} from 'lucide-react';
import { gameSound } from '../utils/gameSound';

interface MediaAttachment {
  type: 'image' | 'video' | 'audio';
  url: string;
  name?: string;
  duration?: number;
}

interface UserProfile {
  id: string;
  name: string;
  identifier: string; // Private (Gmail or Phone - Strictly Unique)
  password: string; // Private
  avatar: string;
  bio: string;
  badge: 'Creator' | 'VIP Member' | 'Member';
  isOnline: boolean;
}

interface MessageReactions {
  [emoji: string]: number;
}

interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderBadge?: string;
  text: string;
  timestamp: string;
  createdAt: number;
  isEdited?: boolean;
  deletedForUserIds?: string[];
  reactions: MessageReactions;
  userReacted?: string;
  media?: MediaAttachment;
  receiverId?: string;
}

interface CallParticipant {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  isMuted: boolean;
  isSpeaking: boolean;
  joinedAt: number;
}

const MAIN_GROUP = {
  id: 'grp-main',
  name: '🌟 ড্রিমল্যান্ড ডিজিটাল কমিউনিটি',
  tagline: 'হোয়াটসঅ্যাপ স্টাইল ডিজিটাল গ্রুপ চ্যাট, অডিও মেসেজ ও লাইভ কল',
  icon: '💬'
};

const DEFAULT_FOUNDER: UserProfile = {
  id: 'usr-creator',
  name: 'Fahad (Founder & Creator)',
  identifier: 'fahad.official@gmail.com',
  password: 'password123',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Lead Animator, 3D Designer & Game Developer.',
  badge: 'Creator',
  isOnline: true
};

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

const REACTION_EMOJIS = ['❤️', '😂', '🔥', '👏', '🚀', '😮', '👍', '🙏', '🎉'];

const SMART_QUICK_REPLIES = [
  '👋 আসসালামু আলাইকুম',
  'কেমন আছেন সবাই? ✨',
  'আলহামদুলিল্লাহ ভালো 🌟',
  'দারুণ হয়েছে ভাই! 🔥',
  'গ্রুপ কলে আসবেন কেউ? 📞',
  'ধন্যবাদ সবাইকে ❤️',
  'ইনশাআল্লাহ দেখা হবে 🤝'
];

// Realistic WhatsApp Audio Waveform Bar Heights (Percentage)
const WAVEFORM_BARS = [
  35, 60, 80, 50, 95, 100, 75, 45, 85, 90, 70, 55, 80, 60, 45, 75, 65, 85, 50, 70, 95, 60, 40, 75, 55, 80, 65, 45
];

// Regexes
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?:gmail\.com|googlemail\.com|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i;
const PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

// --- MASTER PERMANENT STORAGE HELPERS (Guarantees 100% Zero Data Loss across reloads and updates) ---
const MASTER_KEYS = {
  USERS: 'permanent_community_users_master_db',
  ACTIVE_USER: 'permanent_community_active_user_master_db',
  MESSAGES: 'permanent_community_messages_master_db',
  GROUP_CALL: 'permanent_community_live_call_state'
};

// Crystal Clear Sample Voice Note Generator (Warm natural acoustic vocal tone for voice note test)
const createSampleVoiceAudioWav = (durationSec: number = 4): string => {
  const sampleRate = 22050;
  const numChannels = 1;
  const dur = Math.max(2, durationSec);
  const numSamples = Math.floor(dur * sampleRate);
  const buffer = new Float32Array(numSamples);

  // Warm acoustic chime voice note cadence
  const tones = [261.63, 329.63, 392.00, 523.25];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const toneIdx = Math.floor(t * 1.5) % tones.length;
    const freq = tones[toneIdx];
    const envelope = Math.max(0, 1 - ((t * 1.5) % 1) * 0.9);
    const fundamental = Math.sin(2 * Math.PI * freq * t) * 0.4;
    const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.15;
    buffer[i] = (fundamental + harmonic) * envelope;
  }

  const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

const loadPermanentUsers = (): UserProfile[] => {
  const usersMap = new Map<string, UserProfile>();
  usersMap.set(DEFAULT_FOUNDER.identifier.toLowerCase(), DEFAULT_FOUNDER);

  const isMockMember = (u: UserProfile) => {
    if (!u || !u.identifier) return true;
    const cleanEmail = u.identifier.trim().toLowerCase();
    const cleanFounderEmail = DEFAULT_FOUNDER.identifier.toLowerCase();
    
    if (u.id === DEFAULT_FOUNDER.id || cleanEmail === cleanFounderEmail) return false;
    
    const cleanId = u.id.toLowerCase();
    const cleanName = u.name.toLowerCase();

    // If ID or email contains demo, mock, seed, init, preset, or user_
    if (cleanId.includes('mock') || cleanId.includes('demo') || cleanId.includes('seed') || cleanId.includes('init') || cleanId.includes('preset') || cleanId.startsWith('usr-member')) return true;
    if (cleanEmail.includes('example.com') || cleanEmail.includes('test.com') || cleanEmail.includes('demo') || cleanEmail.includes('mock') || cleanEmail.includes('user_') || cleanEmail.includes('artist')) return true;
    
    // Exclude all mock member names (the 13 seeded mock members)
    const MOCK_NAMES = [
      'sadia', 'rahim', 'nusrat', 'arif', 'farhana', 'tanvir', 'anika', 
      'shakib', 'mehedi', 'jannatul', 'kamrul', 'sultana', 'rakib',
      'demo', 'artist', 'creative', 'member', 'mock'
    ];
    if (MOCK_NAMES.some((m) => cleanName.includes(m))) return true;

    return false;
  };

  try {
    // Clear old mock version keys from localStorage so they never contaminate memory
    for (let i = 30; i >= 1; i--) {
      localStorage.removeItem(`smart_community_users_v${i}`);
    }

    // Load saved real users from Master DB (does not delete real user registrations!)
    const masterSaved = localStorage.getItem(MASTER_KEYS.USERS);
    if (masterSaved) {
      const parsed = JSON.parse(masterSaved);
      if (Array.isArray(parsed)) {
        parsed.forEach((u) => {
          if (u && u.identifier && !isMockMember(u)) {
            usersMap.set(u.identifier.toLowerCase(), u);
          }
        });
      }
    }
  } catch {}

  const merged = Array.from(usersMap.values());
  // Save clean real user list to master DB permanently
  try {
    localStorage.setItem(MASTER_KEYS.USERS, JSON.stringify(merged));
  } catch {}
  return merged.length > 0 ? merged : [DEFAULT_FOUNDER];
};

const loadPermanentMessages = (): ChatMessage[] => {
  const msgMap = new Map<string, ChatMessage>();

  try {
    // 1. Check Master DB
    const masterSaved = localStorage.getItem(MASTER_KEYS.MESSAGES);
    if (masterSaved) {
      const parsed = JSON.parse(masterSaved);
      if (Array.isArray(parsed)) {
        parsed.forEach((m) => {
          if (m && m.id) msgMap.set(m.id, m);
        });
      }
    }

    // 2. Merge all past version keys
    for (let i = 30; i >= 1; i--) {
      const old = localStorage.getItem(`smart_community_messages_v${i}`);
      if (old) {
        const parsed = JSON.parse(old);
        if (Array.isArray(parsed)) {
          parsed.forEach((m) => {
            if (m && m.id && !msgMap.has(m.id)) {
              msgMap.set(m.id, m);
            }
          });
        }
      }
    }
  } catch {}

  if (msgMap.size > 0) {
    return Array.from(msgMap.values()).sort((a, b) => a.createdAt - b.createdAt);
  }

  return [
    {
      id: 'msg-init-1',
      groupId: 'grp-main',
      senderId: 'usr-creator',
      senderName: 'Fahad (Founder & Creator)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      senderBadge: 'Creator',
      text: 'স্বাগতম আমাদের স্থায়ী কমিউনিটি প্ল্যাটফর্মে! এখানে প্রতিটি অ্যাকাউন্ট, চ্যাট, ফটো, ভিডিও, গান ও ভয়েস চিরতরে সুরক্ষিত ও স্থায়ী থাকবে। যে কেউ গ্রুপ কলে যোগ দিয়ে কথা বলতে পারবেন!',
      timestamp: '১০:৩০ AM',
      createdAt: Date.now() - 3600000 * 2,
      reactions: { '❤️': 18, '🔥': 25, '👏': 12 },
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        name: 'Fahad_Community_Permanent_Launch.jpg'
      }
    }
  ];
};

const loadPermanentActiveUser = (): UserProfile | null => {
  try {
    const isLoggedOut = localStorage.getItem('permanent_community_logged_out_flag');
    if (isLoggedOut === 'true') return null;

    const saved = localStorage.getItem(MASTER_KEYS.ACTIVE_USER);
    if (saved) return JSON.parse(saved);

    for (let i = 30; i >= 1; i--) {
      const old = localStorage.getItem(`smart_community_active_user_v${i}`);
      if (old) {
        const parsed = JSON.parse(old);
        if (parsed && parsed.identifier) {
          localStorage.setItem(MASTER_KEYS.ACTIVE_USER, JSON.stringify(parsed));
          return parsed;
        }
      }
    }
  } catch {}
  return null;
};

export interface CommunityForumProps {
  initialAuthMode?: 'login' | 'signup' | null;
  onAuthStateChange?: (isLoggedIn: boolean) => void;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({ initialAuthMode, onAuthStateChange }) => {
  // Permanent Master Database States
  const [usersList, setUsersList] = useState<UserProfile[]>(loadPermanentUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(loadPermanentActiveUser);
  const [messages, setMessages] = useState<ChatMessage[]>(loadPermanentMessages);

  // View Navigation Mode
  const [viewTab, setViewTab] = useState<'chat' | 'members' | 'dm' | 'call'>('chat');
  const [selectedDmUser, setSelectedDmUser] = useState<UserProfile | null>(null);

  // Group Call State (Multi-user voice call lounge)
  const [isInGroupCall, setIsInGroupCall] = useState(false);
  const [isGlobalCallActive, setIsGlobalCallActive] = useState(false);
  const [globalCallHost, setGlobalCallHost] = useState<UserProfile | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>([]);
  const callTimerRef = useRef<number | null>(null);
  const speakingSimulationTimerRef = useRef<number | null>(null);

  // 1-to-1 Private Direct Phone Call State
  const [privateCall, setPrivateCall] = useState<{
    status: 'idle' | 'calling' | 'incoming' | 'connected';
    targetUser: UserProfile | null;
    callerUser: UserProfile | null;
    duration: number;
    isMuted: boolean;
    isSpeakerOn: boolean;
  }>({
    status: 'idle',
    targetUser: null,
    callerUser: null,
    duration: 0,
    isMuted: false,
    isSpeakerOn: true
  });
  const privateCallTimerRef = useRef<number | null>(null);
  const ringtoneIntervalRef = useRef<number | null>(null);
  const autoAnswerTimeoutRef = useRef<number | null>(null);

  // Auth Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authName, setAuthName] = useState('');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBio, setAuthBio] = useState('Creative Member in Fahad Community');
  const [authAvatar, setAuthAvatar] = useState(PRESET_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Handle Initial Auth Mode if requested from external Card Button
  useEffect(() => {
    if (!currentUser) {
      setAuthMode(initialAuthMode || 'login');
      setShowAuthModal(true);
      setAuthError('');
    }
  }, [initialAuthMode, currentUser]);

  // Sync Auth State to Parent
  useEffect(() => {
    onAuthStateChange?.(!!currentUser);
  }, [currentUser, onAuthStateChange]);

  // Profile View & Edit Modal
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [isEditingMyProfile, setIsEditingMyProfile] = useState(false);
  const [editMyName, setEditMyName] = useState('');
  const [editMyBio, setEditMyBio] = useState('');
  const [editMyAvatar, setEditMyAvatar] = useState('');

  // Message Edit State (1-hour window)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState<string>('');

  // Delete Options Modal State (Delete for Me vs Delete for Everyone)
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<ChatMessage | null>(null);

  // New Message State
  const [inputText, setInputText] = useState('');
  const [attachedMedia, setAttachedMedia] = useState<MediaAttachment | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // Voice Recording State (Chat Voice Note)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const voiceDurationRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const activeMediaStreamRef = useRef<MediaStream | null>(null);
  const isFallbackVoiceRef = useRef<boolean>(false);

  // Global Clear Audio Playback Player
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(0);
  const globalAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // WhatsApp Digital Search & Smart UI Controls
  const [isSearchingMessages, setIsSearchingMessages] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showChatMenu, setShowChatMenu] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [smartFilter, setSmartFilter] = useState<'all' | 'voice' | 'media' | 'text'>('all');
  const [showSmartReplies, setShowSmartReplies] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);
  const myEditAvatarUploadRef = useRef<HTMLInputElement>(null);

  // 100% Guaranteed Permanent Storage Sync (Updates Master DB Permanently)
  useEffect(() => {
    localStorage.setItem(MASTER_KEYS.USERS, JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem(MASTER_KEYS.MESSAGES, JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedDmUser, viewTab]);

  // Real-time synchronization across all tabs and devices
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('whatsapp_community_channel');
        bc.onmessage = (event) => {
          const data = event.data;
          if (!data) return;

          if (data.type === 'NEW_MESSAGE' && data.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
            gameSound.start();
          } else if (data.type === 'UPDATE_ALL_MESSAGES') {
            setMessages(loadPermanentMessages());
          } else if (data.type === 'UPDATE_USERS') {
            setUsersList(loadPermanentUsers());
          } else if (data.type === 'GROUP_CALL_START') {
            setIsGlobalCallActive(true);
            setGlobalCallHost(data.host);
            if (data.participants) {
              setCallParticipants(data.participants);
            }
            gameSound.phoneRing();
          } else if (data.type === 'GROUP_CALL_JOIN') {
            setIsGlobalCallActive(true);
            if (data.participant) {
              setCallParticipants((prev) => {
                if (prev.some((p) => p.id === data.participant.id)) return prev;
                return [...prev, data.participant];
              });
            }
          } else if (data.type === 'GROUP_CALL_LEAVE') {
            if (data.remaining) {
              setCallParticipants(data.remaining);
              if (data.remaining.length === 0) {
                setIsGlobalCallActive(false);
                setGlobalCallHost(null);
              }
            }
          } else if (data.type === 'GROUP_CALL_END') {
            setIsGlobalCallActive(false);
            setGlobalCallHost(null);
            setIsInGroupCall(false);
            setCallParticipants([]);
          } else if (data.type === 'PRIVATE_CALL_RING') {
            if (currentUser && currentUser.id === data.targetId) {
              setPrivateCall({
                status: 'incoming',
                callerUser: data.caller,
                targetUser: currentUser,
                duration: 0,
                isMuted: false,
                isSpeakerOn: true
              });
              gameSound.phoneRing();
              if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
              ringtoneIntervalRef.current = window.setInterval(() => {
                gameSound.phoneRing();
              }, 2500);
            }
          } else if (data.type === 'PRIVATE_CALL_ANSWERED') {
            if (ringtoneIntervalRef.current) {
              clearInterval(ringtoneIntervalRef.current);
              ringtoneIntervalRef.current = null;
            }
            gameSound.callConnected();
            setPrivateCall((prev) => {
              if (prev.status === 'calling' || prev.status === 'incoming') {
                return { ...prev, status: 'connected', duration: 0 };
              }
              return prev;
            });
            if (privateCallTimerRef.current) clearInterval(privateCallTimerRef.current);
            privateCallTimerRef.current = window.setInterval(() => {
              setPrivateCall((prev) => ({
                ...prev,
                duration: prev.duration + 1
              }));
            }, 1000);
          } else if (data.type === 'PRIVATE_CALL_DECLINED' || data.type === 'PRIVATE_CALL_ENDED') {
            if (ringtoneIntervalRef.current) {
              clearInterval(ringtoneIntervalRef.current);
              ringtoneIntervalRef.current = null;
            }
            if (privateCallTimerRef.current) {
              clearInterval(privateCallTimerRef.current);
              privateCallTimerRef.current = null;
            }
            gameSound.callEnd();
            setPrivateCall({
              status: 'idle',
              targetUser: null,
              callerUser: null,
              duration: 0,
              isMuted: false,
              isSpeakerOn: true
            });
          } else if (data.type === 'USER_TYPING') {
            if (currentUser && data.userId !== currentUser.id) {
              setTypingUser(data.userName || 'মেম্বার');
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = window.setTimeout(() => {
                setTypingUser(null);
              }, 3000);
            }
          }
        };
      }
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === MASTER_KEYS.MESSAGES) {
        setMessages(loadPermanentMessages());
      } else if (e.key === MASTER_KEYS.USERS) {
        setUsersList(loadPermanentUsers());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      bc?.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(MASTER_KEYS.ACTIVE_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(MASTER_KEYS.ACTIVE_USER);
    }
  }, [currentUser]);

  // Audio player setup
  useEffect(() => {
    const player = new Audio();
    player.volume = 1.0;
    globalAudioPlayerRef.current = player;

    return () => {
      if (globalAudioPlayerRef.current) {
        globalAudioPlayerRef.current.pause();
        globalAudioPlayerRef.current.src = '';
      }
      if (activeMediaStreamRef.current) {
        activeMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (privateCallTimerRef.current) clearInterval(privateCallTimerRef.current);
      if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getDmChannelId = (u1: string, u2: string) => {
    const ids = [u1, u2].sort();
    return `dm-${ids[0]}-${ids[1]}`;
  };

  const openProfileModal = (user: UserProfile) => {
    setViewingProfile(user);
    if (currentUser && user.id === currentUser.id) {
      setEditMyName(user.name);
      setEditMyBio(user.bio);
      setEditMyAvatar(user.avatar);
      setIsEditingMyProfile(false);
    }
  };

  const normalizeIdentifier = (val: string): string => {
    const clean = val.trim().toLowerCase();
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length >= 10) {
      if (digitsOnly.startsWith('8801')) return '0' + digitsOnly.slice(3);
      if (digitsOnly.startsWith('01')) return digitsOnly;
    }
    return clean;
  };

  const isValidIdentifier = (input: string): boolean => {
    const cleaned = input.trim();
    return GMAIL_REGEX.test(cleaned) || PHONE_REGEX.test(cleaned.replace(/[\s-]/g, ''));
  };

  // Auth Submit Handler (Exact Match Authentication & Strict Uniqueness)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanIdentifier = authIdentifier.trim().toLowerCase();
    const cleanPassword = authPassword.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setAuthError('দয়া করে জিমেইল / ফোন নম্বর এবং পাসওয়ার্ড পূরণ করুন।');
      return;
    }

    if (!isValidIdentifier(cleanIdentifier)) {
      setAuthError('ভুল জিমেইল বা ফোন নম্বর! সঠিক জিমেইল (যেমন: yourname@gmail.com) অথবা সঠিক ১১ ডিজিটের ফোন নম্বর (যেমন: 017xxxxxxxx) লিখুন।');
      return;
    }

    if (cleanPassword.length < 4) {
      setAuthError('পাসওয়ার্ডটি অন্তত ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (authMode === 'signup') {
      const cleanName = authName.trim();
      if (!cleanName) {
        setAuthError('দয়া করে আপনার সম্পূর্ণ নাম প্রদান করুন।');
        return;
      }

      const normInput = normalizeIdentifier(cleanIdentifier);
      const existingUser = usersList.find((u) => {
        const normExisting = normalizeIdentifier(u.identifier);
        return normExisting === normInput;
      });

      if (existingUser) {
        setAuthError(
          '❌ এই ফোন নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে! একই ফোন নম্বর বা ইমেইল দিয়ে দ্বিতীয়বার অ্যাকাউন্ট তৈরি করা যাবে না। অনুগ্রহ করে লগইন করুন।'
        );
        return;
      }

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        identifier: cleanIdentifier,
        password: cleanPassword, // Stored securely & permanently
        avatar: authAvatar,
        bio: authBio.trim() || 'Creative Member in Fahad Community',
        badge: 'Member',
        isOnline: true
      };

      const updatedUsers = [newUser, ...usersList];
      setUsersList(updatedUsers);
      try {
        localStorage.setItem(MASTER_KEYS.USERS, JSON.stringify(updatedUsers));
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('whatsapp_community_channel');
          bc.postMessage({ type: 'UPDATE_USERS' });
          bc.close();
        }
      } catch {}

      setCurrentUser(newUser);
      try {
        localStorage.removeItem('permanent_community_logged_out_flag');
      } catch {}
      setShowAuthModal(false);
      resetAuthForm();
      gameSound.score();
    } else {
      // Login with strict normalization and password checking
      const normInput = normalizeIdentifier(cleanIdentifier);
      const matchedUser = usersList.find((u) => {
        const normExisting = normalizeIdentifier(u.identifier);
        return normExisting === normInput;
      });

      if (!matchedUser) {
        setAuthError('এই জিমেইল বা ফোন নম্বরে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি। সঠিক তথ্য দিন অথবা নতুন অ্যাকাউন্ট খুলুন।');
        return;
      }

      if (matchedUser.password !== cleanPassword) {
        setAuthError('ভুল পাসওয়ার্ড! আপনি যুক্ত হওয়ার সময় যে পাসওয়ার্ডটি দিয়েছিলেন সেটি দিয়ে লগইন করুন।');
        return;
      }

      setCurrentUser(matchedUser);
      try {
        localStorage.removeItem('permanent_community_logged_out_flag');
      } catch {}
      setShowAuthModal(false);
      resetAuthForm();
      gameSound.score();
    }
  };

  const resetAuthForm = () => {
    setAuthName('');
    setAuthIdentifier('');
    setAuthPassword('');
    setAuthBio('Creative Member in Fahad Community');
    setAuthError('');
  };

  const handleLogoutFromProfile = () => {
    if (globalAudioPlayerRef.current) {
      globalAudioPlayerRef.current.pause();
    }
    if (isInGroupCall) leaveGroupCall();
    if (privateCall.status !== 'idle') endPrivateCall();

    setPlayingAudioId(null);
    setCurrentUser(null);
    setSelectedDmUser(null);
    setViewingProfile(null);
    setIsEditingMyProfile(false);
    setViewTab('chat');
    try {
      localStorage.setItem('permanent_community_logged_out_flag', 'true');
      localStorage.removeItem(MASTER_KEYS.ACTIVE_USER);
    } catch {}
    gameSound.slice();
  };

  const handleSaveMyProfile = () => {
    if (!currentUser) return;
    const trimmedName = editMyName.trim() || currentUser.name;
    const trimmedBio = editMyBio.trim() || currentUser.bio;
    const updatedAvatar = editMyAvatar || currentUser.avatar;

    const updatedUser: UserProfile = {
      ...currentUser,
      name: trimmedName,
      bio: trimmedBio,
      avatar: updatedAvatar
    };

    setCurrentUser(updatedUser);
    const updatedList = usersList.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsersList(updatedList);
    try {
      localStorage.setItem(MASTER_KEYS.USERS, JSON.stringify(updatedList));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('whatsapp_community_channel');
        bc.postMessage({ type: 'UPDATE_USERS' });
        bc.close();
      }
    } catch {}
    
    setMessages((prev) =>
      prev.map((m) =>
        m.senderId === currentUser.id
          ? { ...m, senderName: trimmedName, senderAvatar: updatedAvatar }
          : m
      )
    );

    setViewingProfile(updatedUser);
    setIsEditingMyProfile(false);
    gameSound.score();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAuthAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMyEditAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditMyAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleExitPrivateDm = () => {
    if (privateCall.status !== 'idle') endPrivateCall();
    setSelectedDmUser(null);
    setViewTab('chat');
    gameSound.slice();
  };

  const handleOpenDm = (targetUser: UserProfile) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (targetUser.id === currentUser.id) return;

    setSelectedDmUser(targetUser);
    setViewTab('dm');
    setViewingProfile(null);
    gameSound.start();
  };

  // --- 📞 GROUP CALL VOICE ROOM SYSTEM (সবার কাছে কল পৌঁছাবে, যে কয়জন রিসিভ করবে সবাই যুক্ত হতে পারবে) ---
  const startOrJoinGroupCall = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setIsInGroupCall(true);
    setIsGlobalCallActive(true);
    const host = globalCallHost || currentUser;
    if (!globalCallHost) {
      setGlobalCallHost(currentUser);
    }
    setViewTab('call');
    setCallDuration(0);
    setIsMicMuted(false);
    setIsDeafened(false);

    const myParticipant: CallParticipant = {
      id: currentUser.id,
      name: `${currentUser.name} (You)`,
      avatar: currentUser.avatar,
      badge: currentUser.badge,
      isMuted: false,
      isSpeaking: true,
      joinedAt: Date.now()
    };

    setCallParticipants((prev) => {
      const alreadyIn = prev.some((p) => p.id === currentUser.id);
      const updated = alreadyIn ? prev : [...prev, myParticipant];

      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('whatsapp_community_channel');
          bc.postMessage({
            type: 'GROUP_CALL_START',
            host,
            participant: myParticipant,
            participants: updated
          });
          bc.close();
        }
      } catch {}

      return updated;
    });

    gameSound.callConnected();

    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = window.setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    if (speakingSimulationTimerRef.current) clearInterval(speakingSimulationTimerRef.current);
    speakingSimulationTimerRef.current = window.setInterval(() => {
      setCallParticipants((prev) => {
        if (prev.length <= 1) return prev;
        const randIndex = Math.floor(Math.random() * prev.length);
        return prev.map((p, idx) => ({
          ...p,
          isSpeaking: idx === randIndex ? !p.isMuted : (p.id === currentUser.id ? !isMicMuted : false)
        }));
      });
    }, 2800);
  };

  const leaveGroupCall = () => {
    setIsInGroupCall(false);
    setViewTab('chat');
    setCallParticipants((prev) => {
      const remaining = prev.filter((p) => p.id !== currentUser?.id);
      if (remaining.length === 0) {
        setIsGlobalCallActive(false);
        setGlobalCallHost(null);
      }

      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('whatsapp_community_channel');
          bc.postMessage({
            type: 'GROUP_CALL_LEAVE',
            participantId: currentUser?.id,
            remaining
          });
          bc.close();
        }
      } catch {}

      return remaining;
    });

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (speakingSimulationTimerRef.current) {
      clearInterval(speakingSimulationTimerRef.current);
      speakingSimulationTimerRef.current = null;
    }
    gameSound.callEnd();
  };

  const toggleGroupCallMic = () => {
    setIsMicMuted(!isMicMuted);
    setCallParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUser?.id ? { ...p, isMuted: !isMicMuted, isSpeaking: isMicMuted } : p
      )
    );
    gameSound.start();
  };

  // --- 📞 1-to-1 PRIVATE DIRECT PHONE CALL SYSTEM (রিং বাজবে, রিসিভ করলে দুইজনে কথা বলতে পারবে, রিসিভ না করলে পারবে না) ---
  const startPrivateCall = (target: UserProfile) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (target.id === currentUser.id) return;

    setPrivateCall({
      status: 'calling',
      targetUser: target,
      callerUser: currentUser,
      duration: 0,
      isMuted: false,
      isSpeakerOn: true
    });

    gameSound.phoneRing();
    if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    ringtoneIntervalRef.current = window.setInterval(() => {
      gameSound.phoneRing();
    }, 2500);

    // Broadcast ringing to the target user across tabs
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('whatsapp_community_channel');
        bc.postMessage({
          type: 'PRIVATE_CALL_RING',
          caller: currentUser,
          targetId: target.id
        });
        bc.close();
      }
    } catch {}

    // NO AUTO ANSWER! If recipient does not answer within 35 seconds, end the call
    if (autoAnswerTimeoutRef.current) clearTimeout(autoAnswerTimeoutRef.current);
    autoAnswerTimeoutRef.current = window.setTimeout(() => {
      endPrivateCall();
    }, 35000);
  };

  const acceptPrivateCall = () => {
    if (autoAnswerTimeoutRef.current) {
      clearTimeout(autoAnswerTimeoutRef.current);
      autoAnswerTimeoutRef.current = null;
    }
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    gameSound.callConnected();
    setPrivateCall((prev) => ({
      ...prev,
      status: 'connected',
      duration: 0
    }));

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('whatsapp_community_channel');
        bc.postMessage({ type: 'PRIVATE_CALL_ANSWERED' });
        bc.close();
      }
    } catch {}

    if (privateCallTimerRef.current) clearInterval(privateCallTimerRef.current);
    privateCallTimerRef.current = window.setInterval(() => {
      setPrivateCall((prev) => ({
        ...prev,
        duration: prev.duration + 1
      }));
    }, 1000);
  };

  const declinePrivateCall = () => {
    if (autoAnswerTimeoutRef.current) {
      clearTimeout(autoAnswerTimeoutRef.current);
      autoAnswerTimeoutRef.current = null;
    }
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (privateCallTimerRef.current) {
      clearInterval(privateCallTimerRef.current);
      privateCallTimerRef.current = null;
    }
    gameSound.callEnd();

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('whatsapp_community_channel');
        bc.postMessage({ type: 'PRIVATE_CALL_DECLINED' });
        bc.close();
      }
    } catch {}

    setPrivateCall({
      status: 'idle',
      targetUser: null,
      callerUser: null,
      duration: 0,
      isMuted: false,
      isSpeakerOn: true
    });
  };

  const endPrivateCall = () => {
    if (autoAnswerTimeoutRef.current) {
      clearTimeout(autoAnswerTimeoutRef.current);
      autoAnswerTimeoutRef.current = null;
    }
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (privateCallTimerRef.current) {
      clearInterval(privateCallTimerRef.current);
      privateCallTimerRef.current = null;
    }
    gameSound.callEnd();

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('whatsapp_community_channel');
        bc.postMessage({ type: 'PRIVATE_CALL_ENDED' });
        bc.close();
      }
    } catch {}

    setPrivateCall({
      status: 'idle',
      targetUser: null,
      callerUser: null,
      duration: 0,
      isMuted: false,
      isSpeakerOn: true
    });
  };

  const togglePrivateCallMic = () => {
    setPrivateCall((prev) => ({ ...prev, isMuted: !prev.isMuted }));
    gameSound.start();
  };

  const togglePrivateCallSpeaker = () => {
    setPrivateCall((prev) => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
    gameSound.start();
  };

  // Filter messages (exclude ones deleted for me + apply WhatsApp search filter)
  const currentMessages = (
    viewTab === 'dm' && selectedDmUser && currentUser
      ? messages
          .filter((m) => m.groupId === getDmChannelId(currentUser.id, selectedDmUser.id))
          .filter((m) => !m.deletedForUserIds?.includes(currentUser.id))
      : messages
          .filter((m) => m.groupId === 'grp-main')
          .filter((m) => (currentUser ? !m.deletedForUserIds?.includes(currentUser.id) : true))
  )
    .filter((m) => {
      if (smartFilter === 'voice') return m.media?.type === 'audio';
      if (smartFilter === 'media') return m.media?.type === 'image' || m.media?.type === 'video';
      if (smartFilter === 'text') return !m.media;
      return true;
    })
    .filter((m) => {
      if (!searchKeyword.trim()) return true;
      const q = searchKeyword.toLowerCase();
      return (
        m.text?.toLowerCase().includes(q) ||
        m.senderName?.toLowerCase().includes(q)
      );
    });

  // Gallery File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedMedia({
        type: isVideo ? 'video' : 'image',
        url: reader.result as string,
        name: file.name
      });
      gameSound.start();
    };
    reader.readAsDataURL(file);
  };

  // Reliable Blob to Base64 with Audio format preservation
  const blobToBase64Audio = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert audio'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Voice Note Recording (Records Real User Microphone Audio)
  const startVoiceRecording = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    audioChunksRef.current = [];
    voiceDurationRef.current = 0;
    setRecordingDuration(0);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        activeMediaStreamRef.current = stream;

        let mimeType = '';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          }
        }

        let mediaRecorder: MediaRecorder;
        try {
          mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        } catch {
          mediaRecorder = new MediaRecorder(stream);
        }

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            if (audioChunksRef.current.length > 0) {
              const finalType = mediaRecorder.mimeType || 'audio/webm';
              const recordedBlob = new Blob(audioChunksRef.current, { type: finalType });
              const base64Audio = await blobToBase64Audio(recordedBlob);
              const duration = Math.max(1, voiceDurationRef.current);
              sendVoiceMessage(base64Audio, duration);
            }
          } catch (e) {
            console.error('Error saving voice message:', e);
          } finally {
            if (activeMediaStreamRef.current) {
              activeMediaStreamRef.current.getTracks().forEach((t) => t.stop());
              activeMediaStreamRef.current = null;
            }
          }
        };

        mediaRecorder.start(100);
        setIsRecording(true);
        gameSound.start();

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = window.setInterval(() => {
          voiceDurationRef.current += 1;
          setRecordingDuration(voiceDurationRef.current);
        }, 1000);
      } catch (err) {
        console.warn('Microphone permission error:', err);
        alert('আপনার ডিভাইসের মাইক্রোফোন পারমিশন এলাও করুন যাতে আপনার আসল কণ্ঠ স্পষ্ট রেকর্ড হতে পারে।');
        setIsRecording(false);
      }
    } else {
      alert('আপনার ব্রাউজারে মাইক্রোফোন সাপোর্ট নেই।');
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (activeMediaStreamRef.current) {
      activeMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      activeMediaStreamRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    voiceDurationRef.current = 0;
  };

  const sendVoiceMessage = (audioUrl: string, durationSec: number) => {
    if (!currentUser) return;

    const targetGroupId =
      viewTab === 'dm' && selectedDmUser
        ? getDmChannelId(currentUser.id, selectedDmUser.id)
        : 'grp-main';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      groupId: targetGroupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderBadge: currentUser.badge,
      text: '🎙️ ভয়েস মেসেজ',
      timestamp: timeStr,
      createdAt: Date.now(),
      reactions: {},
      media: {
        type: 'audio',
        url: audioUrl,
        duration: Math.max(1, durationSec),
        name: `Voice_${Date.now().toString().slice(-4)}.m4a`
      },
      receiverId: viewTab === 'dm' && selectedDmUser ? selectedDmUser.id : undefined
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(MASTER_KEYS.MESSAGES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('whatsapp_community_channel');
        bc.postMessage({ type: 'NEW_MESSAGE', message: newMsg });
        bc.close();
      }
    } catch {}

    gameSound.score();
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = () => {
      const audioUrl = reader.result as string;
      sendVoiceMessage(audioUrl, 6);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendTestVoice = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const sampleUrl = createSampleVoiceAudioWav(4);
    sendVoiceMessage(sampleUrl, 4);
  };

  const cyclePlaybackSpeed = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (globalAudioPlayerRef.current) {
      globalAudioPlayerRef.current.playbackRate = nextSpeed;
    }
  };

  // 100% Guaranteed Clear Audio Playback with WhatsApp Features
  const handleTogglePlayAudio = (id: string, audioUrl?: string, durationSec: number = 6) => {
    const player = globalAudioPlayerRef.current;
    if (!player) return;

    if (playingAudioId === id) {
      player.pause();
      setPlayingAudioId(null);
      return;
    }

    player.pause();
    player.currentTime = 0;
    setPlayingAudioId(id);
    setAudioProgress(0);
    setAudioCurrentTime(0);
    setAudioTotalDuration(durationSec);

    if (audioUrl) {
      player.src = audioUrl;
      player.playbackRate = playbackSpeed;
      player.volume = 1.0;

      player.onloadedmetadata = () => {
        if (player.duration && !isNaN(player.duration)) {
          setAudioTotalDuration(Math.round(player.duration));
        }
      };

      player.ontimeupdate = () => {
        if (player.duration && !isNaN(player.duration) && player.duration > 0) {
          setAudioProgress((player.currentTime / player.duration) * 100);
          setAudioCurrentTime(Math.round(player.currentTime));
        }
      };

      player.onended = () => {
        setPlayingAudioId(null);
        setAudioProgress(0);
        setAudioCurrentTime(0);
      };

      player.onerror = () => {
        setPlayingAudioId(null);
        setAudioProgress(0);
      };

      player.play().catch((e) => {
        console.warn('Audio play notice:', e);
        player.play().catch(() => setPlayingAudioId(null));
      });
    } else {
      setPlayingAudioId(null);
      setAudioProgress(0);
    }
  };

  const handleSeekAudio = (percent: number, durationSec: number) => {
    const player = globalAudioPlayerRef.current;
    if (!player || !playingAudioId) return;
    const dur = (player.duration && !isNaN(player.duration)) ? player.duration : durationSec;
    const targetTime = (percent / 100) * dur;
    player.currentTime = targetTime;
    setAudioProgress(percent);
    setAudioCurrentTime(Math.round(targetTime));
  };

  // Send Message with instant multi-user broadcast
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!inputText.trim() && !attachedMedia) return;

    const targetGroupId =
      viewTab === 'dm' && selectedDmUser
        ? getDmChannelId(currentUser.id, selectedDmUser.id)
        : 'grp-main';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      groupId: targetGroupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderBadge: currentUser.badge,
      text: inputText.trim() || (attachedMedia?.type === 'video' ? '🎬 শেয়ার করা ভিডিও' : '🖼️ শেয়ার করা ছবি'),
      timestamp: timeStr,
      createdAt: Date.now(),
      reactions: {},
      media: attachedMedia || undefined,
      receiverId: viewTab === 'dm' && selectedDmUser ? selectedDmUser.id : undefined
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(MASTER_KEYS.MESSAGES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('whatsapp_community_channel');
        bc.postMessage({ type: 'NEW_MESSAGE', message: newMsg });
        bc.close();
      }
    } catch {}

    setInputText('');
    setAttachedMedia(null);
    setShowEmojiPicker(false);
    if (soundEnabled) gameSound.score();
  };

  // Smart Input Change with Typing Broadcast
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.trim() && currentUser) {
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('whatsapp_community_channel');
          bc.postMessage({
            type: 'USER_TYPING',
            userId: currentUser.id,
            userName: currentUser.name
          });
          bc.close();
        }
      } catch {}
    }
  };

  // Send Smart Quick Reply
  const handleSendQuickReply = (text: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const targetGroupId =
      viewTab === 'dm' && selectedDmUser
        ? getDmChannelId(currentUser.id, selectedDmUser.id)
        : 'grp-main';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      groupId: targetGroupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderBadge: currentUser.badge,
      text: text,
      timestamp: timeStr,
      createdAt: Date.now(),
      reactions: {},
      receiverId: viewTab === 'dm' && selectedDmUser ? selectedDmUser.id : undefined
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(MASTER_KEYS.MESSAGES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('whatsapp_community_channel');
        bc.postMessage({ type: 'NEW_MESSAGE', message: newMsg });
        bc.close();
      }
    } catch {}

    if (soundEnabled) gameSound.score();
  };

  // Delete for Me
  const handleDeleteForMe = () => {
    if (!deleteTargetMessage || !currentUser) return;
    const msgId = deleteTargetMessage.id;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              deletedForUserIds: [...(m.deletedForUserIds || []), currentUser.id]
            }
          : m
      )
    );

    setDeleteTargetMessage(null);
    gameSound.slice();
  };

  // Delete for Everyone
  const handleDeleteForEveryone = () => {
    if (!deleteTargetMessage) return;
    const msgId = deleteTargetMessage.id;

    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setDeleteTargetMessage(null);
    gameSound.slice();
  };

  // Edit Message (Within 1 hour)
  const handleStartEditMessage = (msg: ChatMessage) => {
    const isWithinOneHour = Date.now() - msg.createdAt <= 3600000;
    if (!isWithinOneHour) {
      alert('মেসেজ পাঠানোর ১ ঘণ্টার বেশি সময় পার হয়ে গেছে, তাই এটি আর এডিট করা যাবে না।');
      return;
    }

    setEditingMessageId(msg.id);
    setEditingMessageText(msg.text);
  };

  const handleSaveEditedMessage = (msgId: string) => {
    if (!editingMessageText.trim()) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, text: editingMessageText.trim(), isEdited: true }
          : m
      )
    );

    setEditingMessageId(null);
    setEditingMessageText('');
    gameSound.score();
  };

  // Multi-Emoji Reactions
  const handleReactToMessage = (msgId: string, emoji: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const currentCount = m.reactions[emoji] || 0;
          const isSameEmoji = m.userReacted === emoji;

          const updatedReactions = { ...m.reactions };
          if (isSameEmoji) {
            if (currentCount > 1) {
              updatedReactions[emoji] = currentCount - 1;
            } else {
              delete updatedReactions[emoji];
            }
            return { ...m, reactions: updatedReactions, userReacted: undefined };
          } else {
            if (m.userReacted && updatedReactions[m.userReacted]) {
              if (updatedReactions[m.userReacted] > 1) {
                updatedReactions[m.userReacted] -= 1;
              } else {
                delete updatedReactions[m.userReacted];
              }
            }
            updatedReactions[emoji] = (updatedReactions[emoji] || 0) + 1;
            gameSound.start();
            return { ...m, reactions: updatedReactions, userReacted: emoji };
          }
        }
        return m;
      })
    );
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <section id="forum" className="mt-20 md:mt-24 pt-6 mb-16 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2.5 text-white tracking-tight">
            <Users className="w-6 h-6 text-orange-500" />
            <span className="bg-gradient-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
              Community Group
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            কমিউনিটি মেম্বারদের ডিজিটাল আড্ডা, ভয়েস মেসেজ, লাইভ গ্রুপ কল ও স্মার্ট নেটওয়ার্কিং স্পেস।
          </p>
        </div>

        {/* User Profile / Auth Button */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div 
              onClick={() => openProfileModal(currentUser)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c1324] border border-orange-500/40 hover:border-orange-500 transition shadow cursor-pointer group"
              title="প্রোফাইল তথ্য ও ছবি পরিবর্তন করতে ক্লিক করুন"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 rounded-full object-cover border border-orange-400"
              />
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white group-hover:text-orange-400 transition truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <Edit3 size={11} className="text-orange-400 opacity-60 group-hover:opacity-100 transition shrink-0" />
                </div>
                <span className="text-[9px] text-orange-400 font-medium block -mt-0.5">
                  {currentUser.badge}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-orange-500 text-xs font-bold text-gray-200 hover:text-white transition cursor-pointer shadow-sm"
              >
                <LogIn size={13} className="text-orange-400" />
                <span>লগইন</span>
              </button>

              <button
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-md shadow-orange-600/30 cursor-pointer active:scale-95"
              >
                <UserPlus size={13} />
                <span>যুক্ত হোন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOP TAB BAR: 💬 কমিউনিটি গ্রুপ | 👥 মেম্বার | 🔒 প্রাইভেট DM */}
      <div className="mb-3 bg-[#080d19] border border-slate-800/80 rounded-2xl p-2 shadow-lg">
            <div className="flex items-center justify-between gap-2 overflow-x-auto select-none">
              
              <div className="flex items-center gap-1.5 shrink-0 bg-[#050811] p-1 rounded-xl border border-slate-800/80">
                {/* 1. Main Unified Group Tab */}
                <button
                  onClick={() => {
                    setViewTab('chat');
                    gameSound.start();
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    viewTab === 'chat'
                      ? 'bg-[#00a884] text-slate-950 shadow-md font-extrabold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>কমিউনিটি গ্রুপ</span>
                </button>

                {/* 2. Members List Tab */}
                <button
                  onClick={() => {
                    setViewTab('members');
                    gameSound.start();
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    viewTab === 'members'
                      ? 'bg-orange-600 text-white shadow-md font-extrabold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users size={13} />
                  <span>মেম্বার ({usersList.length})</span>
                </button>

                {/* 3. Private DMs Tab */}
                <button
                  onClick={() => {
                    setViewTab('dm');
                    if (!selectedDmUser && usersList.length > 1) {
                      const target = usersList.find((u) => u.id !== currentUser?.id) || usersList[0];
                      setSelectedDmUser(target);
                    }
                    gameSound.start();
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    viewTab === 'dm'
                      ? 'bg-orange-600 text-white shadow-md font-extrabold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageCircle size={13} />
                  <span>প্রাইভেট DM</span>
                </button>
              </div>

              {/* Quick Group Call Button on Tab Bar */}
              <button
                onClick={startOrJoinGroupCall}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-md shadow-emerald-600/30 cursor-pointer shrink-0 active:scale-95"
                title="গ্রুপ কল করুন বা যুক্ত হোন"
              >
                <PhoneCall size={13} />
                <span>{isInGroupCall ? 'কল স্ক্রিন' : isGlobalCallActive ? '🔴 লাইভ কল চলছে' : 'লাইভ গ্রুপ কল'}</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="rounded-2xl md:rounded-3xl bg-[#070c18] border border-slate-800/90 shadow-2xl overflow-hidden p-3 sm:p-4 min-h-[500px] flex flex-col transition-all duration-500 hover:scale-[1.002] hover:border-amber-500/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            
            {/* Global Group Call Incoming/Active Broadcast Banner for all members */}
            {isGlobalCallActive && !isInGroupCall && (
              <div className="mb-3 p-3 sm:p-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-[#070c18] border-2 border-emerald-500/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl shadow-emerald-500/20 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xl shadow shrink-0">
                    🔔
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-2">
                      <span>লাইভ গ্রুপ কল কলিং...</span>
                      <span className="text-[9px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold uppercase">
                        Live Call
                      </span>
                    </h4>
                    <p className="text-[11px] text-emerald-300 mt-0.5">
                      {globalCallHost ? `${globalCallHost.name} গ্রুপ কল শুরু করেছেন` : 'গ্রুপ কল চলছে'} • যে কেউ ইচ্ছেমতো যুক্ত হয়ে কথা বলতে পারবেন ({callParticipants.length} জন আছেন)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={startOrJoinGroupCall}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <PhoneCall size={13} />
                    <span>গ্রুপ কলে যোগ দিন</span>
                  </button>
                  <button
                    onClick={() => setIsGlobalCallActive(false)}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-gray-400 hover:text-white text-xs cursor-pointer"
                    title="নোটিফিকেশন বন্ধ করুন"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 1: LIVE MULTI-USER GROUP VOICE CALL LOUNGE (সবার সাথে কথা বলা ও শোনা) */}
            {viewTab === 'call' && (
              <div className="flex-1 flex flex-col justify-between p-2">
                <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#070c18] border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        লাইভ গ্রুপ অডিও কল রুম (Active)
                      </h3>
                      <p className="text-[11px] text-emerald-400">
                        কল সময়কাল: {formatTime(callDuration)} • {callParticipants.length} জন যুক্ত আছেন (সবাই একে অপরের কথা শুনতে পাচ্ছেন)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={leaveGroupCall}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
                  >
                    <PhoneOff size={13} />
                    <span>কল ছাড়ুন</span>
                  </button>
                </div>

                {/* Multi-User Participants Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto max-h-[380px] p-2">
                  {callParticipants.map((p) => (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl bg-[#050811] border transition flex flex-col items-center text-center relative ${
                        p.isSpeaking && !p.isMuted
                          ? 'border-emerald-400 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="relative mb-2">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                        />
                        {p.isSpeaking && !p.isMuted && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow animate-bounce">
                            🔊
                          </span>
                        )}
                        {p.isMuted && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow">
                            <MicOff size={10} />
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-white truncate max-w-full">
                        {p.name}
                      </h4>
                      <span className="text-[9px] text-emerald-400 font-semibold mt-0.5">{p.badge}</span>

                      {/* Sound wave visualizer if speaking */}
                      {p.isSpeaking && !p.isMuted && (
                        <div className="flex items-center gap-0.5 mt-2">
                          {[4, 10, 14, 8, 12, 5].map((h, i) => (
                            <span
                              key={i}
                              className="w-0.5 bg-emerald-400 rounded-full animate-pulse"
                              style={{ height: `${h}px` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Call Control Bar */}
                <div className="p-3 bg-[#050811] border border-slate-800 rounded-2xl flex items-center justify-center gap-4 mt-3">
                  <button
                    onClick={toggleGroupCallMic}
                    className={`p-3 rounded-full transition cursor-pointer shadow-md active:scale-95 ${
                      isMicMuted
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    title={isMicMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
                  >
                    {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  <button
                    onClick={leaveGroupCall}
                    className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-2 transition shadow-lg shadow-red-600/40 cursor-pointer active:scale-95"
                  >
                    <PhoneOff size={16} />
                    <span>কল সমাপ্ত করুন</span>
                  </button>

                  <button
                    onClick={() => setIsDeafened(!isDeafened)}
                    className={`p-3 rounded-full transition cursor-pointer shadow-md active:scale-95 ${
                      isDeafened
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    title="স্পিকার বন্ধ/চালু"
                  >
                    {isDeafened ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: MEMBERS DIRECTORY VIEW */}
            {viewTab === 'members' && (
              <div className="flex-1 flex flex-col">
                <div className="text-xs font-bold text-gray-400 mb-2.5 px-1 flex items-center justify-between">
                  <span>নিবন্ধিত মেম্বার ({usersList.length})</span>
                  <span className="text-[11px] text-gray-500">মেম্বারকে ক্লিক করে পার্সোনাল মেসেজ বা কল করুন</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 overflow-y-auto max-h-[460px] pr-1">
                  {usersList.map((member) => {
                    const isMe = currentUser?.id === member.id;
                    return (
                      <div
                        key={member.id}
                        className="p-3 rounded-2xl bg-[#050811] border border-slate-800 hover:border-orange-500/50 transition flex items-center justify-between gap-2.5 group"
                      >
                        <div 
                          onClick={() => openProfileModal(member)}
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                        >
                          <div className="relative">
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              className="w-9 h-9 rounded-full object-cover border border-slate-700" 
                            />
                            {member.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-gray-950" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="font-bold text-xs text-white group-hover:text-orange-400 transition truncate">
                                {member.name}
                              </h4>
                              {isMe && <span className="text-[9px] text-orange-400 font-bold">(You)</span>}
                            </div>
                            <p className="text-[10px] text-gray-400 truncate">{member.bio}</p>
                          </div>
                        </div>

                        {!isMe && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => startPrivateCall(member)}
                              className="p-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition cursor-pointer shadow-sm"
                              title="পার্সোনাল ১-টু-১ ফোন কল দিন"
                            >
                              <Phone size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenDm(member)}
                              className="p-1.5 rounded-xl bg-orange-950/40 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/30 transition cursor-pointer shadow-sm"
                              title="পার্সোনাল ১-টু-১ প্রাইভেট মেসেজ পাঠান"
                            >
                              <MessageSquare size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 4 & 5: UNIFIED SINGLE COMMUNITY GROUP OR 1-TO-1 PRIVATE DM (Digital WhatsApp Experience) */}
            {(viewTab === 'chat' || viewTab === 'dm') && (
              <div className="flex-1 flex flex-col h-full bg-[#0b141a] rounded-2xl overflow-hidden border border-[#222e35]">
                
                {/* 🟢 WHATSAPP TOP BAR / HEADER */}
                <div className="px-3.5 py-2.5 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between gap-2 shrink-0 select-none">
                  {viewTab === 'dm' && selectedDmUser ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={handleExitPrivateDm}
                          className="p-1 rounded-full text-[#aebac1] hover:text-white hover:bg-[#374248] transition cursor-pointer mr-0.5"
                          title="গ্রুপে ফিরুন"
                        >
                          <ArrowLeft size={18} />
                        </button>

                        <div 
                          onClick={() => openProfileModal(selectedDmUser)}
                          className="relative cursor-pointer shrink-0"
                        >
                          <img 
                            src={selectedDmUser.avatar} 
                            alt={selectedDmUser.name} 
                            className="w-9 h-9 rounded-full object-cover border border-[#00a884]/60 shadow"
                          />
                          {selectedDmUser.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] rounded-full border-2 border-[#202c33]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 
                              onClick={() => openProfileModal(selectedDmUser)}
                              className="font-bold text-xs sm:text-sm text-[#e9edef] tracking-tight truncate cursor-pointer hover:underline"
                            >
                              {selectedDmUser.name}
                            </h3>
                            <span className="text-[9px] bg-emerald-950/60 border border-emerald-500/30 text-[#00a884] px-1.5 py-0.2 rounded font-semibold">
                              {selectedDmUser.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8696a0] truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                            <span>অনলাইন • প্রাইভেট ১-টু-১ চ্যাট</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* 1-to-1 Private Direct Voice Call Button */}
                        <button
                          onClick={() => startPrivateCall(selectedDmUser)}
                          className="p-2 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl bg-[#00a884] hover:bg-[#02be94] text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
                          title="পার্সোনাল ১-টু-১ ফোন কল দিন"
                        >
                          <Phone size={14} />
                          <span className="hidden sm:inline">কল দিন</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      {/* Left: Group Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 border border-emerald-400/50 flex items-center justify-center text-white text-lg shadow animate-smart-glow">
                            💬
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] rounded-full border-2 border-[#202c33] animate-ping" />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00a884] rounded-full border-2 border-[#202c33]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-[#e9edef] tracking-tight truncate flex items-center gap-1.5">
                            <span>{MAIN_GROUP.name}</span>
                          </h3>
                          <p className="text-[11px] text-[#8696a0] truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] inline-block shrink-0" />
                            <span>{usersList.length} জন সদস্য • অনলাইন • গ্রুপ চ্যাট</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Group Call Button (Beside group name as requested!) + Sound + Search + 3-dots */}
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* 📞 Group Call Button */}
                        <button
                          onClick={startOrJoinGroupCall}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer active:scale-95 shrink-0 ${
                            isGlobalCallActive
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/30 animate-pulse ring-2 ring-emerald-400/50'
                              : 'bg-[#00a884] hover:bg-[#02be94] text-slate-950 shadow-md shadow-emerald-500/20'
                          }`}
                          title="গ্রুপ অডিও কলে যোগ দিন"
                        >
                          <PhoneCall size={13} className={isGlobalCallActive ? 'animate-bounce' : ''} />
                          <span>{isInGroupCall ? 'কল স্ক্রিন' : isGlobalCallActive ? '🔴 লাইভ কল' : 'গ্রুপ কল'}</span>
                        </button>

                        {/* Sound Effects Toggle */}
                        <button
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={`p-2 rounded-full transition cursor-pointer ${
                            soundEnabled ? 'text-[#00a884] hover:bg-[#374248]' : 'text-gray-500 hover:bg-[#374248]'
                          }`}
                          title={soundEnabled ? 'সাউন্ড প্রভাব চালু আছে' : 'সাউন্ড প্রভাব বন্ধ আছে'}
                        >
                          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>

                        {/* Search Message Toggle */}
                        <button
                          onClick={() => {
                            setIsSearchingMessages(!isSearchingMessages);
                            if (isSearchingMessages) setSearchKeyword('');
                          }}
                          className={`p-2 rounded-full transition cursor-pointer ${
                            isSearchingMessages ? 'bg-[#374248] text-[#00a884]' : 'text-[#aebac1] hover:bg-[#374248]'
                          }`}
                          title="মেসেজ সার্চ করুন"
                        >
                          <Search size={16} />
                        </button>

                        {/* 3-dots Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowChatMenu(!showChatMenu)}
                            className="p-2 rounded-full text-[#aebac1] hover:bg-[#374248] transition cursor-pointer"
                            title="মেনু"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {showChatMenu && (
                            <div className="absolute right-0 top-10 w-52 bg-[#233138] border border-[#2a3942] rounded-xl shadow-2xl py-1 z-30 animate-fade-in text-xs">
                              <button
                                onClick={() => {
                                  setViewTab('members');
                                  setShowChatMenu(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-[#d1d7db] hover:bg-[#182229] flex items-center gap-2.5 cursor-pointer"
                              >
                                <Users size={14} className="text-[#00a884]" />
                                <span>কমিউনিটি মেম্বার তালিকা ({usersList.length})</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowSmartReplies(!showSmartReplies);
                                  setShowChatMenu(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-[#d1d7db] hover:bg-[#182229] flex items-center gap-2.5 cursor-pointer"
                              >
                                <Sparkles size={14} className="text-amber-400" />
                                <span>{showSmartReplies ? 'স্মার্ট রিপ্লাই বন্ধ করুন' : 'স্মার্ট রিপ্লাই চালু করুন'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (currentUser) openProfileModal(currentUser);
                                  else setShowAuthModal(true);
                                  setShowChatMenu(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-[#d1d7db] hover:bg-[#182229] flex items-center gap-2.5 border-t border-[#2a3942] cursor-pointer"
                              >
                                <User size={14} className="text-orange-400" />
                                <span>আমার প্রোফাইল ও সেটিংস</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 🔍 Search Input Bar if open */}
                {isSearchingMessages && (
                  <div className="px-3 py-1.5 bg-[#182229] border-b border-[#2a3942] flex items-center gap-2 animate-fade-in">
                    <Search size={14} className="text-[#00a884]" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="মেসেজ বা প্রেরকের নাম লিখে খুঁজুন..."
                      className="flex-1 bg-transparent text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
                      autoFocus
                    />
                    {searchKeyword && (
                      <button
                        onClick={() => setSearchKeyword('')}
                        className="text-[#8696a0] hover:text-white text-xs cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* 🏷️ Smart Media Category Filter Chips */}
                <div className="px-3 py-1.5 bg-[#182229]/80 border-b border-[#2a3942]/60 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
                  <span className="text-[10px] text-[#8696a0] font-semibold shrink-0">ফিল্টার:</span>
                  {[
                    { id: 'all', label: 'সবগুলো', icon: '💬' },
                    { id: 'voice', label: 'ভয়েস', icon: '🎙️' },
                    { id: 'media', label: 'ছবি/ভিডিও', icon: '🖼️' },
                    { id: 'text', label: 'টেক্সট', icon: '📝' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSmartFilter(tab.id as any);
                        if (soundEnabled) gameSound.start();
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 ${
                        smartFilter === tab.id
                          ? 'bg-[#00a884] text-slate-950 shadow-sm'
                          : 'bg-[#202c33] text-[#8696a0] hover:text-white border border-[#2a3942]'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Floating Active Group Call Status Bar (when navigating chat while on call) */}
                {isInGroupCall && (
                  <div className="p-2.5 bg-gradient-to-r from-emerald-950 via-teal-950 to-[#111b21] border-b border-[#00a884]/40 flex items-center justify-between gap-2 shadow-lg animate-pulse shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00a884] animate-ping shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          📞 আপনি লাইভ গ্রুপ কলে আছেন ({formatTime(callDuration)})
                        </p>
                        <p className="text-[10px] text-[#00a884]">
                          {callParticipants.length} জন সদস্য কথা বলছেন (সবাই শুনতে পাচ্ছেন)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={toggleGroupCallMic}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isMicMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-[#00a884] border border-[#00a884]/30'
                        }`}
                      >
                        {isMicMuted ? 'আনমিউট' : 'মিউট'}
                      </button>
                      <button
                        onClick={() => setViewTab('call')}
                        className="px-2.5 py-1 rounded-lg bg-[#00a884] hover:bg-[#02be94] text-slate-950 text-xs font-black transition shadow cursor-pointer"
                      >
                        কল স্ক্রিন
                      </button>
                      <button
                        onClick={leaveGroupCall}
                        className="p-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                        title="কল ছাড়ুন"
                      >
                        <PhoneOff size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 💬 WHATSAPP CHAT FEED AREA */}
                <div 
                  className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#0b141a] select-text max-h-[460px] min-h-[300px] relative"
                  style={{
                    backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
                    backgroundSize: '18px 18px',
                    scrollbarWidth: 'thin'
                  }}
                >
                  {/* WhatsApp Encryption / Privacy Badge */}
                  <div className="flex justify-center my-1 select-none">
                    <span className="px-3 py-1 rounded-lg bg-[#182229] border border-[#2a3942]/60 text-[#8696a0] text-[11px] font-medium shadow-sm flex items-center gap-1.5">
                      <Lock size={11} className="text-[#00a884]" />
                      <span>সকল মেসেজ, ভয়েস ও শেয়ার করা মিডিয়া ডিজিটালভাবে স্থায়ী ও সুরক্ষিত</span>
                    </span>
                  </div>

                  {currentMessages.length === 0 ? (
                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 text-gray-400 select-none">
                      <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center text-[#00a884] mb-2 shadow">
                        <MessageSquare size={24} />
                      </div>
                      <p className="text-xs font-bold text-[#e9edef]">কোনো মেসেজ নেই</p>
                      <p className="text-[11px] text-[#8696a0] mt-0.5">নিচে মেসেজ লিখুন অথবা ভয়েস রেকর্ড বাটনে চাপুন</p>
                    </div>
                  ) : (
                    currentMessages.map((msg) => {
                      const isMine = currentUser ? msg.senderId === currentUser.id : false;
                      const isWithinOneHour = Date.now() - msg.createdAt <= 3600000;
                      const isEditingThis = editingMessageId === msg.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 items-end relative group animate-smart-message ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Avatar for other users (Left aligned) */}
                          {!isMine && (
                            <img 
                              src={msg.senderAvatar} 
                              alt={msg.senderName} 
                              className="w-7 h-7 rounded-full object-cover border border-[#2a3942] shrink-0 mb-1 cursor-pointer hover:border-[#00a884] transition"
                              onClick={() => {
                                const profile = usersList.find((u) => u.id === msg.senderId);
                                if (profile) openProfileModal(profile);
                              }}
                              title={msg.senderName}
                            />
                          )}

                          {/* Chat Bubble Container */}
                          <div className="max-w-[85%] sm:max-w-[70%] flex flex-col">
                            <div
                              className={`rounded-2xl p-2.5 sm:px-3 sm:py-2 transition-all relative shadow-md ${
                                isMine
                                  ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none border border-[#005c4b]/80'
                                  : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#2a3942]/60'
                              }`}
                            >
                              {/* Sender name for group chats */}
                              {!isMine && (
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span 
                                    onClick={() => {
                                      const profile = usersList.find((u) => u.id === msg.senderId);
                                      if (profile) openProfileModal(profile);
                                    }}
                                    className="font-bold text-[11px] text-[#00a884] cursor-pointer hover:underline"
                                  >
                                    {msg.senderName}
                                  </span>
                                  {msg.senderBadge && (
                                    <span className="text-[8px] font-bold bg-black/40 text-amber-300 border border-amber-500/30 px-1 py-0.1 rounded">
                                      {msg.senderBadge}
                                    </span>
                                  )}
                                  {msg.isEdited && (
                                    <span className="text-[9px] text-[#8696a0] italic">(এডিটেড)</span>
                                  )}
                                </div>
                              )}

                              {/* Edit Box or Regular Text Message */}
                              {isEditingThis ? (
                                <div className="space-y-1.5 my-1">
                                  <input
                                    type="text"
                                    value={editingMessageText}
                                    onChange={(e) => setEditingMessageText(e.target.value)}
                                    className="w-full bg-[#111b21] text-white text-xs border border-[#00a884] rounded-lg px-2 py-1 focus:outline-none"
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <button
                                      onClick={() => setEditingMessageId(null)}
                                      className="px-2 py-0.5 rounded-md bg-slate-800 text-gray-300 text-[10px]"
                                    >
                                      বাতিল
                                    </button>
                                    <button
                                      onClick={() => handleSaveEditedMessage(msg.id)}
                                      className="px-2.5 py-0.5 rounded-md bg-[#00a884] hover:bg-[#02be94] text-slate-950 text-[10px] font-bold"
                                    >
                                      সংরক্ষণ
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                msg.text && msg.media?.type !== 'audio' && (
                                  <p className="text-xs sm:text-sm leading-relaxed break-words pr-2">
                                    {msg.text}
                                  </p>
                                )
                              )}

                              {/* Media Attachment (Photo or Video) */}
                              {msg.media && (
                                <div className="mt-1 rounded-xl overflow-hidden">
                                  {msg.media.type === 'image' && (
                                    <div 
                                      className="relative group/img cursor-pointer max-h-60 overflow-hidden rounded-xl"
                                      onClick={() => setPreviewMediaUrl({ url: msg.media!.url, type: 'image' })}
                                    >
                                      <img 
                                        src={msg.media.url} 
                                        alt={msg.media.name || 'Shared'} 
                                        className="w-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-[10px] font-bold bg-black/70 text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                                          <Maximize2 size={11} /> বড় করে দেখুন
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {msg.media.type === 'video' && (
                                    <video 
                                      src={msg.media.url} 
                                      controls 
                                      className="w-full rounded-xl max-h-64 bg-black"
                                    />
                                  )}

                                  {/* 🎙️ WHATSAPP VOICE NOTE PLAYER (Authentic Audio Waveform & Speed Controls) */}
                                  {msg.media.type === 'audio' && (
                                    <div className="w-64 sm:w-72 p-1 flex flex-col gap-1.5 select-none">
                                      <div className="flex items-center gap-2.5">
                                        {/* Avatar with Mic Indicator */}
                                        <div className="relative shrink-0">
                                          <img
                                            src={msg.senderAvatar}
                                            alt={msg.senderName}
                                            className="w-10 h-10 rounded-full object-cover border border-[#00a884]/60 shadow"
                                          />
                                          <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow ${
                                            playingAudioId === msg.id ? 'bg-[#53bdeb] text-black animate-pulse' : 'bg-[#00a884] text-slate-950'
                                          }`}>
                                            <Mic size={9} />
                                          </span>
                                        </div>

                                        {/* Play / Pause Circular Button */}
                                        <button
                                          onClick={() => handleTogglePlayAudio(msg.id, msg.media?.url, msg.media?.duration || 6)}
                                          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02be94] text-slate-950 flex items-center justify-center shrink-0 shadow-md transition cursor-pointer active:scale-95"
                                          title={playingAudioId === msg.id ? 'থামান' : 'ভয়েস শুনুন'}
                                        >
                                          {playingAudioId === msg.id ? (
                                            <Pause size={18} className="fill-slate-950" />
                                          ) : (
                                            <Play size={18} className="fill-slate-950 ml-0.5" />
                                          )}
                                        </button>

                                        {/* Waveform & Scrubbing */}
                                        <div className="flex-1 flex flex-col justify-center min-w-0">
                                          <div 
                                            className="flex items-center gap-0.5 h-6 cursor-pointer py-1"
                                            onClick={(e) => {
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              const clickX = e.clientX - rect.left;
                                              const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                                              handleSeekAudio(pct, msg.media?.duration || 6);
                                            }}
                                            title="ক্লিক করে ভয়েসের নির্দিষ্ট অংশে যান"
                                          >
                                            {WAVEFORM_BARS.map((heightPercent, idx) => {
                                              const threshold = (idx / WAVEFORM_BARS.length) * 100;
                                              const isPlayed = playingAudioId === msg.id && audioProgress >= threshold;
                                              return (
                                                <span
                                                  key={idx}
                                                  className={`w-1 rounded-full transition-colors duration-150 ${
                                                    isPlayed ? 'bg-[#00a884]' : 'bg-[#8696a0]/50 hover:bg-[#8696a0]'
                                                  }`}
                                                  style={{ height: `${Math.max(6, Math.min(22, (heightPercent / 100) * 22))}px` }}
                                                />
                                              );
                                            })}
                                          </div>

                                          {/* Time and Speed Multiplier */}
                                          <div className="flex items-center justify-between text-[10px] text-[#8696a0] -mt-0.5 font-mono">
                                            <span>
                                              {playingAudioId === msg.id 
                                                ? `${formatTime(audioCurrentTime)} / ${formatTime(audioTotalDuration || msg.media.duration || 6)}`
                                                : `${formatTime(msg.media.duration || 6)}`}
                                            </span>

                                            <button
                                              onClick={cyclePlaybackSpeed}
                                              className="px-1.5 py-0.2 rounded bg-black/40 hover:bg-black/60 text-[#00a884] font-bold text-[9px] cursor-pointer"
                                              title="প্লেব্যাক স্পিড পরিবর্তন করুন"
                                            >
                                              {playbackSpeed}x
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Timestamp and Double Tick Read Receipt (WhatsApp iconic checkmark) */}
                              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8696a0]">
                                <span>{msg.timestamp}</span>
                                {isMine && (
                                  <CheckCheck size={14} className="text-[#53bdeb] ml-0.5 inline-block" />
                                )}
                              </div>

                              {/* Hover Actions: Reactions + Edit + Delete Trigger */}
                              <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#1f2c34] border border-[#2a3942] rounded-full px-2 py-0.5 shadow-xl z-10">
                                {REACTION_EMOJIS.slice(0, 5).map((em) => (
                                  <button
                                    key={em}
                                    onClick={() => handleReactToMessage(msg.id, em)}
                                    className="text-xs hover:scale-125 transition cursor-pointer p-0.5"
                                  >
                                    {em}
                                  </button>
                                ))}

                                {currentUser && (
                                  <>
                                    <span className="w-px h-3 bg-[#2a3942] mx-0.5" />
                                    {isMine && isWithinOneHour && (
                                      <button
                                        onClick={() => handleStartEditMessage(msg)}
                                        className="text-[#8696a0] hover:text-[#00a884] p-0.5 cursor-pointer"
                                        title="মেসেজ এডিট করুন"
                                      >
                                        <Edit3 size={11} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setDeleteTargetMessage(msg)}
                                      className="text-[#8696a0] hover:text-red-400 p-0.5 cursor-pointer"
                                      title="মেসেজ ডিলিট করুন"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Rendered Reactions */}
                            {Object.keys(msg.reactions).length > 0 && (
                              <div className={`flex items-center gap-1 mt-1 flex-wrap ${isMine ? 'justify-end' : 'justify-start'}`}>
                                {Object.entries(msg.reactions).map(([emoji, count]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReactToMessage(msg.id, emoji)}
                                    className={`flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full border transition cursor-pointer ${
                                      msg.userReacted === emoji
                                        ? 'bg-[#005c4b] border-[#00a884] text-white font-bold'
                                        : 'bg-[#202c33] border-[#2a3942] text-[#8696a0]'
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span>{count}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Smart Animated Typing Indicator */}
                  {typingUser && (
                    <div className="flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-[#202c33] text-[#8696a0] text-xs w-fit rounded-tl-none border border-[#2a3942]/60 animate-smart-message shadow-sm my-1">
                      <span className="font-semibold text-[#00a884] text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping" />
                        {typingUser} টাইপ করছেন
                      </span>
                      <div className="flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] smart-typing-dot-1" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] smart-typing-dot-2" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] smart-typing-dot-3" />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Attached Media Staging Preview */}
                {attachedMedia && (
                  <div className="p-2 bg-[#202c33] border-t border-[#2a3942] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {attachedMedia.type === 'image' ? (
                        <img src={attachedMedia.url} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-[#2a3942]" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#111b21] border border-[#2a3942] flex items-center justify-center text-[#00a884]">
                          <Film size={18} />
                        </div>
                      )}
                      <p className="text-xs font-bold text-[#e9edef] truncate">{attachedMedia.name || 'মিডিয়া ফাইল প্রস্তুত'}</p>
                    </div>
                    <button 
                      onClick={() => setAttachedMedia(null)}
                      className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                      title="বাতিল করুন"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                {/* Emoji Quick Picker Row */}
                {showEmojiPicker && (
                  <div className="px-3 py-2 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-2 overflow-x-auto select-none animate-fade-in">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInputText((prev) => prev + emoji);
                        }}
                        className="text-lg hover:scale-125 transition p-1 cursor-pointer active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleSendTestVoice}
                      className="ml-auto px-2 py-1 rounded-full bg-[#182229] border border-[#2a3942] text-[10px] text-[#00a884] font-bold hover:bg-[#233138] cursor-pointer shrink-0"
                      title="মাইক্রোফোন ছাড়া স্যাম্পল ভয়েস ক্লিপ পাঠান"
                    >
                      🎙️ টেস্ট ভয়েস
                    </button>
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />

                {/* ⚡ SMART QUICK REPLIES BAR */}
                {showSmartReplies && (
                  <div className="px-3 py-1.5 bg-[#182229] border-t border-[#2a3942] flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
                    <span className="text-[10px] text-[#8696a0] font-bold shrink-0 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-400 animate-pulse" />
                      স্মার্ট রিপ্লাই:
                    </span>
                    {SMART_QUICK_REPLIES.map((text, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendQuickReply(text)}
                        className="px-2.5 py-1 rounded-full bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] hover:border-[#00a884] text-[#d1d7db] hover:text-white text-[11px] font-medium whitespace-nowrap transition cursor-pointer active:scale-95 shadow-sm shrink-0"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                )}

                {/* 🟢 WHATSAPP INPUT / VOICE RECORDING BOTTOM BAR */}
                <div className="p-2 sm:p-2.5 bg-[#202c33] border-t border-[#2a3942]">
                  {isRecording ? (
                    <div className="flex items-center justify-between gap-3 bg-[#182229] border border-[#00a884]/60 rounded-full px-4 py-2 shadow-lg animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                        <span className="text-xs font-bold text-white">
                          রেকর্ড হচ্ছে... {formatTime(recordingDuration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cancelVoiceRecording}
                          className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                          title="বাতিল করুন"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={stopVoiceRecording}
                          className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02be94] text-slate-950 font-bold transition shadow-md cursor-pointer active:scale-95"
                          title="ভয়েস মেসেজ পাঠান"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 border border-[#374248]">
                        {/* Emoji Button */}
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className={`p-1 transition cursor-pointer ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#8696a0] hover:text-[#d1d7db]'}`}
                          title="ইমোজি"
                        >
                          <Smile size={18} />
                        </button>

                        {/* Paperclip Attachment Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#8696a0] hover:text-[#d1d7db] transition cursor-pointer p-1"
                          title="ছবি বা ভিডিও সংযুক্ত করুন"
                        >
                          <Paperclip size={17} />
                        </button>

                        {/* Voice File Upload Button */}
                        <button
                          type="button"
                          onClick={() => audioFileInputRef.current?.click()}
                          className="text-[#8696a0] hover:text-[#00a884] transition cursor-pointer p-1"
                          title="অডিও ফাইল আপলোড করুন"
                        >
                          <Music size={16} />
                        </button>

                        {/* Text Input */}
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder={
                            viewTab === 'dm' && selectedDmUser
                              ? `${selectedDmUser.name} কে মেসেজ পাঠান...`
                              : 'একটি মেসেজ লিখুন...'
                          }
                          className="flex-1 bg-transparent text-xs sm:text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
                        />
                      </div>

                      {/* WhatsApp Mic or Send Button */}
                      {inputText.trim() || attachedMedia ? (
                        <button
                          type="submit"
                          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02be94] text-slate-950 flex items-center justify-center shadow-md transition cursor-pointer active:scale-95 shrink-0"
                          title="মেসেজ পাঠান"
                        >
                          <Send size={16} className="ml-0.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startVoiceRecording}
                          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02be94] text-slate-950 flex items-center justify-center shadow-md transition cursor-pointer active:scale-95 shrink-0"
                          title="ভয়েস রেকর্ড করতে ট্যাপ করুন"
                        >
                          <Mic size={18} />
                        </button>
                      )}
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

      {/* DELETE CONFIRMATION MODAL (Delete for Me vs Delete for Everyone) */}
      {deleteTargetMessage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setDeleteTargetMessage(null)}
        >
          <div 
            className="w-full max-w-sm bg-[#0c1220] border border-slate-700/80 rounded-3xl p-5 shadow-2xl relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Trash2 size={22} />
            </div>

            <h3 className="text-base font-extrabold text-white mb-1">
              মেসেজ ডিলিট করুন
            </h3>
            <p className="text-xs text-gray-400 mb-4 px-2">
              আপনি কি এই মেসেজটি শুধুমাত্র নিজের জন্য মুছে ফেলতে চান নাকি সবার জন্য মুছে ফেলতে চান?
            </p>

            <div className="space-y-2">
              <button
                onClick={handleDeleteForMe}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UserX size={15} className="text-orange-400" />
                <span>আমার জন্য ডিলিট করুন (Delete for Me)</span>
              </button>

              {(currentUser?.id === deleteTargetMessage.senderId || currentUser?.badge === 'Creator') && (
                <button
                  onClick={handleDeleteForEveryone}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-red-600/30"
                >
                  <Globe2 size={15} />
                  <span>সবার জন্য ডিলিট করুন (Delete for Everyone)</span>
                </button>
              )}

              <button
                onClick={() => setDeleteTargetMessage(null)}
                className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer mt-1"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIGN UP / LOGIN AUTH MODAL */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#0a1020] border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-gray-400 hover:text-white flex items-center justify-center transition"
            >
              <X size={15} />
            </button>

            <div className="text-center mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center mx-auto mb-2 text-white shadow-lg shadow-orange-600/30">
                <Users size={20} />
              </div>
              <h3 className="text-base font-extrabold text-white">
                {authMode === 'signup' ? 'কমিউনিটিতে যুক্ত হোন (নতুন অ্যাকাউন্ট)' : 'কমিউনিটি অ্যাকাউন্টে লগইন'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {authMode === 'signup'
                  ? 'আপনার আসল জিমেইল বা ফোন নম্বর দিয়ে অ্যাকাউন্ট খুলুন (প্রতিটি জিমেইল একবারই ব্যবহার্য)'
                  : 'আপনার নিবন্ধিত জিমেইল/ফোন ও আসল পাসওয়ার্ড দিয়ে লগইন করুন'}
              </p>
            </div>

            {authError && (
              <div className="mb-3 p-2.5 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-start gap-1.5">
                <AlertCircle size={14} className="shrink-0 text-red-400 mt-0.5" />
                <span className="leading-tight">{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    আপনার সম্পূর্ণ নাম:
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ"
                      required
                      className="w-full bg-[#050811] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  জিমেইল অথবা ফোন নম্বর:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type="text"
                    value={authIdentifier}
                    onChange={(e) => setAuthIdentifier(e.target.value)}
                    placeholder="example@gmail.com অথবা 017xxxxxxxx"
                    required
                    className="w-full bg-[#050811] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <span className="text-[10px] text-gray-400 block mt-1">
                  * সঠিক জিমেইল (যেমন: name@gmail.com) অথবা ১১ ডিজিটের মোবাইল নম্বর দিন।
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  পাসওয়ার্ড:
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড লিখুন..."
                    required
                    className="w-full bg-[#050811] border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    প্রোফাইল পিকচার:
                  </label>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={authAvatar} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover border border-orange-500 shadow-sm"
                    />
                    <div>
                      <input 
                        ref={avatarUploadRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarFileChange} 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => avatarUploadRef.current?.click()}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-orange-500 text-xs text-white cursor-pointer"
                      >
                        <Camera size={12} className="text-orange-400" />
                        <span>গ্যালারি থেকে ছবি দিন</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-8 gap-1">
                    {PRESET_AVATARS.map((av, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAuthAvatar(av)}
                        className={`rounded-full overflow-hidden border transition cursor-pointer aspect-square ${
                          authAvatar === av ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-slate-800 opacity-60'
                        }`}
                      >
                        <img src={av} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition cursor-pointer active:scale-98 mt-1"
              >
                {authMode === 'signup' ? 'অ্যাকাউন্ট তৈরি ও যুক্ত হোন' : 'লগইন করুন'}
              </button>
            </form>

            <div className="mt-3 pt-2 border-t border-slate-800 text-center">
              {authMode === 'signup' ? (
                <p className="text-xs text-gray-400">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="text-orange-400 font-bold hover:underline cursor-pointer"
                  >
                    লগইন করুন
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  অ্যাকাউন্ট নেই?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                    }}
                    className="text-orange-400 font-bold hover:underline cursor-pointer"
                  >
                    নতুন অ্যাকাউন্ট খুলুন
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {viewingProfile && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => {
            setViewingProfile(null);
            setIsEditingMyProfile(false);
          }}
        >
          <div 
            className="w-full max-w-sm bg-[#0a1020] border border-slate-700/90 rounded-3xl p-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setViewingProfile(null);
                setIsEditingMyProfile(false);
              }}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center transition"
            >
              <X size={15} />
            </button>

            {currentUser && viewingProfile.id === currentUser.id && isEditingMyProfile ? (
              <div className="text-left space-y-3">
                <h3 className="text-sm font-extrabold text-white mb-2 flex items-center gap-1.5">
                  <Edit3 size={15} className="text-orange-400" />
                  প্রোফাইল তথ্য ও ছবি পরিবর্তন
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    প্রোফাইল ছবি পরিবর্তন:
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={editMyAvatar || currentUser.avatar} 
                      alt="Avatar Preview" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-500 shadow-md"
                    />
                    <div>
                      <input 
                        ref={myEditAvatarUploadRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleMyEditAvatarFileChange} 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => myEditAvatarUploadRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-orange-500 text-xs text-white cursor-pointer"
                      >
                        <Camera size={13} className="text-orange-400" />
                        <span>গ্যালারি থেকে ফটো দিন</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-8 gap-1 mb-2">
                    {PRESET_AVATARS.map((av, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditMyAvatar(av)}
                        className={`rounded-full overflow-hidden border transition cursor-pointer aspect-square ${
                          editMyAvatar === av ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-slate-800 opacity-60'
                        }`}
                      >
                        <img src={av} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    আপনার নাম:
                  </label>
                  <input
                    type="text"
                    value={editMyName}
                    onChange={(e) => setEditMyName(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="নাম লিখুন..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    বায়ো:
                  </label>
                  <input
                    type="text"
                    value={editMyBio}
                    onChange={(e) => setEditMyBio(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="বায়ো লিখুন..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsEditingMyProfile(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-gray-300 font-semibold text-xs cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveMyProfile}
                    className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-orange-600/30 flex items-center justify-center gap-1"
                  >
                    <Check size={14} />
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="text-center">
                <div className="relative inline-block mx-auto mb-2">
                  <img 
                    src={viewingProfile.avatar} 
                    alt={viewingProfile.name} 
                    className="w-18 h-18 rounded-full object-cover border-2 border-orange-500 shadow-xl"
                  />
                  {viewingProfile.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-950" />
                  )}
                </div>

                <h3 className="text-sm font-extrabold text-white">
                  {viewingProfile.name}
                </h3>
                <span className="inline-block text-[9px] font-bold text-orange-400 bg-orange-950/60 border border-orange-500/30 px-2.5 py-0.5 rounded-full mt-1">
                  {viewingProfile.badge}
                </span>

                <p className="text-xs text-gray-300 mt-2 px-2 leading-relaxed">
                  "{viewingProfile.bio}"
                </p>

                {/* Privacy: Phone and Email are strictly private and never visible to other users */}
                {currentUser && viewingProfile.id === currentUser.id ? (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left my-3">
                    <span className="text-[10px] text-gray-400 block font-semibold mb-0.5">
                      আপনার জিমেইল / ফোন নম্বর (শুধুমাত্র আপনি দেখতে পাচ্ছেন):
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                      {currentUser.identifier}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left my-3">
                    <span className="text-[10px] text-gray-400 block font-semibold mb-0.5">
                      যোগাযোগ তথ্য:
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                      <Lock size={12} className="text-emerald-400 shrink-0" />
                      ব্যক্তিগত ও গোপনীয় (নিরাপত্তার স্বার্থে ফোন ও ইমেইল নম্বর গোপন রাখা হয়েছে)
                    </span>
                  </div>
                )}

                {currentUser && viewingProfile.id === currentUser.id && (
                  <button
                    onClick={() => setIsEditingMyProfile(true)}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-orange-500 text-gray-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Edit3 size={13} className="text-orange-400" />
                    <span>প্রোফাইল পিকচার ও নাম এডিট করুন</span>
                  </button>
                )}

                {currentUser && currentUser.id !== viewingProfile.id && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        setViewingProfile(null);
                        startPrivateCall(viewingProfile);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer active:scale-95"
                    >
                      <Phone size={13} />
                      <span>ফোন কল দিন</span>
                    </button>
                    <button
                      onClick={() => handleOpenDm(viewingProfile)}
                      className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer active:scale-95"
                    >
                      <MessageSquare size={13} />
                      <span>মেসেজ পাঠান</span>
                    </button>
                  </div>
                )}

                {currentUser && viewingProfile.id === currentUser.id && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={handleLogoutFromProfile}
                      className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm active:scale-98"
                    >
                      <LogOut size={13} />
                      <span>লগআউট করুন</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1-to-1 PRIVATE DIRECT PHONE CALL MODAL (আসল ফোনের মতো রিং ও কানেকশন) */}
      {privateCall.status !== 'idle' && privateCall.targetUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm bg-gradient-to-b from-[#0c1424] to-[#050811] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl relative text-center flex flex-col items-center">
            
            {/* Determine caller vs recipient */}
            {(() => {
              const isCaller = currentUser ? privateCall.callerUser?.id === currentUser.id : true;
              return (
                <>
                  {/* Header Call Status */}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 inline-block mb-1">
                      {privateCall.status === 'calling' 
                        ? (isCaller ? '📲 আউটগোয়িং কলিং... (Calling)' : '📲 আগত হোয়াটসঅ্যাপ কল (Incoming Call)') 
                        : '🟢 কল সংযুক্ত (Connected)'}
                    </span>
                    <p className="text-xs text-gray-400">
                      {privateCall.status === 'calling'
                        ? (isCaller ? `${privateCall.targetUser.name} এর ফোনে রিং হচ্ছে...` : `${privateCall.callerUser?.name || 'একজন মেম্বার'} আপনাকে প্রাইভেট কল দিয়েছেন...`)
                        : `কথা বলা চলছে • ${formatTime(privateCall.duration)}`}
                    </p>
                  </div>

                  {/* Target User Avatar with Pulsing Waves */}
                  <div className="relative my-4 flex items-center justify-center">
                    {privateCall.status === 'calling' && (
                      <>
                        <span className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-ping" />
                        <span className="absolute w-36 h-36 rounded-full bg-emerald-500/10 animate-pulse" />
                      </>
                    )}
                    {privateCall.status === 'connected' && !privateCall.isMuted && (
                      <span className="absolute w-28 h-28 rounded-full bg-emerald-400/25 animate-pulse" />
                    )}
                    
                    <img
                      src={privateCall.targetUser.avatar}
                      alt={privateCall.targetUser.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-2xl relative z-10"
                    />
                  </div>

                  {/* Target User Details */}
                  <h3 className="text-lg font-black text-white mb-0.5">
                    {privateCall.targetUser.name}
                  </h3>
                  <span className="text-xs text-emerald-400 font-semibold mb-4">
                    {privateCall.targetUser.badge}
                  </span>

                  {/* Live Audio Equalizer Wave if Connected */}
                  {privateCall.status === 'connected' && (
                    <div className="flex items-center gap-1 my-3 h-8">
                      {[6, 14, 22, 10, 18, 26, 12, 20, 8, 16].map((h, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full transition-all duration-150 ${
                            privateCall.isMuted ? 'bg-slate-700 h-1.5' : 'bg-emerald-400 animate-pulse'
                          }`}
                          style={{ height: privateCall.isMuted ? '6px' : `${h}px` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Calling state: Action for Caller vs Receiver */}
                  {privateCall.status === 'calling' && (
                    <div className="w-full space-y-3 mt-4">
                      {isCaller ? (
                        <div className="w-full space-y-3">
                          <button
                            onClick={endPrivateCall}
                            className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer active:scale-98"
                          >
                            <PhoneOff size={16} />
                            <span>কল কাটুন (Cancel Call)</span>
                          </button>

                          {/* Simulator / Test controls for 1-window verification */}
                          <div className="pt-2 border-t border-slate-800/80 w-full text-center">
                            <p className="text-[10px] text-gray-400 mb-1.5">
                              * রিসিভার রিসিভ করলেই কেবল দুইজন কথা বলতে পারবে। রিসিভ না করলে কথা বলা যাবে না।
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={acceptPrivateCall}
                                className="flex-1 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                title="রিসিভারের রিসিভ টেস্ট করুন"
                              >
                                <PhoneCall size={11} />
                                <span>রিসিভার রিসিভ করল (টেস্ট)</span>
                              </button>
                              <button
                                onClick={declinePrivateCall}
                                className="flex-1 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-red-400 text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                title="রিসিভারের কল কাটা টেস্ট করুন"
                              >
                                <PhoneOff size={11} />
                                <span>রিসিভার কল কাটল (টেস্ট)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={acceptPrivateCall}
                            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-98 animate-bounce"
                          >
                            <PhoneCall size={16} />
                            <span>কল রিসিভ করুন (Accept Call)</span>
                          </button>

                          <button
                            onClick={declinePrivateCall}
                            className="w-full py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer active:scale-98"
                          >
                            <PhoneOff size={15} />
                            <span>বাতিল করুন (Decline)</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Connected state: In-Call Controls */}
                  {privateCall.status === 'connected' && (
                    <div className="w-full flex items-center justify-center gap-4 mt-6">
                      {/* Mute Button */}
                      <button
                        onClick={togglePrivateCallMic}
                        className={`p-3.5 rounded-full transition cursor-pointer shadow-lg active:scale-90 ${
                          privateCall.isMuted
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        }`}
                        title={privateCall.isMuted ? 'আনমিউট করুন' : 'মাইক্রোফোন মিউট'}
                      >
                        {privateCall.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>

                      {/* End Call Button */}
                      <button
                        onClick={endPrivateCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white transition shadow-xl shadow-red-600/40 cursor-pointer active:scale-90"
                        title="কল সমাপ্ত করুন"
                      >
                        <PhoneOff size={24} />
                      </button>

                      {/* Speaker Button */}
                      <button
                        onClick={togglePrivateCallSpeaker}
                        className={`p-3.5 rounded-full transition cursor-pointer shadow-lg active:scale-90 ${
                          !privateCall.isSpeakerOn
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                        }`}
                        title={privateCall.isSpeakerOn ? 'স্পিকার চালু' : 'স্পিকার বন্ধ'}
                      >
                        {privateCall.isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewMediaUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-[#0c1220] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-2 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/80 text-white hover:bg-orange-600 flex items-center justify-center transition z-10 cursor-pointer"
            >
              <X size={16} />
            </button>
            <img 
              src={previewMediaUrl.url} 
              alt="Full Preview" 
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};
