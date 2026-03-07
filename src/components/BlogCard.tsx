"use client";

import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog';

interface BlogCardProps {
    posts: BlogPostMeta[];
}

export default function BlogCard({ posts }: BlogCardProps) {
    return (
        <div className="glass-card hover-scale h-full">
            <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-black dark:text-white">Writing</h2>
                    <Link
                        href="/blog"
                        className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        All posts →
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">No posts yet.</p>
                ) : (
                    <div className="space-y-4 flex-grow">
                        {posts.slice(0, 4).map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                                <div className="flex items-start gap-3">
                                    {/* Date column */}
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 whitespace-nowrap mt-0.5 w-16 shrink-0">
                                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                                    </span>

                                    {/* Content */}
                                    <div className="min-w-0 flex-grow">
                                        <h3 className="text-xs font-medium text-gray-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {post.tags.slice(0, 2).map((tag) => (
                                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400">
                                                    {tag}
                                                </span>
                                            ))}
                                            <span className="text-[9px] text-slate-400 dark:text-zinc-500">{post.readingTime}m</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
