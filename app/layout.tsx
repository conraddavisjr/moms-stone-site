import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astraea — Earthbound Wonders",
  description: "Discover a small universe of singular stones, polished spheres, and crystal wonders.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
