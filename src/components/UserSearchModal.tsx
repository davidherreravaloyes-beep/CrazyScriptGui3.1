import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, User, Gavel, ExternalLink, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export function UserSearchModal({ isOpen, onClose, onSelectUser }: UserSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('displayName', '>=', searchTerm),
          where('displayName', '<=', searchTerm + '\uf8ff'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(users);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0c] border border-border rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-border bg-zinc-900/30 flex items-center gap-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users by name..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand/50 transition-all font-medium"
                />
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 size={32} className="text-brand animate-spin" />
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Searching Database...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user.id);
                        onClose();
                      }}
                      className="w-full p-4 flex items-center gap-4 bg-zinc-900/30 hover:bg-zinc-900/80 border border-white/5 hover:border-brand/30 rounded-2xl transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-border bg-zinc-800">
                        <img 
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold group-hover:text-brand transition-colors">{user.displayName}</span>
                          {(user.email === 'davidherreravaloyes@gmail.com' || user.email === 'herreravaloyesa@gmail.com') && (
                            <Gavel size={14} className="text-brand" fill="currentColor" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">View Profile & Scripts</p>
                      </div>
                      <ExternalLink size={16} className="text-zinc-600 group-hover:text-brand transition-all" />
                    </button>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="py-20 text-center text-zinc-500 italic">No users found matching "{searchTerm}"</div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center gap-4 grayscale opacity-30">
                  <User size={64} className="text-zinc-500 " />
                  <p className="text-zinc-500 text-sm font-medium">Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
