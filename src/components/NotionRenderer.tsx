import React from 'react';

export default function NotionRenderer({ blocks }: { blocks: any[] }) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="space-y-6">
            {blocks.map((block) => {
                const { id, type } = block;
                const value = block[type];

                switch (type) {
                    case 'paragraph':
                        return (
                            <p key={id} className="text-lg text-zinc-300 leading-relaxed font-roboto">
                                <RichText text={value.rich_text} />
                            </p>
                        );
                    case 'heading_1':
                        return (
                            <h2 key={id} className="font-fuel-decay text-4xl text-white uppercase tracking-wide mt-12 mb-6">
                                <RichText text={value.rich_text} />
                            </h2>
                        );
                    case 'heading_2':
                        return (
                            <h3 key={id} className="font-fuel-decay text-3xl text-sor7ed-yellow uppercase tracking-wide mt-10 mb-4">
                                <RichText text={value.rich_text} />
                            </h3>
                        );
                    case 'heading_3':
                        return (
                            <h4 key={id} className="font-mono-headline text-xl text-white tracking-widest uppercase mt-8 mb-4">
                                <RichText text={value.rich_text} />
                            </h4>
                        );
                    case 'bulleted_list_item':
                        return (
                            <ul key={id} className="list-disc list-inside text-lg text-zinc-300 font-roboto leading-relaxed">
                                <li><RichText text={value.rich_text} /></li>
                            </ul>
                        );
                    case 'numbered_list_item':
                        return (
                            <ol key={id} className="list-decimal list-inside text-lg text-zinc-300 font-roboto leading-relaxed">
                                <li><RichText text={value.rich_text} /></li>
                            </ol>
                        );
                    case 'quote':
                        return (
                            <blockquote key={id} className="border-l-4 border-sor7ed-yellow pl-6 py-2 my-8 text-xl text-zinc-100 font-light italic">
                                <RichText text={value.rich_text} />
                            </blockquote>
                        );
                    case 'divider':
                        return <hr key={id} className="border-white/10 my-10" />;
                    case 'image':
                        const src = value.type === 'external' ? value.external.url : value.file.url;
                        return (
                            <div key={id} className="relative w-full my-10 aspect-video overflow-hidden rounded-xl border border-white/5 shadow-2xl">
                                <img src={src} alt="Article graphic" className="w-full h-full object-cover opacity-80" />
                            </div>
                        );
                    case 'callout':
                        return (
                            <div key={id} className="bg-sor7ed-yellow/10 border border-sor7ed-yellow/30 p-6 rounded-xl my-8">
                                <p className="text-zinc-200 font-roboto text-lg">
                                    <span className="mr-3">{value.icon?.emoji}</span>
                                    <RichText text={value.rich_text} />
                                </p>
                            </div>
                        );
                    default:
                        // Unsupported empty block
                        return null;
                }
            })}
        </div>
    );
}

const RichText = ({ text }: { text: any[] }) => {
    if (!text) return null;
    return (
        <>
            {text.map((t, i) => {
                const { annotations } = t;
                const classes = [
                    annotations.bold ? 'font-bold text-white' : '',
                    annotations.italic ? 'italic' : '',
                    annotations.strikethrough ? 'line-through' : '',
                    annotations.underline ? 'underline' : '',
                    annotations.code ? 'bg-zinc-800 text-sor7ed-yellow px-2 py-0.5 rounded font-mono text-sm' : ''
                ].filter(Boolean).join(' ');

                return (
                    <span key={i} className={classes || undefined}>
                        {t.text?.link ? (
                            <a href={t.text.link.url} className="text-sor7ed-yellow underline decoration-sor7ed-yellow/30 hover:decoration-sor7ed-yellow underline-offset-4 transition-colors">
                                {t.text.content}
                            </a>
                        ) : (
                            t.text?.content
                        )}
                    </span>
                );
            })}
        </>
    );
};
