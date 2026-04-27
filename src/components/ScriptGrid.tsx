import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Heart, Clock, User, Gamepad2, Download, Flame, Loader2, Gem, Gavel, Star, TreePine, Target, Sword, Cloud, Globe, Leaf, Zap, Skull, Shield, Search, Lock, Key, Ghost } from 'lucide-react';
import { Script } from '../constants';
import { cn } from '../lib/utils';

const ICON_MAP: Record<string, any> = {
  TreePine, Target, Sword, Cloud, Globe, Leaf, Zap, Skull, Shield, Search, Lock, Key, Ghost, Gamepad2, Flame, Gem, Star, Heart
};

function DynamicIcon({ name, size, className }: { name?: string, size: number, className?: string }) {
  const IconComponent = (name && ICON_MAP[name]) || Gamepad2;
  return <IconComponent size={size} className={className} />;
}

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(script)}
      className="group relative bg-[#0b0b0d] hover:bg-[#0f0f12] rounded-3xl p-8 transition-all cursor-pointer border border-transparent hover:border-white/5 overflow-hidden shadow-2xl"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff4d4d]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex flex-col gap-6">
        {/* Title & Icon Header */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl group-hover:bg-brand/10 group-hover:text-brand transition-all duration-500 shadow-inner">
            <DynamicIcon 
              name={script.iconName} 
              size={32} 
              className="text-white group-hover:text-brand transition-colors duration-500" 
            />
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight group-hover:text-brand transition-colors duration-300">
            {script.title}
          </h3>
        </div>

        {/* Description Area */}
        <p className="text-zinc-400 text-lg leading-relaxed line-clamp-3 font-medium">
          {script.description}
        </p>

        {/* Stats & Metadata Footer */}
        <div className="flex flex-wrap items-center justify-between pt-6 border-t border-white/5 gap-4">
          <div className="flex items-center gap-6 text-sm font-bold text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{script.views >= 1000 ? `${(script.views/1000).toFixed(1)}K` : script.views}</span>
            </div>
            <div className="flex items-center gap-2 text-brand/80">
              <Heart size={16} fill="currentColor" />
              <span>{script.likes >= 1000 ? `${(script.likes/1000).toFixed(1)}K` : script.likes}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div 
               onClick={(e) => {
                 e.stopPropagation();
                 onSelectUser?.(script.authorId);
               }}
               className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
             >
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-zinc-500">
                  {script.author[0]}
                </div>
                <span className="text-xs text-white font-bold">{script.author}</span>
                {isAdminAuthor && <Gavel size={10} className="text-brand" fill="currentColor" />}
             </div>
          </div>
        </div>
      </div>

      {/* Hidden high-priority image for faster loading in background/cache if needed, but not visible */}
      <img 
        src={script.thumbnail} 
        style={{ display: 'none' }}
        fetchPriority={index < 10 ? "high" : "low" as any}
        loading={index < 10 ? "eager" : "lazy"}
      />
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
