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
        <div className="flex gap-6 font-mono-headline text-xs uppercase tracking-widest text-zinc-400">
          <a href="#domains" className="hover:text-sor7ed-yellow transition-colors">Domains</a>
          <a href="#tools" className="hover:text-sor7ed-yellow transition-colors">Tools</a>
          <a href="#blog" className="hover:text-sor7ed-yellow transition-colors">Blog</a>
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
              <Link href={`/tools/${tool.Slug || '#'}`} key={idx} className="group relative bg-black border border-white/10 hover:-translate-y-1 hover:border-white/30 transition-all duration-300 cursor-pointer min-h-[300px] flex flex-col justify-end overflow-hidden p-6">
                <Image
                  src={tool["Cover Image"] || getFallbackImage('tool', idx)}
                  alt={tool.Name || "Tool"}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-[2px] group-hover:blur-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                <div className="z-10 relative">
                  <h4 className="font-fuel-decay text-4xl uppercase tracking-wide text-white group-hover:text-sor7ed-yellow transition-colors">{tool.Name}</h4>
                  <p className="font-roboto text-sm text-zinc-400 mt-1">{tool.Description || "System optimization tool."}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

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
              <Link href={`/blog/${post.Slug || '#'}`} key={idx} className="group border border-white/5 bg-black hover:border-sor7ed-yellow flex flex-col cursor-pointer transition-colors duration-300 overflow-hidden hover:-translate-y-1 shadow-lg">
                <div className="relative w-full h-48 overflow-hidden bg-black/50">
                  <Image
                    src={post["Cover Image"] || getFallbackImage('blog', idx)}
                    alt={post.Title || "Post"}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between bg-black/90 border-t border-white/5">
                  <p className="font-mono-headline text-xs text-sor7ed-yellow mb-3">{post["Publish Date"] || "Transmission Date Unknown"}</p>
                  <h4 className="font-roboto text-xl font-medium text-white group-hover:text-sor7ed-yellow transition-colors leading-tight">{post.Title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-sor7ed-gray-light py-12 px-6 text-center text-zinc-600 font-mono-headline text-xs">
        <p>// END_OF_TRANSMISSION — SYSTEM VER 2.0.26</p>
      </footer>
    </div>
  );
}
