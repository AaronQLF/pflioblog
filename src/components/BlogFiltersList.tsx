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

function SeriesFolder({ info, isExpanded, onToggle }: {
    info: SeriesInfo;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const totalReadingTime = info.posts.reduce((sum, p) => sum + p.readingTime, 0);

    return (
        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden transition-colors duration-200">
            <button
                onClick={onToggle}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[var(--color-surface-hover)] transition-colors duration-200"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[var(--color-muted)] text-sm shrink-0 transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                        ▸
                    </span>
                    <div className="min-w-0">
                        <h3 className="text-base font-medium truncate">{info.name}</h3>
                        <p className="text-xs font-mono text-[var(--color-muted)] mt-0.5">
                            {info.posts.length} {info.posts.length === 1 ? 'post' : 'posts'} · {totalReadingTime}m total
                        </p>
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="border-t border-[var(--color-border)]">
                    {info.posts.map((post, idx) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                            <div className="px-5 py-3.5 flex items-center gap-3 hover:bg-[var(--color-surface-hover)] transition-colors duration-200 border-b border-[var(--color-border)] last:border-0">
                                <span className="text-xs font-mono text-[var(--color-muted)] w-5 shrink-0 text-right">
                                    {idx + 1}.
                                </span>
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm group-hover:text-[var(--color-accent)] transition-colors duration-200 truncate">
                                        {post.title}
                                    </p>
                                </div>
                                <span className="text-xs font-mono text-[var(--color-muted)] shrink-0">
                                    {post.readingTime}m
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function PostRow({ post }: { post: BlogPostMeta }) {
    return (
        <Link href={`/blog/${post.slug}`} className="block group">
            <article className="py-5 border-b border-[var(--color-border)] last:border-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {post.tags.map((tag) => (
                                <span key={tag} className="tag text-xs">
                                    {tag}
                                </span>
                            ))}
                            {post.series && (
                                <span className="text-xs font-mono px-2 py-0.5 rounded border border-[var(--color-accent)] text-[var(--color-accent)] opacity-70">
                                    {post.series}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-medium group-hover:text-[var(--color-accent)] transition-colors duration-200 mb-1">
                            {post.title}
                        </h2>
                        <p className="text-sm text-[var(--color-muted)] line-clamp-1">
                            {post.excerpt}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-sm font-mono text-[var(--color-muted)] whitespace-nowrap">
                            {new Date(post.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                        <p className="text-sm font-mono text-[var(--color-muted)] mt-0.5">
                            {post.readingTime}m
                        </p>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default function BlogFiltersList({ posts, series, tags, searchIndex }: Props) {
    const [query, setQuery] = useState("");
    const [activeSeries, setActiveSeries] = useState<string | null>(null);
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
    const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

    const toggleSeries = (name: string) => {
        setExpandedSeries((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const toggleTag = (name: string) => {
        setActiveTags((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const [showAllTags, setShowAllTags] = useState(false);
    const TAG_PREVIEW_COUNT = 8;

    const hasActiveFilters = activeTags.size > 0;
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

        if (activeTags.size === 0) return results;
        return results.filter(({ post }) =>
            Array.from(activeTags).every((t) => postHasTag(post, t))
        );
    }, [posts, searchIndex, query, activeTags]);

    const filteredBySeriesPosts = useMemo(() => {
        let base: BlogPostMeta[];
        if (!activeSeries) {
            base = posts;
        } else {
            const seriesInfo = series.find((s) => s.name === activeSeries);
            base = seriesInfo ? seriesInfo.posts : posts;
        }
        return filterByTags(base);
    }, [posts, series, activeSeries, activeTags]);

    const standalonePosts = useMemo(() => {
        return filterByTags(posts.filter((p) => !p.series));
    }, [posts, activeTags]);

    const filteredSeries = useMemo(() => {
        if (activeTags.size === 0) return series;
        return series
            .map((s) => ({
                ...s,
                posts: s.posts.filter((p) =>
                    Array.from(activeTags).every((t) => postHasTag(p, t))
                ),
            }))
            .filter((s) => s.posts.length > 0);
    }, [series, activeTags]);

    const showFolderView = !isSearching && !activeSeries;

    return (
        <div>
            {/* Series pills */}
            {series.length > 0 && (
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <button
                        onClick={() => setActiveSeries(null)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors duration-200 ${
                            !activeSeries
                                ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5'
                                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                        }`}
                    >
                        All
                    </button>
                    {series.map((s) => (
                        <button
                            key={s.name}
                            onClick={() => setActiveSeries(activeSeries === s.name ? null : s.name)}
                            className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors duration-200 ${
                                activeSeries === s.name
                                    ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5'
                                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                            }`}
                        >
                            {s.name}
                            <span className="ml-1.5 opacity-60">{s.posts.length}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Tag pills */}
            {tags.length > 0 && (() => {
                const visibleTags = showAllTags ? tags : tags.slice(0, TAG_PREVIEW_COUNT);
                const hiddenCount = tags.length - TAG_PREVIEW_COUNT;
                return (
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                        <span className="text-xs font-mono text-[var(--color-muted)] mr-1">Tags</span>
                        {visibleTags.map((tag) => (
                            <button
                                key={tag.name}
                                onClick={() => toggleTag(tag.name)}
                                className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-colors duration-200 ${
                                    activeTags.has(tag.name)
                                        ? 'border-[var(--color-fg)] text-[var(--color-fg)] bg-[var(--color-fg)]/10'
                                        : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-fg)]/40 hover:text-[var(--color-fg)]'
                                }`}
                            >
                                {tag.name}
                                <span className="ml-1 opacity-50">{tag.count}</span>
                            </button>
                        ))}
                        {!showAllTags && hiddenCount > 0 && (
                            <button
                                onClick={() => setShowAllTags(true)}
                                className="text-xs font-mono px-2.5 py-1 rounded-full border border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-fg)]/40 hover:text-[var(--color-fg)] transition-colors duration-200"
                            >
                                +{hiddenCount} more
                            </button>
                        )}
                        {showAllTags && hiddenCount > 0 && (
                            <button
                                onClick={() => setShowAllTags(false)}
                                className="text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
                            >
                                less
                            </button>
                        )}
                        {hasActiveFilters && (
                            <button
                                onClick={() => setActiveTags(new Set())}
                                className="text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200 ml-1"
                            >
                                clear
                            </button>
                        )}
                    </div>
                );
            })()}

            {/* Search */}
            <div className="mb-8">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full text-sm px-4 py-2.5 rounded-lg bg-transparent border border-[var(--color-border)] text-[#1a1a1a] dark:text-[#e8e4df] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors duration-200 font-sans"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors text-xs font-mono"
                        >
                            clear
                        </button>
                    )}
                </div>
            </div>

            {/* Search results mode */}
            {isSearching && searchResults && (
                searchResults.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)] py-8 text-center">
                        No posts match your search.
                    </p>
                ) : (
                    <div className="space-y-0">
                        {searchResults.map(({ post }) => (
                            <PostRow key={post.slug} post={post} />
                        ))}
                    </div>
                )
            )}

            {/* Series filter mode */}
            {!isSearching && activeSeries && (
                filteredBySeriesPosts.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)] py-8 text-center">
                        No posts match{hasActiveFilters ? ' the selected tags in this series' : ' in this series yet'}.
                    </p>
                ) : (
                    <div className="space-y-0">
                        {filteredBySeriesPosts.map((post) => (
                            <PostRow key={post.slug} post={post} />
                        ))}
                    </div>
                )
            )}

            {/* Default folder view */}
            {showFolderView && (
                <>
                    {filteredSeries.length > 0 && (
                        <div className="space-y-3 mb-10">
                            {filteredSeries.map((s) => (
                                <SeriesFolder
                                    key={s.name}
                                    info={s}
                                    isExpanded={expandedSeries.has(s.name)}
                                    onToggle={() => toggleSeries(s.name)}
                                />
                            ))}
                        </div>
                    )}

                    <div className="space-y-0">
                        {standalonePosts.length > 0 && filteredSeries.length > 0 && (
                            <p className="text-xs font-mono text-[var(--color-muted)] mb-4 uppercase tracking-wider">
                                Standalone posts
                            </p>
                        )}
                        {standalonePosts.map((post) => (
                            <PostRow key={post.slug} post={post} />
                        ))}
                    </div>

                    {hasActiveFilters && standalonePosts.length === 0 && filteredSeries.length === 0 && (
                        <p className="text-sm text-[var(--color-muted)] py-8 text-center">
                            No posts match the selected tags.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
