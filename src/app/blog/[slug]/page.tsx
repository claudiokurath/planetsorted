import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Client } from '@notionhq/client';
import NotionRenderer from '@/components/NotionRenderer';
import blogData from '../../../data/blog.json';

export const dynamic = 'force-dynamic';

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

    // Format the Template string to look like an actual article rather than a raw bot script
    let formattedTemplate = post.Template || "";
    // Remove the trailing "— SOR7ED" signature if present
    formattedTemplate = formattedTemplate.replace(/—\s*SOR7ED/g, '');
    
    // Split by Markdown hyphens so we can style sections distinctly
    const templateSections = formattedTemplate.split('---').map((s: string) => s.trim()).filter(Boolean);

    let notionBlocks: any[] = [];
    let errorMessage: string | null = null;
    let liveTitle: string | null = null;
    let liveTLDR: string | null = null;
    let liveAdCopy: string | null = null;
    let liveCTA: string | null = null;

    const notionSecret = process.env.NOTION_SECRET || process.env.NOTION_API_KEY;
    const articleDbId = process.env.NOTION_ARTICLES_DB_ID || 'db668e4687ed455498357b8d11d2c714';
    
    if (notionSecret) {
        try {
            const notion = new Client({ auth: notionSecret });
            const pageQuery = await notion.databases.query({
                database_id: articleDbId.replace(/-/g, ''),
                filter: {
                    property: 'Slug',
                    rich_text: { equals: slug }
                }
            });

            if (pageQuery.results.length > 0) {
                const pageId = pageQuery.results[0].id;
                const liveProps = (pageQuery.results[0] as any).properties;
                
                const extractText = (prop: any) => {
                    if (!prop) return null;
                    if (prop.type === 'rich_text') return prop.rich_text.map((t:any) => t.plain_text).join('');
                    if (prop.type === 'title') return prop.title.map((t:any) => t.plain_text).join('');
                    return null;
                };

                liveTitle = extractText(liveProps['Title']) || extractText(liveProps['Name']);
                liveTLDR = extractText(liveProps['TL;DR']) || extractText(liveProps['TLDR']);
                liveAdCopy = extractText(liveProps['Ad Copy']);
                liveCTA = extractText(liveProps['CTA']);
                
                
                // Fetch all blocks on the page
                let blockCursor: string | undefined;
                do {
                    const blockRes: any = await notion.blocks.children.list({
                        block_id: pageId,
                        start_cursor: blockCursor,
                        page_size: 100,
                    });
                    notionBlocks = [...notionBlocks, ...blockRes.results];
                    blockCursor = blockRes.next_cursor || undefined;
                } while (blockCursor);
            } else {
                errorMessage = `No page found in Notion DB ${articleDbId} with Slug '${slug}'. (Check if the Notion Integration has access to the Blog Database!)`;
            }
        } catch (error: any) {
            errorMessage = error.message;
            console.error("Failed to fetch page body from Notion:", error);
        }
    } else {
        errorMessage = "No NOTION_SECRET environment variable is configured on Vercel.";
    }

    // Parse the CTA to extract the raw URL into a big button style
    const ctaTextRaw = liveCTA || post.CTA || "";
    const urlRegex = /(https:\/\/wa\.me\/[^\s]+)/;
    const ctaMatch = ctaTextRaw.match(urlRegex);
    const ctaUrl = ctaMatch ? ctaMatch[0] : null;
    let ctaCleanText = ctaTextRaw;
    if (ctaUrl) {
        ctaCleanText = ctaTextRaw.replace(ctaUrl, '').replace(/Text.*?to\s+for/i, 'Click below for').replace(/to\s*for/i, 'for').trim();
    }

    return (
        <div className="min-h-screen bg-sor7ed-black text-white selection:bg-sor7ed-yellow selection:text-black pt-24 pb-32">
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <Link href="/" className="font-fuel-decay text-3xl tracking-widest uppercase hover:text-sor7ed-yellow transition-colors">
                    SOR7ED
                </Link>
                <Link href="/login" className="border border-sor7ed-yellow text-sor7ed-yellow hover:bg-sor7ed-yellow hover:text-black px-4 py-2 text-xs uppercase tracking-widest transition-colors font-mono-headline">
                    Access System
                </Link>
            </nav>

            <main className="max-w-3xl mx-auto px-6 space-y-16">
                <header className="space-y-6 pt-8 text-center">
                    <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 text-sor7ed-yellow font-mono-headline text-xs tracking-widest uppercase">
                        TRANSMISSION // {post["Publish Date"] || "DATE UNKNOWN"}
                    </div>
                    <h1 className="font-fuel-decay text-5xl md:text-6xl uppercase tracking-tight text-white leading-none mx-auto max-w-2xl">
                        {liveTitle || post.Title}
                    </h1>
                </header>

                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl border border-white/5 shadow-2xl">
                    <Image
                        src={coverSrc}
                        alt={post.Title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sor7ed-black via-transparent to-transparent opacity-80" />
                </div>

                <article className="font-roboto text-zinc-300 leading-relaxed space-y-10 text-lg">
                    
                    {/* TL;DR Section */}
                    {(liveTLDR || post["TL;DR"]) && (
                        <div className="whitespace-pre-wrap font-roboto text-xl md:text-2xl text-white font-light border-l-4 border-sor7ed-yellow pl-6 leading-relaxed">
                            {liveTLDR || post["TL;DR"]}
                        </div>
                    )}
                    
                    {/* Ad Copy Section */}
                    {(liveAdCopy || post["Ad Copy"]) && (
                        <div className="whitespace-pre-wrap font-roboto text-lg md:text-xl text-zinc-300 leading-loose pt-4">
                            {liveAdCopy || post["Ad Copy"]}
                        </div>
                    )}

                    {notionBlocks.length > 0 ? (
                        <div className="pt-8">
                            <NotionRenderer blocks={notionBlocks} />
                        </div>
                    ) : (
                        <div className="space-y-8 pt-6">
                            {errorMessage && (
                                <div className="bg-red-900/40 border border-red-500/50 p-6 rounded-lg text-red-200 font-mono-headline text-sm mb-6">
                                    <h4 className="text-red-400 font-bold mb-2 break-words">SYSTEM ERROR: UNABLE TO FETCH FROM NOTION</h4>
                                    <p className="break-words">{errorMessage}</p>
                                    <p className="mt-4 text-xs text-red-400/80">
                                        If it says "Object not found", you must open the Notion Blog database, click the ••• menu in top right, click "Connections" or "Add Connections", and grant access to your SOR7ED Integration bot!
                                    </p>
                                </div>
                            )}
                            {templateSections.length > 0 && templateSections.map((section: string, idx: number) => (
                                <div key={idx} className="whitespace-pre-wrap font-roboto text-lg md:text-xl text-zinc-300 leading-loose">
                                    {section}
                                </div>
                            ))}
                        </div>
                    )}

                    {post.CTA && (
                        <div className="mt-16 bg-[#111] border border-white/10 p-8 md:p-12 rounded-2xl flex flex-col items-center text-center space-y-6 shadow-[0_0_40px_rgba(245,198,20,0.08)]">
                            <h3 className="font-fuel-decay text-3xl text-sor7ed-yellow uppercase tracking-wide">
                                NEED PERSONALIZED PROTOCOLS?
                            </h3>
                            <p className="font-roboto text-xl text-white max-w-lg">
                                {ctaCleanText}
                            </p>
                            
                            {ctaUrl ? (
                                <a 
                                    href={ctaUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="mt-4 bg-sor7ed-yellow text-black font-extrabold font-mono-headline tracking-widest uppercase px-10 py-5 hover:bg-white transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(245,198,20,0.3)] block w-full md:w-auto"
                                >
                                    OPEN IN WHATSAPP →
                                </a>
                            ) : (
                                <p className="text-sor7ed-yellow font-mono-headline text-sm tracking-widest">{ctaTextRaw}</p>
                            )}
                        </div>
                    )}
                </article>
            </main>
        </div>
    );
}
