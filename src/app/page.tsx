import Header from '../components/Header';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import ProjectsCard from '../components/ProjectsCard';
import BooksCard from '../components/BooksCard';
import BlogCard from '../components/BlogCard';
import ActivityGraph from '../components/ActivityGraph';
import FadeIn from '../components/FadeIn';
import { getAllPosts } from '../lib/blog';

export default function Home() {
  const recentPosts = getAllPosts();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const profileSrc = `${basePath}/images/profile.png`;

  return (
    <main className="min-h-screen pt-24">
      <Header />

      <FadeIn>
        <section className="container mt-20 sm:mt-24 mb-16 sm:mb-20">
          <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-12 lg:gap-14">
            <figure className="shrink-0 mx-auto md:mx-0 w-full max-w-[220px] md:max-w-[240px]">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--color-border)]/30 ring-1 ring-[var(--color-border)]">
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

            <div className="min-w-0 flex-1 space-y-6 md:space-y-7 md:pt-1">
              <div className="space-y-4">
                <h1 className="text-[2.75rem] sm:text-5xl lg:text-6xl font-serif italic font-normal leading-[1.08] tracking-tight text-[#161b21] dark:text-[#dce3ea]">
                  Hi, I&apos;m Haroun Guessous.
                </h1>
              </div>

              <p className="text-[17px] leading-relaxed text-[var(--color-muted)] max-w-2xl border-t border-[var(--color-border)] pt-6">
                Engineer, Team Lead, ML research, amateur runner; occasional writing. Co-founded{' '}
                <span className="font-medium text-[#161b21] dark:text-[#dce3ea]">Divitae Eventure</span>
                {' '}
                ,a systematic trading fund where 15% of annual profits go directly to leukemia research.
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
                <a
                  href="mailto:haroun.guessous@mail.mcgill.ca"
                  className="link-hover-line hover:text-[var(--color-accent)] transition-colors duration-200"
                >
                  Email
                </a>
                <span className="text-[var(--color-border)]">/</span>
                <a
                  href="https://github.com/AaronQLF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-hover-line hover:text-[var(--color-accent)] transition-colors duration-200"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <div className="container space-y-28 sm:space-y-32 pb-16">
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <section id="experience">
              <ExperienceCard />
            </section>
            <FadeIn delay={100}>
              <section id="education">
                <EducationCard />
              </section>
            </FadeIn>
            <FadeIn delay={200}>
              <section id="reading">
                <BooksCard />
              </section>
            </FadeIn>
          </div>
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
