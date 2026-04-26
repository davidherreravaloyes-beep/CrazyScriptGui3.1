import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Github, Loader2, ArrowLeft } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from '../lib/firebase';

export function LoginView({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Immediate check if already logged in
    if (auth.currentUser) {
      onBack();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onBack();
      }
    });
    return () => unsubscribe();
  }, [onBack]);

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading('google');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        onBack();
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("Please allow popups for this site to sign in.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("Error: Unauthorized Domain. Please add " + window.location.hostname + " to your Firebase Console Authorized Domains list.");
      } else {
        alert("Login failed: " + error.message);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.05)_0%,_transparent_70%)] pointer-events-none" />
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm"
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] flex flex-col items-center"
      >
        {/* Brand Logo Fallback */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8 relative rounded-3xl overflow-hidden neon-glow bg-[#121217] border border-brand/30 flex items-center justify-center">
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

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-8 sm:mb-10 tracking-tight text-center">
          Welcome to CrazyGuiscripts
        </h1>

        <div className="w-full space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-zinc-300 block">
              Enter your email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full h-12 bg-[#16161a] border border-[#2a2a32] rounded-lg pl-12 pr-4 text-white focus:outline-none focus:border-brand/40 transition-all placeholder:text-zinc-600 text-sm"
              />
            </div>
            <button 
              disabled
              className="w-full h-12 bg-[#232328] text-zinc-600 font-bold rounded-lg cursor-not-allowed flex items-center justify-center text-sm"
            >
              Send magic link
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#232328]"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-[#232328]"></div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              disabled={!!loading}
              className="w-full h-12 bg-[#16161a] border border-[#2a2a32] hover:bg-[#1a1a20] text-zinc-200 font-bold rounded-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              {loading === 'google' ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
            <button 
              disabled
              className="w-full h-12 bg-[#16161a] border border-[#2a2a32] text-zinc-200 font-bold rounded-lg flex items-center justify-center gap-3 opacity-50 cursor-not-allowed text-sm"
            >
              <Github size={18} fill="currentColor" />
              Continue with GitHub
            </button>
          </div>

          <div className="text-center pt-8">
            <a href="#" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">
              Need help? <span className="underline decoration-zinc-800 underline-offset-4">Need more help with logging in?</span>
            </a>
          </div>
        </div>
      </motion.div>

      <div className="mt-auto py-8">
        <p className="text-[10px] text-zinc-700 text-center uppercase tracking-widest font-bold">
          By logging in or creating an account, you agree to our <a href="#" className="underline">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
