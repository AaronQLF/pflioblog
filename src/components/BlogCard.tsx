"use client";

import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog';

interface BlogCardProps {
    posts: BlogPostMeta[];
}

export default function BlogCard({ posts }: BlogCardProps) {
    return (
        <div>
            <span className="text-xs font-mono text-[var(--color-border)] block mb-2">04</span>
            <div className="flex items-baseline justify-between mb-10">
                <h2 className="section-heading mb-0">Recent Writing</h2>
                <Link
                    href="/blog"
                    className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
                >
                    All posts &rarr;
                </Link>
            </div>

            {posts.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">No posts yet.</p>
            ) : (
                <div className="space-y-6">
                    {posts.slice(0, 5).map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                            <div className="flex items-baseline gap-4">
                                <span className="text-sm font-mono text-[var(--color-muted)] whitespace-nowrap shrink-0 w-20">
                                    {new Date(post.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="text-base font-medium link-hover-line group-hover:text-[var(--color-accent)] transition-colors duration-200 leading-snug">
                                        {post.title}
                                    </h3>
                                    {post.excerpt && (
                                        <p className="text-sm text-[var(--color-muted)] mt-1 line-clamp-1">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
