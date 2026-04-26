import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, X } from 'lucide-react';

export function MusicPlayer() {
  const [showControls, setShowControls] = useState(false);

  // Spotify Playlist ID: 6vwdTEu3krGgFYxCDDSfUX
  const playlistId = "6vwdTEu3krGgFYxCDDSfUX";
  
  return (
    <div 
      className="fixed top-24 right-4 z-[60] flex flex-col items-end gap-3"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <AnimatePresence>
        {showControls ? (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="bg-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl w-[320px]"
          >
             <div className="p-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Spotify Playlist • Sleeping City</span>
                </div>
                <button 
                  onClick={() => setShowControls(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-zinc-500 transition-colors"
                >
                  <X size={14} />
                </button>
             </div>
             <div className="w-full bg-[#121212]">
               <iframe 
                  src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`} 
                  width="100%" 
                  height="152" 
                  frameBorder="0" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="rounded-b-2xl shadow-inner"
                />
             </div>
             <div className="p-2 bg-black/40">
                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter text-center">
                  Press play on the Spotify widget to start background music
                </p>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative group cursor-pointer"
            onClick={() => setShowControls(true)}
          >
            {/* Pulsing Ring */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -inset-1 rounded-2xl border-2 border-[#1DB954]/50 blur-sm"
            />
            
            {/* The Image (Spotify Themed) */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand shadow-[0_0_20px_rgba(var(--color-brand),0.3)] relative bg-[#1DB954]/10 flex items-center justify-center">
               <Music size={24} className="text-[#1DB954] animate-pulse" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
               <div className="absolute bottom-1 left-0 right-0 text-[8px] font-black text-white text-center drop-shadow-md select-none tracking-tighter">
                  PLAYLIST
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

