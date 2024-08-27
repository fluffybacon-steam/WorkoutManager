import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workout Manager",
  description: "UI for interacting with Google Spreadsheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <h1>Workout Planner</h1>
        {children}
        <footer>
          {/* online video by Mira iconic from <a href="https://thenounproject.com/browse/icons/term/online-video/" target="_blank" title="online video Icons">Noun Project</a> (CC BY 3.0) */}
        </footer>
      </body>
    </html>
  );
}
