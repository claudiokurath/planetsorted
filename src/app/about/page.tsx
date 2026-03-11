import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-sor7ed-black text-white selection:bg-sor7ed-yellow selection:text-black pt-24 pb-20">
            {/* Quick Nav */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-sor7ed-gray-light px-6 py-4 flex justify-between items-center">
                <Link href="/" className="font-fuel-decay text-3xl tracking-widest uppercase hover:text-sor7ed-yellow transition-colors">
                    SOR7ED
                </Link>
                <div className="flex gap-6 font-mono-headline text-xs uppercase tracking-widest text-zinc-400 items-center">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
                    <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    <Link href="/about" className="text-white">About</Link>
                    <div className="h-4 w-px bg-zinc-700 mx-2" />
                    <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 space-y-12">
                <header className="space-y-6 pt-12 border-b border-sor7ed-gray-light pb-12">
                    <div className="inline-block px-3 py-1 border border-sor7ed-gray-light text-sor7ed-yellow font-mono-headline text-xs tracking-widest uppercase opacity-80 shadow-[0_0_15px_rgba(245,198,20,0.1)]">
                        // PROTOCOL // ABOUT
                    </div>
                    <h1 className="font-fuel-decay text-6xl md:text-8xl uppercase tracking-tight text-white leading-none">
                        System Architecture.
                    </h1>
                </header>

                <article className="font-roboto text-zinc-300 leading-relaxed space-y-6 text-lg">
                    <p className="text-xl text-zinc-100 font-light border-l-2 border-sor7ed-yellow pl-4">
                        SOR7ED is a high-contrast stealth framework designed for mastering the seven core domains of a well-architected life. It provides unbreakable logic for neurodivergent minds.
                    </p>
                    <p>
                        The tools and transmissions provided within this environment are curated via active syncing algorithms designed to simplify executive functioning overhead, reduce cognitive friction, and enable sustainable systemic expansion.
                    </p>

                    <div className="bg-[#111] border border-white/10 p-8 md:p-12 relative overflow-hidden mt-12 group">
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <h2 className="font-fuel-decay text-3xl md:text-4xl uppercase tracking-wide text-sor7ed-yellow">
                                ENTER THE LAB
                            </h2>
                            <p className="font-roboto text-zinc-400 max-w-lg leading-relaxed pt-4">
                                Experience the full breadth of the architecture. Engage the internal protocols and instantiate your personal framework logic today.
                            </p>
                            <div className="pt-6 flex gap-4 w-full md:w-auto">
                                <Link href="/tools" className="flex-1 md:flex-none bg-sor7ed-yellow text-black font-mono-headline text-xs tracking-widest uppercase px-8 py-4 hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(245,198,20,0.3)]">
                                    Access Tool Directory
                                </Link>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
