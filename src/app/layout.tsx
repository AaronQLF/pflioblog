import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata: Metadata = {
  title: "Haroun Guessous | Portfolio",
  description: "R&D Lead at Stingray Digital · Masters in CS at UdeM/MILA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider>
          <main className="transition-colors duration-300">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
