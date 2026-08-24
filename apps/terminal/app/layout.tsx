import "./globals.css";
import type { ReactNode } from "react";
import { DM_Mono, Space_Grotesk } from "next/font/google";

const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-sans" });

export const metadata = {
  title: "Pump Terminal — Market Radar",
  description: "Paper-mode Pump.fun market intelligence and token discovery terminal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className="bg-background"><body className={`${mono.variable} ${grotesk.variable}`}>{children}</body></html>;
}
