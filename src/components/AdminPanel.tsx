import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { db, auth, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../lib/imageUtils';
import { Shield, Users, FileText, Trash2, Check, X, AlertCircle, Palette, Save, Loader2, Plus, Gem } from 'lucide-react';

export function AdminPanel({ onEditScript }: { onEditScript?: (script: any) => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scripts, setScripts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'scripts' | 'users' | 'branding'>('scripts');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [siteConfig, setSiteConfig] = useState({
    name: 'CrazyGui',
    brand: 'scripts',
    logo: '',
    brandColor: '#8B5CF6',
    heroTitle: 'Enhance Your Experience with Premium Gaming Scripts',
    heroSubtitle: 'Explore thousands of verified, high-performance scripts and GUIs for your favorite games. Zero malware, 100% efficiency.',
    heroBadge: 'V3.0 IS NOW LIVE',
    footerText: 'The #1 platform for verified gaming scripts and executors.',
    discordLink: 'https://discord.gg/5PSyhpvTn',
    splashText: 'CrazyGuiscripts',
    splashOwner: 'D4vidskys',
    twitterLink: '',
    githubLink: '',
    featuredTitle: 'Featured Scripts',
    uploadTitle: 'Upload your own scripts',
    uploadSubtitle: 'Join 1,200+ developers sharing their creations with the largest community of script-users. Get verified today.',
    premiumTitle: 'Premium Scripts',
    premiumSubtitle: 'Get access to undetected, high-performance private scripts.'
  });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    // Load site config
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteConfig(docSnap.data() as any);
      }
    });

    const checkAdmin = async () => {
      if (!auth.currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Bootstrap admin by email
      if (auth.currentUser.email === 'davidherreravaloyes@gmail.com' || auth.currentUser.email === 'herreravaloyesa@gmail.com') {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `admins/${auth.currentUser.uid}`);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdmin();
    return () => unsubscribeConfig();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'scripts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScripts(docs);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      // Compress logo before upload (max 400px)
      const compressedBlob = await compressImage(file, 400, 0.8);
      
      const fileRef = ref(storage, `config/logo-${Date.now()}.jpg`);
      await uploadBytes(fileRef, compressedBlob);
      const url = await getDownloadURL(fileRef);
      setSiteConfig(prev => ({ ...prev, logo: url }));
    } catch (error) {
      console.error("Logo upload failed:", error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteScript = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this script?")) return;
    try {
      await deleteDoc(doc(db, 'scripts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `scripts/${id}`);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await setDoc(doc(db, 'config', 'site'), siteConfig);
      alert("Settings saved successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'config/site');
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-32 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="text-red-500" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-400 mb-8">You need administrator privileges to view this page.</p>
        <div className="bg-[#121217] border border-border rounded-xl p-4 text-left">
           <div className="flex gap-3 text-sm text-zinc-500">
             <AlertCircle size={16} className="shrink-0" />
             <p>If you are the owner, add your UID ({auth.currentUser?.uid || 'Not Logged In'}) to the 'admins' collection in Firestore.</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center neon-glow">
          <Shield className="text-black" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-zinc-500 font-medium">Manage scripts, users, and content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('scripts')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'scripts' ? 'bg-brand text-black' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <FileText size={20} />
            Scripts ({scripts.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-brand text-black' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Users size={20} />
            Users
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'branding' ? 'bg-brand text-black' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Palette size={20} />
            Branding
          </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'scripts' && (
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-white/[0.02]">
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Script</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Author</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {scripts.map((script) => (
                      <tr key={script.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="font-bold text-white">{script.title}</div>
                             {script.isPremium && (
                               <Gem size={12} className="text-brand" fill="currentColor" />
                             )}
                          </div>
                          <div className="text-xs text-zinc-500">{script.game}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-zinc-400 font-medium">@{script.author || 'Anonymous'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{script.category}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {script.updatedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => onEditScript?.(script)}
                               className="p-2 text-zinc-600 hover:text-brand transition-colors"
                             >
                               <Shield size={18} />
                             </button>
                             <button 
                               onClick={() => handleDeleteScript(script.id)}
                               className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                             >
                               <Trash2 size={18} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

                  {activeTab === 'branding' && (
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-brand/10 rounded-2xl text-brand">
                  <Palette size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Appearance & Branding</h3>
                  <p className="text-sm text-zinc-500">Customize site name, logo, and theme.</p>
                </div>
              </div>

              <div className="space-y-8 max-w-2xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Main Name</label>
                        <input 
                          type="text" 
                          value={siteConfig.name}
                          onChange={e => setSiteConfig({...siteConfig, name: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Accent Name</label>
                        <input 
                          type="text" 
                          value={siteConfig.brand}
                          onChange={e => setSiteConfig({...siteConfig, brand: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                        />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Discord Link</label>
                    <input 
                      type="text" 
                      value={siteConfig.discordLink}
                      onChange={e => setSiteConfig({...siteConfig, discordLink: e.target.value})}
                      className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                    />
                 </div>

                 <div className="h-px bg-border/50" />

                 <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white">Hero Section Content</h4>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hero Badge</label>
                        <input 
                          type="text" 
                          value={siteConfig.heroBadge}
                          onChange={e => setSiteConfig({...siteConfig, heroBadge: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hero Headline</label>
                        <textarea 
                          rows={3}
                          value={siteConfig.heroTitle}
                          onChange={e => setSiteConfig({...siteConfig, heroTitle: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors resize-none"
                        />
                        <p className="text-[10px] text-zinc-500 italic">Tip: Use &lt;br /&gt; for line breaks.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Hero Subheadline</label>
                        <textarea 
                          rows={3}
                          value={siteConfig.heroSubtitle}
                          onChange={e => setSiteConfig({...siteConfig, heroSubtitle: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors resize-none"
                        />
                    </div>
                 </div>

                 <div className="h-px bg-border/50" />

                 <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white">Splash Screen Animation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Splash Main Title</label>
                            <input 
                              type="text" 
                              value={siteConfig.splashText || ''}
                              onChange={e => setSiteConfig({...siteConfig, splashText: e.target.value})}
                              className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                              placeholder="e.g. CrazyGuiscripts"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Splash Owner Name</label>
                            <input 
                              type="text" 
                              value={siteConfig.splashOwner || ''}
                              onChange={e => setSiteConfig({...siteConfig, splashOwner: e.target.value})}
                              className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                              placeholder="e.g. D4vidskys"
                            />
                        </div>
                    </div>
                 </div>

                 <div className="h-px bg-border/50" />

                 <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white">Footer & Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Twitter Link</label>
                            <input 
                              type="text" 
                              value={siteConfig.twitterLink || ''}
                              onChange={e => setSiteConfig({...siteConfig, twitterLink: e.target.value})}
                              className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Github Link</label>
                            <input 
                              type="text" 
                              value={siteConfig.githubLink || ''}
                              onChange={e => setSiteConfig({...siteConfig, githubLink: e.target.value})}
                              className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Footer Bio</label>
                        <textarea 
                          rows={2}
                          value={siteConfig.footerText}
                          onChange={e => setSiteConfig({...siteConfig, footerText: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors resize-none"
                        />
                    </div>
                 </div>

                 <div className="h-px bg-border/50" />

                 <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white">Home Page Sections</h4>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Featured Section Title</label>
                        <input 
                          type="text" 
                          value={siteConfig.featuredTitle || 'Featured Scripts'}
                          onChange={e => setSiteConfig({...siteConfig, featuredTitle: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Upload CTA Title</label>
                        <input 
                          type="text" 
                          value={siteConfig.uploadTitle || 'Upload your own scripts'}
                          onChange={e => setSiteConfig({...siteConfig, uploadTitle: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Upload CTA Subtitle</label>
                        <textarea 
                          rows={2}
                          value={siteConfig.uploadSubtitle || ''}
                          onChange={e => setSiteConfig({...siteConfig, uploadSubtitle: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors resize-none"
                        />
                    </div>

                    <div className="h-px bg-border/50" />
                    
                    <h4 className="text-lg font-bold text-white">Premium Section</h4>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Premium Title</label>
                        <input 
                          type="text" 
                          value={siteConfig.premiumTitle || ''}
                          onChange={e => setSiteConfig({...siteConfig, premiumTitle: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Premium Subtitle</label>
                        <textarea 
                          rows={2}
                          value={siteConfig.premiumSubtitle || ''}
                          onChange={e => setSiteConfig({...siteConfig, premiumSubtitle: e.target.value})}
                          className="w-full bg-[#121217] border border-border rounded-xl px-4 py-3 text-white focus:border-brand/50 outline-none transition-colors resize-none"
                        />
                    </div>
                 </div>

                 <div className="h-px bg-border/50" />

                 <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Logo Appearance</label>
                    <div className="flex items-center gap-6 p-6 bg-[#121217] rounded-3xl border border-border/50">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/40 border border-border group shrink-0 flex items-center justify-center">
                        {siteConfig.logo ? (
                          <img 
                            src={siteConfig.logo || undefined} 
                            alt="Logo preview" 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain" 
                          />
                        ) : (
                          <Palette className="text-zinc-700" size={32} />
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           {uploadingLogo ? (
                             <Loader2 className="animate-spin text-brand" size={24} />
                           ) : (
                             <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/10 rounded-full text-white">
                               <Plus size={20} />
                             </button>
                           )}
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <input 
                          type="text" 
                          value={siteConfig.logo}
                          onChange={e => setSiteConfig({...siteConfig, logo: e.target.value})}
                          className="w-full bg-black/30 border border-border rounded-xl px-4 py-2 text-white text-xs focus:border-brand/50 outline-none transition-colors"
                          placeholder="Or paste Logo URL..."
                        />
                        <p className="text-[10px] text-zinc-500">Square images with transparent backgrounds work best.</p>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Theme Color</label>
                    <div className="flex items-center gap-4 p-6 bg-[#121217] rounded-3xl border border-border/50">
                      <div 
                        className="w-12 h-12 rounded-xl shadow-lg shrink-0 border border-white/10" 
                        style={{ backgroundColor: siteConfig.brandColor }}
                      />
                      <div className="flex-1 space-y-2">
                        <input 
                          type="color" 
                          value={siteConfig.brandColor}
                          onChange={e => setSiteConfig({...siteConfig, brandColor: e.target.value})}
                          className="w-full h-10 bg-black/30 border border-border rounded-lg px-1 py-1 cursor-pointer focus:border-brand/50 transition-colors"
                        />
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={siteConfig.brandColor}
                            onChange={e => setSiteConfig({...siteConfig, brandColor: e.target.value})}
                            className="bg-transparent border-none text-xs text-zinc-400 font-mono focus:outline-none w-20"
                            placeholder="#000000"
                          />
                          <span className="text-[10px] text-zinc-600 uppercase font-bold">Hex Code</span>
                        </div>
                      </div>
                    </div>
                 </div>

                 <button 
                  onClick={handleSaveConfig}
                  disabled={savingConfig || uploadingLogo}
                  className="px-8 py-4 bg-brand text-black font-black rounded-2xl flex items-center gap-2 hover:bg-brand-muted transition-all active:scale-95 disabled:opacity-50 neon-glow"
                 >
                    {savingConfig ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Branding Settings
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-card border border-border rounded-3xl p-12 text-center">
              <Users size={48} className="text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
              <p className="text-zinc-500">Feature coming soon. Direct Firestore access is recommended for now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
