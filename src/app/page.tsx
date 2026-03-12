import Header from '../components/Header';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import ProjectsCard from '../components/ProjectsCard';
import BooksCard from '../components/BooksCard';
import BlogCard from '../components/BlogCard';
import { getAllPosts } from '../lib/blog';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function Home() {
  const recentPosts = getAllPosts();

  return (
    <main className="min-h-screen pt-20">
      <Header />

      {/* Hero Section */}
      <section className="my-16 container">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-6xl font-bold dark:text-white">Hi, I&apos;m</h1>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}/images/profile.jpg`}
                alt="Haroun Guessous"
                width={90}
                height={90}
                className="rounded-full inline-block bg-[#333] w-[90px] h-[90px] object-cover"
              />
            </div>
            <h1 className="text-6xl font-bold dark:text-white">Haroun Guessous!</h1>
          </div>
          <div className="mb-4">
            <p className="text-5xl mb-2">
              <span className="text-slate-400 dark:text-slate-300">I&apos;m an</span>{' '}
              <span className="font-medium dark:text-white">R&amp;D Lead</span>{' '}
              <span className="text-slate-400 dark:text-slate-300">at</span>
            </p>
            <p className="text-6xl font-bold text-primary">Stingray Digital.</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mb-20">
          <p className="text-base dark:text-slate-300">
            Software Engineer &amp; ML Researcher building AI systems, RAG pipelines, and scalable infrastructure.
            I also co-founded <span className="font-medium dark:text-white">Divitae Eventure</span>, a systematic trading fund
            where 15% of annual profits go directly to leukemia research.
            Feel free to explore my work and reach out!
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="container py-12">
        <div className="flex flex-col gap-6">

          {/* Row 1: Experience · Education · Reading List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div id="experience">
              <ExperienceCard />
            </div>
            <div id="education">
              <EducationCard />
            </div>
            <div>
              <BooksCard />
            </div>
          </div>

          {/* Row 2: Writing */}
          <div id="blog">
            <BlogCard posts={recentPosts} />
          </div>

          {/* Row 3: Featured Projects — full width */}
          <div id="projects" className="md:h-[420px]">
            <ProjectsCard />
          </div>

        </div>
      </section>
    </main>
  );
}
