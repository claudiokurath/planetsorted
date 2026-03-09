import Image from "next/image";

const SECTIONS = [
  { id: "01", name: "Keep Going", annotation: "// FUEL_SYSTEM" },
  { id: "02", name: "Feel Good", annotation: "// BIOMETRICS" },
  { id: "03", name: "Spend Smart", annotation: "// CAPITAL" },
  { id: "04", name: "Be Connected", annotation: "// NETWORK" },
  { id: "05", name: "Plan Ahead", annotation: "// LOGISTICS" },
  { id: "06", name: "Be Yourself", annotation: "// IDENTITY" },
  { id: "07", name: "Level Up", annotation: "// EXPANSION" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-sor7ed-black text-white selection:bg-sor7ed-yellow selection:text-black">
      {/* Hero Header */}
      <header className="relative flex flex-col items-center justify-center pt-32 pb-20 px-6 border-b border-sor7ed-gray-light">
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

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-12 border-b border-sor7ed-gray-light pb-4">
          <h2 className="font-mono-headline text-sm tracking-widest text-zinc-500 uppercase">
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
              className="group relative bg-sor7ed-yellow hover:-translate-y-2 transition-transform duration-300 ease-in-out cursor-pointer p-6 flex flex-col justify-between min-h-[220px] shadow-[0_10px_30px_rgba(245,198,20,0.05)] border border-transparent hover:border-white/20"
            >
              {/* Card Meta */}
              <div className="flex justify-between items-start text-sor7ed-black">
                <span className="font-mono-headline text-xs font-bold tracking-widest opacity-60">
                  {section.id}
                </span>
                <span className="font-mono-headline text-[10px] tracking-wider uppercase border border-sor7ed-black/20 px-2 py-1">
                  {section.annotation}
                </span>
              </div>

              {/* Card Title */}
              <div className="mt-8">
                <h3 className="font-fuel-decay text-5xl md:text-6xl uppercase leading-none tracking-tight text-sor7ed-black">
                  {section.name}
                </h3>
              </div>

              {/* Interaction Affordance */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-sor7ed-black rotate-45 transform origin-center">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-sor7ed-gray-light py-12 px-6 text-center text-zinc-600 font-mono-headline text-xs">
        <p>// END_OF_TRANSMISSION — SYSTEM VER 2.0.26</p>
      </footer>
    </div>
  );
}
