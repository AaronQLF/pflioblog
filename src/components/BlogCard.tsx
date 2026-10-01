"use client";

import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog';
import MacWindowCard from './MacWindowCard';

interface BlogCardProps {
    posts: BlogPostMeta[];
}

export default function BlogCard({ posts }: BlogCardProps) {
    return (
        <MacWindowCard title="recent_writing.md" actionText={`${posts.length} posts`}>
            <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-[var(--color-border)]">
                <div>
                    <span className="text-[10px] font-mono text-[var(--color-accent)] block uppercase tracking-wider mb-1">
                        Publication Stream
                    </span>
                    <h2 className="section-heading mb-0 text-2xl sm:text-3xl">Recent Writing</h2>
                </div>
                <Link
                    href="/blog"
                    className="text-xs font-mono text-[var(--color-accent)] hover:underline flex items-center gap-1"
                >
                    View index &rarr;
                </Link>
            </div>

            {posts.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">No posts yet.</p>
            ) : (
                <div className="space-y-4">
                    {posts.slice(0, 5).map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                            <div className="p-3.5 rounded-lg border border-transparent group-hover:border-[var(--color-border)] group-hover:bg-[var(--color-surface-hover)] transition-all duration-200">
                                <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)] mb-1">
                                    <span>
                                        {new Date(post.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                    {post.series && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium">
                                            {post.series} #{post.seriesOrder}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-base font-serif font-medium group-hover:text-[var(--color-accent)] transition-colors duration-200 leading-snug text-[var(--color-fg)]">
                                    {post.title}
                                </h3>
                                {post.excerpt && (
                                    <p className="text-xs text-[var(--color-muted)] mt-1.5 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </MacWindowCard>
    );
}
