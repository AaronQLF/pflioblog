import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import CardSection from '../components/CardSection';
import MontrealMapCard from '../components/MontrealMapCard';
import ProjectsCard from '../components/ProjectsCard';
import BooksCard from '../components/BooksCard';

export default function Home() {
  return (
    <div className="container py-12">
      <Header />

      {/* Hero Section */}
      <section className="my-16">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-6xl font-bold">Hi, I'm</h1>
            <div className="relative">
              <Image 
                src="/images/profile.jpg" 
                alt="Haroun Guessous" 
                width={90} 
                height={90} 
                className="rounded-full inline-block bg-[#333]"
              />
            </div>
            <h1 className="text-6xl font-bold">Haroun Guessous!</h1>
            ,
          </div>
          <div className="mb-4">
            <p className="text-5xl mb-2">
              <span className="text-slate-400">I'm a</span> <span className="font-medium">Software Engineer</span> <span className="text-slate-400">at</span>
            </p>
            <p className="text-6xl font-bold text-primary">CDPQ.</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mb-20">
          <p className="text-base">
            Feel free to explore my portfolio and reach out —I'd love to connect!
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* First Row: Experience and Projects Cards */}
        <div className="col-span-4">
          <ExperienceCard />
        </div>
        
        <div className="col-span-8">
          <ProjectsCard />
        </div>
        
        {/* Second Row: Education, Map and Books Cards */}
        <div className="col-span-4 mt-6">
          <EducationCard />
        </div>
        
        <div className="col-span-4 mt-6">
          <MontrealMapCard />
        </div>
        
        <div className="col-span-4 mt-6">
          <BooksCard />
        </div>
        
        {/* Third Row: Additional Cards */}
      </div>

      <Footer />
    </div>
  );
}
