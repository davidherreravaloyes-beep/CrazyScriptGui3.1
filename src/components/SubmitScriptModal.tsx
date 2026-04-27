import { useState, useEffect, type FormEvent, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Terminal, Code, Type, Gamepad2, Layers, CheckCircle2, Loader2, Image as ImageIcon, Plus, Gem, TreePine, Target, Sword, Cloud, Globe, Leaf, Zap, Skull, Shield, Search, Lock, Key, Ghost, Flame, Star, Heart } from 'lucide-react';
import { auth, db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../lib/imageUtils';
import { CATEGORIES, Script } from '../constants';
import { cn } from '../lib/utils';

const AVAILABLE_ICONS = [
  { name: 'TreePine', Icon: TreePine },
  { name: 'Target', Icon: Target },
  { name: 'Sword', Icon: Sword },
  { name: 'Cloud', Icon: Cloud },
  { name: 'Globe', Icon: Globe },
  { name: 'Leaf', Icon: Leaf },
  { name: 'Zap', Icon: Zap },
  { name: 'Skull', Icon: Skull },
  { name: 'Shield', Icon: Shield },
  { name: 'Search', Icon: Search },
  { name: 'Lock', Icon: Lock },
  { name: 'Key', Icon: Key },
  { name: 'Ghost', Icon: Ghost },
  { name: 'Gamepad2', Icon: Gamepad2 },
  { name: 'Flame', Icon: Flame }
];

export function SubmitScriptModal({ onClose, editScript, isAdmin }: { onClose: () => void, editScript?: Script, isAdmin?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pastingField, setPastingField] = useState<'rawScript' | 'description' | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
    category: 'Universal',
    rawScript: '',
    thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=800&auto=format&fit=crop&q=60',
    isPremium: false,
    iconName: ''
  });

  useEffect(() => {
    if (editScript) {
      setFormData({
        title: editScript.title || '',
        description: editScript.description || '',
        game: editScript.game || '',
        category: editScript.category || 'Universal',
        rawScript: editScript.rawScript || '',
        thumbnail: editScript.thumbnail || 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=800&auto=format&fit=crop&q=60',
        isNew: !!editScript.isNew,
        isTrending: !!editScript.isTrending,
        isPremium: !!editScript.isPremium,
        iconName: editScript.iconName || 'Gamepad2'
      } as any);
    }
  }, [editScript]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress image before upload (max 800px for thumbnails)
      const compressedBlob = await compressImage(file, 800, 0.8);
      
      const fileRef = ref(storage, `scripts/${Date.now()}-${file.name.split('.')[0]}.jpg`);
      await uploadBytes(fileRef, compressedBlob);
      const url = await getDownloadURL(fileRef);
      setFormData(prev => ({ ...prev, thumbnail: url }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent, field: 'rawScript' | 'description') => {
    if (!isAdmin) return;
    
    const items = e.clipboardData.items;
    let imageFound = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;

        e.preventDefault();
        imageFound = true;
        setPastingField(field);
        try {
          const compressedBlob = await compressImage(file, 1200, 0.8);
          const path = field === 'rawScript' ? 'scripts/uploads' : 'descriptions/uploads';
          const fileRef = ref(storage, `${path}/${Date.now()}-${file.name.replace(/\.[^/.]+$/, "") || "pasted"}.jpg`);
          await uploadBytes(fileRef, compressedBlob);
          const url = await getDownloadURL(fileRef);
          
          const markdownImage = `\n![image](${url})\n`;
          const textarea = field === 'rawScript' ? scriptTextareaRef.current : descTextareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = formData[field];
            const before = text.substring(0, start);
            const after = text.substring(end);
            setFormData(prev => ({ ...prev, [field]: before + markdownImage + after }));
            
            // Set cursor position after the image
            setTimeout(() => {
              textarea.focus();
              const newPos = start + markdownImage.length;
              textarea.setSelectionRange(newPos, newPos);
            }, 0);
          }
        } catch (error) {
          console.error("Paste upload failed:", error);
          alert("Failed to upload pasted image.");
        } finally {
          setPastingField(null);
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("You must be signed in to publish scripts.");
      return;
    }
    
    if (!formData.iconName) {
      alert("Please select an icon for your script.");
      return;
    }
    
    setLoading(true);
    try {
      const author = auth.currentUser.displayName || 'Anonymous';
      const authorId = auth.currentUser.uid;

      if (editScript) {
        const scriptRef = doc(db, 'scripts', editScript.id);
        await setDoc(scriptRef, {
          ...formData,
          author: editScript.author || author,
          authorId: editScript.authorId || authorId,
          updatedAt: 'Just now'
        }, { merge: true });
      } else {
        await addDoc(collection(db, 'scripts'), {
          ...formData,
          author,
          authorId,
          views: 0,
          likes: 0,
          isNew: true,
          updatedAt: 'Just now',
          createdAt: serverTimestamp()
        });
      }
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      handleFirestoreError(error, editScript ? OperationType.UPDATE : OperationType.CREATE, 'scripts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-card border border-border rounded-[32px] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12">
          {success ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mb-6 neon-glow">
                <CheckCircle2 className="text-brand" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{editScript ? 'Updated!' : 'Uploaded!'}</h2>
              <p className="text-zinc-500">{editScript ? 'Changes saved successfully.' : 'Your script is now live for the community to see.'}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-brand/10 rounded-2xl text-brand group-hover:neon-glow">
                  {editScript ? <Code size={24} /> : <Upload size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{editScript ? 'Edit Script' : 'Submit New Script'}</h2>
                  <p className="text-sm text-zinc-500">{editScript ? 'Update script details and content.' : 'Share your creation with thousands of gamers.'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Preview & Upload */}
                <div className="flex flex-col md:flex-row gap-6 items-center bg-zinc-900/50 p-6 rounded-3xl border border-border/50">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-brand/20 group">
                    <img 
                      src={formData.thumbnail || undefined} 
                      alt="Preview" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="text-brand animate-spin" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <h4 className="text-white font-bold mb-1">Thumbnail Image</h4>
                      <p className="text-zinc-500 text-xs text-pretty">Choose an image from your files or provide a direct URL below.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/20 text-brand rounded-xl hover:bg-brand/20 transition-all text-xs font-bold"
                      >
                        <Plus size={14} />
                        Upload File
                      </button>
                      <div className="relative flex-1 min-w-[200px]">
                        <input
                          type="text"
                          className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-2 text-white text-xs focus:border-brand/50 outline-none transition-colors"
                          placeholder="Or paste image URL..."
                          value={formData.thumbnail}
                          onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Type size={14} /> Title
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                      placeholder="e.g. God Mode V2"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Gamepad2 size={14} /> Game
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                      placeholder="e.g. Blox Fruits"
                      value={formData.game}
                      onChange={e => setFormData({ ...formData, game: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} /> Category
                  </label>
                  <select
                    className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Star size={14} /> Choose Script Icon
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                    {AVAILABLE_ICONS.map(({ name, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData({ ...formData, iconName: name })}
                        className={cn(
                          "w-full aspect-square flex items-center justify-center rounded-xl border transition-all",
                          formData.iconName === name 
                            ? "bg-brand/20 border-brand text-brand ring-2 ring-brand/20" 
                            : "bg-zinc-900 border-border text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        )}
                      >
                        <Icon size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex flex-wrap gap-6 p-4 bg-brand/5 border border-brand/10 rounded-2xl">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-border bg-zinc-900 text-brand focus:ring-brand" 
                        checked={!!(formData as any).isNew}
                        onChange={e => setFormData({ ...formData, isNew: e.target.checked } as any)}
                      />
                      <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">Mark as New</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-border bg-zinc-900 text-brand focus:ring-brand" 
                        checked={!!(formData as any).isTrending}
                        onChange={e => setFormData({ ...formData, isTrending: e.target.checked } as any)}
                      />
                      <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">Mark as Trending</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-border bg-zinc-900 text-brand focus:ring-brand" 
                        checked={!!(formData as any).isPremium}
                        onChange={e => setFormData({ ...formData, isPremium: e.target.checked } as any)}
                      />
                      <span className="text-sm font-bold text-brand group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                        <Gem size={14} fill="currentColor" /> Premium Script
                      </span>
                    </label>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Type size={14} /> Description {isAdmin && <span className="text-brand/50 lowercase ml-auto">(Admin: Paste images allowed)</span>}
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={3}
                      ref={descTextareaRef}
                      className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-zinc-300 text-sm focus:border-brand/50 outline-none transition-colors resize-none"
                      placeholder="Give a brief overview of what this script does..."
                      value={formData.description}
                      onPaste={e => handlePaste(e, 'description')}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                    {pastingField === 'description' && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-border rounded-lg shadow-xl">
                          <Loader2 className="animate-spin text-brand" size={16} />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Uploading Image...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Code size={14} /> Script Source {isAdmin && <span className="text-brand/50 lowercase ml-auto">(Admin: Paste images allowed)</span>}
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={5}
                      ref={scriptTextareaRef}
                      className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs focus:border-brand/50 outline-none transition-colors resize-none"
                      placeholder="Paste your loadstring or code here..."
                      value={formData.rawScript}
                      onPaste={e => handlePaste(e, 'rawScript')}
                      onChange={e => setFormData({ ...formData, rawScript: e.target.value })}
                    />
                    {pastingField === 'rawScript' && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-border rounded-lg shadow-xl">
                          <Loader2 className="animate-spin text-brand" size={16} />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Uploading Image...</span>
                        </div>
                      </div>
                    )}
                  </div>

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full py-4 bg-brand text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-muted transition-all active:scale-95 disabled:opacity-50 neon-glow"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {editScript ? <CheckCircle2 size={20} /> : <Terminal size={20} />}
                      {editScript ? 'Save Changes' : 'Publish Script'}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
