import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/custom/Sidebar";
import NetworkProvider from "@/components/custom/NetworkProvider";
import AIChatBot from "@/components/custom/AIChatBot";
import { ThemeProvider } from "@/components/theme-provider";
import { DisasterProvider } from "@/context/DisasterContext"; // Ensure you created the context file!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OneKont 2.0 | Disaster Response",
  description: "Official Gov Disaster Management Portal",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground overflow-x-hidden`}>
        
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <NetworkProvider>
                {/* 1. We wrap everything with DisasterProvider so data is shared */}
                <DisasterProvider>
                
                    <div className="flex min-h-screen">
                        <Sidebar />
                        <main className="flex-1 min-w-0 w-full transition-all duration-300 md:ml-[var(--sidebar-width)]">
                            {children}
                        </main>
                    </div>

                    <AIChatBot />

                </DisasterProvider>
            </NetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
