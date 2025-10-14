import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { competitors } from '@/data/competitors';
import { ComparisonHeading } from '../_components/comparison-heading';
import { ComparisonTableSkeleton } from '../_components/compare-skeleton';
import { ComparisonTable } from '../_components/compare-table';
import { Testimonials } from '../../_components/testimonials';
import { Pricing } from '../../_components/pricing-2';
import FAQs from '../../_components/faq-section';
import { CompetitorReviews } from '../_components/competitor-reviews';
import { CompetitiveSEO } from '../_components/competitive-seo';

interface PageProps {
  params: Promise<{
    competitor: string;
  }>
}

export async function generateStaticParams() {
  return Object.keys(competitors).map(slug => ({
    competitor: slug
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const competitor = competitors[params.competitor];

  if (!competitor) return {};

  const title = `Olly.social vs ${competitor.name} Comparison`;
  const description = `Compare Olly.social with ${competitor.name}. See how these ${competitor.category} tools stack up in features, pricing, and capabilities.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{
        url: '/olly_home.png',
        width: 1200,
        height: 630,
        alt: `Olly.social vs ${competitor.name} comparison`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/olly_home.png']
    },
    alternates: {
      canonical: `https://olly.social/compare/${params.competitor}`
    }
  };
}

export default async function ComparisonPage(props: PageProps) {
  const params = await props.params;
  const competitor = competitors[params.competitor];

  if (!competitor) {
    notFound();
  }

  // Default rating values for SEO
  const defaultOllyRating = 4.8;
  const defaultCompetitorRating = 3.2;
  const defaultTotalReviews = 3;

  return (
    <>
      {/* Add server-side structured data */}
      <CompetitiveSEO 
        competitor={competitor}
        ollyRating={defaultOllyRating}
        competitorRating={defaultCompetitorRating}
        totalReviews={defaultTotalReviews}
      />
      
      <ComparisonHeading
        title={`Olly.social vs ${competitor.name}`}
        subtitle={`Compare features, pricing, and capabilities between Olly.social and ${competitor.name}`}
        competitor={competitor}
      />
      
      <div className="container py-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Detailed Feature Comparison</h2>
          <p className="text-lg text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how Olly.social and {competitor.name} compare across key features and capabilities in the detailed breakdown below.
          </p>
        </div>
        
        <Suspense fallback={<ComparisonTableSkeleton />}>
          <ComparisonTable competitor={competitor} />
        </Suspense>
        
        <div className="mt-20">
          <CompetitorReviews competitor={competitor} />
        </div>
        
        <Testimonials />
        <Pricing />
        <FAQs />
      </div>
    </>
  );
}