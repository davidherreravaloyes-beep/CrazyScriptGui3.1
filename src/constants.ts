export interface Script {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  views: number;
  likes: number;
  game: string;
  thumbnail: string;
  updatedAt: string;
  authorId?: string;
  isTrending?: boolean;
  isNew?: boolean;
  rawScript?: string;
  isPremium?: boolean;
  rating?: number;
  ratingCount?: number;
}

export interface Executor {
  id: string;
  name: string;
  author: string;
  description: string;
  status: 'Working' | 'Outdated';
  version: string;
  platforms: string[];
  downloads: string;
  price: string;
  banner: string;
  icon: string;
  unc?: string;
  lastWorked?: string;
  updatedDate?: string;
  website?: string;
  discord?: string;
  gallery?: string[];
}

export const CATEGORIES = [
  'All',
  'Universal',
  'Roblox',
  'Anime',
  'Simulator',
  'FPS',
  'RPG',
  'Utility'
];

export const MOCK_EXECUTORS: Executor[] = [
  {
    id: 'e1',
    name: 'Volt',
    author: 'Cell',
    description: 'Volt is the most powerful script executor for Roblox currently on the market.',
    status: 'Working',
    version: 'v1.2.13.2',
    platforms: ['windows'],
    downloads: '42.1K',
    price: '$5.99 Weekly',
    banner: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=1200&q=80',
    icon: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=200&q=80',
    unc: '99%',
    lastWorked: '1d ago',
    updatedDate: 'Feb 17, 2026',
    website: 'https://volt.bz/',
    discord: 'https://discord.gg/volt',
    gallery: [
      'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=800&q=60',
      'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=800&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'e2',
    name: 'Potassium',
    author: 'permanentlyy',
    description: 'A powerful script executor aimed to give you the best scripting experience.',
    status: 'Working',
    version: 'v2.1.2',
    platforms: ['windows'],
    downloads: '32.0K',
    price: '$22.99 Lifetime',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
    icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80',
    unc: '99%',
    lastWorked: '2d ago',
    updatedDate: 'Apr 6, 2026',
    website: 'https://potassium.com',
    discord: 'https://discord.gg/potassium'
  },
  {
    id: 'e3',
    name: 'Wave',
    author: 'Team Wave',
    description: 'Wave is a robust and efficient Roblox exploit, offering a seamless scripting experience with powerful features and a user-friendly design!',
    status: 'Working',
    version: 'vNEW-1.2.3',
    platforms: ['windows'],
    downloads: '28.6K',
    price: '$5.99 Weekly',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
    icon: 'https://images.unsplash.com/photo-1578632738980-df317604323c?w=200&q=80',
    unc: '99%',
    lastWorked: '1d ago',
    updatedDate: 'Feb 17, 2026',
    website: 'https://getwave.gg',
    discord: 'https://discord.gg/wave'
  },
  {
    id: 'e4',
    name: 'Seliware',
    author: 'dxdef',
    description: 'Seliware is a 2025 Roblox executor with Level 8 support - now available through authorized resellers at $10/month.',
    status: 'Working',
    version: 'v2.3.8',
    platforms: ['windows'],
    downloads: '2.9K',
    price: '$3.99 Weekly',
    banner: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&q=80',
    icon: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200&q=80',
    unc: '99%',
    lastWorked: '1h ago',
    updatedDate: 'Feb 17, 2026',
    website: 'https://seliware.com',
    discord: 'https://discord.gg/seliware'
  },
  {
    id: 'e5',
    name: 'Synapse Z',
    author: 'grhofficial',
    description: "Don't settle for less. Step up from risky, unreliable products to secure, first-class software that always puts you first.",
    status: 'Outdated',
    version: 'v1.0.2.0',
    platforms: ['windows'],
    downloads: '31.5K',
    price: '$3.99 Weekly',
    banner: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=1200&q=80',
    icon: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=200&q=80',
    unc: '99%',
    lastWorked: '4d ago',
    updatedDate: 'Mar 8, 2026',
    website: 'https://synapse.to',
    discord: 'https://discord.gg/synapse'
  },
  {
    id: 'e6',
    name: 'Delta',
    author: 'Lxnny',
    description: 'Delta is a cutting-edge Roblox executor, offering a premium, secure, and free scripting experience...',
    status: 'Outdated',
    version: 'v2.710.706',
    platforms: ['android'],
    downloads: '8.8K',
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
    icon: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&q=80',
    unc: '98%',
    lastWorked: 'Apr 4, 2026',
    updatedDate: 'Feb 20, 2026',
    website: 'https://delta.gg',
    discord: 'https://discord.gg/delta'
  },
  {
    id: 'e7',
    name: 'Codex',
    author: 'Furky',
    description: 'Codex is the premier Roblox script executor, offering unparalleled ease in running scripts for your favorite games.',
    status: 'Outdated',
    version: 'v2.706.750',
    platforms: ['android'],
    downloads: '6.6K',
    price: 'Free',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
    icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80',
    unc: '98%',
    lastWorked: 'Apr 4, 2026',
    updatedDate: 'Feb 20, 2026',
    website: 'https://codex.lol',
    discord: 'https://discord.gg/codex'
  }
];

export const MOCK_SCRIPTS: Script[] = [
  {
    id: '1',
    title: 'AutoFarm Master Pro',
    description: 'The most comprehensive autofarm for Blox Fruits. Includes auto-quest, auto-raid, and more.',
    author: 'ScriptGod',
    category: 'Roblox',
    views: 12500,
    likes: 4200,
    game: 'Blox Fruits',
    thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=800&auto=format&fit=crop&q=60',
    updatedAt: '2 hours ago',
    isTrending: true,
    rawScript: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/CrazyGui/AutoFarm/main/script.lua"))()'
  },
  {
    id: '2',
    title: 'Elite ESP & Aimbot',
    description: 'Advanced ESP with box, skeleton, and distance. Customizable aimbot with smooth settings.',
    author: 'PhantomZ',
    category: 'FPS',
    views: 8900,
    likes: 1200,
    game: 'Universal',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60',
    updatedAt: '5 hours ago',
    isNew: true,
    rawScript: '-- Universal Aimbot V2\\nprint("Elite ESP Loaded")'
  },
  {
    id: '3',
    title: 'Anime Adventures Macro',
    description: 'Full macro for tower defense. Supports all maps and units. Auto-retry and auto-next.',
    author: 'OtakuCoder',
    category: 'Anime',
    views: 15000,
    likes: 5600,
    game: 'Anime Adventures',
    thumbnail: 'https://images.unsplash.com/photo-1578632738980-df317604323c?w=800&auto=format&fit=crop&q=60',
    updatedAt: '1 day ago',
    isTrending: true,
    rawScript: 'loadstring(game:HttpGet("https://api.crazygui.net/aa-macro"))()'
  },
  {
    id: '4',
    title: 'Trade Hub Sniper',
    description: 'Instantly find and buy underpriced items in the trading hub. Very fast and efficient.',
    author: 'RichieRich',
    category: 'Utility',
    views: 6700,
    likes: 800,
    game: 'Adopt Me!',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=60',
    updatedAt: '3 hours ago',
    rawScript: 'print("Sniper Active")'
  },
  {
    id: '5',
    title: 'Speed Hack Extreme',
    description: 'Bypass most anti-cheats with our refined speed hack. Customizable speed and acceleration.',
    author: 'FlashDev',
    category: 'Universal',
    views: 21000,
    likes: 8900,
    game: 'Universal',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60',
    updatedAt: '10 mins ago',
    isTrending: true,
    rawScript: 'game.Players.LocalPlayer.Character.Humanoid.WalkSpeed = 100'
  },
  {
    id: 'p1',
    title: 'Volt Premium Hub',
    description: 'Exclusive multi-game script hub for Volt users. Advanced features and undetected bypasses.',
    author: 'VoltTeam',
    category: 'Universal',
    views: 45000,
    likes: 12000,
    game: 'Universal',
    thumbnail: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=800&auto=format&fit=crop&q=60',
    updatedAt: '1 hour ago',
    isPremium: true,
    rawScript: '-- Premium Hub Access Required'
  },
  {
    id: 'p2',
    title: 'Abyss Admin Pro',
    description: 'The ultimate admin command script. 500+ commands, server-side simulations, and more.',
    author: 'AbyssDev',
    category: 'Utility',
    views: 32000,
    likes: 9500,
    game: 'Universal',
    thumbnail: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop&q=60',
    updatedAt: '3 hours ago',
    isPremium: true,
    rawScript: '-- Abyss Admin Pro'
  }
];

export const RECENT_ACTIVITY = [
  { id: 1, user: 'User123', action: 'downloaded', target: 'AutoFarm Master Pro', time: 'Just now' },
  { id: 2, user: 'ScriptKiddy', action: 'liked', target: 'Elite ESP & Aimbot', time: '2m ago' },
  { id: 3, user: 'DevAlpha', action: 'uploaded', target: 'Super Jump V3', time: '5m ago' },
  { id: 4, user: 'ProGamer', action: 'downloaded', target: 'Speed Hack Extreme', time: '8m ago' },
];
