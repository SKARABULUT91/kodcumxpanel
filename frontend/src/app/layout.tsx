import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SNR ENGINE V2 | KODCUM AJANS",
  description: "Advanced X Automation & Stealth Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} bg-[#050505] text-[#ededed] antialiased`}>
        {children}
      </body>
    </html>
  );
}