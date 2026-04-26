import { motion } from 'motion/react';
import { Search, ChevronRight, Terminal } from 'lucide-react';

export function Hero({ onSearch, onOpenSubmit, siteConfig }: { onSearch: (query: string) => void, onOpenSubmit: () => void, siteConfig?: any }) {
  const config = siteConfig || {
    heroTitle: 'Enhance Your Experience with Premium Gaming Scripts',
    heroSubtitle: 'Explore thousands of verified, high-performance scripts and GUIs for your favorite games. Zero malware, 100% efficiency.',
    heroBadge: 'V3.0 IS NOW LIVE'
  };

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* High-tech background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20 filter grayscale brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full -mr-64 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full -ml-32 -mb-32" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-brand text-xs font-semibold mb-6 uppercase tracking-wider"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
          </span>
          {config.heroBadge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          {(config.heroTitle || '').split('<br />').map((line: string, i: number) => (
            <span key={i}>
              {line}
              {i < (config.heroTitle || '').split('<br />').length - 1 && <br className="hidden sm:block" />}
            </span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mb-8 px-4"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic tracking-tighter text-white mb-2 uppercase leading-tight">
            The site with <span className="text-brand drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">the best</span> premium and free <span className="text-brand drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">scripts</span>
          </h2>
          <div className="flex flex-col items-center">
            <div className="h-0.5 w-24 bg-brand rounded-full mb-2 shadow-[0_0_10px_#a855f7]" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-brand/80 ml-1 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">Helpers Elizz</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-2xl text-zinc-400 text-base md:text-xl mb-10"
        >
          {config.heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col md:flex-row gap-4 w-full max-w-2xl"
        >
        <motion.div
          whileTap={{ scale: 0.99 }}
          className="flex-1 relative"
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-zinc-500" size={20} />
          </div>
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search scripts..."
            className="w-full h-14 bg-zinc-900/50 backdrop-blur-md border border-border rounded-2xl pl-14 pr-6 text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand/50 transition-all shadow-xl"
          />
        </motion.div>
          <button 
            onClick={onOpenSubmit}
            className="h-14 px-8 bg-brand text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-muted transition-all active:scale-95 neon-glow whitespace-nowrap"
          >
            <Terminal size={20} />
            Submit Script
          </button>
        </motion.div>
      </div>
    </section>
  );
}
