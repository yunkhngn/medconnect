import { Html, Head, Main, NextScript } from "next/document";
import clsx from "clsx";

export default function Document() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://medconnects.app';
  
  return (
    <Html lang="vi">
      <Head>
        {/* Primary Meta Tags */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href={baseUrl} />
        
        {/* Default Open Graph - Can be overridden by page-level Meta component */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MedConnect" />
        <meta property="og:locale" content="vi_VN" />
        
        {/* Default Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@MedConnect" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#10B981" />
        <meta name="msapplication-TileColor" content="#10B981" />
      </Head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
        )}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
