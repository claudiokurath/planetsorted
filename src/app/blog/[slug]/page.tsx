import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import blogData from '../../../data/blog.json';

type Params = Promise<{ slug: string }>;

export default async function BlogDetailPage(props: { params: Params }) {
    const { slug } = await props.params;
    const post = (blogData as any[]).find(p => p.Slug === slug || p.Title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);

    if (!post) {
        notFound();
    }

    const getFallbackImage = (index: number) => {
        const backup = [
            "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop"
        ];
        return backup[index % backup.length];
    };

    const coverSrc = post["Cover Image"] || getFallbackImage(0);

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
            // TRANSMISSION_LOG // {post["Publish Date"] || "DATE UNKNOWN"}
                    </div>
                    <h1 className="font-fuel-decay text-5xl md:text-7xl uppercase tracking-tight text-white leading-none">
                        {post.Title}
                    </h1>
                </header>

                <div className="relative w-full h-80 overflow-hidden border border-white/10 bg-black shadow-lg">
                    <Image
                        src={coverSrc}
                        alt={post.Title}
                        fill
                        className="object-cover opacity-60 mix-blend-screen"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <article className="font-roboto text-zinc-300 leading-relaxed space-y-6 text-lg">
                    {post.Summary && (
                        <p className="text-xl text-zinc-100 font-light border-l-2 border-sor7ed-yellow pl-4">
                            {post.Summary}
                        </p>
                    )}

                    <div className="bg-[#111] border border-white/10 p-8 md:p-12 relative overflow-hidden mt-12 group">
                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <h2 className="font-fuel-decay text-3xl md:text-4xl uppercase tracking-wide text-sor7ed-yellow">
                                FULL POST LOCKED
                            </h2>
                            <p className="font-roboto text-zinc-400 max-w-lg leading-relaxed pt-4">
                                This transmission is restricted. Connect your device to the SOR7ED system to read the full brief.
                            </p>
                            <div className="pt-6 flex gap-4 w-full md:w-auto">
                                <Link href="/signup" className="flex-1 md:flex-none bg-sor7ed-yellow text-black font-mono-headline text-xs tracking-widest uppercase px-8 py-4 hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(245,198,20,0.3)]">
                                    Initialize Connection
                                </Link>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
