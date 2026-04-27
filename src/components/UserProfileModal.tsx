import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Gavel, Calendar, FileText, Heart, Star, ExternalLink, Gamepad2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
  const [userData, setUserData] = useState<any>(null);
  const [privateEmail, setPrivateEmail] = useState<string | null>(null);
  const [userScripts, setUserScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }

          // Try to fetch private email if authorized
          try {
            const emailDoc = await getDoc(doc(db, 'users', userId, 'private', 'email'));
            if (emailDoc.exists()) {
              setPrivateEmail(emailDoc.data().email);
            }
          } catch (e) {
            // Probably not authorized, which is fine
          }

          const q = query(collection(db, 'scripts'), where('authorId', '==', userId));
          const querySnapshot = await getDocs(q);
          const scripts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserScripts(scripts);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${userId}`);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [isOpen, userId]);

  const isAdmin = userData?.uid === 'davidherreravaloyes' || userId === 'davidherreravaloyes' || privateEmail === 'davidherreravaloyes@gmail.com' || privateEmail === 'herreravaloyesa@gmail.com';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-2xl bg-[#0a0a0c] border border-border rounded-[32px] overflow-hidden shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white transition-colors z-10">
              <X size={24} />
            </button>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : userData ? (
              <div className="flex flex-col">
                {/* Header/Cover */}
                <div className="h-32 bg-gradient-to-r from-brand/20 to-purple-900/20 relative" />
                
                <div className="px-8 pb-8 -mt-12 relative flex flex-col items-center sm:items-start">
                  <div className="w-24 h-24 rounded-full border-4 border-[#0a0a0c] overflow-hidden bg-zinc-900 shadow-xl">
                    <img src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.displayName}`} alt={userData.displayName} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-3xl font-black text-white italic">{userData.displayName}</h2>
                        {isAdmin && <Gavel size={20} className="text-brand" fill="currentColor" />}
                      </div>
                      <p className="text-zinc-500 text-sm flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <Calendar size={14} /> Joined {new Date(userData.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-3 justify-center">
                      <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <div className="text-xl font-bold text-white">{userScripts.length}</div>
                        <div className="text-[10px] text-zinc-500 uppercase font-black">Scripts</div>
                      </div>
                      <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <div className="text-xl font-bold text-white">
                          {userScripts.reduce((acc, s) => acc + (s.likes || 0), 0)}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase font-black">Likes</div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-border my-8" />

                  <div className="w-full">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-6 uppercase tracking-widest text-sm">
                      <FileText size={18} className="text-brand" />
                      Published Scripts
                    </h3>

                    {userScripts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {userScripts.map(script => (
                          <div key={script.id} className="p-4 bg-zinc-900/50 border border-border rounded-2xl hover:border-brand/30 transition-colors group">
                            <h4 className="text-white font-bold truncate mb-2">{script.title}</h4>
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                              <span className="flex items-center gap-1"><Gamepad2 size={12} /> {script.game}</span>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-brand"><Heart size={12} /> {script.likes || 0}</span>
                                <span className="flex items-center gap-1 text-yellow-500"><Star size={12} fill="currentColor" /> {script.rating || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-zinc-900/30 rounded-3xl border border-dashed border-border text-zinc-500 italic">
                        No scripts published yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center text-zinc-500 italic">User not found</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
