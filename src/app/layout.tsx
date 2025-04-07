import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haroun Guessous | Portfolio",
  description: "Software Engineer at CDPQ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div className="min-h-screen bg-white">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
