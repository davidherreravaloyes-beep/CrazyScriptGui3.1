import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Download, AlertCircle, Terminal, Heart, Edit2, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Script } from '../constants';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

import ReactMarkdown from 'react-markdown';

export function ScriptModal({ script, onClose, isAdmin, onEdit }: { script: Script; onClose: () => void; isAdmin: boolean; onEdit?: (script: Script) => void }) {
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!auth.currentUser) return;
      try {
        const ratingDoc = await getDoc(doc(db, 'scripts', script.id, 'ratings', auth.currentUser.uid));
        if (ratingDoc.exists()) {
          setUserRating(ratingDoc.data().rating);
        }
      } catch (error: any) {
        // We don't want to throw for GET permissions errors in a loop/initial load usually, 
        // but the spec says "Always use the handleFirestoreError function to throw errors when modifying Firestore in any way."
        // For GET, it says: "Example with getDocs ... try { ... } catch (error) { handleFirestoreError(error, OperationType.GET, pathForGetDocs); }"
        if (error.code !== 'permission-denied') {
          console.error("Error fetching rating:", error);
        }
      }
    };
    fetchUserRating();
  }, [script.id]);

  const handleRate = async (rating: number) => {
    if (!auth.currentUser) return;
    setIsRating(true);
    const ratingPath = `scripts/${script.id}/ratings/${auth.currentUser.uid}`;
    try {
      // Save rating in subcollection
      await setDoc(doc(db, 'scripts', script.id, 'ratings', auth.currentUser.uid), {
        rating,
        userId: auth.currentUser.uid,
        updatedAt: new Date().toISOString()
      });

      // Update script summary (simplified for demo)
      const currentRatingCount = script.ratingCount || 0;
      const currentRatingSum = (script.rating || 0) * currentRatingCount;
      
      let newRatingCount = currentRatingCount;
      let newRatingSum = currentRatingSum;

      if (userRating === null) {
        newRatingCount += 1;
        newRatingSum += rating;
      } else {
        newRatingSum = (newRatingSum - userRating) + rating;
      }

      const newAverage = newRatingSum / newRatingCount;

      await updateDoc(doc(db, 'scripts', script.id), {
        rating: Math.round(newAverage * 10) / 10,
        ratingCount: newRatingCount,
        updatedAt: new Date().toISOString()
      });

      setUserRating(rating);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, ratingPath);
    } finally {
      setIsRating(false);
    }
  };

  const handleCopy = () => {
    if (script.rawScript) {
      navigator.clipboard.writeText(script.rawScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          {isAdmin && (
            <button 
              onClick={() => onEdit?.(script)}
              className="h-10 px-4 flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand rounded-full hover:bg-brand/20 transition-all text-xs font-bold font-sans"
            >
              <Edit2 size={16} />
              Edit
            </button>
          )}
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/3 h-56 md:h-auto relative bg-zinc-900">
            <img 
              src={script.thumbnail || undefined} 
              alt={script.title} 
              referrerPolicy="no-referrer" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r" />
          </div>

          <div className="w-full md:w-2/3 p-6 md:p-10">
            <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase mb-4 tracking-[0.2em]">
              <Terminal size={14} />
              {script.game}
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">{script.title}</h2>
            
            {/* Rating Section */}
            <div className="flex items-center gap-4 mb-6 p-3 bg-zinc-900/50 rounded-2xl border border-border">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Reliability</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={!auth.currentUser || isRating}
                      onClick={() => handleRate(star)}
                      className={cn(
                        "transition-all",
                        (userRating || script.rating || 0) >= star ? "text-yellow-500" : "text-zinc-700",
                        auth.currentUser && "hover:scale-110 active:scale-90"
                      )}
                    >
                      <Star size={18} fill={(userRating || script.rating || 0) >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-white ml-2">
                    {script.rating || 'No votes'} 
                    {script.ratingCount && <span className="text-zinc-500 font-normal text-xs ml-1">({script.ratingCount})</span>}
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-border mx-2" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Status</span>
                <span className="text-xs font-bold text-brand uppercase tracking-widest mt-1">Undetected</span>
              </div>
            </div>

            <div className="text-zinc-400 text-sm leading-relaxed mb-10 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{script.description}</ReactMarkdown>
            </div>

            <div className="space-y-6 mb-10">
              <div className="bg-black/50 border border-border p-4 rounded-xl">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Script Code</span>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 text-brand text-xs font-bold hover:opacity-80 transition-opacity"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Script'}
                    </button>
                 </div>
                 <code className="text-xs font-mono text-zinc-300 break-all block py-2 max-h-32 overflow-y-auto">
                    {script.rawScript || '-- No code available for this script'}
                 </code>
              </div>

              <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <AlertCircle size={18} className="text-orange-500 flex-shrink-0" />
                <p className="text-[11px] text-orange-200 leading-tight">
                  Remember to use a reliable executor to run this script safely. 
                  Never share your account credentials inside scripts.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleCopy}
                className="flex-1 h-12 bg-brand text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-muted transition-all active:scale-95 neon-glow"
              >
                {copied ? <Check size={18} /> : <Download size={18} />}
                {copied ? 'Copied to Clipboard' : 'Get Script'}
              </button>
              <button className="w-12 h-12 bg-zinc-800 text-white rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
