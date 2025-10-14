"use client";

import { Competitor } from "@/data/competitors";

type CompetitorStructuredDataProps = {
  competitor: Competitor;
  ollyRating: number; // Olly's rating out of 5
  competitorRating: number; // Competitor's rating out of 5
  totalReviews: number; // Number of comparison reviews
}

export function CompetitorStructuredData({ 
  competitor, 
  ollyRating, 
  competitorRating, 
  totalReviews 
}: CompetitorStructuredDataProps) {
  // Create structured data for comparison
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Olly.social vs " + competitor.name,
    "description": `Compare Olly.social with ${competitor.name}. See how these ${competitor.category} tools stack up in features, pricing, and capabilities.`,
    "image": "https://olly.social/olly_home.png",
    "brand": {
      "@type": "Brand",
      "name": "Olly.social"
    },
    "offers": {
      "@type": "AggregateOffer",
      "offerCount": 2,
      "lowPrice": "0",
      "highPrice": "49.99",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ollyRating.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": totalReviews
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": ollyRating.toFixed(1),
          "bestRating": "5"
        },
        "name": `Olly.social review in comparison with ${competitor.name}`,
        "author": {
          "@type": "Organization",
          "name": "Olly.social Users"
        },
        "reviewBody": `Olly.social features comprehensive AI capabilities, supports 12+ platforms, and offers unique features like virality scoring and custom comment panels.`
      }
    ],
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Category",
        "value": competitor.category
      },
      {
        "@type": "PropertyValue",
        "name": "Comparison Type",
        "value": "Feature and Capability Comparison"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 