import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Camera, Check, Loader2, Gavel, Upload } from 'lucide-react';
import { auth, updateProfile, db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin?: boolean;
}

export function ProfileModal({ isOpen, onClose, user, isAdmin }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isOpen]);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setPhotoURL(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Make sure you have permission to upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName,
          photoURL: photoURL
        });

        // Also update Firestore users collection
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: displayName,
          photoURL: photoURL,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Update profile failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 pb-12 overflow-y-auto custom-scrollbar">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-md bg-[#0a0a0c] border border-brand/30 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] my-auto"
          >
            {/* Cyberpunk accent lines */}
            <div className="absolute top-0 left-0 w-24 h-1 bg-brand" />
            <div className="absolute top-0 right-0 w-12 h-1 bg-brand/50" />
            
            <div className="p-6 border-b border-border flex items-center justify-between bg-zinc-900/50">
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase italic tracking-tighter">
                  <User size={20} className="text-brand drop-shadow-[0_0_8px_#a855f7]" />
                  User Profile
                </h2>
                {isAdmin && (
                  <span className="text-[10px] text-brand font-black uppercase tracking-[0.2em] flex items-center gap-1 mt-1">
                    <Gavel size={10} /> Authorized Access
                  </span>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5 hover:border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-8">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-zinc-800 p-1 bg-gradient-to-tr from-brand to-purple-600 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 relative">
                      {photoURL ? (
                        <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <User size={48} />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                      >
                        <Camera size={28} className="text-brand mb-1" />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Change Photo</span>
                      </div>
                    </div>
                    
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <Loader2 size={32} className="text-brand animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  {/* Decorative corner */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0a0a0c] rotate-45 border-t border-l border-brand/50" />
                </div>
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white hover:border-brand/40 transition-all flex items-center gap-2 group"
                >
                  <Upload size={14} className="group-hover:text-brand transition-colors" /> 
                  Upload Local File
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Display Name</label>
                    <span className="text-[10px] text-zinc-700 font-mono">ID: {user?.uid?.slice(0, 8)}...</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-brand/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="relative w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand/50 transition-all font-medium placeholder:text-zinc-700"
                      placeholder="Your unique handle"
                      required
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand transition-colors">
                      <User size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Current Photo Identity</label>
                  <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 font-mono text-[10px] text-zinc-500 break-all leading-relaxed">
                    {photoURL || 'No photo data available'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-zinc-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || success || uploading}
                  className="flex-[2] py-4 bg-brand text-black font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-muted transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 neon-glow"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : success ? (
                    <>
                      <Check size={18} />
                      Sync Complete
                    </>
                  ) : (
                    'Update Protocol'
                  )}
                </button>
              </div>
            </form>
            
            {/* Bottom Cyberpunk Footer */}
            <div className="px-8 py-3 bg-brand/5 border-t border-brand/10">
              <p className="text-[8px] text-zinc-600 font-mono text-center uppercase tracking-[0.3em]">
                System Status: Online // User Identity Encrypted
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
