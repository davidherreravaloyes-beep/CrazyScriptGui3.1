import { motion, AnimatePresence } from 'motion/react';
import { Search, Monitor, Laptop, Smartphone, Apple, Download, User, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { MOCK_EXECUTORS, Executor } from '../constants';
import { cn } from '../lib/utils';
import { ExecutorDetail } from './ExecutorDetail';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export function Executors({ isAdmin }: { isAdmin: boolean }) {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');
  const [status, setStatus] = useState('All');
  const [selectedExecutor, setSelectedExecutor] = useState<Executor | null>(null);
  const [firestoreExecutors, setFirestoreExecutors] = useState<Executor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'executors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Executor));
      setFirestoreExecutors(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'executors');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const allExecutors = useMemo(() => {
    // Merge firestore with mock, prioritizing firestore by ID
    const merged = [...firestoreExecutors];
    MOCK_EXECUTORS.forEach(mock => {
      if (!merged.find(e => e.id === mock.id)) {
        merged.push(mock);
      }
    });
    return merged;
  }, [firestoreExecutors]);

  const filtered = allExecutors.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platform === 'All' || ex.platforms.includes(platform.toLowerCase());
    const matchesStatus = status === 'All' || ex.status === status;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <div className="pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (selectedExecutor) {
    // Find the latest state of the selected executor in allExecutors
    const currentExecutor = allExecutors.find(e => e.id === selectedExecutor.id) || selectedExecutor;
    return <ExecutorDetail executor={currentExecutor} onBack={() => setSelectedExecutor(null)} isAdmin={isAdmin} />;
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="w-full max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text"
            placeholder="Search executors..."
            className="w-full bg-zinc-900/50 border border-border rounded-xl pl-12 pr-4 py-3 text-white focus:border-accent/50 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-border">
            {['Windows', 'Mac', 'IOS', 'Android'].map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p === platform ? 'All' : p)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  platform === p ? "bg-accent text-white" : "text-zinc-500 hover:text-white"
                )}
              >
                {p === 'Windows' && <Monitor size={14} />}
                {p === 'Mac' && <Laptop size={14} />}
                {p === 'IOS' && <Apple size={14} />}
                {p === 'Android' && <Smartphone size={14} />}
                {p}
              </button>
            ))}
          </div>

          <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-border">
            {['All', 'Working', 'Outdated'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  status === s ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-zinc-400 hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((ex, idx) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedExecutor(ex)}
            className="group relative bg-[#121217] border border-border rounded-[24px] overflow-hidden card-hover cursor-pointer"
          >
            {/* Banner */}
            <div className="relative h-48 overflow-hidden bg-zinc-900/50">
              <AnimatePresence>
                {!loadedImages[`banner-${ex.id}`] && (
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
                animate={{ opacity: loadedImages[`banner-${ex.id}`] ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                src={ex.banner || undefined} 
                alt={ex.name} 
                referrerPolicy="no-referrer"
                loading={idx < 4 ? "eager" : "lazy"}
                {...(idx < 4 ? { fetchPriority: "high" } : {})}
                decoding="async"
                onLoad={() => handleImageLoad(`banner-${ex.id}`)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-transparent" />
              
              {/* Badge Overlay */}
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md border",
                  ex.status === 'Working' 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {ex.status === 'Working' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {ex.status}
                </div>
                <div className="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white/70">
                  {ex.version}
                </div>
              </div>

              {/* Logo/Icon on Banner */}
              <div className="absolute bottom-[-20px] left-8 w-20 h-20 bg-[#121217] rounded-2xl p-1 border border-border shadow-2xl flex items-center justify-center overflow-hidden">
                 <img 
                  src={ex.icon || undefined} 
                  alt={ex.name} 
                  referrerPolicy="no-referrer" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-xl" 
                />
              </div>
            </div>

            <div className="pt-10 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1 group-hover:text-accent transition-colors">{ex.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <User size={14} className="text-zinc-600" />
                    <span>{ex.author}</span>
                  </div>
                </div>
                <a 
                  href={ex.website || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 bg-zinc-900 rounded-xl hover:bg-accent hover:text-white transition-all text-zinc-400 active:scale-90"
                >
                  <ExternalLink size={20} />
                </a>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-2">
                {ex.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <div className="flex gap-2">
                  {ex.platforms.map(p => (
                    <div key={p} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/50 rounded-lg border border-border/50 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                       {p === 'windows' ? <Monitor size={12} /> : <Smartphone size={12} />}
                       {p}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-xs uppercase">
                      <Download size={14} />
                      {ex.downloads}
                    </div>
                  </div>
                  <div className="text-brand font-black text-sm whitespace-nowrap">
                    {ex.price}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
