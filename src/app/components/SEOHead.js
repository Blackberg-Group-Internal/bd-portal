import Head from 'next/head';

const SEOHead = ({page}) => {

  const data =  page?.seoOverride || page?.post?.seoOverride;
  
  return (
    <Head>
      <title>{data?.title ?? 'Blackberg Group, LLC.'}</title>
      <meta name="description" content={data?.description ?? 'Where Strategy Meets Creativity'} />
      <link rel="canonical" href={`http://www.blackberggroup.com/${data?.slug ?? ''}`} />

      {/* Charset and Viewport */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Open Graph (OG) Tags for Social Sharing */}
      <meta property="og:title" content={data?.title ?? 'Blackberg Group, LLC'} />
      <meta property="og:description" content={data?.description ?? 'Where Strategy Meets Creativity.'} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`http://www.blackberggroup.com/${data?.slug ?? ''}`} />
      <meta property="og:image" content="https://media.graphassets.com/JMyrcEGXSI2wH3oHnzBI" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={data?.title ?? 'Blackberg Group, LLC'} />
      <meta name="twitter:description" content={data?.description ?? 'Where Strategy Meets Creativity.'} />
      <meta name="twitter:image" content="https://media.graphassets.com/JMyrcEGXSI2wH3oHnzBI" />

      {/* Favicon */}
      <link rel="icon" href="/images/favicon.ico" />
    </Head>
  );
};

export default SEOHead;