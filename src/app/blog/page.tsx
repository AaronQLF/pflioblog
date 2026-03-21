import { getAllPosts, buildSearchIndex } from '@/lib/blog';
import Header from '@/components/Header';
import BlogFiltersList from '@/components/BlogFiltersList';

export const metadata = {
    title: 'Blog | Haroun Guessous',
    description: 'Thoughts on AI, software engineering, and research by Haroun Guessous.',
};

export default function BlogPage() {
    const posts = getAllPosts();
    const searchIndex = buildSearchIndex();

    return (
        <main className="min-h-screen pt-20">
            <Header />
            <section className="container py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold dark:text-white mb-3">Blog</h1>
                    <p className="text-base text-slate-500 dark:text-slate-400">
                        Thoughts on AI research, engineering, and whatever I&apos;m building.
                    </p>
                </div>

                <BlogFiltersList posts={posts} searchIndex={searchIndex} />
            </section>
        </main>
    );
}
