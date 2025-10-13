import Head from 'next/head';

const Meta = ({ 
  title = 'MedConnect - Healthcare Platform', 
  description = 'Nền tảng đặt lịch khám bệnh trực tuyến',
  keywords = 'bác sĩ, khám bệnh, đặt lịch, y tế',
  ogImage = '/assets/logo.svg'
}) => {
  const fullTitle = title.includes('MedConnect') ? title : `${title} - MedConnect`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#8B5CF6" />
    </Head>
  );
};

export default Meta;