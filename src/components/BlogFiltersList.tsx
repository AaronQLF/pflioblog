"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BlogPostMeta, SeriesInfo, TagInfo } from "@/lib/blog";
import type { TfIdfIndex } from "@/lib/blog";

const STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
    'from','is','it','its','this','that','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','shall','should','may',
    'might','must','can','could','not','no','nor','so','if','then','than','too',
    'very','just','about','above','after','again','all','also','am','any','as',
    'because','before','between','both','during','each','few','further','get',
    'got','he','her','here','him','his','how','i','into','me','more','most','my',
    'now','only','other','our','out','over','own','re','same','she','some','such',
    'them','there','these','they','through','under','until','up','us','we','what',
    'when','where','which','while','who','whom','why','you','your',
]);

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function cosineSimilarity(
    queryVec: Record<string, number>,
    docVec: Record<string, number>
): number {
    let dot = 0;
    let qMag = 0;
    let dMag = 0;
    for (const [term, qw] of Object.entries(queryVec)) {
        qMag += qw * qw;
        if (term in docVec) dot += qw * docVec[term];
    }
    for (const dw of Object.values(docVec)) dMag += dw * dw;
    if (qMag === 0 || dMag === 0) return 0;
    return dot / (Math.sqrt(qMag) * Math.sqrt(dMag));
}

interface Props {
    posts: BlogPostMeta[];
    series: SeriesInfo[];
    tags: TagInfo[];
    searchIndex: TfIdfIndex;
}

function PostEntry({ post, isHero = false }: { post: BlogPostMeta, isHero?: boolean }) {
    // Format date as YYYY-MM-DD
    const dateStr = new Date(post.date).toISOString().split('T')[0];

    return (
        <Link href={`/blog/${post.slug}`} className="block group mb-12 last:mb-0">
            <article className="border-t-[1.5px] border-[var(--color-fg)] pt-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-3">
                    <p className="text-sm font-mono text-[var(--color-fg)] font-medium">
                        {dateStr}
                    </p>
                    <div className="flex gap-2 text-xs font-mono text-[var(--color-muted)] uppercase tracking-widest flex-wrap">
                        {post.tags.map(tag => `[${tag}]`).join(' ')}
                        {post.series && ` // SERIES: ${post.series}`}
                    </div>
                </div>
                
                <h2 className={`${isHero ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-serif text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition-colors duration-200 mb-4`}>
                    {post.title}
                </h2>
                
                <p className={`text-[15px] sm:text-base text-[var(--color-fg)] opacity-80 leading-[1.8] font-serif ${isHero ? 'line-clamp-4' : 'line-clamp-3'}`}>
                    <span className="font-semibold text-[var(--color-fg)] opacity-100 font-sans text-sm uppercase tracking-widest mr-2">Abstract.</span> 
                    {post.excerpt}
                </p>
            </article>
        </Link>
    );
}

export default function BlogFiltersList({ posts, series, tags, searchIndex }: Props) {
    const [query, setQuery] = useState("");
    const [activeSeries, setActiveSeries] = useState<string | null>(null);
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

    const toggleTag = (name: string) => {
        setActiveTags((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const [showAllTags, setShowAllTags] = useState(false);
    const TAG_PREVIEW_COUNT = 10;

    const isSearching = query.trim().length > 0;

    function postHasTag(post: BlogPostMeta, tag: string): boolean {
        return post.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
    }

    function filterByTags(postList: BlogPostMeta[]): BlogPostMeta[] {
        if (activeTags.size === 0) return postList;
        return postList.filter((p) =>
            Array.from(activeTags).every((t) => postHasTag(p, t))
        );
    }

    const searchResults = useMemo(() => {
        const q = query.trim();
        if (q.length === 0) return null;

        const tokens = tokenize(q);
        if (tokens.length === 0) return posts.map((post) => ({ post, score: 0 }));

        const tf: Record<string, number> = {};
        for (const t of tokens) tf[t] = (tf[t] ?? 0) + 1;
        const maxTf = Math.max(...Object.values(tf));
        const queryVec: Record<string, number> = {};
        for (const [term, count] of Object.entries(tf)) {
            const idfVal = searchIndex.idf[term];
            if (idfVal !== undefined) {
                queryVec[term] = (0.5 + 0.5 * count / maxTf) * idfVal;
            }
        }

        const results = posts
            .map((post) => ({
                post,
                score: cosineSimilarity(queryVec, searchIndex.docs[post.slug] ?? {}),
            }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score);

        let filtered = results;
        if (activeSeries) {
            filtered = filtered.filter(({ post }) => post.series === activeSeries);
        }
        if (activeTags.size > 0) {
            filtered = filtered.filter(({ post }) =>
                Array.from(activeTags).every((t) => postHasTag(post, t))
            );
        }
        return filtered;
    }, [posts, searchIndex, query, activeTags, activeSeries]);

    const displayedPosts = useMemo(() => {
        if (isSearching && searchResults) {
            return searchResults.map(r => r.post);
        }
        let base = posts;
        if (activeSeries) {
            const seriesInfo = series.find((s) => s.name === activeSeries);
            base = seriesInfo ? seriesInfo.posts : [];
        }
        return filterByTags(base);
    }, [posts, series, activeSeries, activeTags, isSearching, searchResults]);

    return (
        <div className="flex flex-col lg:flex-row gap-16 items-start relative">
            {/* Sidebar */}
            <aside className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-28">
                <div className="mb-12">
                    <h1 className="text-4xl font-serif text-[var(--color-fg)] tracking-tight mb-4">Publications</h1>
                    <p className="text-[13px] font-mono text-[var(--color-muted)] leading-relaxed uppercase tracking-wider mb-6">
                        Archive // Research & Engineering
                    </p>
                    <Link
                        href="/blog/galaxy"
                        className="font-mono text-xs text-[var(--color-fg)] underline underline-offset-4 decoration-[var(--color-border)] hover:decoration-[var(--color-accent)] transition-colors"
                    >
                        View 3D Semantic Map &rarr;
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-10">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="QUERY..."
                            className="w-full text-xs font-mono uppercase tracking-widest px-0 py-2 bg-transparent border-0 border-b-[1.5px] border-[var(--color-fg)] text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors rounded-none shadow-none"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors text-[10px] font-mono uppercase tracking-widest"
                            >
                                [X]
                            </button>
                        )}
                    </div>
                </div>

                {/* Series filter */}
                {series.length > 0 && (
                    <div className="mb-10">
                        <p className="text-[11px] font-mono font-bold text-[var(--color-fg)] uppercase tracking-widest mb-4">Collections</p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveSeries(null)}
                                className={`text-left text-xs font-mono tracking-wide transition-colors duration-200 ${
                                    !activeSeries
                                        ? 'text-[var(--color-accent)] font-bold'
                                        : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
                                }`}
                            >
                                {'>'} ALL
                            </button>
                            {series.map((s) => (
                                <button
                                    key={s.name}
                                    onClick={() => setActiveSeries(s.name)}
                                    className={`text-left text-xs font-mono tracking-wide transition-colors duration-200 flex items-center justify-between ${
                                        activeSeries === s.name
                                            ? 'text-[var(--color-accent)] font-bold'
                                            : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
                                    }`}
                                >
                                    <span>{'>'} {s.name.toUpperCase()}</span>
                                    <span className="opacity-50">[{s.posts.length}]</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tags filter */}
                {tags.length > 0 && (() => {
                    const visibleTags = showAllTags ? tags : tags.slice(0, TAG_PREVIEW_COUNT);
                    const hiddenCount = tags.length - TAG_PREVIEW_COUNT;
                    return (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[11px] font-mono font-bold text-[var(--color-fg)] uppercase tracking-widest">Index</p>
                                {activeTags.size > 0 && (
                                    <button
                                        onClick={() => setActiveTags(new Set())}
                                        className="text-[10px] font-mono text-[var(--color-accent)] hover:underline"
                                    >
                                        [CLEAR]
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-2">
                                {visibleTags.map((tag) => (
                                    <button
                                        key={tag.name}
                                        onClick={() => toggleTag(tag.name)}
                                        className={`text-[11px] font-mono tracking-wide transition-colors duration-200 ${
                                            activeTags.has(tag.name)
                                                ? 'text-[var(--color-accent)] font-bold'
                                                : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
                                        }`}
                                    >
                                        #{tag.name.toUpperCase()}
                                    </button>
                                ))}
                                {!showAllTags && hiddenCount > 0 && (
                                    <button
                                        onClick={() => setShowAllTags(true)}
                                        className="text-[11px] font-mono tracking-wide text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors duration-200"
                                    >
                                        +{hiddenCount} MORE...
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </aside>

            {/* Main Content List */}
            <div className="flex-1 min-w-0 w-full pt-2">
                {displayedPosts.length === 0 ? (
                    <div className="py-20 border-t-[1.5px] border-[var(--color-fg)]">
                        <p className="text-[var(--color-fg)] font-mono text-sm uppercase tracking-widest">
                            No documents found.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {displayedPosts.map((post, index) => {
                            const isHero = index === 0;
                            return (
                                <PostEntry key={post.slug} post={post} isHero={isHero} />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
