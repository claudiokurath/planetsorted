import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  { id: "01", name: "Keep Going", annotation: "// FUEL_SYSTEM" },
  { id: "02", name: "Feel Good", annotation: "// BIOMETRICS" },
  { id: "03", name: "Spend Smart", annotation: "// CAPITAL" },
  { id: "04", name: "Be Connected", annotation: "// NETWORK" },
  { id: "05", name: "Plan Ahead", annotation: "// LOGISTICS" },
  { id: "06", name: "Be Yourself", annotation: "// IDENTITY" },
  { id: "07", name: "Level Up", annotation: "// EXPANSION" },
];

const TOOLS = [
  { name: "Focus Timer", desc: "Pomodoro-style interval timer." },
  { name: "Budget Tracker", desc: "Capital flow visualization spreadsheet." },
  { name: "Habit Engine", desc: "Daily biometric and action logger." },
];

const BLOG_POSTS = [
  { title: "Building Resilient Architectures", date: "Mar 1, 2026" },
  { title: "The High-Contrast Lifestyle", date: "Feb 15, 2026" },
  { title: "Capital Allocation in the 21st Century", date: "Feb 2, 2026" },
];

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
              <div
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
              </div>
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
              <div key={idx} className="group relative bg-white/5 border border-white/10 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300 cursor-pointer p-6 min-h-[160px] flex flex-col justify-between">
                <h4 className="font-fuel-decay text-4xl uppercase tracking-wide text-white group-hover:text-sor7ed-yellow transition-colors">{tool.name}</h4>
                <p className="font-roboto text-sm text-zinc-400">{tool.desc}</p>
              </div>
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
              <div key={idx} className="group border-b border-white/5 hover:border-sor7ed-yellow pb-6 flex flex-col justify-between cursor-pointer transition-colors duration-300">
                <p className="font-mono-headline text-xs text-sor7ed-yellow mb-3">{post.date}</p>
                <h4 className="font-roboto text-xl font-medium text-white group-hover:text-zinc-300 transition-colors">{post.title}</h4>
              </div>
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
