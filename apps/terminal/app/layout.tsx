import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Pump Terminal — Market Radar",
  description: "Paper-mode Pump.fun market intelligence and token discovery terminal"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className="bg-[#0b0d11]"><body>{children}</body></html>;
}
