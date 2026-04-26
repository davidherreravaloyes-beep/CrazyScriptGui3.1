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
                <MessageSquare size={18} />
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
