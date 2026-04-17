"use client";

const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border)] mt-32 py-14">
      <div className="container mx-auto max-w-4xl px-5 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--color-muted)]">
          <p>&copy; {new Date().getFullYear()} Haroun Guessous</p>

          <div className="flex items-center gap-6">
            <a
              href="mailto:haroun.guessous@mail.mcgill.ca"
              className="link-hover-line hover:text-[var(--color-accent)] transition-colors duration-200"
            >
              Email
            </a>
            <a
              href="https://github.com/AaronQLF"
              target="_blank"
              rel="noopener noreferrer"
              className="link-hover-line hover:text-[var(--color-accent)] transition-colors duration-200"
            >
              GitHub
            </a>
          </div>

          <p className="text-xs">Montreal, QC</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
