import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Heart, Clock, User, Gamepad2, Download, Flame, Loader2, Gem, Gavel, Star } from 'lucide-react';
import { Script } from '../constants';
import { cn } from '../lib/utils';

interface ScriptCardProps {
  script: Script;
  index: number;
  onClick: (s: Script) => void;
  onSelectUser?: (userId: string) => void;
  key?: string | number;
}

export function ScriptCard({ script, index, onClick, onSelectUser }: ScriptCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isAdminAuthor = script.author === 'D4VIDSKYS' || script.author === 'Admin' || script.author === 'CrazyGui';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(script)}
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-brand/40 transition-all hover:shadow-[0_0_30px_-5px_rgba(0,255,153,0.1)] cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden bg-zinc-900/50">
        <AnimatePresence>
          {!isLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-800/20 flex items-center justify-center overflow-hidden"
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.img 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.1 }}
          transition={{ duration: 0.4 }}
          src={script.thumbnail} 
          alt={script.title}
          referrerPolicy="no-referrer"
          loading={index < 4 ? "eager" : "lazy"}
          {...(index < 4 ? { fetchPriority: "high" } : {})}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=800&q=60';
            setIsLoaded(true);
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
        <div className="absolute top-4 right-4 flex flex-col gap-2 scale-90 origin-top-right">
           {script.isPremium && (
             <span className="px-3 py-1 bg-gradient-to-r from-brand to-cyan-400 text-black rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-lg animate-pulse">
                <Gem size={12} fill="currentColor" /> Premium
             </span>
           )}
           {script.isTrending && (
             <span className="px-3 py-1 bg-orange-500 text-black rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                <Flame size={12} fill="currentColor" /> Trending
             </span>
           )}
           {script.isNew && (
             <span className="px-3 py-1 bg-brand text-black rounded-lg text-[10px] font-black uppercase shadow-lg">
                New
             </span>
           )}
        </div>
        <div className="absolute bottom-4 left-4">
           <div className="flex items-center gap-1.5 text-brand bg-brand/10 backdrop-blur-md px-2 py-1 rounded-md">
            <Gamepad2 size={14} />
            <span className="text-[10px] font-bold uppercase">{script.game}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
           <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-brand transition-colors">
            {script.title}
          </h3>
          <span className="flex-shrink-0 text-[10px] text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
            {script.category}
          </span>
        </div>
        <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed">
          {script.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <User size={14} className="text-zinc-400" />
            </div>
            <div className="flex flex-col">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUser?.(script.authorId);
                }}
                className="flex items-center gap-1.5 hover:text-brand transition-colors text-left"
              >
                <span className="text-xs text-white font-medium">{script.author}</span>
                {isAdminAuthor && <Gavel size={10} className="text-brand" fill="currentColor" />}
              </button>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Clock size={10} /> {script.updatedAt}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-zinc-500/80">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span className="text-xs font-mono">{script.views >= 1000 ? `${(script.views/1000).toFixed(1)}K` : script.views}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg text-yellow-500">
              <Star size={14} fill="currentColor" />
              <span className="text-xs font-mono">{script.rating || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg text-brand">
              <Heart size={14} />
              <span className="text-xs font-mono">{script.likes >= 1000 ? `${(script.likes/1000).toFixed(1)}K` : script.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FilterBar({ 
  selectedCategory, 
  onSelectCategory,
  categories 
}: { 
  selectedCategory: string, 
  onSelectCategory: (cat: string) => void,
  categories: string[]
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-12 flex-wrap px-4">
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => onSelectCategory(category)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
            selectedCategory === category 
              ? "bg-brand text-black border-brand neon-glow" 
              : "bg-transparent text-zinc-400 border-border hover:border-zinc-700 hover:text-white"
          )}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
}
