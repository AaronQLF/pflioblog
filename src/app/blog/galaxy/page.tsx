import Link from "next/link";
import Header from "@/components/Header";
import FadeIn from "@/components/FadeIn";
import PostGalaxy3DLoader from "@/components/PostGalaxy3DLoader";

export const metadata = {
    title: "Semantic map | Haroun Guessous",
    description:
        "Three-dimensional map of blog posts from local sentence embeddings and PCA.",
};

export default function BlogGalaxyPage() {
    return (
        <main className="min-h-screen pt-24">
            <Header />
            <section className="container py-12 max-w-4xl">
                <FadeIn>
                    <div className="mb-8">
                        <p className="text-sm font-mono text-[var(--color-muted)] mb-3">
                            <Link
                                href="/blog"
                                className="link-hover-line hover:text-[var(--color-accent)] transition-colors"
                            >
                                Writing
                            </Link>
                            <span className="mx-2">/</span>
                            <span>Semantic map</span>
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-serif italic mb-3">
                            Post galaxy
                        </h1>
                        <p className="text-lg text-[var(--color-muted)]">
                            Each sphere is a post. Neighbors are closer in embedding
                            space before projection into three dimensions.
                        </p>
                    </div>
                </FadeIn>

                <PostGalaxy3DLoader />
            </section>
        </main>
    );
}
