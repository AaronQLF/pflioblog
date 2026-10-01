import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "../context/ThemeContext";
import Footer from "../components/Footer";
import LivelyCloudBackground from "../components/LivelyCloudBackground";

export const metadata: Metadata = {
  title: "Haroun Guessous | Portfolio",
  description: "Masters in CS at UdeM/MILA · ML research, ex-quant",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
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
      <body suppressHydrationWarning className="relative min-h-screen">
        <ThemeProvider>
          <LivelyCloudBackground />
          <div className="relative z-10">
            <main className="transition-colors duration-200">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
