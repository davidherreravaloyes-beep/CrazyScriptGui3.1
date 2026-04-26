import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Monitor, Smartphone, Download, CheckCircle2, AlertCircle, Globe, MessageSquare, ExternalLink, Calendar, ShieldCheck, User, Edit2 } from 'lucide-react';
import { Executor } from '../constants';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { EditExecutorModal } from './EditExecutorModal';
import ReactMarkdown from 'react-markdown';

export function ExecutorDetail({ executor, onBack, isAdmin }: { executor: Executor, onBack: () => void, isAdmin: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 pb-20 px-4 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">All Executors</span>
        </button>

        {isAdmin && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 text-brand rounded-xl hover:bg-brand/20 transition-all text-xs font-bold font-sans"
          >
            <Edit2 size={14} />
            Edit Executor
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {/* Banner Card */}
        <div className="rounded-[24px] overflow-hidden border border-[#2a2a32] bg-[#0c0c0e]">
          <div className="relative aspect-video bg-zinc-900/50">
            <AnimatePresence>
              {!isBannerLoaded && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-zinc-800/20 overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.img 
              initial={{ opacity: 0 }}
              animate={{ opacity: isBannerLoaded ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              src={executor.banner || undefined} 
              alt={executor.name} 
              referrerPolicy="no-referrer"
              loading="eager"
              {...({ fetchPriority: "high" } as any)}
              decoding="async"
              onLoad={() => setIsBannerLoaded(true)}
              className="w-full h-full object-cover" 
            />
            {/* Watermark simulation if needed, but the images already have it */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e]/40 to-transparent" />
          </div>
          
          {/* Thumbnails */}
          <div className="p-4 flex gap-3 overflow-x-auto scrollbar-hide">
             <div className="w-20 h-12 rounded-lg border-2 border-brand overflow-hidden shrink-0">
               <img 
                src={executor.banner || undefined} 
                referrerPolicy="no-referrer" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover" 
              />
             </div>
             {executor.gallery?.map((img, i) => (
                <div key={i} className="w-20 h-12 rounded-lg border border-[#2a2a32] overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <img 
                    src={img || undefined} 
                    referrerPolicy="no-referrer" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                </div>
             ))}
             {/* Dummy thumbnails to match screenshot appearance */}
             <div className="w-20 h-12 rounded-lg border border-[#2a2a32] bg-[#16161a] shrink-0" />
             <div className="w-20 h-12 rounded-lg border border-[#2a2a32] bg-[#16161a] flex items-center justify-center shrink-0">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                   <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-white ml-0.5" />
                </div>
             </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#121217] border border-[#2a2a32] rounded-[24px] p-8">
          <div className="flex gap-6 mb-8">
            <div className="w-20 h-20 bg-[#1a1a20] rounded-2xl p-1 border border-[#2a2a32] shrink-0 overflow-hidden">
              <img 
                src={executor.icon || undefined} 
                alt={executor.name} 
                referrerPolicy="no-referrer" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover rounded-xl" 
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-1">{executor.name}</h1>
              <div className="flex items-center gap-1 text-zinc-500">
                 <User size={14} />
                 <span className="text-sm font-medium">{executor.author}</span>
              </div>
            </div>
          </div>

          <div className="text-zinc-400 text-sm leading-relaxed mb-8 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{executor.description}</ReactMarkdown>
          </div>

          <div className="flex items-center gap-2 text-xl font-bold text-white mb-6">
            <span>{executor.price}</span>
            <span className="text-zinc-600 font-normal">·</span>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Download size={16} />
              <span>{executor.downloads} downloads</span>
            </div>
          </div>

          <a 
            href={executor.website || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#9ba7f5] hover:bg-[#8a96e4] text-black font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-lg shadow-xl shadow-[#9ba7f5]/10"
          >
            Get {executor.name}
            <ArrowLeft className="rotate-180" size={20} />
          </a>
          
          <div className="text-center mt-4">
            <p className="text-[11px] font-bold text-zinc-500 flex items-center justify-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-500" />
              Official source · Verified by CrazyGuiscripts
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-[#121217] border border-[#2a2a32] rounded-[24px] p-6 space-y-6">
          <div className="flex flex-wrap gap-3">
             <div className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-xs",
               executor.status === 'Working' 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
             )}>
                {executor.status === 'Working' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {executor.status}
             </div>
             {executor.unc && (
               <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg font-bold text-xs">
                 UNC {executor.unc}
               </div>
             )}
          </div>

          <div className="text-xs font-bold text-zinc-400">
             Version {executor.version} <span className="mx-2 text-zinc-700">·</span> Working {executor.lastWorked}
          </div>

          <div className="space-y-3">
             <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Compatibility</h3>
             <div className="flex gap-2">
                {executor.platforms.map(p => (
                   <div key={p} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a20] rounded-lg border border-[#2a2a32] text-xs font-bold text-zinc-300">
                      {p === 'windows' ? <Monitor size={14} /> : <Smartphone size={14} />}
                      {p}
                   </div>
                ))}
             </div>
          </div>

          <div className="pt-4 border-t border-[#2a2a32] flex items-center gap-2 text-[11px] font-bold text-zinc-500">
             <Calendar size={14} />
             Updated {executor.updatedDate}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3">
           <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Links</h3>
           <div className="flex flex-col sm:flex-row gap-3">
              <a href={executor.website || '#'} className="flex-1 flex items-center gap-3 p-4 bg-[#121217] hover:bg-[#1a1a20] rounded-xl border border-[#2a2a32] transition-colors">
                 <Globe size={18} className="text-zinc-500" />
                 <span className="text-sm font-bold text-white">Website</span>
              </a>
              <a href={executor.discord || '#'} className="flex-1 flex items-center gap-3 p-4 bg-[#121217] hover:bg-[#1a1a20] rounded-xl border border-[#2a2a32] transition-colors">
                 <MessageSquare size={18} className="text-zinc-500" />
                 <span className="text-sm font-bold text-white">Discord</span>
              </a>
           </div>
        </div>
      </div>
    </motion.div>

    <AnimatePresence>
      {isEditing && (
        <EditExecutorModal 
          executor={executor} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </AnimatePresence>
    </>
  );
}
