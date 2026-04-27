import React, { useState } from 'react';
import { Search, Sparkles, Loader2, ExternalLink, Globe, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ai, MODEL_NAME } from '../lib/gemini';
import { Type } from '@google/genai';

interface SearchResult {
  title: string;
  source: string;
  url: string;
  description: string;
  snippet?: string;
}

export function AISearch({ siteConfig }: { siteConfig?: any }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy handleCopy:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Focus your search on these specific websites: scriptdee.com, scriptpastebin.com, rscripts.net, scriptblox.com, and delta-hub.com.
        Find LATEST and WORKING Delta Executor scripts for the user query: "${query}". 
        IGNORE old, patched, or non-functional scripts from past years. Prioritize results from 2024-2026.
        
        The user might provide a descriptive request (e.g., "Busca un script para haze Piece") or a specific script name (e.g., "omg hub script blox fruits").
        EXTRACT the key game name and features from the query.
        
        Provide the response in the specified JSON format with title, direct URL, and a helpful description.
        CRITICAL: For each script, provide the EXACT loadstring or Lua code in the "snippet" field. This is the most important part for the user.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scripts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    source: { type: Type.STRING },
                    url: { type: Type.STRING },
                    description: { type: Type.STRING },
                    snippet: { type: Type.STRING }
                  },
                  required: ["title", "source", "url", "description", "snippet"]
                }
              }
            },
            required: ["scripts"]
          }
        }
      });

      const data = JSON.parse(response.text || '{"scripts":[]}');
      setResults(data.scripts || []);
    } catch (err) {
      console.error("AI Search Error:", err);
      setError("Unable to perform AI search. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{siteConfig?.aiTitle || 'Crazy IA'}</h2>
            <p className="text-zinc-400 text-sm">{siteConfig?.aiSubtitle || 'Discover latest scripts with AI power'}</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for scripts (e.g. 'Blox Fruits Auto Farm')..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-8 items-center">
          <span className="text-xs text-zinc-500 font-medium">Try:</span>
          {(siteConfig?.aiSuggestions ? siteConfig.aiSuggestions.split(',').map((s: string) => s.trim()) : ['Blox Fruits Auto Farm', 'Haze Piece Script', 'Hoho Hub', 'OMG Hub Script']).map((suggestion: string) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                setTimeout(() => {
                  const form = document.querySelector('form');
                  form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }, 100);
              }}
              className="text-[10px] bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-full px-3 py-1 text-zinc-400 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <Globe className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-zinc-400 animate-pulse">Scouring the web for the best scripts...</p>
            </motion.div>
          )}

          {!isSearching && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-primary/30 transition-all group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-1 flex-1">{result.title}</h3>
                    <div className="flex gap-1">
                      {result.snippet && (
                        <button 
                          onClick={() => handleCopy(result.snippet!, idx)}
                          className="p-2 bg-zinc-800 rounded-lg hover:bg-primary hover:text-white transition-all text-zinc-400 flex items-center gap-1"
                          title="Copy script"
                        >
                          {copiedId === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
                    {result.description}
                  </p>
                  
                  {result.snippet && (
                    <div className="mt-auto">
                      <div className="bg-black/20 rounded-lg p-3 font-mono text-[10px] text-zinc-300 break-all border border-white/5 relative group/code overflow-hidden max-h-24">
                        <div className="opacity-60 overflow-y-auto max-h-full">
                          {result.snippet}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isSearching && results.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="bg-zinc-800/50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Search className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-white font-medium mb-1">Search the web</h3>
              <p className="text-zinc-500 text-sm">Enter a query above to let AI find scripts for you.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
