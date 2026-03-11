import Image from "next/image";
import Link from "next/link";

import toolsData from '../data/tools.json';
import blogData from '../data/blog.json';

const SECTIONS = [
  { id: "01", name: "Keep Going", annotation: "// FUEL_SYSTEM" },
  { id: "02", name: "Feel Good", annotation: "// BIOMETRICS" },
  { id: "03", name: "Spend Smart", annotation: "// CAPITAL" },
  { id: "04", name: "Be Connected", annotation: "// NETWORK" },
  { id: "05", name: "Plan Ahead", annotation: "// LOGISTICS" },
  { id: "06", name: "Be Yourself", annotation: "// IDENTITY" },
  { id: "07", name: "Level Up", annotation: "// EXPANSION" },
];

const getFallbackImage = (type: 'tool' | 'blog', index: number) => {
  const toolImages = [
    "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop"
  ];
  const blogImages = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop"
  ];
  const pool = type === 'tool' ? toolImages : blogImages;
  return pool[index % pool.length];
};

const TOOLS = (toolsData as any[]).filter(tool => tool.Status === "Published").slice(0, 6);
const BLOG_POSTS = (blogData as any[]).filter(post => post.Status === "Published").slice(0, 6);

export default function Home() {
  return (
    <div className="min-h-screen bg-sor7ed-black text-white selection:bg-sor7ed-yellow selection:text-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-sor7ed-gray-light px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-fuel-decay text-3xl tracking-widest uppercase hover:text-sor7ed-yellow transition-colors">
          SOR7ED
        </Link>
        <div className="flex gap-6 font-mono-headline text-xs uppercase tracking-widest text-zinc-400 items-center">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <div className="h-4 w-px bg-zinc-700 mx-2" />
          <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
          <Link href="/signup" className="border border-sor7ed-yellow text-sor7ed-yellow hover:bg-sor7ed-yellow hover:text-black px-4 py-2 transition-colors">
            Initialize Connection
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative flex flex-col items-center justify-center pt-40 pb-20 px-6 border-b border-sor7ed-gray-light">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/80 to-black pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-block px-3 py-1 mb-4 border border-sor7ed-gray-light text-sor7ed-yellow font-mono-headline text-xs tracking-widest uppercase opacity-80 shadow-[0_0_15px_rgba(245,198,20,0.1)]">
            // SOR7ED_SYSTEM_ONLINE
          </div>
          <h1 className="font-fuel-decay text-7xl md:text-9xl uppercase tracking-tight leading-[0.85] text-white">
            Unbreakable <br />
            <span className="text-sor7ed-yellow">Architecture.</span>
          </h1>
          <p className="font-roboto text-zinc-400 max-w-lg mx-auto text-lg md:text-xl pt-6 font-light">
            A high-contrast stealth framework for mastering the seven core domains of a well-architected life.
          </p>
          <div className="pt-10 flex flex-col md:flex-row gap-4 justify-center items-center font-mono-headline text-xs uppercase tracking-widest">
            <Link href="/tools" className="bg-sor7ed-yellow text-black border border-sor7ed-yellow hover:bg-white hover:border-white px-8 py-4 transition-colors font-bold shadow-[0_0_20px_rgba(245,198,20,0.3)] w-full md:w-auto text-center">
              Enter the Lab →
            </Link>
            <Link href="/about" className="border border-white/30 text-zinc-300 hover:border-white hover:bg-white hover:text-black px-8 py-4 transition-colors w-full md:w-auto text-center">
              Explore Architecture
            </Link>
          </div>
        </div>
      </header>



      {/* Main Content Areas */}
      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">

        {/* Core Domains */}
        <section id="domains">
          <div className="flex items-center justify-between mb-12 border-b border-sor7ed-gray-light pb-4">
            <h2 className="font-mono-headline text-sm tracking-widest text-white uppercase">
              [ System // Domains ]
            </h2>
            <span className="font-mono-headline text-xs text-sor7ed-yellow animate-pulse">
              STATUS: ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SECTIONS.map((section) => (
              <Link
                href={`/domains/${section.name.toLowerCase().replace(/\s+/g, '-')}`}
                key={section.id}
                className="group relative bg-sor7ed-yellow hover:-translate-y-2 transition-transform duration-300 ease-in-out cursor-pointer p-6 flex flex-col justify-between min-h-[220px] shadow-[0_10px_30px_rgba(245,198,20,0.05)] border border-transparent hover:border-white/20 text-sor7ed-black"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono-headline text-xs font-bold tracking-widest opacity-60">
                    {section.id}
                  </span>
                  <span className="font-mono-headline text-[10px] tracking-wider uppercase border border-sor7ed-black/20 px-2 py-1">
                    {section.annotation}
                  </span>
                </div>

                <div className="mt-8">
                  <h3 className="font-fuel-decay text-5xl md:text-6xl uppercase leading-none tracking-tight">
                    {section.name}
                  </h3>
                </div>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-45 transform origin-center">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Tools Section Banner */}
      <div className="max-w-7xl mx-auto px-6 w-full pt-12 pb-8">
        <Image src="/images/tools-hero.png" alt="Tools Divider" width={2000} height={800} className="w-full h-auto border border-zinc-800 rounded-sm" priority />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {/* Tools Section */}
        <section id="tools">
          <div className="flex items-center justify-between mb-12 border-b border-sor7ed-gray-light pb-4">
            <h2 className="font-mono-headline text-sm tracking-widest text-white uppercase">
              [ System // Tools ]
            </h2>
            <Link href="#tools" className="font-mono-headline text-xs text-zinc-500 hover:text-white transition-colors">
              VIEW_ALL_TOOLS →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOOLS.map((tool, idx) => (
              <Link href={`/tools/${tool.Slug || '#'}`} key={idx} className="group relative bg-black border border-white/10 hover:-translate-y-1 hover:border-white/30 transition-all duration-300 cursor-pointer min-h-[220px] flex flex-col justify-between overflow-hidden p-6 text-left">
                <Image
                  src={tool["Cover Image"] || getFallbackImage('tool', idx)}
                  alt={tool.Name || "Tool"}
                  fill
                  className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-[1px] group-hover:blur-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity duration-500 pointer-events-none" />
                <div className="z-10 relative flex w-full justify-between items-start">
                  {/* Optional top-left metadata if desired in future */}
                </div>
                <div className="z-10 relative mt-8 w-full">
                  <h4 className="font-fuel-decay text-5xl md:text-6xl uppercase leading-none tracking-tight text-white group-hover:text-sor7ed-yellow transition-colors">{tool.Name}</h4>
                  <p className="font-roboto text-xs md:text-sm text-zinc-400 uppercase tracking-wider font-medium mt-2">{tool.Description || "SYSTEM OPTIMIZATION TOOL"}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Blog Section Banner */}
      <div className="max-w-7xl mx-auto px-6 w-full pt-12 pb-8">
        <Image src="/images/blog-hero.png" alt="Blog Divider" width={2000} height={800} className="w-full h-auto border border-zinc-800 rounded-sm" priority />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32 mb-12">
        {/* Blog Section */}
        <section id="blog">
          <div className="flex items-center justify-between mb-12 border-b border-sor7ed-gray-light pb-4">
            <h2 className="font-mono-headline text-sm tracking-widest text-white uppercase">
              [ System // Transmission Log ]
            </h2>
            <Link href="#blog" className="font-mono-headline text-xs text-zinc-500 hover:text-white transition-colors">
              VIEW_ARCHIVE →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post, idx) => (
              <Link href={`/blog/${post.Slug || '#'}`} key={idx} className="group relative bg-black border border-white/10 hover:-translate-y-1 hover:border-white/30 transition-all duration-300 cursor-pointer min-h-[220px] flex flex-col justify-between overflow-hidden p-6 text-left">
                <Image
                  src={post["Cover Image"] || getFallbackImage('blog', idx)}
                  alt={post.Title || "Post"}
                  fill
                  className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-[1px] group-hover:blur-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity duration-500 pointer-events-none" />
                <div className="z-10 relative flex w-full justify-between items-start">
                  <p className="font-mono-headline text-[10px] text-sor7ed-yellow uppercase tracking-widest border border-sor7ed-yellow/30 px-2 py-1 bg-black/50">{post["Publish Date"] || "TRANSMISSION DATE UNKNOWN"}</p>
                </div>
                <div className="z-10 relative mt-8 w-full">
                  <h4 className="font-fuel-decay text-5xl md:text-6xl uppercase leading-none tracking-tight text-white group-hover:text-sor7ed-yellow transition-colors">{post.Title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing">
          <div className="flex items-center justify-between mb-12 border-b border-sor7ed-gray-light pb-4">
            <h2 className="font-mono-headline text-sm tracking-widest text-white uppercase">
              [ System // Pricing ]
            </h2>
            <span className="font-mono-headline text-xs text-sor7ed-yellow animate-pulse">
              NO_HIDDEN_FEES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Tier */}
            <div className="group relative bg-black border border-white/10 hover:-translate-y-1 hover:border-sor7ed-yellow transition-all duration-300 p-8 flex flex-col justify-between mix-blend-screen h-full">
              <div>
                <div className="font-mono-headline text-[10px] text-sor7ed-yellow uppercase tracking-widest border border-sor7ed-yellow/30 px-2 py-1 inline-block mb-6 bg-black/50">
                  FREE STARTER
                </div>
                <h3 className="font-fuel-decay text-5xl uppercase leading-none tracking-tight text-white group-hover:text-sor7ed-yellow transition-colors">
                  £0<span className="text-2xl text-zinc-500 font-roboto">/mo</span>
                </h3>
                <p className="font-roboto text-sm text-zinc-400 mt-4 mb-8">
                  Begin your system initialization. Perfect for testing the architecture.
                </p>
                <ul className="space-y-4 font-mono-headline text-xs text-zinc-300 tracking-wider">
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> 3 Active Tools
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> 10 interactions / week
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> Basic tool library
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> Self-service support
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-12 w-full text-center border py-3 font-mono-headline text-xs tracking-widest uppercase border-white/20 hover:bg-white hover:text-black transition-colors">
                Start Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="group relative bg-sor7ed-yellow text-black border border-sor7ed-yellow hover:-translate-y-1 transition-all duration-300 p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(245,198,20,0.15)] h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-50"></div>
              <div>
                <div className="font-mono-headline text-[10px] text-black uppercase tracking-widest border border-black/30 px-2 py-1 inline-block mb-6 font-bold">
                  PRO MEMBER
                </div>
                <h3 className="font-fuel-decay text-5xl uppercase leading-none tracking-tight">
                  £9.99<span className="text-2xl font-roboto text-black/60">/mo</span>
                </h3>
                <p className="font-roboto text-sm mt-4 mb-8 font-medium">
                  Full unrestricted access to the complete SOR7ED tool system via WhatsApp.
                </p>
                <ul className="space-y-4 font-mono-headline text-xs tracking-wider opacity-90 font-medium">
                  <li className="flex items-start gap-2">
                    <span>»</span> Unlimited tool requests
                  </li>
                  <li className="flex items-start gap-2">
                    <span>»</span> Full library access (30+ tools)
                  </li>
                  <li className="flex items-start gap-2">
                    <span>»</span> Priority response speed
                  </li>
                  <li className="flex items-start gap-2">
                    <span>»</span> WhatsApp Voice Message support
                  </li>
                  <li className="flex items-start gap-2">
                    <span>»</span> Private coaching channel
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-12 w-full text-center border-2 border-black py-3 font-mono-headline text-xs tracking-widest text-[14px] font-bold uppercase hover:bg-black hover:text-sor7ed-yellow transition-colors">
                Upgrade to Pro
              </Link>
            </div>

            {/* Coach Tier */}
            <div className="group relative bg-black border border-white/10 hover:-translate-y-1 hover:border-sor7ed-yellow transition-all duration-300 p-8 flex flex-col justify-between h-full">
              <div>
                <div className="font-mono-headline text-[10px] text-zinc-400 uppercase tracking-widest border border-white/20 px-2 py-1 inline-block mb-6 bg-black/50">
                  COACH
                </div>
                <h3 className="font-fuel-decay text-5xl uppercase leading-none tracking-tight text-white group-hover:text-sor7ed-yellow transition-colors">
                  £29.99<span className="text-2xl text-zinc-500 font-roboto">/mo</span>
                </h3>
                <p className="font-roboto text-sm text-zinc-400 mt-4 mb-8">
                  Built for professionals supporting multiple neurodivergent clients.
                </p>
                <ul className="space-y-4 font-mono-headline text-xs text-zinc-300 tracking-wider">
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> Everything in Pro
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> Up to 20 client accounts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> API access
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> Custom tool requests
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sor7ed-yellow">»</span> White-label support
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-12 w-full text-center border py-3 font-mono-headline text-xs tracking-widest uppercase border-white/20 hover:bg-white hover:text-black transition-colors">
                Apply for Coach
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-sor7ed-gray-light py-12 px-6 text-center text-zinc-600 font-mono-headline text-xs">
        <div className="flex justify-center gap-6 mb-6">
          <Link href="/" className="hover:text-white transition-colors uppercase tracking-widest">Home</Link>
          <Link href="/tools" className="hover:text-white transition-colors uppercase tracking-widest">Tools</Link>
          <Link href="/blog" className="hover:text-white transition-colors uppercase tracking-widest">Blog</Link>
          <Link href="/about" className="hover:text-white transition-colors uppercase tracking-widest">About</Link>
        </div>
        <p>// END_OF_TRANSMISSION — SYSTEM VER 2.0.26</p>
      </footer>
    </div>
  );
}
