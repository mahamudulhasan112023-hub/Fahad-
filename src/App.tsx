/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { 
  Music, 
  MapPin, 
  Globe, 
  Film, 
  Tv, 
  Maximize2, 
  Minimize2, 
  X, 
  Menu, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize,
  Gamepad2,
  Target,
  Sword,
  Rocket,
  Layers,
  Sparkles,
  Smartphone,
  Laptop,
  Monitor,
  Zap,
  Swords,
  Brain,
  Car,
  Flame,
  Home,
  Users,
  Bot,
  Mail,
  Shield,
  Bike,
  Crosshair,
  Skull,
  Package,
  Footprints,
  Pickaxe,
  Trophy,
  Gauge,
  Wind
} from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CyberBladeNinja } from './components/games/CyberBladeNinja';
import { GtaVHeistRacer } from './components/games/GtaVHeistRacer';
import { SubwaySurfersParkour } from './components/games/SubwaySurfersParkour';
import { GodOfWarRagnarok } from './components/games/GodOfWarRagnarok';
import { CandyCrushRoyal } from './components/games/CandyCrushRoyal';
import { Smart8BallPool } from './components/games/Smart8BallPool';
import { WitcherMonsterHunt } from './components/games/WitcherMonsterHunt';
import { TempleRunEscape } from './components/games/TempleRunEscape';
import { KnifeHitMaster } from './components/games/KnifeHitMaster';
import { WaterSortColorPuzzle } from './components/games/WaterSortColorPuzzle';
import { CommunityForum } from './components/CommunityForum';
import { FahadEntertainmentZone } from './components/FahadEntertainmentZone';
import { NexusAiAssistant } from './components/NexusAiAssistant';
import { ContactSection } from './components/ContactSection';
import { FooterSection } from './components/FooterSection';
import { gameSound } from './utils/gameSound';

interface VideoItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface VideoSectionProps {
  title: string;
  videos: VideoItem[];
  icon: React.ElementType;
  onSelectVideo: (video: VideoItem, size?: 'large' | 'small') => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({ title, videos, icon: Icon, onSelectVideo }) => {
  const [showAll, setShowAll] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const displayedVideos = showAll ? videos : videos.slice(0, 3);
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 text-white tracking-tight">
          <Icon className="w-7 h-7 md:w-8 md:h-8 text-orange-500" /> 
          <span className="bg-gradient-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        <span className="text-xs text-orange-400 bg-orange-950/40 border border-orange-500/30 px-3 py-1 rounded-full font-medium">
          {videos.length} Videos
        </span>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {displayedVideos.map((video) => (
          <div 
            key={video.id}
            className="group rounded-2xl md:rounded-3xl overflow-hidden bg-[#0c1220] border border-slate-800/80 shadow-xl hover:border-slate-700 transition duration-300 flex flex-col"
          >
            {/* Top Thumbnail Section or Inline In-Place Player */}
            <div className="relative aspect-video w-full overflow-hidden bg-black rounded-t-2xl md:rounded-t-3xl">
              {playingVideoId === video.id ? (
                <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center" style={{ isolation: 'isolate' }}>
                  {/* Clean unbranded 100% pure video frame scaled and offset so all top titles, channel text, and logos are 100% outside the viewport */}
                  <div 
                    className="absolute pointer-events-auto overflow-hidden"
                    style={{
                      width: '140%',
                      height: '188%',
                      top: '-44%',
                      left: '-20%',
                    }}
                  >
                    <iframe
                      className="w-full h-full border-0 block"
                      src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&playsinline=1&loop=1&playlist=${video.id}`}
                      title="Video Player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>

                  {/* Close Inline Player Button to return to thumbnail */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayingVideoId(null);
                    }}
                    className="absolute top-2.5 right-2.5 z-30 p-1.5 rounded-full bg-black/85 hover:bg-red-600 text-white transition shadow-lg cursor-pointer border border-white/10"
                    title="ভিডিও বন্ধ করে থাম্বনেইলে ফিরুন"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  className="relative w-full h-full cursor-pointer group/thumb"
                  onClick={() => setPlayingVideoId(video.id)}
                  title="এখানে ক্লিক করে ভিডিও অন করুন"
                >
                  <img 
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Subtle dark overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Center Orange Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 pointer-events-none">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/40 group-hover:scale-110 group-hover:from-orange-500 group-hover:to-amber-400 transition-transform duration-200">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Details Bar */}
            <div className="px-4 py-3.5 bg-[#0c1220] border-t border-slate-800/60 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <h3 className="font-bold text-base md:text-lg text-white tracking-tight truncate">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {video.subtitle || 'Video Editing'}
                </p>
              </div>

              {/* Full View Button */}
              <button
                onClick={() => {
                  setPlayingVideoId(null);
                  onSelectVideo(video, 'large');
                }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/20 text-amber-500 hover:bg-orange-600 hover:text-white hover:border-orange-600 text-xs font-semibold transition-all duration-200 cursor-pointer"
                title="ফুল ভিউতে দেখুন (Full View)"
              >
                <Maximize size={13} />
                <span>Full View</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Show More / Show Less Button with smooth gentle animation */}
      {videos.length > 3 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 border border-gray-800 text-sm font-semibold text-gray-200 hover:text-white hover:bg-orange-600 hover:border-orange-600 transition-colors duration-200 shadow-md"
          >
            {showAll ? (
              <>Show Less <ChevronUp size={16} /></>
            ) : (
              <>Show More ({videos.length - 3} more) <ChevronDown size={16} /></>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default function App() {
  const [selectedVideoItem, setSelectedVideoItem] = useState<VideoItem | null>(null);
  const [modalSize, setModalSize] = useState<'large' | 'small'>('large');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'cartoons' | 'songs' | 'movies'>('cartoons');

  // Active game modal state (10 Distinct Mega-Hit Genre Games)
  const [activeGame, setActiveGame] = useState<
    'blade' | 'gtav' | 'subway' | 'gow' | 'candy' | 'pool' | 'witcher' | 'temple' | 'knifehit' | 'watersort' | null
  >(null);
  const [gameSoundEnabled, setGameSoundEnabled] = useState(true);
  const [gameVolume, setGameVolume] = useState(50);
  const [showMobileGamepad, setShowMobileGamepad] = useState(true);
  const gameModalRef = useRef<HTMLDivElement>(null);
  const gamesSliderRef = useRef<HTMLDivElement>(null);

  // Dispatch virtual key press for all games universally on phone touch
  const triggerMobileKey = (key: string, code: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true }));
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key, code, bubbles: true }));
    }, 100);
  };

  const scrollGames = (direction: 'left' | 'right') => {
    if (!gamesSliderRef.current) return;
    const container = gamesSliderRef.current;
    const scrollAmount = 320;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Active Nav and Smart Scroll Hide/Show Navbar States
  const [activeNav, setActiveNav] = useState('hero');
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 70) {
        setShowNavbar(false); // scrolling down -> hide
      } else {
        setShowNavbar(true); // scrolling up -> show
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleGameSound = () => {
    const next = !gameSoundEnabled;
    setGameSoundEnabled(next);
    gameSound.enabled = next;
  };

  const toggleGameFullScreen = () => {
    if (!gameModalRef.current) return;
    if (!document.fullscreenElement) {
      gameModalRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Video playback & scrubber states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(600); // default fallback to 10 min
  const isDraggingRef = useRef(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoModalDialogRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Send commands to YouTube iframe API
  const sendPlayerCommand = useCallback((func: string, args: any = '') => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      sendPlayerCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendPlayerCommand('playVideo');
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      sendPlayerCommand('unMute');
      setIsMuted(false);
    } else {
      sendPlayerCommand('mute');
      setIsMuted(true);
    }
  };

  const restartVideo = () => {
    setCurrentTime(0);
    sendPlayerCommand('seekTo', [0, true]);
    sendPlayerCommand('playVideo');
    setIsPlaying(true);
  };

  const skipSeconds = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(currentTime + seconds, duration));
    setCurrentTime(nextTime);
    sendPlayerCommand('seekTo', [nextTime, true]);
  };

  // Cross-browser & phone full screen support
  const toggleFullScreen = () => {
    const targetElement = videoModalDialogRef.current || playerContainerRef.current;
    if (!targetElement) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (targetElement.requestFullscreen) {
        targetElement.requestFullscreen().catch(() => {});
      } else if ((targetElement as any).webkitRequestFullscreen) {
        (targetElement as any).webkitRequestFullscreen();
      } else if ((targetElement as any).mozRequestFullScreen) {
        (targetElement as any).mozRequestFullScreen();
      } else if ((targetElement as any).msRequestFullscreen) {
        (targetElement as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Seek bar calculation helper based on clientX
  const calculateSeekTime = (clientX: number): number => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = rect.width > 0 ? clickX / rect.width : 0;
    return Math.round(percent * duration);
  };

  // Mouse drag & click seeking
  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    const targetSeconds = calculateSeekTime(e.clientX);
    setCurrentTime(targetSeconds);
    sendPlayerCommand('seekTo', [targetSeconds, true]);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        const nextSec = calculateSeekTime(moveEvent.clientX);
        setCurrentTime(nextSec);
        sendPlayerCommand('seekTo', [nextSec, true]);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch drag & tap seeking for mobile phones
  const handleSeekTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    const touch = e.touches[0];
    const targetSeconds = calculateSeekTime(touch.clientX);
    setCurrentTime(targetSeconds);
    sendPlayerCommand('seekTo', [targetSeconds, true]);
  };

  const handleSeekTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      const touch = e.touches[0];
      const targetSeconds = calculateSeekTime(touch.clientX);
      setCurrentTime(targetSeconds);
      sendPlayerCommand('seekTo', [targetSeconds, true]);
    }
  };

  const handleSeekTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Google OAuth hash response handler
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const token = params.get("access_token");
      if (token) {
        window.history.replaceState(null, "", window.location.pathname);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(googleUser => {
          if (googleUser && googleUser.email) {
            if (window.opener) {
              window.opener.postMessage({ type: "GOOGLE_LOGIN_SUCCESS", googleUser }, window.location.origin);
              window.close();
            } else {
              window.dispatchEvent(new CustomEvent("google-login-success", { detail: googleUser }));
            }
          }
        })
        .catch(err => console.error("Google profile retrieval error:", err));
      }
    }
  }, []);

  // Listen to YouTube postMessage events for accurate time & duration
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data !== 'string') return;
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(Math.round(data.info.duration));
          }
          if (typeof data.info.currentTime === 'number') {
            if (!isDraggingRef.current) {
              setCurrentTime(Math.round(data.info.currentTime));
            }
          }
          if (typeof data.info.playerState === 'number') {
            if (data.info.playerState === 1) setIsPlaying(true);
            if (data.info.playerState === 2) setIsPlaying(false);
          }
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Tell YouTube iframe to broadcast time events & auto-tick timer
  useEffect(() => {
    if (!selectedVideoItem) return;

    // Send listening command so YouTube emits infoDelivery events
    const timer = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening' }),
          '*'
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedVideoItem]);

  // Fallback timer when playing
  useEffect(() => {
    let interval: any;
    if (selectedVideoItem && isPlaying && !isDraggingRef.current) {
      interval = setInterval(() => {
        setCurrentTime(t => Math.min(t + 1, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedVideoItem, isPlaying, duration]);

  // Reset playback states when video changes
  useEffect(() => {
    if (selectedVideoItem) {
      setIsPlaying(true);
      setIsMuted(false);
      setCurrentTime(0);
      setDuration(600);
    }
  }, [selectedVideoItem]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Song collection
  const songs: VideoItem[] = [
    { id: 'jLNrvmXboj8', title: 'Song 1', subtitle: 'Video Editing' },
    { id: '7OSvqxyB2zY', title: 'Song 2', subtitle: 'Video Editing' },
    { id: '0JqshOsHon8', title: 'Song 3', subtitle: 'Video Editing' },
    { id: 'ZGKEzihlwxU', title: 'Song 4', subtitle: 'Video Editing' },
    { id: 'JrNMyzsYr4M', title: 'Song 5', subtitle: 'Video Editing' },
    { id: 'yxantUhWjQQ', title: 'Song 6', subtitle: 'Video Editing' },
    { id: 'vBGCS6u2ODs', title: 'Song 7', subtitle: 'Video Editing' },
    { id: 'W6yQ88FpMOs', title: 'Song 8', subtitle: 'Video Editing' },
    { id: 'KsYJq3rGrG8', title: 'Song 9', subtitle: 'Video Editing' },
    { id: 'iWQf0NR0VAo', title: 'Song 10', subtitle: 'Video Editing' },
  ];

  // Movie collection
  const movies: VideoItem[] = [
    { id: 'FdKsYloBmo0', title: 'Movie 1', subtitle: 'Video Editing' },
    { id: 'JIWARBvn8qU', title: 'Movie 2', subtitle: 'Video Editing' },
    { id: 'bVAS5afUTUk', title: 'Movie 3', subtitle: 'Video Editing' },
    { id: 'aRa5an5LdT0', title: 'Movie 4', subtitle: 'Video Editing' },
    { id: 'rS8NktBtazs', title: 'Movie 5', subtitle: 'Video Editing' },
    { id: 'p41kjCNwAm8', title: 'Movie 6', subtitle: 'Video Editing' },
    { id: '4wBGOWHTwjY', title: 'Movie 7', subtitle: 'Video Editing' },
    { id: 'XMLBXXPX4QA', title: 'Movie 8', subtitle: 'Video Editing' },
    { id: 'KO498_Qtv90', title: 'Movie 9', subtitle: 'Video Editing' },
    { id: 'mHENsiQFdYg', title: 'Movie 10', subtitle: 'Video Editing' },
  ];

  // 10 Cartoons with exact labels: Cartoon 1, Cartoon 2...
  const cartoons: VideoItem[] = [
    { id: 'Si5auXCYWDI', title: 'Cartoon 1', subtitle: 'Video Editing' },
    { id: 'emg5Oa1l-9A', title: 'Cartoon 2', subtitle: 'Video Editing' },
    { id: 'b2sjCyAsFbM', title: 'Cartoon 3', subtitle: 'Video Editing' },
    { id: 'vdkTYCSOjQY', title: 'Cartoon 4', subtitle: 'Video Editing' },
    { id: 'BDfX2EuxJzw', title: 'Cartoon 5', subtitle: 'Video Editing' },
    { id: 'xY5UaEf6JCs', title: 'Cartoon 6', subtitle: 'Video Editing' },
    { id: 'ORL4klAlxTk', title: 'Cartoon 7', subtitle: 'Video Editing' },
    { id: '7YAqXmh13IE', title: 'Cartoon 8', subtitle: 'Video Editing' },
    { id: 'TswCNV6meYM', title: 'Cartoon 9', subtitle: 'Video Editing' },
    { id: '_AYNAJ8ieWs', title: 'Cartoon 10', subtitle: 'Video Editing' },
  ];

  const handleSelectVideo = (video: VideoItem, size: 'large' | 'small' = 'large') => {
    setSelectedVideoItem(video);
    setModalSize(size);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-orange-500 selection:text-white">
      {/* Navigation with Smart Scroll Hide/Show */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md bg-gray-950/90 px-4 py-3 md:px-6 md:py-4 transition-transform duration-300 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <a href="#" className="text-xl md:text-2xl font-black tracking-wider text-white hover:text-orange-500 transition shrink-0">
            FAHAD<span className="text-orange-500">.</span>
          </a>

          {/* Centered Pill Container Navigation with Active Animation */}
          <div className={`absolute top-full left-0 w-full bg-[#0a0f1c]/95 backdrop-blur-md p-4 md:static md:flex md:w-auto md:bg-[#0c1220]/90 md:border md:border-slate-800/80 md:rounded-full md:px-3 md:py-1.5 md:shadow-2xl items-center gap-1.5 text-sm font-medium ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            {[
              { id: 'hero', label: 'Home' },
              { id: 'content-tabs', label: 'Videos' },
              { id: 'games', label: 'Games' },
              { id: 'nexus-social', label: 'Nexus' },
              { id: 'sonexas-ai', label: 'Sonexas AI' },
              { id: 'contact-portal', label: 'Contact Me' }
            ].map(item => {
              const isActive = activeNav === item.id;
              return (
                <a 
                  key={item.id} 
                  href={`#${item.id}`} 
                  onClick={() => { 
                    setIsMobileMenuOpen(false); 
                    setActiveNav(item.id);
                    gameSound.playScore();
                  }} 
                  className={`block md:inline-block py-2 md:py-1.5 px-3.5 rounded-full transition-all duration-300 text-xs md:text-sm font-bold ${
                    isActive 
                      ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white shadow-lg shadow-orange-600/30 scale-105' 
                      : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full">

      {/* Hero Section */}
      <header id="hero" className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
        <div className="md:w-1/2 space-y-4 md:space-y-5 text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="flex items-center gap-1.5 text-xs bg-gray-900 border border-gray-800 px-3.5 py-1.5 rounded-full text-gray-300">
              <MapPin size={14} className="text-orange-500" /> DHAKA, BANGLADESH
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-gray-900 border border-gray-800 px-3.5 py-1.5 rounded-full text-gray-300">
              <Globe size={14} className="text-emerald-500" /> Available worldwide
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            FAHAD<br />
            <span className="text-orange-500">ENTERTAINMENT</span>
          </h1>
          <p className="text-base md:text-xl text-gray-300 font-light">
            Cartoons, Music & Full Movies
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            বিশ্বমানের সেরা মিউজিক, জনপ্রিয় কার্টুন এবং ব্লকবাস্টার সিনেমার এক প্রিমিয়াম প্ল্যাটফর্ম। কোনো বাড়তি বিজ্ঞাপন বা বিভ্রান্তিকর ফ্রেম ছাড়াই সরাসরি হাই-ডেফিনিশন সিনেমাটিক প্লেয়ারে উপভোগ করুন নিরবচ্ছিন্ন বিনোদন।
          </p>
          <div className="flex justify-center md:justify-start gap-4 pt-2">
            <button 
              onClick={() => {
                setActiveSection('cartoons');
                const el = document.getElementById('content-tabs');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-full transition shadow-lg text-sm"
            >
              Explore Cartoons
            </button>
          </div>
        </div>

        <div className="w-44 h-44 md:w-72 md:h-72 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border-4 border-orange-500/30 flex flex-col items-center justify-center shadow-2xl p-6 text-center">
          <Film size={32} className="text-orange-500" />
          <h3 className="text-xl md:text-2xl font-bold mt-2">FAHAD</h3>
          <p className="text-xs uppercase tracking-widest text-orange-400 font-semibold mt-1">Creator & Curator</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main id="content-tabs" className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-900 p-1.5 rounded-full w-fit mx-auto border border-gray-800">
          {[
            { id: 'cartoons', label: 'Cartoons' },
            { id: 'songs', label: 'Songs' },
            { id: 'movies', label: 'Movies' }
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${activeSection === sec.id ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {activeSection === 'cartoons' && (
          <VideoSection 
            title="Cartoons" 
            videos={cartoons} 
            icon={Tv} 
            onSelectVideo={handleSelectVideo} 
          />
        )}
        {activeSection === 'songs' && (
          <VideoSection 
            title="Songs" 
            videos={songs} 
            icon={Music} 
            onSelectVideo={handleSelectVideo} 
          />
        )}
        {activeSection === 'movies' && (
          <VideoSection 
            title="Movies" 
            videos={movies} 
            icon={Film} 
            onSelectVideo={handleSelectVideo} 
          />
        )}

        {/* Games Section - Swipeable Carousel Slider with Left/Right Navigation */}
        <section id="games" className="mt-16 pt-6">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              {/* Sleek Mini Gaming Logo */}
              <div className="relative flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 p-[1.5px] shadow-sm shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0a0f1c] rounded-[9px] flex items-center justify-center">
                  <Gamepad2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full border border-gray-950 animate-pulse" />
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 tracking-tight leading-none">
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]">
                    Games
                  </span>
                </h2>
                <span className="text-[10px] text-cyan-400/70 font-mono tracking-wider uppercase block mt-1">Smart Arcade Lounge</span>
              </div>
            </div>

            {/* Right: Small Left/Right Navigation Buttons */}
            <div className="flex items-center gap-2">
              {/* Small Left Arrow Button */}
              <button
                onClick={() => scrollGames('left')}
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#0c1220] border border-slate-700/80 hover:border-cyan-500 hover:bg-cyan-600 text-gray-300 hover:text-white flex items-center justify-center transition shadow-md active:scale-90 cursor-pointer"
                title="আগের গেমগুলো দেখুন (Scroll Left)"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Small Right Arrow Button */}
              <button
                onClick={() => scrollGames('right')}
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#0c1220] border border-slate-700/80 hover:border-cyan-500 hover:bg-cyan-600 text-gray-300 hover:text-white flex items-center justify-center transition shadow-md active:scale-90 cursor-pointer"
                title="পরের গেমগুলো দেখুন (Scroll Right)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Swipeable & Scrollable Games Carousel with 4-Side Running Neon Cards */}
          <div className="relative">
            <div 
              ref={gamesSliderRef}
              className="flex gap-4 md:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { id: 'blade', title: 'Cyber Blade Ninja', sub: 'Orb Slicer Action', tag: 'Slicer Hit', icon: Sword, color: 'text-cyan-400', badge: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400', glow: 'shadow-cyan-500/20 bg-cyan-500/20 border-cyan-500/40' },
                { id: 'gtav', title: 'Grand Theft Auto V', sub: 'Los Santos Highway Heist', tag: 'GTA V', icon: Car, color: 'text-amber-400', badge: 'bg-amber-950/60 border-amber-500/30 text-amber-400', glow: 'shadow-amber-500/20 bg-amber-500/20 border-amber-500/40' },
                { id: 'subway', title: 'Subway Surfers', sub: '3D Subway Train Parkour', tag: 'Top Runner', icon: Footprints, color: 'text-sky-400', badge: 'bg-sky-950/60 border-sky-500/30 text-sky-400', glow: 'shadow-sky-500/20 bg-sky-500/20 border-sky-500/40' },
                { id: 'gow', title: 'God of War: Ragnarök', sub: 'Leviathan Axe & Frost Recall', tag: 'God of War', icon: Shield, color: 'text-blue-400', badge: 'bg-blue-950/60 border-blue-500/30 text-blue-400', glow: 'shadow-blue-500/20 bg-blue-500/20 border-blue-500/40' },
                { id: 'candy', title: 'Candy Crush Saga', sub: 'Royal Match-3 Jewel Blitz', tag: 'Play Store #1', icon: Sparkles, color: 'text-pink-400', badge: 'bg-pink-950/60 border-pink-500/30 text-pink-400', glow: 'shadow-pink-500/20 bg-pink-500/20 border-pink-500/40' },
                { id: 'pool', title: '8 Ball Smart Pool', sub: 'Laser Aim Cue Billiards', tag: 'Smart Physics', icon: Target, color: 'text-emerald-400', badge: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400', glow: 'shadow-emerald-500/20 bg-emerald-500/20 border-emerald-500/40' },
                { id: 'witcher', title: 'The Witcher 3: Wild Hunt', sub: 'Silver Sword & Igni Slayer', tag: 'Witcher 3', icon: Sword, color: 'text-sky-400', badge: 'bg-sky-950/60 border-sky-500/30 text-sky-400', glow: 'shadow-sky-500/20 bg-sky-500/20 border-sky-500/40' },
                { id: 'temple', title: 'Temple Run', sub: 'Ancient Ruin Monster Escape', tag: 'Classic Escape', icon: Flame, color: 'text-orange-400', badge: 'bg-orange-950/60 border-orange-500/30 text-orange-400', glow: 'shadow-orange-500/20 bg-orange-500/20 border-orange-500/40' },
                { id: 'knifehit', title: 'Knife Hit Master', sub: 'Spinning Wheel Log Slasher', tag: 'Target Hit', icon: Sword, color: 'text-rose-400', badge: 'bg-rose-950/60 border-rose-500/30 text-rose-400', glow: 'shadow-rose-500/20 bg-rose-500/20 border-rose-500/40' },
                { id: 'watersort', title: 'Water Sort Color Puzzle', sub: 'Smart Liquid Tube Brain', tag: 'Smart Logic #1', icon: Sparkles, color: 'text-cyan-400', badge: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400', glow: 'shadow-cyan-500/20 bg-cyan-500/20 border-cyan-500/40' },
              ].map((g) => {
                const IconComponent = g.icon;
                return (
                  <div 
                    key={g.id}
                    onClick={() => setActiveGame(g.id as any)}
                    className="w-[230px] sm:w-[260px] md:w-[280px] snap-start shrink-0 neon-running-card cursor-pointer group"
                  >
                    <div className="neon-running-content flex flex-col h-full">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#0c1220] flex items-center justify-center p-4">
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-lg ${g.glow}`}>
                          <IconComponent size={26} className={`${g.color}`} />
                        </div>
                        <span className={`absolute top-2.5 right-2.5 text-[10px] uppercase font-bold border px-2 py-0.5 rounded-md ${g.badge}`}>
                          {g.tag}
                        </span>
                      </div>
                      <div className="p-3.5 flex items-center justify-between border-t border-slate-800/60 bg-[#0c1220] mt-auto">
                        <div className="min-w-0 pr-1">
                          <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition truncate">{g.title}</h3>
                          <p className="text-[11px] text-gray-400">{g.sub}</p>
                        </div>
                        <div className="w-8 h-8 shrink-0 rounded-xl bg-orange-600 group-hover:bg-orange-500 flex items-center justify-center text-white shadow-md transition">
                          <Play size={13} className="fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Community & Forum Groups Section (Now Nexus Social Platform) */}
        <div id="nexus-social">
          <CommunityForum />
        </div>

        {/* Fahad Entertainment Fan Zone & Lounge */}
        <FahadEntertainmentZone />

        {/* NEXUS AI Solver & Assistant Section */}
        <div id="nexus-ai">
          <NexusAiAssistant />
        </div>

        {/* Dynamic Contact & Quick Mail Section */}
        <div id="contact-portal">
          <ContactSection />
        </div>
      </main>
      
      {/* Mahamudul Hasan Professional Footer Section */}
      <FooterSection />
      </div> {/* End of Smart Device Mode Viewport Container */}
      
      {/* Video Modal - 100% Fresh Pure Clean Video Player with No Names Displayed */}
      {selectedVideoItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6"
          onClick={() => setSelectedVideoItem(null)}
        >
          <div 
            ref={videoModalDialogRef}
            className={`relative w-full ${modalSize === 'large' ? 'max-w-5xl h-full sm:h-auto justify-center' : 'max-w-2xl'} bg-[#0c1220] rounded-none sm:rounded-2xl md:rounded-3xl overflow-hidden border-0 sm:border border-slate-700/80 shadow-2xl transition-all duration-300 flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 100% Pure Fresh Header - No Names Displayed */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0a0f1c] border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-400">
                  Cinema View
                </span>
              </div>

              {/* View Controls & Close button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Full Screen Mode Button for phone/pc */}
                <button
                  onClick={toggleFullScreen}
                  className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-950/40 hover:bg-orange-600 transition border border-orange-500/30 cursor-pointer"
                  title="ফুলস্ক্রিনে দেখুন (Full Screen)"
                >
                  <Maximize size={13} />
                  <span className="font-semibold text-[11px] sm:text-xs">Full Screen</span>
                </button>

                {/* View Size Toggle */}
                <button
                  onClick={() => setModalSize(modalSize === 'large' ? 'small' : 'large')}
                  className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition border border-gray-800 cursor-pointer"
                  title={modalSize === 'large' ? 'ছোট করুন (Small View)' : 'বড় করুন (Large View)'}
                >
                  {modalSize === 'large' ? (
                    <>
                      <Minimize2 size={13} className="text-amber-400" />
                      <span className="hidden sm:inline">Small View</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={13} className="text-amber-400" />
                      <span className="hidden sm:inline">Large View</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedVideoItem(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-red-600 text-gray-300 hover:text-white transition cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 
              Ultra-Clean Video Container:
              Scales 1.72x centered inside overflow-hidden to permanently eliminate:
              - Top 36%: Video Title, Channel Avatar, Channel Name, Share Button, Watch Later
              - Bottom 36%: YouTube logo watermark, Copy Link button, 'More videos' shelf
              - 100% Pure, Fresh, Cinematic Full Video with zero branding
            */}
            <div 
              ref={playerContainerRef}
              className="relative aspect-video w-full bg-black overflow-hidden select-none"
              style={{ isolation: 'isolate' }}
            >
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <div 
                  className="w-full h-full relative"
                  style={{
                    transform: 'scale(1.72)',
                    transformOrigin: 'center center'
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0 pointer-events-none block"
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideoItem.id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&controls=0&enablejsapi=1&playsinline=1&fs=0&disablekb=1`}
                    title="Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Protective solid black strips at very top & bottom to ensure 100% clean borders */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-black pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-black pointer-events-none z-10" />

              {/* Clickable Screen Area to toggle play/pause */}
              <div 
                onClick={togglePlay}
                className="absolute inset-0 cursor-pointer z-20"
                title={isPlaying ? 'ক্লিক করে পজ করুন' : 'ক্লিক করে প্লে করুন'}
              />

              {/* Center Play Icon overlay when video is paused */}
              {!isPlaying && (
                <div 
                  onClick={togglePlay}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 cursor-pointer backdrop-blur-[1px] transition-all"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-2xl shadow-orange-600/60 scale-100 hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Custom Interactive Control Bar with Timeline Scrubber */}
            <div className="px-4 py-3 bg-[#0a0f1c] border-t border-slate-800 flex flex-col gap-2.5 select-none">
              {/* 
                Timeline Scrub Bar (টেনে টেনে দেখার বার):
                Drag or click anywhere to jump or scrub through the video!
              */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-gray-400 w-11 text-right select-none">
                  {formatTime(currentTime)}
                </span>

                {/* Interactive Slider Track */}
                <div 
                  ref={progressBarRef}
                  onMouseDown={handleSeekMouseDown}
                  onTouchStart={handleSeekTouchStart}
                  onTouchMove={handleSeekTouchMove}
                  onTouchEnd={handleSeekTouchEnd}
                  className="relative flex-1 h-6 flex items-center cursor-pointer group/slider py-2 touch-none"
                  title="টেনে টেনে ভিডিওর যেকোনো অংশে যান"
                >
                  {/* Background Track */}
                  <div className="w-full h-1.5 group-hover/slider:h-2.5 bg-slate-800 group-hover/slider:bg-slate-700 rounded-full overflow-hidden transition-all duration-150 relative">
                    {/* Filled Progress Bar in Orange */}
                    <div 
                      className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full transition-all duration-75"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Scrubber Knob Thumb */}
                  <div 
                    className="absolute w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-lg shadow-orange-500/50 transform -translate-x-1/2 scale-100 group-hover/slider:scale-125 transition-transform pointer-events-none"
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>

                <span className="text-[11px] font-mono text-gray-400 w-11 text-left select-none">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Play / Pause button */}
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition shadow-sm"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-white" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  {/* -10s rewind */}
                  <button
                    onClick={() => skipSeconds(-10)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition font-mono text-[11px]"
                    title="১০ সেকেন্ড পেছনে যান"
                  >
                    -10s
                  </button>

                  {/* +10s forward */}
                  <button
                    onClick={() => skipSeconds(10)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition font-mono text-[11px]"
                    title="১০ সেকেন্ড সামনে যান"
                  >
                    +10s
                  </button>

                  {/* Restart button */}
                  <button
                    onClick={restartVideo}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition"
                    title="শুরু থেকে দেখুন (Restart)"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Mute / Unmute */}
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition"
                    title={isMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
                  >
                    {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} />}
                  </button>

                  <div className="h-4 w-px bg-slate-800" />

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullScreen}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition"
                    title="ফুলস্ক্রিন করুন"
                  >
                    <Maximize size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Game Modal - Optimized for 100dvh Phone & PC with Universal Touch System */}
      {activeGame && (
        <div 
          className="fixed inset-0 w-screen h-[100dvh] z-[200] bg-black flex items-center justify-center overflow-hidden touch-none select-none overscroll-none"
        >
          <div 
            ref={gameModalRef}
            className="relative w-full h-full flex flex-col bg-black overflow-hidden touch-none"
          >
            {/* Top Game Bar with Volume Slider, Fullscreen & Clear Exit Button */}
            <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-[220] flex items-center gap-2 bg-slate-950/85 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-white/15 shadow-2xl pointer-events-auto">
              {/* Volume Controls */}
              <div className="flex items-center gap-1.5 px-1.5 sm:px-2">
                <button
                  onClick={() => {
                    const next = !gameSoundEnabled;
                    setGameSoundEnabled(next);
                    gameSound.enabled = next;
                    if (next && gameVolume === 0) {
                      setGameVolume(50);
                      gameSound.setVolume(0.5);
                    }
                  }}
                  className="text-slate-300 hover:text-white transition"
                  title={gameSoundEnabled ? 'মিউট করুন' : 'আনমিউট করুন'}
                >
                  {gameSoundEnabled && gameVolume > 0 ? (
                    <Volume2 size={18} className="text-cyan-400" />
                  ) : (
                    <VolumeX size={18} className="text-rose-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={gameSoundEnabled ? gameVolume : 0}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setGameVolume(v);
                    gameSound.setVolume(v / 100);
                    setGameSoundEnabled(v > 0);
                  }}
                  className="w-12 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  title={`সাউন্ড ভলিউম: ${gameVolume}%`}
                />
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">{gameVolume}%</span>
              </div>

              {/* Fullscreen API Toggle */}
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    gameModalRef.current?.requestFullscreen?.().catch(() => {});
                  } else {
                    document.exitFullscreen?.().catch(() => {});
                  }
                }}
                className="p-1.5 sm:p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition shadow border border-white/10"
                title="ফুলস্ক্রিন করুন"
              >
                <Maximize size={16} />
              </button>

              {/* Clear Red Exit Button */}
              <button
                onClick={() => setActiveGame(null)}
                className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg font-bold text-xs flex items-center gap-1 border border-rose-400/40 active:scale-95 cursor-pointer"
                title="গেম থেকে বের হন"
              >
                <X size={16} />
                <span>বের হন</span>
              </button>
            </div>

            {/* Game Content Body - Filling 100% of the screen */}
            <div className="flex-grow w-full h-full flex items-center justify-center game-play-area overflow-hidden relative">
              {activeGame === 'blade' && <CyberBladeNinja />}
              {activeGame === 'gtav' && <GtaVHeistRacer />}
              {activeGame === 'subway' && <SubwaySurfersParkour />}
              {activeGame === 'gow' && <GodOfWarRagnarok />}
              {activeGame === 'candy' && <CandyCrushRoyal />}
              {activeGame === 'pool' && <Smart8BallPool />}
              {activeGame === 'witcher' && <WitcherMonsterHunt />}
              {activeGame === 'temple' && <TempleRunEscape />}
              {activeGame === 'knifehit' && <KnifeHitMaster />}
              {activeGame === 'watersort' && <WaterSortColorPuzzle />}
            </div>
          </div>
        </div>
      )}
      {/* Mobile Floating Bottom Navigation Bar (like the uploaded image) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 md:hidden bg-[#0c1220]/95 backdrop-blur-md border border-slate-800/90 rounded-full px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-1 overflow-x-auto max-w-[95vw] scrollbar-none">
        {[
          { id: 'hero', label: 'Home', icon: Home },
          { id: 'content-tabs', label: 'Videos', icon: Film },
          { id: 'games', label: 'Games', icon: Gamepad2 },
          { id: 'community-forum', label: 'Community', icon: Users },
          { id: 'nexus-ai', label: 'Nexus', icon: Sparkles },
          { id: 'contact-portal', label: 'Contact', icon: Mail }
        ].map(item => {
          const IconComponent = item.icon;
          const isActive = activeNav === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => {
                setActiveNav(item.id);
                gameSound.playScore();
              }}
              className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-full transition-all duration-300 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white shadow-md shadow-orange-600/30 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <IconComponent size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
              <span className="text-[9px] font-bold mt-0.5 whitespace-nowrap">{item.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
