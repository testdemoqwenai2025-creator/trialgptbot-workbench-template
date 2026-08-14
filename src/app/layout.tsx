import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TrialGPTBot Enterprise | AI-Powered Clinical Trial Management",
  description:
    "Advanced AI-powered clinical trial management platform with Boolean confirmation workflow, EDC integration, and regulatory compliance (FDA 21 CFR Part 11, EMA Annex 11).",
  keywords: [
    "clinical trials",
    "AI",
    "EDC",
    "FDA",
    "regulatory",
    "Boolean confirmation",
    "review dashboard",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Apply the saved theme BEFORE React hydrates so the very first paint
          already matches the user's preference (no white flashbang). Reads
          localStorage first, then falls back to the OS color-scheme query.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('trialgptbot-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var r=document.documentElement;if(t==='dark'){r.classList.add('dark');}else{r.classList.remove('dark');}r.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
