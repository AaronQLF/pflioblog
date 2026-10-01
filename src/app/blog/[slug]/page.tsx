import { getPostBySlug, getAllPostSlugs, getSeriesForPost } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import BlogContent from '@/components/BlogContent';
import MacWindowCard from '@/components/MacWindowCard';
import FadeIn from '@/components/FadeIn';

export async function generateStaticParams() {
    return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};
    return {
        title: `${post.title} | Haroun Guessous`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) notFound();

    const seriesCtx = getSeriesForPost(slug);
    const prevPost = seriesCtx && seriesCtx.currentIndex > 0
        ? seriesCtx.series.posts[seriesCtx.currentIndex - 1]
        : null;
    const nextPost = seriesCtx && seriesCtx.currentIndex < seriesCtx.series.posts.length - 1
        ? seriesCtx.series.posts[seriesCtx.currentIndex + 1]
        : null;

    return (
        <main className="min-h-screen pt-20 pb-20">
            <Header />
            <div className="container py-8 max-w-4xl">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200 mb-6 group"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
                    Back to writing index
                </Link>

                <FadeIn>
                    <MacWindowCard title={`${post.slug}.md`} actionText={`${post.readingTime} min read`}>
                        <header className="mb-10">
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="tag text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            {seriesCtx && (
                                <p className="text-xs font-mono text-[var(--color-accent)] mb-3 opacity-90 font-medium">
                                    {seriesCtx.series.name} · Part {seriesCtx.currentIndex + 1} of {seriesCtx.series.posts.length}
                                </p>
                            )}
                            <h1 className="text-3xl sm:text-5xl font-serif italic mb-4 leading-tight text-[var(--color-fg)]">
                                {post.title}
                            </h1>
                            <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-muted)] pb-4 border-b border-[var(--color-border)]">
                                <span>
                                    {new Date(post.date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                                <span>&middot;</span>
                                <span>{post.readingTime} min read</span>
                            </div>
                        </header>

                        <BlogContent content={post.content} />

                        {seriesCtx && (prevPost || nextPost) && (
                            <nav className="mt-14 pt-6 border-t border-[var(--color-border)]">
                                <p className="text-xs font-mono text-[var(--color-muted)] uppercase tracking-wider mb-4">
                                    {seriesCtx.series.name}
                                </p>
                                <div className="flex justify-between gap-4">
                                    {prevPost ? (
                                        <Link
                                            href={`/blog/${prevPost.slug}`}
                                            className="group flex-1 min-w-0 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                                        >
                                            <p className="text-xs font-mono text-[var(--color-muted)] mb-1">&larr; Previous</p>
                                            <p className="text-sm font-serif group-hover:text-[var(--color-accent)] transition-colors duration-200 truncate">
                                                {prevPost.title}
                                            </p>
                                        </Link>
                                    ) : <div className="flex-1" />}
                                    {nextPost ? (
                                        <Link
                                            href={`/blog/${nextPost.slug}`}
                                            className="group flex-1 min-w-0 text-right p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                                        >
                                            <p className="text-xs font-mono text-[var(--color-muted)] mb-1">Next &rarr;</p>
                                            <p className="text-sm font-serif group-hover:text-[var(--color-accent)] transition-colors duration-200 truncate">
                                                {nextPost.title}
                                            </p>
                                        </Link>
                                    ) : <div className="flex-1" />}
                                </div>
                            </nav>
                        )}
                    </MacWindowCard>
                </FadeIn>
            </div>
        </main>
    );
}
