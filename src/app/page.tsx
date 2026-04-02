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

  return (
    <main className="min-h-screen pt-24">
      <Header />

      <FadeIn>
        <section className="container mt-20 sm:mt-28 mb-28 sm:mb-36">
          <h1 className="text-7xl sm:text-8xl font-serif italic mb-5">Haroun Guessous</h1>
          <p className="text-xl text-[var(--color-muted)] mb-6">
            R&amp;D Lead at <em className="font-serif not-italic text-[#1a1a1a] dark:text-[#e8e4df]">Stingray Digital</em>.{' '}
            M.Sc. student at <em className="font-serif not-italic text-[#1a1a1a] dark:text-[#e8e4df]">UdeM / MILA</em>.
          </p>
          <p className="text-[17px] leading-relaxed max-w-2xl">
            Software engineer and ML researcher building AI systems, RAG pipelines, and scalable infrastructure.
            I also co-founded <span className="font-medium">Divitae Eventure</span>, a systematic trading fund
            where 15% of annual profits go directly to leukemia research.
          </p>
          <div className="flex items-center gap-5 mt-7 text-sm text-[var(--color-muted)]">
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
            <span className="text-[var(--color-border)]">/</span>
            <a
              href="https://www.linkedin.com/in/harounguessous/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-hover-line hover:text-[var(--color-accent)] transition-colors duration-200"
            >
              LinkedIn
            </a>
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
