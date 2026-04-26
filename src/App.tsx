/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SplashScreen } from './components/SplashScreen';
import { Hero } from './components/Hero';
import { ScriptCard, FilterBar } from './components/ScriptGrid';
import { ActivityFeed } from './components/ActivityFeed';
import { ScriptModal } from './components/ScriptModal';
import { SubmitScriptModal } from './components/SubmitScriptModal';
import { Executors } from './components/Executors';
import { AdminPanel } from './components/AdminPanel';
import { LoginView } from './components/LoginView';
import { Footer } from './components/Footer';
import { MusicPlayer } from './components/MusicPlayer';
import { MOCK_SCRIPTS, CATEGORIES, Script } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Star, Trophy, Loader2, Gem } from 'lucide-react';
import { db, auth, onAuthStateChanged, type User, handleFirestoreError, OperationType, syncUserProfile } from './lib/firebase';
import { collection, onSnapshot, query, orderBy, getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfileModal } from './components/UserProfileModal';
import { UserSearchModal } from './components/UserSearchModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'scripts' | 'executors' | 'admin' | 'login'>('scripts');
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [firestoreScripts, setFirestoreScripts] = useState<Script[]>([]);
  const [externalScripts, setExternalScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);

  useEffect(() => {
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        const config = docSnap.data();
        setSiteConfig(config);
        if (config.brandColor) {
          const root = document.documentElement;
          root.style.setProperty('--color-brand', config.brandColor);
          root.style.setProperty('--color-accent', config.brandColor);
          
          root.style.setProperty('--color-brand-muted', config.brandColor + 'cc');
          root.style.setProperty('--color-brand-dark', config.brandColor + '99');
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'config/site');
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user profile to Firestore for searchability
        syncUserProfile(currentUser);

        if (currentUser.email === 'davidherreravaloyes@gmail.com' || currentUser.email === 'herreravaloyesa@gmail.com') {
          setIsAdmin(true);
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminDoc.exists());
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `admins/${currentUser.uid}`);
            setIsAdmin(false);
          }
        }
        if (currentPage === 'login') {
          setCurrentPage('scripts');
        }
      } else {
        setIsAdmin(false);
      }
    });

    const q = query(collection(db, 'scripts'), orderBy('createdAt', 'desc'));
    const unsubscribeScripts = onSnapshot(q, (snapshot) => {
      const scripts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Script[];
      setFirestoreScripts(scripts);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scripts');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeScripts();
      unsubscribeConfig();
    };
  }, [currentPage]);

  useEffect(() => {
    const syncExternalScripts = async () => {
      try {
        const response = await fetch('/api/rscripts/sync');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setExternalScripts(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const newScripts = data.filter((s: any) => !existingIds.has(s.id));
              return [...prev, ...newScripts];
            });
          }
        }
      } catch (err) {
        console.error("External sync error:", err);
      }
    };
    syncExternalScripts();
  }, []);

  const allScripts = useMemo(() => {
    // Combine mock data with real firestore data and external scripts
    return [...firestoreScripts, ...externalScripts, ...MOCK_SCRIPTS].reduce((acc: Script[], current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
  }, [firestoreScripts, externalScripts]);

  const filteredScripts = useMemo(() => {
    return allScripts.filter(script => {
      const isActuallyPremium = script.isPremium;
      const matchesCategory = selectedCategory === 'All' || script.category === selectedCategory;
      const matchesSearch = script.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           script.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           script.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && !isActuallyPremium;
    });
  }, [selectedCategory, searchQuery, allScripts]);

  const handleEditScript = (script: Script) => {
    setEditingScript(script);
    setSelectedScript(null);
  };

  const closeModals = () => {
    setIsSubmitModalOpen(false);
    setEditingScript(null);
    setSelectedScript(null);
  };

  const handleSplashComplete = useMemo(() => () => setShowSplash(false), []);

  return (
    <div className="min-h-screen bg-background selection:bg-brand/30 selection:text-brand">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <MusicPlayer />

      {currentPage === 'login' ? (
        <LoginView onBack={() => setCurrentPage('scripts')} />
      ) : (
        <>
          <Navbar 
            onOpenSubmit={() => setIsSubmitModalOpen(true)} 
            onPageChange={setCurrentPage}
            currentPage={currentPage}
            onOpenUserSearch={() => setIsUserSearchOpen(true)}
          />

          <main>
            {currentPage === 'scripts' ? (
              <>
                <Hero 
                  onSearch={setSearchQuery} 
                  onOpenSubmit={() => setIsSubmitModalOpen(true)} 
                  siteConfig={siteConfig}
                />

            {/* Featured Section */}
            <section className="max-w-7xl mx-auto px-4 mb-20">
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Star size={20} className="text-brand" fill="currentColor" />
                      {siteConfig?.featuredTitle || 'Featured Scripts'}
                    </h2>
                    <span className="text-sm text-zinc-500 font-medium">
                      Showing {filteredScripts.length} results
                    </span>
                  </div>
                  
                  <FilterBar 
                    categories={CATEGORIES} 
                    selectedCategory={selectedCategory} 
                    onSelectCategory={setSelectedCategory} 
                  />

                  <motion.div 
                    whileTap={{ scale: 0.998 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredScripts.map((script, idx) => (
                        <ScriptCard 
                          key={script.id} 
                          script={script} 
                          index={idx} 
                          onClick={setSelectedScript} 
                          onSelectUser={setSelectedUserId}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  
                  {filteredScripts.length === 0 && (
                    <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="text-center py-32 bg-card/20 rounded-3xl border border-dashed border-border"
                    >
                       <p className="text-zinc-500 text-lg">No results found for your search/filter.</p>
                       <button 
                        onClick={() => {setSelectedCategory('All'); setSearchQuery('');}}
                        className="mt-4 text-brand font-bold text-sm hover:underline"
                      >
                        Clear all filters
                      </button>
                    </motion.div>
                  )}

                  <div className="mt-12 flex justify-center">
                    <button className="px-8 py-3 bg-zinc-900 border border-border text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 group">
                      Load More Scripts
                      <Trophy size={16} className="text-brand group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Sidebar Activity */}
                <aside className="w-full lg:w-80 flex-shrink-0">
                   <ActivityFeed />
                </aside>
              </div>
            </section>

            {/* Premium Scripts Section */}
            <section className="max-w-7xl mx-auto px-4 mb-20">
              <div className="bg-[#0a0a0c] border border-brand/20 rounded-[32px] p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 blur-[120px] -mr-48 -mt-48" />
                
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 relative z-10">
                  <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
                      <Gem size={28} className="text-brand animate-pulse" fill="currentColor" />
                      {siteConfig?.premiumTitle || 'Premium Scripts'}
                    </h2>
                    <p className="text-zinc-500 text-sm font-medium">{siteConfig?.premiumSubtitle || 'Get access to undetected, high-performance private scripts.'}</p>
                  </div>
                  <button className="px-6 py-2.5 bg-brand/10 border border-brand/20 text-brand text-xs font-black rounded-xl uppercase tracking-widest hover:bg-brand hover:text-black transition-all">
                    View All Premium
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {allScripts.filter(s => s.isPremium).map((script, idx) => (
                    <ScriptCard 
                      key={script.id} 
                      script={script} 
                      index={idx} 
                      onClick={setSelectedScript} 
                      onSelectUser={setSelectedUserId}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Categories CTA Section */}
            <section className="max-w-7xl mx-auto px-4 py-20 border-t border-border/50">
              <div className="bg-gradient-to-br from-brand/20 to-blue-500/10 rounded-[40px] p-8 md:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 blur-[100px] -mr-32 -mt-32" />
                
                <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-12">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 text-brand font-black text-xs uppercase mb-6 tracking-widest">
                      <Flame size={16} fill="currentColor" /> Grow with us
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                      {(siteConfig?.uploadTitle || 'Upload your own scripts').split('<br />').map((line: string, i: number) => (
                        <span key={i}>
                          {line}
                          {i < (siteConfig?.uploadTitle || 'Upload your own scripts').split('<br />').length - 1 && <br />}
                        </span>
                      ))}
                    </h2>
                    <p className="text-zinc-400 mb-10 text-lg leading-relaxed">
                      {siteConfig?.uploadSubtitle || 'Join 1,200+ developers sharing their creations with the largest community of script-users. Get verified today.'}
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="px-8 py-4 bg-brand text-black font-bold rounded-2xl hover:bg-brand-muted transition-all active:scale-95 neon-glow"
                      >
                        Become a Creator
                      </button>
                      <button className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all">
                        Learn More
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    {[
                      { label: 'Scripts', value: '12K+' },
                      { label: 'Users', value: '500K+' },
                      { label: 'Authors', value: '1.2K' },
                      { label: 'Daily DLs', value: '45K' },
                    ].map((stat) => (
                      <div key={stat.label} className="stat-card p-6 bg-black/60 backdrop-blur-3xl border border-white/5 rounded-3xl group hover:border-brand/30 transition-colors">
                        <div className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-brand transition-colors">{stat.value}</div>
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            </>
            ) : currentPage === 'executors' ? (
              <Executors isAdmin={isAdmin} />
            ) : currentPage === 'admin' ? (
              <AdminPanel onEditScript={handleEditScript} />
            ) : null}
          </main>

          <Footer />

          <UserProfileModal 
            isOpen={!!selectedUserId} 
            onClose={() => setSelectedUserId(null)} 
            userId={selectedUserId || ''} 
          />

          <UserSearchModal
            isOpen={isUserSearchOpen}
            onClose={() => setIsUserSearchOpen(false)}
            onSelectUser={setSelectedUserId}
          />

          <AnimatePresence>
            {selectedScript && (
              <ScriptModal 
                script={selectedScript} 
                onClose={closeModals} 
                isAdmin={isAdmin}
                onEdit={handleEditScript}
              />
            )}
            {(isSubmitModalOpen || editingScript) && (
              <SubmitScriptModal 
                onClose={closeModals} 
                editScript={editingScript || undefined}
                isAdmin={isAdmin}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
