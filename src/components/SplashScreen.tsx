import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [splashConfig, setSplashConfig] = useState({
    text: 'CrazyGuiscripts',
    owner: 'D4vidskys'
  });

  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    // Load config directly for splash (since it's the very first thing)
    const loadConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'site'));
        if (snap.exists()) {
          const data = snap.data();
          setSplashConfig({
            text: data.splashText || 'CrazyGuiscripts',
            owner: data.splashOwner || 'D4vidskys'
          });
        }
      } catch (e) {
        console.error("Failed to load splash config", e);
      }
    };
    loadConfig();

    // Cinematic intro impact
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
    audio.currentTime = 10; // Start a bit into it for more immediate sound
    audio.volume = 0.2;

    audio.onerror = () => {
      console.warn("Splash sound failed to load.");
    };

    let soundTimer: NodeJS.Timeout;
    if (!hasPlayed) {
      soundTimer = setTimeout(() => {
        if (audio.readyState >= 2) {
          audio.play().catch(e => console.log("Sound impact blocked:", e));
        }
        setHasPlayed(true);
      }, 1200);
    }

    const timer = setTimeout(() => {
      onComplete();
    }, 3800);
    return () => {
      clearTimeout(timer);
      if (soundTimer) clearTimeout(soundTimer);
    };
  }, [onComplete, hasPlayed]);

  // Split the text into two parts for the C/G animation
  const midPoint = Math.ceil(splashConfig.text.length / 2);
  const part1 = splashConfig.text.substring(0, midPoint);
  const part2 = splashConfig.text.substring(midPoint);
  const char1 = part1[0];
  const rest1 = part1.substring(1);
  const char2 = part2[0];
  const rest2 = part2.substring(1);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Background glow effects */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-brand/5 opacity-20 blur-[120px] rounded-full" />
      
      <div className="relative flex flex-col items-center w-full px-6">
        <div className="relative flex items-center justify-center font-black text-[12vw] md:text-8xl tracking-tighter w-full text-center">
          {/* Left Part */}
          <div className="flex items-center">
            <motion.span
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              {char1}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="text-white/80 overflow-hidden break-keep"
            >
              {rest1}
            </motion.span>
          </div>

          {/* Right Part */}
          <div className="flex items-center">
            <motion.span
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="text-brand drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              {char2}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="text-brand/80 overflow-hidden break-keep"
            >
              {rest2}
            </motion.span>
          </div>

          {/* Shine effect that sweeps across */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="absolute inset-x-0 h-full bg-white/20 blur-xl skew-x-[-20deg] origin-left z-10"
          />
        </div>

        {/* Owner Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
          className="mt-6 flex flex-col items-center"
        >
          <div className="h-px w-16 bg-brand/30 mb-3" />
          <span className="text-zinc-500 text-sm font-bold uppercase tracking-[0.4em] text-center">
            OWNED BY <span className="text-zinc-300 ml-1">{splashConfig.owner}</span>
          </span>
        </motion.div>
      </div>

      {/* Loading Bar at bottom */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 max-w-[80%] h-1 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
          className="h-full bg-brand"
        />
      </div>
    </motion.div>

  );
}
