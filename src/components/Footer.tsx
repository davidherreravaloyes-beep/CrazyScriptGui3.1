import { Terminal, Github, Twitter, MessageSquare, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function Footer() {
  const [siteConfig, setSiteConfig] = useState<any>({
    name: 'CrazyGui',
    brand: 'scripts',
    logo: '',
    footerText: '',
    githubLink: '',
    twitterLink: '',
    discordLink: ''
  });

  useEffect(() => {
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'site'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteConfig(docSnap.data() as any);
      }
    });

    return () => unsubscribeConfig();
  }, []);

  return (
    <footer className="pt-20 pb-10 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-[#121217] border border-brand/20">
                {siteConfig.logo ? (
                  <img 
                    src={siteConfig.logo} 
                    alt="Logo" 
                    referrerPolicy="no-referrer" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
                    <text x="50%" y="54%" textAnchor="middle" fill="#00ff99" className="text-[50px] font-black font-sans">CG</text>
                  </svg>
                )}
              </div>
              <span className="text-lg font-bold tracking-tighter text-white">
                {siteConfig.name}<span className="text-brand">{siteConfig.brand}</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              {siteConfig.footerText || 'The ultimate source for high-quality scripts. Designed for gamers, by gamers.'}
            </p>
            <div className="flex gap-4">
              {siteConfig.githubLink && (
                <a href={siteConfig.githubLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-zinc-900 border border-border flex items-center justify-center text-zinc-400 hover:text-brand hover:border-brand/30 transition-all">
                  <Github size={18} />
                </a>
              )}
              {siteConfig.twitterLink && (
                <a href={siteConfig.twitterLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-zinc-900 border border-border flex items-center justify-center text-zinc-400 hover:text-brand hover:border-brand/30 transition-all">
                  <Twitter size={18} />
                </a>
              )}
              <a href={siteConfig.discordLink || "https://discord.gg/5PSyhpvTn"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-zinc-900 border border-border flex items-center justify-center text-zinc-400 hover:text-brand hover:border-brand/30 transition-all">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-brand transition-colors">Our Scripts</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Top Categories</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Game Hubs</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Mobile Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Developers</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-brand transition-colors">Join the Team</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Script API</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Submit a Script</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-zinc-500 text-sm mb-6">Get notified when new powerful scripts are dropped.</p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full h-10 bg-zinc-900 border border-border rounded-lg pl-10 pr-3 text-sm focus:outline-none focus:border-brand/50"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-brand text-black text-xs font-bold rounded-md">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-border/30 gap-6">
          <p className="text-zinc-600 text-xs text-center md:text-left">
            © 2026 {siteConfig.name}{siteConfig.brand}. All rights reserved. Our platform is strictly for educational purposes.
          </p>
          <div className="flex gap-8 text-xs text-zinc-600 font-medium">
            <a href="#" className="hover:text-brand transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
