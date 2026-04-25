import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono, Roboto } from "next/font/google";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { ChatBot } from "@/components/ui/ChatBot";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "@/styles/globals.css";

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
  title: "My Pham — Data Scientist & Product Strategist",
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
    >
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
