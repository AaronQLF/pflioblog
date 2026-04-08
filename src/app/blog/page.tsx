import Link from 'next/link';
import { getAllPosts, getAllSeries, buildSearchIndex } from '@/lib/blog';
import Header from '@/components/Header';
import BlogFiltersList from '@/components/BlogFiltersList';
import FadeIn from '@/components/FadeIn';

export const metadata = {
    title: 'Blog | Haroun Guessous',
    description: 'Thoughts on AI, software engineering, and research by Haroun Guessous.',
};

export default function BlogPage() {
    const posts = getAllPosts();
    const series = getAllSeries();
    const searchIndex = buildSearchIndex();

    return (
        <main className="min-h-screen pt-24">
            <Header />
            <section className="container py-12">
                <FadeIn>
                    <div className="mb-10">
                        <h1 className="text-4xl sm:text-5xl font-serif italic mb-3">Writing</h1>
                        <p className="text-lg text-[var(--color-muted)]">
                            Thoughts on AI research, engineering, and whatever I&apos;m building.
                        </p>
                        <p className="mt-4 text-sm">
                            <Link
                                href="/blog/galaxy"
                                className="font-mono text-[var(--color-accent)] underline-offset-4 hover:underline"
                            >
                                3D semantic map of posts
                            </Link>
                            <span className="text-[var(--color-muted)]">
                                {" "}
                                (local embeddings, no API)
                            </span>
                        </p>
                    </div>
                </FadeIn>

                <BlogFiltersList posts={posts} series={series} searchIndex={searchIndex} />
            </section>
        </main>
    );
}
