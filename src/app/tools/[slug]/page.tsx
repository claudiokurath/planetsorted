import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import toolsData from '../../../data/tools.json';

type Params = Promise<{ slug: string }>;

export default async function ToolDetailPage(props: { params: Params }) {
    const { slug } = await props.params;
    const tool = (toolsData as any[]).find(t => t.Slug === slug || t.Name?.toLowerCase().replace(/\s+/g, '-') === slug);

    if (!tool) {
        notFound();
    }

    const getFallbackImage = (index: number) => {
        const backup = [
            "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop"
        ];
        return backup[index % backup.length];
    };

    const coverSrc = tool["Cover Image"] || getFallbackImage(0);

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
                    <div className="inline-block px-3 py-1 border border-sor7ed-gray-light text-sor7ed-yellow font-mono-headline text-xs tracking-widest uppercase opacity-80 shadow-[0_0_15px_rgba(245,198,20,0.1)]">
            // SOR7ED_TOOL // INIT: {tool.Branch?.toUpperCase() || "SYSTEM"}
                    </div>
                    <h1 className="font-fuel-decay text-5xl md:text-7xl uppercase tracking-tight text-white leading-none">
                        {tool.Name}
                    </h1>
                    <p className="font-roboto text-xl text-zinc-400 font-light border-l-2 border-sor7ed-yellow pl-4">
                        {tool.Description || "System optimization parameter."}
                    </p>
                </header>

                <div className="relative w-full h-80 overflow-hidden border border-white/10 bg-black shadow-lg">
                    <Image
                        src={coverSrc}
                        alt={tool.Name}
                        fill
                        className="object-cover opacity-60 mix-blend-screen"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                {/* Member Check Gate */}
                <section className="bg-[#111] border border-red-500/30 p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-6">

                        <div className="w-16 h-16 rounded-full border border-red-500 flex items-center justify-center animate-pulse">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h2 className="font-fuel-decay text-3xl md:text-4xl uppercase tracking-wide text-red-500 flex items-center justify-center gap-3">
                                <span className="hidden md:block w-12 h-px bg-red-500/50" />
                                SYSTEM LOCKED: MEMBERS ONLY
                                <span className="hidden md:block w-12 h-px bg-red-500/50" />
                            </h2>
                            <p className="font-mono-headline text-xs uppercase tracking-widest text-zinc-500">
                                Interactive Module Requires Active Authentication Protocol
                            </p>
                        </div>

                        <p className="font-roboto text-zinc-400 max-w-lg leading-relaxed pt-4">
                            The full functionality of <strong className="text-white">{tool.Name}</strong> is restricted. You are currently viewing public read-only documentation. To engage with the interactive system, you must instantiate a connection.
                        </p>

                        <div className="pt-6 flex gap-4 w-full md:w-auto">
                            <Link href="/signup" className="flex-1 md:flex-none bg-sor7ed-yellow text-black font-mono-headline text-xs tracking-widest uppercase px-8 py-4 hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(245,198,20,0.3)]">
                                Initialize Connection
                            </Link>
                            <Link href="/login" className="flex-1 md:flex-none border border-zinc-700 text-zinc-400 font-mono-headline text-xs tracking-widest uppercase px-8 py-4 hover:border-white hover:text-white transition-colors duration-300">
                                Auth Route
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
