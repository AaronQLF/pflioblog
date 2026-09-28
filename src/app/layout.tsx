import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "../context/ThemeContext";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Haroun Guessous | Portfolio",
  description: "Masters in CS at UdeM/MILA · ML research, ex-quant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <main className="transition-colors duration-200">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
