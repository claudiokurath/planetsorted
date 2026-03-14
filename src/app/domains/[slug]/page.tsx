import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import toolsData from '../../../data/tools.json';
import blogData from '../../../data/blog.json';

const SECTIONS = [
    { id: "01", name: "Keep Going", annotation: "// FUEL_SYSTEM", description: "Protocols for burnout recovery, task initiation, and maintaining momentum without relying on anxiety." },
    { id: "02", name: "Feel Good", annotation: "// BIOMETRICS", description: "Somatic regulation, dopamine management, and building physical well-being alongside neurodivergence." },
    { id: "03", name: "Spend Smart", annotation: "// CAPITAL", description: "Strategies to reduce the ADHD tax, guilt-free financial automation, and impulse management tools." },
    { id: "04", name: "Be Connected", annotation: "// NETWORK", description: "Navigating Rejection Sensitive Dysphoria (RSD), setting boundaries, and maintaining relationships without burnout." },
    { id: "05", name: "Plan Ahead", annotation: "// LOGISTICS", description: "Working with time blindness, designing functional routines, and offloading executive functioning." },
    { id: "06", name: "Be Yourself", annotation: "// IDENTITY", description: "Unmasking strategies, self-advocacy protocols, and dismantling systemic shame." },
    { id: "07", name: "Level Up", annotation: "// EXPANSION", description: "Harnessing hyperfocus, career progression, and building sustainable side-hustles." },
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

type Params = Promise<{ slug: string }>;

export default async function DomainDetailPage(props: { params: Params }) {
    const { slug } = await props.params;
    const domain = SECTIONS.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === slug);

    if (!domain) {
        notFound();
    }

    const domainTools = (toolsData as any[]).filter(tool => tool.Status === "Published" && tool.Branch === domain.name);
    const domainBlogs = (blogData as any[]).filter(post => post.Status === "Published" && post.Branch === domain.name);

    return (
        <div className="min-h-screen bg-sor7ed-black text-white selection:bg-sor7ed-yellow selection:text-black pt-24 pb-20">
            {/* Quick Nav */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-sor7ed-gray-light px-6 py-4 flex justify-between items-center">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <Image src="/images/Logo.PNG" alt="SOR7ED Logo" width={100} height={30} className="object-contain" priority />
                </Link>
                <div className="flex gap-6 font-mono-headline text-xs uppercase tracking-widest text-zinc-400 items-center">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
                    <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    <div className="h-4 w-px bg-zinc-700 mx-2" />
                    <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 space-y-24">
                <header className="space-y-6 pt-12">
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
                    <p className="font-roboto text-xl text-zinc-400 font-light max-w-2xl mt-6">
                        {domain.description}
                    </p>
                </header>

                <section id="tools">
                    <div className="flex items-center justify-between mb-12 border-b border-sor7ed-gray-light pb-4">
                        <h2 className="font-fuel-decay text-5xl uppercase tracking-tight text-white leading-none">
                            DOMAIN TOOLS.
                        </h2>
                    </div>
                    {domainTools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {domainTools.map((tool, idx) => (
                                <Link href={`/tools/${tool.Slug || '#'}`} key={idx} className="group relative bg-black border border-white/10 hover:-translate-y-1 hover:border-white/30 transition-all duration-300 cursor-pointer min-h-[220px] flex flex-col justify-between overflow-hidden p-6 text-left">
                                    <Image
                                        src={tool["Cover Image"] || getFallbackImage('tool', idx)}
                                        alt={tool.Name || "Tool"}
                                        fill
                                        className="object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500 blur-[1px] group-hover:blur-none"
                                    />
                                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500 pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />
                                    <div className="z-10 relative flex w-full justify-between items-start">
                                        <span className="font-mono-headline text-[10px] text-zinc-500 border border-zinc-700 px-2 py-1 uppercase bg-black/50">
                                            v2.0
                                        </span>
                                    </div>
                                    <div className="z-10 relative mt-8 w-full">
                                        <h4 className="font-fuel-decay text-5xl md:text-6xl uppercase leading-none tracking-tight text-white group-hover:text-sor7ed-yellow transition-colors">{tool.Name}</h4>
                                        <p className="font-roboto text-xs md:text-sm text-zinc-400 uppercase tracking-wider font-medium mt-2">{tool.Description || "SYSTEM OPTIMIZATION TOOL"}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-dashed border-zinc-800 bg-zinc-900/50">
                            <p className="font-mono-headline text-xs uppercase text-zinc-500">
                                No tools found in this domain array.
                            </p>
                        </div>
                    )}
                </section>

                <section id="blogs">
                    <div className="flex items-center justify-between mb-12 border-b border-sor7ed-gray-light pb-4">
                        <h2 className="font-fuel-decay text-5xl uppercase tracking-tight text-white leading-none">
                            TRANSMISSIONS.
                        </h2>
                    </div>
                    {domainBlogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {domainBlogs.map((post, idx) => (
                                <Link href={`/blog/${post.Slug || '#'}`} key={idx} className="group relative bg-black border border-white/10 hover:-translate-y-1 hover:border-white/30 transition-all duration-300 cursor-pointer min-h-[220px] flex flex-col justify-between overflow-hidden p-6 text-left">
                                    <Image
                                        src={post["Cover Image"] || getFallbackImage('blog', idx)}
                                        alt={post.Title || "Post"}
                                        fill
                                        className="object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500 blur-[1px] group-hover:blur-none"
                                    />
                                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500 pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />
                                    <div className="z-10 relative flex w-full justify-between items-start">
                                        <p className="font-mono-headline text-[10px] text-sor7ed-yellow uppercase tracking-widest border border-sor7ed-yellow/30 px-2 py-1 bg-black/50">{post["Publish Date"] || "TRANSMISSION DATE UNKNOWN"}</p>
                                    </div>
                                    <div className="z-10 relative mt-8 w-full">
                                        <h4 className="font-fuel-decay text-5xl md:text-6xl uppercase leading-none tracking-tight text-white group-hover:text-sor7ed-yellow transition-colors">{post.Title}</h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-dashed border-zinc-800 bg-zinc-900/50">
                            <p className="font-mono-headline text-xs uppercase text-zinc-500">
                                No transmissions found in this domain array.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
