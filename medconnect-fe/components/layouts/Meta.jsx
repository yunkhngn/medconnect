import Head from 'next/head';
import { useRouter } from 'next/router';

const Meta = ({ 
  title = 'MedConnect - Healthcare Platform', 
  description = 'Nền tảng đặt lịch khám bệnh trực tuyến, kết nối bệnh nhân với bác sĩ chuyên nghiệp. Khám bệnh từ xa qua video call, quản lý hồ sơ sức khỏe, đặt lịch khám nhanh chóng và tiện lợi.',
  keywords = 'bác sĩ, khám bệnh, đặt lịch, y tế, telemedicine, khám bệnh online, bác sĩ trực tuyến, đặt lịch khám, hồ sơ sức khỏe, MedConnect',
  ogImage = null,
  ogType = 'website',
  noindex = false,
  nofollow = false,
  canonical = null
}) => {
  const router = useRouter();
  const fullTitle = title.includes('MedConnect') ? title : `${title} - MedConnect`;
  
  // Get base URL
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'https://medconnects.app';
  };
  
  const baseUrl = getBaseUrl();
  const currentUrl = canonical || `${baseUrl}${router.asPath}`;
  const defaultOgImage = ogImage || `${baseUrl}/assets/homepage/cover.jpg`;
  
  // Robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');
  
  return (
    <Head>
      {/* Basic SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="MedConnect" />
      <meta name="robots" content={robotsContent.join(', ')} />
      <meta name="googlebot" content={robotsContent.join(', ')} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={defaultOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="MedConnect" />
      <meta property="og:locale" content="vi_VN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultOgImage} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:site" content="@MedConnect" />
      <meta name="twitter:creator" content="@MedConnect" />
      
      {/* Additional SEO */}
      <meta name="language" content="Vietnamese" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Mobile & PWA */}
      <meta name="theme-color" content="#10B981" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="MedConnect" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Favicon - Already in _app.jsx but ensure it's here too */}
      <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      
      {/* Structured Data - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": "MedConnect",
            "description": description,
            "url": baseUrl,
            "logo": `${baseUrl}/assets/homepage/cover.jpg`,
            "sameAs": [
              // Add social media links if available
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "availableLanguage": "Vietnamese"
            },
            "areaServed": {
              "@type": "Country",
              "name": "Vietnam"
            },
            "medicalSpecialty": [
              "Cardiology",
              "Internal Medicine",
              "Pediatrics",
              "Obstetrics and Gynecology",
              "Neurology",
              "Dermatology",
              "Ophthalmology",
              "Otolaryngology",
              "General Surgery"
            ]
          })
        }}
      />
    </Head>
  );
};

export default Meta;