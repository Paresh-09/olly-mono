import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { ReviewStatus, Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { sendDiscordNotification } from '@/service/discord-notify';
import productData from '@/data/product-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CRON_SECRET = process.env.CRON_SECRET as string;

const DAILY_REVIEW_COUNT = parseInt(process.env.DAILY_REVIEWS_COUNT || '3', 10);

// Product data interface
interface Product {
  title: string;
  file: string;
  description: string;
  datetime: string;
  url: string;
}

// Review interface
interface GeneratedReview {
  productSlug: string;
  rating: number;
  reviewBody: string;
  authorName: string;
  status: ReviewStatus;
  isVerified: boolean;
  authorId: string | null;
}

// Generation record interface
interface GenerationSummary {
  productSlug: string;
  status: 'success' | 'failed';
  error?: string;
}

interface GenerationRecord {
  totalReviews: number;
  successCount: number;
  failureCount: number;
  startTime: Date;
  endTime: Date;
  errors: string[];
  productsSummary: GenerationSummary[];
}

// Load product data
const PRODUCTS: Product[] = productData

PRODUCTS.forEach(product => {
  if (!product.title || !product.file || !product.description || !product.datetime || !product.url) {
    console.warn('Invalid product data found:', product);
  }
});

  async function getProductsForReview(): Promise<Product[]> {
    try {
      // Get the last review generation record to check which products were reviewed
      const lastGenerations = await prismadb.reviewGenerationRecord.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10, // Look at last 10 generations to determine coverage
      });
  
      // Extract recently reviewed product slugs from the records
      const recentlyReviewedSlugs = new Set<string>();
      lastGenerations.forEach(record => {
        const summary = record.productsSummary as any[];
        summary.forEach((item: { productSlug: string }) => {
          recentlyReviewedSlugs.add(item.productSlug);
        });
      });
  
      // Filter out recently reviewed products and prioritize ones that haven't been reviewed
      const availableProducts = PRODUCTS.filter(product => 
        !recentlyReviewedSlugs.has(product.file)
      );
  
      // If all products have been recently reviewed, use the full list
      const productsPool = availableProducts.length > 0 ? availableProducts : PRODUCTS;
  
      // Randomly select DAILY_REVIEW_COUNT products
      const selectedProducts: Product[] = [];
      const poolCopy = [...productsPool];
  
      for (let i = 0; i < Math.min(DAILY_REVIEW_COUNT, poolCopy.length); i++) {
        const randomIndex = Math.floor(Math.random() * poolCopy.length);
        selectedProducts.push(poolCopy[randomIndex]);
        poolCopy.splice(randomIndex, 1);
      }
  
      return selectedProducts;
    } catch (error) {
      console.error('Error getting products for review:', error);
      // Fallback to random selection from all products if there's an error
      const shuffled = [...PRODUCTS].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, DAILY_REVIEW_COUNT);
    }
  }

  async function generateAIReview(product: Product): Promise<{ 
    rating: number;
    reviewBody: string;
    authorName: string;
  }> {
    const prompt = `Generate a review for the following product:
  
  Product Name: ${product.title.split('|')[0].trim()}
  Product Description: ${product.description}
  
  The review should:
  1. Be realistic and specific to the product's features and benefits
  2. Mention actual use cases or experiences
  3. Be 2-3 sentences long
  4. Focus on practical aspects that a real user would care about
  5. Sound authentic and conversational
  6. Mix of positive aspects and minor suggestions for improvement
  7. Be helpful for potential users
  
  Rating should be 4 or 5 stars, as we want to maintain a positive but authentic tone.
  
  Also generate a diverse, realistic full name for the reviewer that reflects a global user base.
  
  Format the response exactly like this:
  Rating: [number]
  Name: [full name]
  Review: [review text]`;
  
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    });
  
    const response = completion.choices[0].message.content || '';
    
    // Parse the response
    const ratingMatch = response.match(/Rating: (\d+)/);
    const nameMatch = response.match(/Name: (.+)/);
    const reviewMatch = response.match(/Review: (.+)/);
  
    if (!ratingMatch || !nameMatch || !reviewMatch) {
      throw new Error('Failed to parse AI response');
    }
  
    return {
      rating: parseInt(ratingMatch[1]),
      authorName: nameMatch[1].trim(),
      reviewBody: reviewMatch[1].trim()
    };
  }
  
  async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  export async function GET(req: Request) {
    try {

      const isCronAuthorized = req.headers.get('Authorization') === `Bearer ${CRON_SECRET}`;

      if (!isCronAuthorized) {
        return new NextResponse("Unauthorized.", { status: 401 });
      }

      const reviews: GeneratedReview[] = [];
      const generationRecord: GenerationRecord = {
        totalReviews: 0,
        successCount: 0,
        failureCount: 0,
        startTime: new Date(),
        endTime: new Date(),
        errors: [],
        productsSummary: []
      };
  
      // Get products that need reviews today
      const productsForToday = await getProductsForReview();
  
      for (const product of productsForToday) {
        try {
          // Generate one review for the product
          const review = await generateAIReview(product);
          
          reviews.push({
            productSlug: product.file,
            ...review,
            status: ReviewStatus.APPROVED,
            isVerified: true,
            authorId: null,
          });
          
          generationRecord.successCount += 1;
          generationRecord.productsSummary.push({
            productSlug: product.file,
            status: 'success'
          });
        } catch (error: any) {
          generationRecord.failureCount += 1;
          generationRecord.errors.push(`Error generating review for ${product.file}: ${error.message}`);
          generationRecord.productsSummary.push({
            productSlug: product.file,
            status: 'failed',
            error: error.message
          });
        }
        
        await sleep(1000);
      }
  
      generationRecord.totalReviews = reviews.length;
      generationRecord.endTime = new Date();
  
      // Insert all reviews and create generation record in a single transaction
      const result = await prismadb.$transaction(async (tx) => {
        const createdReviews = await tx.productReview.createMany({
          data: reviews
        });
  
        const productsSummaryJson: Prisma.JsonArray = generationRecord.productsSummary.map(summary => ({
          productSlug: summary.productSlug,
          status: summary.status,
          ...(summary.error && { error: summary.error })
        }));
  
        const record = await tx.reviewGenerationRecord.create({
          data: {
            totalReviews: generationRecord.totalReviews,
            successCount: generationRecord.successCount,
            failureCount: generationRecord.failureCount,
            startTime: generationRecord.startTime,
            endTime: generationRecord.endTime,
            errors: generationRecord.errors,
            productsSummary: productsSummaryJson
          }
        });
  
        return { createdReviews, record };
      });
  
      return NextResponse.json({
        message: `Successfully created ${result.createdReviews.count} reviews for ${productsForToday.length} products`,
        generationRecord: result.record
      }, { status: 200 });
  
    } catch (error) {
      console.error('Error creating AI reviews:', error);
      return NextResponse.json({ error: 'Failed to create AI reviews' }, { status: 500 });
    }
  }