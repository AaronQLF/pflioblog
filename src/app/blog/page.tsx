import { getAllPosts, buildSearchIndex } from '@/lib/blog';
import Header from '@/components/Header';
import BlogFiltersList from '@/components/BlogFiltersList';
import FadeIn from '@/components/FadeIn';

export const metadata = {
    title: 'Blog | Haroun Guessous',
    description: 'Thoughts on AI, software engineering, and research by Haroun Guessous.',
};

export default function BlogPage() {
    const posts = getAllPosts();
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
                    </div>
                </FadeIn>

                <BlogFiltersList posts={posts} searchIndex={searchIndex} />
            </section>
        </main>
    );
}
