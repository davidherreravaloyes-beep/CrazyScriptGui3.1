import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, ArrowLeft, LogIn } from 'lucide-react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithPopup,
  googleProvider,
  syncUserProfile
} from '../lib/firebase';

export function LoginView({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      onBack();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onBack();
      }
    });

    // Auto-trigger Google Sign-In on mount
    handleGoogleLogin();

    return () => unsubscribe();
  }, [onBack]);

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Sync user profile
        await syncUserProfile(result.user);
        onBack();
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setError("Domain not authorized in Firebase Console.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError("Login cancelled. Click the button below to try again.");
      } else {
        setError("Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center px-6 relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.05)_0%,_transparent_70%)] pointer-events-none" />
      
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm z-50"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] flex flex-col items-center relative z-10"
      >
        <div className="w-24 h-24 mb-8 relative rounded-3xl overflow-hidden neon-glow bg-[#121217] border border-brand/30 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full p-2">
              <defs>
                <linearGradient id="logoGradientLarge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00ff99" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <text x="50%" y="50%" dy=".35em" textAnchor="middle" fill="url(#logoGradientLarge)" className="text-[50px] font-black font-sans">CG</text>
            </svg>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight text-center">
          Sign In
        </h1>
        <p className="text-zinc-500 text-sm mb-12 text-center max-w-[280px]">
          Sign in via Google to access all features and your saved scripts.
        </p>

        {error && (
          <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold mb-6 text-center">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-14 bg-white text-black font-black rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 text-sm mb-6"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.2em]">
          Secure Authentication
        </p>
      </motion.div>

      <div className="mt-24 py-8">
        <p className="text-[10px] text-zinc-800 text-center uppercase tracking-widest font-black">
          Sleeping City Architecture • v2.4.0
        </p>
      </div>
    </div>
  );
}

