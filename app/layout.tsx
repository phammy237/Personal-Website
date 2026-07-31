import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { DM_Serif_Display, Inter, JetBrains_Mono, Roboto } from "next/font/google";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "@/styles/globals.css";

const ChatBot = dynamic(() => import("@/components/ui/ChatBot").then((m) => m.ChatBot), { ssr: false });

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "My Pham",
  description: "Data Science student at UF · Product Strategist · Builder. Formerly Deloitte Risk Advisory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${inter.variable} ${jetbrains.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Set theme class before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-base dark:bg-navy text-surface dark:text-white font-body antialiased min-h-screen">
        <ThemeProvider>
          <CustomCursor />
          {children}
          <ChatBot />
        </ThemeProvider>
      </body>
    </html>
  );
}
