import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import AuthGuard from "../config/Auth/AuthGuard";
import "../styles/globals.css";
import NextTopLoader from 'nextjs-toploader';
export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <NextTopLoader
          color="#2299DD"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          template='<div class="bar" role="bar"><div class="peg"></div></div> 
          <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
          zIndex={1600}
          showAtBottom={false}
        />
        <AuthGuard>
        <Component {...pageProps} />
        </AuthGuard>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}