import Image from 'next/image';
import Header from '../components/Header';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import MontrealMapCard from '../components/MontrealMapCard';
import ProjectsCard from '../components/ProjectsCard';
import BooksCard from '../components/BooksCard';
import BlogCard from '../components/BlogCard';
import { getAllPosts } from '../lib/blog';

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
              <Image
                src="/images/profile.jpg"
                alt="Haroun Guessous"
                width={90}
                height={90}
                className="rounded-full inline-block bg-[#333]"
              />
            </div>
            <h1 className="text-6xl font-bold dark:text-white">Haroun Guessous!</h1>
          </div>
          <div className="mb-4">
            <p className="text-5xl mb-2">
              <span className="text-slate-400 dark:text-slate-300">I&apos;m an</span> <span className="font-medium dark:text-white">R&amp;D Engineering Lead</span> <span className="text-slate-400 dark:text-slate-300">at</span>
            </p>
            <p className="text-6xl font-bold text-primary">Stingray Digital.</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mb-20">
          <p className="text-base dark:text-slate-300">
            Software Engineer &amp; ML Researcher building AI systems, RAG pipelines, and scalable infrastructure. Feel free to explore my work and reach out!
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* First Row: Experience and Projects */}
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div id="experience" className="col-span-1 md:col-span-4">
              <ExperienceCard />
            </div>

            <div id="projects" className="col-span-1 md:col-span-8 mt-6 md:mt-0 md:h-[420px]">
              <ProjectsCard />
            </div>
          </div>

          {/* Second Row: Education, Map and Books Cards */}
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-start">
            <div id="education" className="col-span-1 md:col-span-4">
              <EducationCard />
            </div>

            <div id="about" className="col-span-1 md:col-span-4 mt-6 md:mt-0 md:h-[420px]">
              <MontrealMapCard />
            </div>

            <div className="col-span-1 md:col-span-4 mt-6 md:mt-0 md:h-[420px]">
              <BooksCard />
            </div>
          </div>

          {/* Third Row: Blog */}
          <div id="blog" className="col-span-1 md:col-span-12 mt-6">
            <BlogCard posts={recentPosts} />
          </div>
        </div>
      </section>
    </main>
  );
}
