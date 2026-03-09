import type { Metadata } from "next";
import { League_Gothic, Roboto } from "next/font/google";
import "./globals.css";

const leagueGothic = League_Gothic({
  variable: "--font-league-gothic",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOR7ED | High-Contrast System",
  description: "SOR7ED Lab - Rebuilt for speed and resilience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${leagueGothic.variable} ${roboto.variable} ${roboto.className} antialiased bg-black text-white selection:bg-sor7ed-yellow selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
