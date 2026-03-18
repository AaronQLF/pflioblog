import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';
import Header from '@/components/Header';
import ActivityGraph from '@/components/ActivityGraph';

export const metadata = {
    title: 'Blog | Haroun Guessous',
    description: 'Thoughts on AI, software engineering, and research by Haroun Guessous.',
};

export default function BlogPage() {
    const posts = getAllPosts();

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

                <ActivityGraph />

                {posts.length === 0 ? (
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">No posts yet. Add a <code>.md</code> file to <code>content/blog/</code> to get started.</p>
                ) : (
                    <div className="grid gap-6">
                        {posts.map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                                <article className="glass-card p-6 hover:shadow-md transition-all duration-300 group-hover:scale-[1.01]">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {post.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h2 className="text-lg font-semibold dark:text-white group-hover:text-primary transition-colors mb-1">
                                                {post.title}
                                            </h2>
                                            <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2">{post.excerpt}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                                                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{post.readingTime} min read</p>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
