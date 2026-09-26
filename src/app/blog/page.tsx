import Link from 'next/link';
import { getAllPosts, getAllSeries, getAllTags, buildSearchIndex } from '@/lib/blog';
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
    const tags = getAllTags();
    const searchIndex = buildSearchIndex();

    return (
        <main className="min-h-screen pt-24">
            <Header />
            <section className="max-w-[1200px] mx-auto px-5 sm:px-6 py-12">
                <FadeIn>
                    <BlogFiltersList posts={posts} series={series} tags={tags} searchIndex={searchIndex} />
                </FadeIn>
            </section>
        </main>
    );
}
