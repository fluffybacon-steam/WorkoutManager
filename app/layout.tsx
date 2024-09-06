import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from './navbar';

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
        <div id="loader" style={{display: 'none'}}>
          <div className="spinner"></div>
        </div>
        <div className='popup' role="alertdialog"></div>
        <header>
          <h1>Workout Planner</h1>
          <Navbar />
        </header>
        {children}
        <footer>
          <b>Legal disclaimer:</b> I am not associated with Jeff Nippard and receive no financial gain from this app or the purchase of Nippard's program.
          <br/><br/>
          Developed by <a href='https://github.com/fluffybacon-steam'>fluffybacon</a> 2024
        </footer>
      </body>
    </html>
  );
}