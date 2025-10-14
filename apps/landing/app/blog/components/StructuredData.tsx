interface StructuredDataProps {
  title: string;
  description: string;
  date: Date | string;
  author: string;
  slug: string;
  image?: string;
}

export function StructuredData({
  title,
  description,
  date,
  author,
  slug,
  image,
}: StructuredDataProps) {
  const formattedDate = typeof date === 'string' ? date : date.toISOString();
  const postUrl = `https://olly.com/blog/${slug}`;
  const imageUrl = image || `https://olly.com/api/og?title=${encodeURIComponent(title)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    datePublished: formattedDate,
    dateModified: formattedDate,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Olly",
      logo: {
        "@type": "ImageObject",
        url: "https://olly.com/logo2.webp",
      },
    },
    image: imageUrl,
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
} 