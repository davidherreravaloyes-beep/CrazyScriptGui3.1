import { useState, type FormEvent, useRef, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { X, Save, Type, User, Globe, Image as ImageIcon, Settings, CheckCircle2, Loader2, AlertCircle, Plus } from 'lucide-react';
import { auth, db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../lib/imageUtils';
import { Executor } from '../constants';

export function EditExecutorModal({ executor, onClose }: { executor: Executor, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'banner' | 'icon' | null>(null);
  const [pastingImage, setPastingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    name: executor.name,
    author: executor.author,
    description: executor.description,
    status: executor.status,
    version: executor.version,
    banner: executor.banner,
    icon: executor.icon,
    price: executor.price,
    website: executor.website || '',
    discord: executor.discord || '',
    unc: executor.unc || ''
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, type: 'banner' | 'icon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      // Compress image before upload
      // Banners: 1200px, Icons: 400px
      const maxWidth = type === 'banner' ? 1200 : 400;
      const compressedBlob = await compressImage(file, maxWidth, 0.8);

      const fileRef = ref(storage, `executors/${type}s/${Date.now()}-${file.name.split('.')[0]}.jpg`);
      await uploadBytes(fileRef, compressedBlob);
      const url = await getDownloadURL(fileRef);
      setFormData(prev => ({ ...prev, [type]: url }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Failed to upload ${type}. Please try again.`);
    } finally {
      setUploading(null);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;

        e.preventDefault();
        setPastingImage(true);
        try {
          const compressedBlob = await compressImage(file, 1200, 0.8);
          const fileRef = ref(storage, `executors/uploads/${Date.now()}-${file.name.replace(/\.[^/.]+$/, "") || "pasted"}.jpg`);
          await uploadBytes(fileRef, compressedBlob);
          const url = await getDownloadURL(fileRef);
          
          const markdownImage = `\n![image](${url})\n`;
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = formData.description;
            const before = text.substring(0, start);
            const after = text.substring(end);
            setFormData(prev => ({ ...prev, description: before + markdownImage + after }));
            
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
          setPastingImage(false);
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      // We use the executor ID as the document ID
      const executorRef = doc(db, 'executors', executor.id);
      await setDoc(executorRef, {
        ...formData,
        id: executor.id,
        platforms: executor.platforms, // Keep existing platforms
        downloads: executor.downloads, // Keep existing downloads
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'executors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0c0c0e] border border-border rounded-[32px] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          {success ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mb-6 neon-glow">
                <CheckCircle2 className="text-brand" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Executor Updated!</h2>
              <p className="text-zinc-500">Changes have been saved to the database.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-brand/10 rounded-2xl text-brand">
                  <Settings size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Executor</h2>
                  <p className="text-sm text-zinc-500">Modify {executor.name} details and images.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Images Upload */}
                <div className="space-y-6">
                  <div className="bg-[#121217] p-6 rounded-3xl border border-border/50">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <ImageIcon size={14} /> Banner & Icon
                    </label>
                    <div className="flex flex-col gap-6">
                      {/* Banner */}
                      <div className="space-y-3">
                        <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-border group bg-black/50">
                          <img src={formData.banner || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-60" alt="Banner preview" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-all">
                            {uploading === 'banner' ? (
                              <Loader2 className="animate-spin text-brand" size={24} />
                            ) : (
                              <button 
                                type="button"
                                onClick={() => bannerInputRef.current?.click()}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold hover:bg-white/10 transition-all"
                              >
                                Change Banner
                              </button>
                            )}
                          </div>
                          <input ref={bannerInputRef} type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'banner')} />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-black/30 border border-border rounded-xl px-4 py-2 text-white text-xs focus:border-brand/50 outline-none transition-colors"
                          placeholder="Banner URL..."
                          value={formData.banner}
                          onChange={e => setFormData({ ...formData, banner: e.target.value })}
                        />
                      </div>

                      {/* Icon */}
                      <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border group shrink-0 bg-black/50">
                          <img src={formData.icon || undefined} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Icon preview" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100">
                            {uploading === 'icon' ? (
                              <Loader2 className="animate-spin text-brand" size={20} />
                            ) : (
                              <button 
                                type="button"
                                onClick={() => iconInputRef.current?.click()}
                                className="p-2 bg-white/5 rounded-full text-white"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                          <input ref={iconInputRef} type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'icon')} />
                        </div>
                        <div className="flex-1 space-y-2">
                           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Icon URL</label>
                           <input
                            type="text"
                            className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 text-white text-xs focus:border-brand/50 outline-none transition-colors"
                            placeholder="Icon URL..."
                            value={formData.icon}
                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Type size={14} /> Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} /> Author
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                      value={formData.author}
                      onChange={e => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={14} /> Description <span className="text-brand/50 lowercase ml-auto">(Paste images supported)</span>
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={3}
                      ref={textareaRef}
                      className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-zinc-300 text-sm focus:border-brand/50 outline-none transition-colors resize-none"
                      value={formData.description}
                      onPaste={handlePaste}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                    {pastingImage && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-border rounded-lg shadow-xl">
                          <Loader2 className="animate-spin text-brand" size={16} />
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Uploading Image...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={14} /> Status
                    </label>
                    <select
                      className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors appearance-none"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Working">Working</option>
                      <option value="Outdated">Outdated</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Version</label>
                    <input
                      type="text"
                      className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                      value={formData.version}
                      onChange={e => setFormData({ ...formData, version: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Price</label>
                    <input
                      type="text"
                      className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !!uploading}
                  className="w-full py-4 bg-brand text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-muted transition-all active:scale-95 disabled:opacity-50 neon-glow"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
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
