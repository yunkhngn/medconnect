import Head from 'next/head'

const Meta = ({title}) => {
  return (
    <Head>
      <title>{title ? title : "MedConnect"}</title>
      <meta name="description" content="Meta description" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="favicon/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png" />
      <link rel="manifest" href="favicon/site.webmanifest" />
    </Head>
  )
}

export default Meta