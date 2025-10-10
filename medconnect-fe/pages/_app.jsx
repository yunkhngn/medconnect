import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import AuthGuard from "../config/Auth/AuthGuard";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}