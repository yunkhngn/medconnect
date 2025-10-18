import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "@/styles/globals.css";
import NextTopLoader from 'nextjs-toploader';
import Head from "next/head";
import { useEffect, useState } from "react";
import AuthGuard from '@/config/Auth/AuthGuard';
import Chatbot from "@/components/ui/Chatbot";


export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;
    
    // Only sync token to cookie (NO userRole)
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      document.cookie = `authToken=${authToken}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, [mounted]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>MedConnect - Healthcare Platform</title>
        <meta name="description" content="MedConnect - Nền tảng đặt lịch khám bệnh trực tuyến" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </Head>
      
      <HeroUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <NextTopLoader
            //color blue 
            color="linear-gradient(to right, #62cff4, #62cff4)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={5}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 16px #10B981, 0 0 8px #10B981"
            showAtBottom={false}
          />
          <AuthGuard>
            <Chatbot />
            <Component {...pageProps} />
          </AuthGuard>
        </NextThemesProvider>
      </HeroUIProvider>
    </>
  );
}