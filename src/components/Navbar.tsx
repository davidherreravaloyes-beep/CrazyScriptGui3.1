import { motion } from 'motion/react';
import { Search, Terminal, Flame, Star, Clock, User as UserIcon, Download, ExternalLink, Menu, X, LogOut, Shield, Settings, Gavel } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { db, auth, googleProvider, signInWithPopup, onAuthStateChanged, type User } from '../lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ProfileModal } from './ProfileModal';

export function Navbar({ onOpenSubmit, onPageChange, currentPage, onOpenUserSearch }: { onOpenSubmit: () => void, onPageChange: (page: 'scripts' | 'executors' | 'admin' | 'login') => void, currentPage: string, onOpenUserSearch?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>({
    name: 'CrazyGui',
    brand: 'scripts',
    logo: '',
    discordLink: ''
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Bootstrap admin by email
        if (currentUser.email === 'herreravaloyesa@gmail.com') {
          setIsAdmin(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminDoc.exists());
          } catch (error) {
            console.error("Admin check failed:", error);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
    });

    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteConfig(docSnap.data() as any);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeConfig();
    };
  }, []);

  const handleLogin = async () => {
    onPageChange('login');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const DISCORD_LINK = siteConfig.discordLink || "https://discord.gg/5PSyhpvTn";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <motion.div 
          whileTap={{ scale: 0.998 }}
          className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"
        >
        <div 
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer" 
          onClick={() => onPageChange('scripts')}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex items-center justify-center neon-glow bg-[#121217] border border-brand/20">
            {siteConfig.logo ? (
              <img 
                src={siteConfig.logo || undefined} 
                alt="Logo" 
                referrerPolicy="no-referrer" 
                loading="eager"
                {...({ fetchPriority: "high" } as any)}
                decoding="async"
                className="w-full h-full object-cover" 
              />
            ) : (
              <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff99" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <text x="50%" y="50%" dy=".35em" textAnchor="middle" fill="url(#logoGradient)" className="text-[45px] font-black font-sans">CG</text>
              </svg>
            )}
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tighter text-white">
            {siteConfig.name}<span className="text-brand">{siteConfig.brand}</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button 
            onClick={() => onPageChange('scripts')}
            className={cn("transition-colors", currentPage === 'scripts' ? "text-brand" : "text-zinc-400 hover:text-brand")}
          >
            Scripts
          </button>
          <button 
            onClick={() => onPageChange('executors')}
            className={cn("transition-colors", currentPage === 'executors' ? "text-brand" : "text-zinc-400 hover:text-brand")}
          >
            Executors
          </button>
          {isAdmin && (
            <button 
              onClick={() => onPageChange('admin')}
              className={cn("transition-colors flex items-center gap-1.5", currentPage === 'admin' ? "text-brand" : "text-zinc-400 hover:text-brand")}
            >
              <Shield size={14} />
              Admin
            </button>
          )}
          <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-brand transition-colors">
            Discord
          </a>
          <button 
            onClick={onOpenUserSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-border rounded-xl text-zinc-400 hover:text-white transition-all"
          >
            <Search size={14} />
            Search Users
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={onOpenSubmit}
                className="text-xs font-bold text-brand uppercase tracking-widest hover:opacity-80 transition-opacity"
              >
                Submit Script
              </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="relative">
                      <img 
                        src={user.photoURL || undefined} 
                        alt={user.displayName || ''} 
                        referrerPolicy="no-referrer" 
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded-full border border-brand/50" 
                      />
                      {isAdmin && (
                        <div className="absolute -bottom-1 -right-1 bg-brand rounded-full p-0.5 border border-black shadow-lg">
                          <Gavel size={8} className="text-black" fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-white">{(user.displayName || 'Guest').split(' ')[0]}</span>
                      {isAdmin && <Gavel size={12} className="text-brand" fill="currentColor" />}
                    </div>
                  </button>
                </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={handleLogin}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={handleLogin}
                className="px-6 py-2 bg-brand text-black text-sm font-bold rounded-full hover:bg-brand-muted transition-all active:scale-95 neon-glow"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!user && (
            <button 
              onClick={handleLogin}
              className="md:hidden px-3 py-1.5 bg-brand text-black text-[10px] sm:text-xs font-bold rounded-full neon-glow transition-all active:scale-95"
            >
              Login
            </button>
          )}

          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-zinc-400 p-1.5" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-b border-border p-4 space-y-4"
        >
          <button 
            onClick={() => { onPageChange('scripts'); setIsOpen(false); }}
            className={cn("block w-full text-left py-2 px-4 rounded-lg", currentPage === 'scripts' ? "bg-brand/10 text-brand" : "text-zinc-400")}
          >
            Scripts
          </button>
          <button 
            onClick={() => { onPageChange('executors'); setIsOpen(false); }}
            className={cn("block w-full text-left py-2 px-4 rounded-lg", currentPage === 'executors' ? "bg-brand/10 text-brand" : "text-zinc-400")}
          >
            Executors
          </button>
          {isAdmin && (
            <button 
              onClick={() => { onPageChange('admin'); setIsOpen(false); }}
              className={cn("block w-full text-left py-2 px-4 rounded-lg flex items-center gap-2", currentPage === 'admin' ? "bg-brand/10 text-brand" : "text-zinc-400")}
            >
              <Shield size={16} />
              Admin Panel
            </button>
          )}
          <button 
            onClick={() => { onOpenUserSearch?.(); setIsOpen(false); }}
            className="block w-full text-left py-2 px-4 rounded-lg text-zinc-400 flex items-center gap-2"
          >
            <Search size={16} />
            Search Users
          </button>
          <a 
            href={DISCORD_LINK} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full text-left py-2 px-4 rounded-lg text-zinc-400"
          >
            Discord
          </a>
          
          <div className="pt-4 border-t border-border">
            {user ? (
              <div className="space-y-4">
                <button 
                  onClick={() => { setIsProfileOpen(true); setIsOpen(false); }}
                  className="flex items-center gap-3 px-4 w-full text-left"
                >
                  <div className="relative">
                    <img 
                      src={user.photoURL || undefined} 
                      alt="" 
                      referrerPolicy="no-referrer" 
                      loading="lazy"
                      decoding="async"
                      className="w-8 h-8 rounded-full border border-brand/50" 
                    />
                    {isAdmin && (
                      <div className="absolute -bottom-1 -right-1 bg-brand rounded-full p-1 border border-black shadow-lg">
                        <Gavel size={10} className="text-black" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{user.displayName || 'Guest User'}</span>
                      {isAdmin && <Gavel size={14} className="text-brand" fill="currentColor" />}
                    </div>
                    <span className="text-[10px] text-brand font-bold uppercase tracking-wider">Edit Profile</span>
                  </div>
                </button>
                <button 
                  onClick={() => { onOpenSubmit(); setIsOpen(false); }}
                  className="w-full py-3 bg-brand/10 text-brand font-bold rounded-xl border border-brand/20"
                >
                  Submit Script
                </button>
                <button 
                  onClick={handleLogout} 
                  className="w-full py-3 bg-zinc-800 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { handleLogin(); setIsOpen(false); }} 
                className="w-full py-3 bg-brand text-black font-bold rounded-xl neon-glow"
              >
                Get Started
              </button>
            )}
          </div>
        </motion.div>
      )}

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
        isAdmin={isAdmin}
      />
    </nav>
  );
}
