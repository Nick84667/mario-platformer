import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Mario Clone – Browser Platformer",
  description:
    "A browser-playable 2D platformer built with Next.js, TypeScript, and HTML5 Canvas.",
  keywords: ["mario", "platformer", "game", "nextjs", "typescript", "canvas"],
  authors: [{ name: "Rahul96A" }],
  openGraph: {
    title: "Super Mario Clone",
    description: "Play a browser-based Mario-style platformer built with Next.js",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5c94fc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden", background: "#000" }}>
        {children}
      </body>
    </html>
  );
}
