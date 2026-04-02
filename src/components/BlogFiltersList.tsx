"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";
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
    searchIndex: TfIdfIndex;
}

export default function BlogFiltersList({ posts, searchIndex }: Props) {
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        const q = query.trim();
        let ranked: { post: BlogPostMeta; score: number }[];

        if (q.length > 0) {
            const tokens = tokenize(q);
            if (tokens.length === 0) {
                ranked = posts.map((post) => ({ post, score: 0 }));
            } else {
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

                ranked = posts
                    .map((post) => ({
                        post,
                        score: cosineSimilarity(queryVec, searchIndex.docs[post.slug] ?? {}),
                    }))
                    .filter(({ score }) => score > 0)
                    .sort((a, b) => b.score - a.score);
            }
        } else {
            ranked = posts.map((post) => ({ post, score: 0 }));
        }

        return ranked;
    }, [posts, searchIndex, query]);

    return (
        <div>
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

            {/* Results */}
            {results.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)] py-8 text-center">
                    No posts match the current filters.
                </p>
            ) : (
                <div className="space-y-0">
                    {results.map(({ post }) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                            <article className="py-5 border-b border-[var(--color-border)] last:border-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {post.tags.map((tag) => (
                                                <span key={tag} className="tag text-xs">
                                                    {tag}
                                                </span>
                                            ))}
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
                    ))}
                </div>
            )}
        </div>
    );
}
