import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, User, ExternalLink, Loader2, Gavel } from 'lucide-react';
import { RECENT_ACTIVITY } from '../constants';

export function ActivityFeed() {
  const [activities, setActivities] = useState(RECENT_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(1248);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => prev + 10);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/rscripts');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Transform data to match UI
            const newActivities = data.map((item: any) => ({
              id: item.id,
              user: item.user,
              action: item.action,
              target: item.title,
              time: item.time,
              isAdmin: item.user === 'System' || item.user === 'D4VIDSKYS' || item.user === 'Server'
            }));
            setActivities(newActivities);
          }
        }
      } catch (error) {
        console.error("Failed to fetch fresh activity", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    // Poll every 5 minutes
    const interval = setInterval(fetchActivities, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-6 rounded-3xl border border-border/50 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Activity size={18} className="text-brand" />
          Live Activity
        </h3>
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
      </div>

      <div className="space-y-6">
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-brand animate-spin" />
          </div>
        ) : (
          activities.map((item: any, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex gap-4 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-border flex-shrink-0 flex items-center justify-center">
                <User size={16} className="text-zinc-500 group-hover:text-brand transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  <span className="text-zinc-500 font-normal flex items-center gap-1">
                    {item.user}
                    {item.isAdmin && <Gavel size={10} className="text-brand" fill="currentColor" />}
                  </span> {item.action}
                </p>
                <p className="text-xs text-brand truncate font-mono">
                  {item.target}
                </p>
                <span className="text-[10px] text-zinc-600 uppercase mt-1 block tracking-wider">{item.time}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <ExternalLink size={12} className="text-zinc-400" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-zinc-500">Online Users</span>
          <span className="text-white font-bold">{onlineUsers.toLocaleString()}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
           <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '75%' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-brand"
           />
        </div>
      </div>
    </div>
  );
}
