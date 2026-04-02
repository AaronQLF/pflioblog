import { getPostBySlug, getAllPostSlugs } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import BlogContent from '@/components/BlogContent';
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

    return (
        <main className="min-h-screen pt-24">
            <Header />
            <article className="container py-16 max-w-3xl select-none">
                <Link
                    href="/blog"
                    className="link-hover-line inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200 mb-10 group"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
                    All posts
                </Link>

                <FadeIn>
                    <header className="mb-14">
                        <div className="flex items-center gap-2 mb-4">
                            {post.tags.map((tag) => (
                                <span key={tag} className="tag text-xs">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-serif italic mb-5 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-3 text-sm font-mono text-[var(--color-muted)]">
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
                        <hr className="border-t border-[var(--color-border)] mt-8" />
                    </header>
                </FadeIn>

                <BlogContent content={post.content} />
            </article>
        </main>
    );
}
