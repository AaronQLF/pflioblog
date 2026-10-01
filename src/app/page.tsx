import Header from '../components/Header';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import ProjectsCard from '../components/ProjectsCard';
import BooksCard from '../components/BooksCard';
import BlogCard from '../components/BlogCard';
import ActivityGraph from '../components/ActivityGraph';
import MacWindowCard from '../components/MacWindowCard';
import FadeIn from '../components/FadeIn';
import { getAllPosts } from '../lib/blog';

export default function Home() {
  const recentPosts = getAllPosts();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const profileSrc = `${basePath}/images/profile.png`;

  return (
    <main className="min-h-screen pt-20 pb-20">
      <Header />

      <FadeIn>
        <section className="container mt-8 sm:mt-12 mb-16 sm:mb-20 relative">
          {/* Floating Retro Kaomojis */}
          <div className="hidden lg:block absolute -top-4 -left-8 kaomoji-tag -rotate-6 z-10">
            ^ ω ^
          </div>
          <div className="hidden lg:block absolute top-12 -right-6 kaomoji-tag rotate-6 z-10">
            {'{ ^-^ }'}
          </div>
          <div className="hidden lg:block absolute -bottom-6 left-12 kaomoji-tag -rotate-3 z-10">
            ¯\_(ツ)_/¯
          </div>

          <MacWindowCard title="haroun_bio.mov" actionText="live · montreal">
            <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-10">
              <figure className="shrink-0 mx-auto md:mx-0 w-full max-w-[200px] md:max-w-[220px]">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--color-border)]/30 ring-1 ring-[var(--color-border)] shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element -- basePath-prefixed URL for static export on GitHub Pages */}
                  <img
                    src={profileSrc}
                    alt="Haroun Guessous"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    width={480}
                    height={600}
                    fetchPriority="high"
                  />
                </div>
              </figure>

              <div className="min-w-0 flex-1 space-y-5">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl font-serif italic font-normal leading-tight text-[var(--color-fg)]">
                    Hi, I&apos;m Haroun Guessous.
                  </h1>
                </div>

                <p className="text-[15px] sm:text-base leading-relaxed text-[var(--color-muted)] max-w-2xl border-t border-[var(--color-border)] pt-4">
                  Engineer, ML researcher, and amateur runner. Co-founded{' '}
                  <span className="font-semibold text-[var(--color-fg)]">Divitae Eventure</span>
                  , a systematic quantitative trading fund where 15% of annual profits go directly to leukemia research.
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-[var(--color-muted)] pt-1">
                  <a
                    href="mailto:haroun.guessous@mail.mcgill.ca"
                    className="gloss-pill hover:text-[var(--color-accent)]"
                  >
                    ✉ email me
                  </a>
                  <a
                    href="https://github.com/AaronQLF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gloss-pill hover:text-[var(--color-accent)]"
                  >
                    💻 github
                  </a>
                  <a
                    href="https://www.goodreads.com/user/show/150192618-haroun-guessous"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gloss-pill hover:text-[var(--color-accent)]"
                  >
                    📚 goodreads
                  </a>
                </div>
              </div>
            </div>
          </MacWindowCard>
        </section>
      </FadeIn>

      <div className="container space-y-16 sm:space-y-20">
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section id="experience">
              <ExperienceCard />
            </section>
            <FadeIn delay={100}>
              <section id="education">
                <EducationCard />
              </section>
            </FadeIn>
          </div>
        </FadeIn>

        <FadeIn>
          <section id="reading" className="w-full">
            <BooksCard />
          </section>
        </FadeIn>

        <FadeIn>
          <section id="blog" className="w-full">
            <BlogCard posts={recentPosts} />
          </section>
        </FadeIn>

        <FadeIn>
          <section>
            <ActivityGraph />
          </section>
        </FadeIn>

        <FadeIn>
          <section id="projects">
            <ProjectsCard />
          </section>
        </FadeIn>
      </div>
    </main>
  );
}
