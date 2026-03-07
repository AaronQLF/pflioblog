import { getPostBySlug, getAllPostSlugs } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import BlogContent from '@/components/BlogContent';

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
        <main className="min-h-screen pt-20">
            <Header />
            <article className="container py-16 max-w-3xl">
                {/* Back link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-10 group"
                >
                    <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                    All posts
                </Link>

                {/* Header */}
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold dark:text-white mb-4 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-zinc-500">
                        <span>
                            {new Date(post.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                        <span>·</span>
                        <span>{post.readingTime} min read</span>
                    </div>
                </header>

                {/* Content */}
                <div className="glass-card p-8 sm:p-10">
                    <BlogContent content={post.content} />
                </div>
            </article>
        </main>
    );
}
