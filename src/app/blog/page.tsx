'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogDirectory() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/articles');
                if (!res.ok) throw new Error('Failed to fetch articles API endpoint');
                const data = await res.json();

                // Filter only published ones
                const published = data.filter((t: any) => t.Status === "Published");
                setPosts(published);
            } catch (err) {
                console.error("Error fetching articles:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const getFallbackImage = (index: number) => {
        const blogImages = [
            "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop"
        ];
        return blogImages[index % blogImages.length];
    };

    return (
        <div className="min-h-screen bg-sor7ed-black text-white selection:bg-sor7ed-yellow selection:text-black">
            {/* Quick Nav */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-sor7ed-gray-light px-6 py-4 flex justify-between items-center">
                <Link href="/" className="font-fuel-decay text-3xl tracking-widest uppercase hover:text-sor7ed-yellow transition-colors">
                    SOR7ED
                </Link>
                <div className="flex gap-6 font-mono-headline text-xs uppercase tracking-widest text-zinc-400 items-center">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
                    <Link href="/blog" className="text-white">Blog</Link>
                    <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    <div className="h-4 w-px bg-zinc-700 mx-2" />
                    <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 space-y-12 bg-sor7ed-black min-h-screen w-full">
                <header className="space-y-6">
                    <div className="inline-block px-3 py-1 border border-sor7ed-gray-light text-sor7ed-yellow font-mono-headline text-xs tracking-widest uppercase opacity-80 shadow-[0_0_15px_rgba(245,198,20,0.1)]">
                        // DIRECTORY // BLOG
                    </div>
                    <h1 className="font-fuel-decay text-6xl md:text-8xl uppercase tracking-tight text-white leading-none">
                        Transmission Log.
                    </h1>
                    <p className="font-roboto text-xl text-zinc-400 font-light max-w-2xl">
                        A real-time synchronization of system updates, thoughts, and architectural insights.
                    </p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                        <div className="w-12 h-12 border-2 border-sor7ed-yellow border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-mono-headline text-xs uppercase tracking-widest text-sor7ed-yellow animate-pulse">
                            Fetching from /api/articles...
                        </p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-zinc-800 bg-zinc-900/50">
                        <p className="font-mono-headline text-xs uppercase text-zinc-500">
                            No transmissions found in the system. API sync required.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post, idx) => (
                            <Link href={`/blog/${post.Slug || '#'}`} key={idx} className="group relative bg-black border border-white/10 hover:-translate-y-1 hover:border-white/30 transition-all duration-300 cursor-pointer min-h-[220px] flex flex-col justify-between overflow-hidden p-6 text-left">
                                <Image
                                    src={post["Cover Image"] || getFallbackImage(idx)}
                                    alt={post.Title || "Post"}
                                    fill
                                    className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-[1px] group-hover:blur-none"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity duration-500 pointer-events-none" />
                                <div className="z-10 relative flex w-full justify-between items-start">
                                    <p className="font-mono-headline text-[10px] text-sor7ed-yellow uppercase tracking-widest border border-sor7ed-yellow/30 px-2 py-1 bg-black/50">
                                        {post["Publish Date"] || "TRANSMISSION DATE UNKNOWN"}
                                    </p>
                                </div>
                                <div className="z-10 relative mt-8 w-full">
                                    <h4 className="font-fuel-decay text-5xl md:text-6xl uppercase leading-none tracking-tight text-white group-hover:text-sor7ed-yellow transition-colors">{post.Title}</h4>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
