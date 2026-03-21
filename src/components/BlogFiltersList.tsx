"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";
import type { TfIdfIndex } from "@/lib/blog";

type ReadingTimeBucket = "all" | "short" | "medium" | "long";

function matchesBucket(minutes: number, bucket: ReadingTimeBucket): boolean {
    if (bucket === "all") return true;
    if (bucket === "short") return minutes <= 5;
    if (bucket === "medium") return minutes >= 6 && minutes <= 12;
    return minutes >= 13;
}

const bucketLabels: Record<ReadingTimeBucket, string> = {
    all: "Any length",
    short: "≤ 5 min",
    medium: "6–12 min",
    long: "13+ min",
};

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
    const [readingTime, setReadingTime] = useState<ReadingTimeBucket>("all");

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

        return ranked.filter(({ post }) => matchesBucket(post.readingTime, readingTime));
    }, [posts, searchIndex, query, readingTime]);

    const hasActiveFilters = query.length > 0 || readingTime !== "all";

    const resetAll = () => {
        setQuery("");
        setReadingTime("all");
    };

    return (
        <div>
            {/* Filter controls */}
            <div className="glass-card p-5 mb-8 space-y-4">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full text-sm px-4 py-2.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors text-xs"
                        >
                            clear
                        </button>
                    )}
                </div>

                {/* Reading time + reset row */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                        {(Object.entries(bucketLabels) as [ReadingTimeBucket, string][]).map(
                            ([bucket, label]) => (
                                <button
                                    key={bucket}
                                    onClick={() => setReadingTime(bucket)}
                                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all duration-200 ${
                                        readingTime === bucket
                                            ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500"
                                            : "bg-white dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500"
                                    }`}
                                >
                                    {label}
                                </button>
                            )
                        )}
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={resetAll}
                            className="text-[11px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {results.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500 py-8 text-center">
                    No posts match the current filters.
                </p>
            ) : (
                <div className="grid gap-6">
                    {results.map(({ post }) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                            <article className="glass-card p-6 hover:shadow-md transition-all duration-300 group-hover:scale-[1.01]">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h2 className="text-lg font-semibold dark:text-white group-hover:text-primary transition-colors mb-1">
                                            {post.title}
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-xs text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                                            {new Date(post.date).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                                            {post.readingTime} min read
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
