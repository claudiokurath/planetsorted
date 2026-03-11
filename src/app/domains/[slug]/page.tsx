import Link from 'next/link';
import { notFound } from 'next/navigation';

const SECTIONS = [
    { id: "01", name: "Keep Going", annotation: "// FUEL_SYSTEM" },
    { id: "02", name: "Feel Good", annotation: "// BIOMETRICS" },
    { id: "03", name: "Spend Smart", annotation: "// CAPITAL" },
    { id: "04", name: "Be Connected", annotation: "// NETWORK" },
    { id: "05", name: "Plan Ahead", annotation: "// LOGISTICS" },
    { id: "06", name: "Be Yourself", annotation: "// IDENTITY" },
    { id: "07", name: "Level Up", annotation: "// EXPANSION" },
];

type Params = Promise<{ slug: string }>;

export default async function DomainDetailPage(props: { params: Params }) {
    const { slug } = await props.params;
    const domain = SECTIONS.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === slug);

    if (!domain) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-sor7ed-black text-white selection:bg-sor7ed-yellow selection:text-black pt-24 pb-20">
            {/* Quick Nav */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-sor7ed-gray-light px-6 py-4 flex justify-between items-center">
                <Link href="/" className="font-fuel-decay text-3xl tracking-widest uppercase hover:text-sor7ed-yellow transition-colors">
                    SOR7ED
                </Link>
                <Link href="/login" className="border border-sor7ed-yellow text-sor7ed-yellow hover:bg-sor7ed-yellow hover:text-black px-4 py-2 text-xs uppercase tracking-widest transition-colors font-mono-headline">
                    Initialize Connection
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 space-y-12">
                <header className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-6">
                        <div className="inline-block px-3 py-1 border border-sor7ed-gray-light text-sor7ed-yellow font-mono-headline text-xs tracking-widest uppercase opacity-80 shadow-[0_0_15px_rgba(245,198,20,0.1)]">
                // SYSTEM_DOMAIN // {domain.annotation.replace('// ', '')}
                        </div>
                        <span className="font-mono-headline text-zinc-500 uppercase tracking-widest text-sm">
                            NODE: {domain.id}
                        </span>
                    </div>
                    <h1 className="font-fuel-decay text-6xl md:text-8xl uppercase tracking-tight text-white leading-none pt-8">
                        {domain.name}
                    </h1>
                </header>

                <div className="bg-[#111] border border-white/10 p-8 md:p-12 relative overflow-hidden mt-12 group">
                    <div className="absolute inset-0 bg-sor7ed-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-start space-y-6">
                        <h2 className="font-fuel-decay text-3xl uppercase tracking-wide text-sor7ed-yellow">
                            DOMAIN SYSTEM OFFLINE
                        </h2>
                        <p className="font-roboto text-zinc-400 max-w-lg leading-relaxed pt-2">
                            The full toolset array for the <strong className="text-white">{domain.name}</strong> domain is currently compiling. Active system members will be notified upon module completion.
                        </p>
                        <div className="pt-6">
                            <Link href="/signup" className="inline-block bg-white text-black font-mono-headline text-xs tracking-widest uppercase px-8 py-4 hover:bg-sor7ed-yellow transition-colors duration-300">
                                Request Early Access
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
