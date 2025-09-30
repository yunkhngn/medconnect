import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";

// Css
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <Component {...pageProps} />
      </NextThemesProvider>
    </HeroUIProvider>
  );
}