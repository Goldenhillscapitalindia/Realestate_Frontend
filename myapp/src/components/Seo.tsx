import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  canonicalPath: string;
};

const SITE_URL = "https://asset72.ghills.ai";

const Seo = ({ title, description, canonicalPath }: SeoProps) => {
  const normalizedPath =
    canonicalPath === "/" ? "/" : canonicalPath.replace(/\/+$/, "");
  const canonicalUrl = `${SITE_URL}${normalizedPath}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default Seo;
