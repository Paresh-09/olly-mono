import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const LEAD_SEARCH_CREDIT_COST = 2;
const APOLLO_API_URL = 'https://api.apollo.io/api/v1/mixed_people/search';

// Schema for validating search parameters
const searchParamsSchema = z.object({
  person_titles: z.array(z.string()).optional(),
  person_locations: z.array(z.string()).optional(),
  person_seniorities: z.array(z.string()).optional(),
  organization_locations: z.array(z.string()).optional(),
  q_organization_domains_list: z.array(z.string()).optional(),
  contact_email_status: z.array(z.string()).optional(),
  organization_num_employees_ranges: z.array(z.string()).optional(),
  q_keywords: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validatedData = searchParamsSchema.parse(body);
    
    // Check if we have any search parameters
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'At least one search parameter is required' },
        { status: 400 }
      );
    }
    
    // Check if user has enough credits
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id },
    });
    
    if (!userCredit) {
      // Create user credit if it doesn't exist
      await prismadb.userCredit.create({
        data: {
          userId: user.id,
          balance: 10, // Default starting balance
        },
      });
      
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          creditCost: LEAD_SEARCH_CREDIT_COST,
          currentBalance: 10
        },
        { status: 402 }
      );
    }
    
    if (userCredit.balance < LEAD_SEARCH_CREDIT_COST) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          creditCost: LEAD_SEARCH_CREDIT_COST,
          currentBalance: userCredit.balance
        },
        { status: 402 }
      );
    }
    
    // First, check if we have matching leads in our database
    const dbLeads = await findMatchingLeadsInDb(validatedData, user.id);
    
    // If we have enough leads in our database, return them without calling Apollo API
    if (dbLeads.length >= 10) {
      return NextResponse.json({
        leads: dbLeads,
        fromCache: true,
        message: 'Leads found in database'
      });
    }
    
    // Make Apollo API request
    const apiKey = process.env.APOLLO_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Apollo API key not configured' },
        { status: 500 }
      );
    }
    
    // Prepare search parameters for Apollo API
    const searchParams = {
      ...validatedData,
      page: 1,
      per_page: 25, // Fetch up to 25 leads
    };
    
    const apolloResponse = await fetch(APOLLO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(searchParams)
    });
    
    if (!apolloResponse.ok) {
      const errorData = await apolloResponse.json();
      return NextResponse.json(
        { error: 'Apollo API error', details: errorData },
        { status: apolloResponse.status }
      );
    }
    
    const apolloData = await apolloResponse.json();
    
    if (!apolloData.people || apolloData.people.length === 0) {
      // If no new leads found, return the ones from DB if any
      if (dbLeads.length > 0) {
        return NextResponse.json({
          leads: dbLeads,
          fromCache: true,
          message: 'No new leads found, returning leads from database'
        });
      }
      
      return NextResponse.json(
        { error: 'No leads found matching your criteria' },
        { status: 404 }
      );
    }
    
    // Process Apollo API results and save to database
    const newLeads = [];
    const existingLeadIds = new Set(dbLeads.map(lead => lead.apolloId));
    
    for (const person of apolloData.people) {
      // Skip if we already have this lead in our database
      if (person.id && existingLeadIds.has(person.id)) {
        continue;
      }
      
      // Create lead in database
      const newLead = await prismadb.apolloLead.create({
        data: {
          linkedinUrl: person.linkedin_url || null,
          firstName: person.first_name || '',
          lastName: person.last_name || '',
          email: person.email || null,
          title: person.title || null,
          company: person.organization_name || null,
          phoneNumber: person.phone_numbers?.[0] || null,
          apolloId: person.id || null,
          seniority: person.seniority || null,
          location: person.city ? `${person.city}${person.state ? `, ${person.state}` : ''}${person.country ? `, ${person.country}` : ''}` : null,
          organizationLocation: person.organization_location || null,
          organizationDomain: person.organization_website || null,
          organizationSize: person.organization_num_employees_range || null,
          emailStatus: person.email_status || null,
          rawData: JSON.stringify(person),
          userId: user.id,
        },
      });
      
      newLeads.push(newLead);
    }
    
    // Deduct credits only if we found new leads
    if (newLeads.length > 0) {
      // Deduct credits from user
      const updatedUserCredit = await prismadb.userCredit.update({
        where: { userId: user.id },
        data: { balance: { decrement: LEAD_SEARCH_CREDIT_COST } },
      });
      
      // Record the transaction
      await prismadb.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: -LEAD_SEARCH_CREDIT_COST,
          type: 'SPENT',
          description: `Apollo lead search for ${validatedData.q_keywords || 'advanced criteria'}`,
        },
      });
      
      // Combine new leads with existing leads from DB
      const allLeads = [...newLeads, ...dbLeads];
      
      return NextResponse.json({
        leads: allLeads,
        fromCache: false,
        creditsUsed: LEAD_SEARCH_CREDIT_COST,
        remainingCredits: updatedUserCredit.balance,
        message: `Found ${newLeads.length} new leads and ${dbLeads.length} existing leads`
      });
    } else {
      // If we didn't find any new leads, return the ones from DB
      return NextResponse.json({
        leads: dbLeads,
        fromCache: true,
        message: 'No new leads found, returning leads from database'
      });
    }
  } catch (error) {
    console.error('Error in Apollo lead search:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to find matching leads in the database
async function findMatchingLeadsInDb(searchParams: any, userId: string) {
  try {
    // Build the where clause based on search parameters
    const where: Prisma.ApolloLeadWhereInput = {
      userId,
    };
    
    // Add filters based on search parameters
    if (searchParams.person_titles && searchParams.person_titles.length > 0) {
      where.OR = searchParams.person_titles.map((title: string) => ({
        title: {
          contains: title,
          mode: 'insensitive',
        },
      }));
    }
    
    if (searchParams.person_seniorities && searchParams.person_seniorities.length > 0) {
      where.seniority = {
        in: searchParams.person_seniorities,
        mode: 'insensitive',
      };
    }
    
    if (searchParams.person_locations && searchParams.person_locations.length > 0) {
      if (!where.OR) where.OR = [];
      where.OR = [
        ...where.OR,
        ...searchParams.person_locations.map((location: string) => ({
          location: {
            contains: location,
            mode: 'insensitive',
          },
        })),
      ];
    }
    
    if (searchParams.organization_locations && searchParams.organization_locations.length > 0) {
      if (!where.OR) where.OR = [];
      where.OR = [
        ...where.OR,
        ...searchParams.organization_locations.map((location: string) => ({
          organizationLocation: {
            contains: location,
            mode: 'insensitive',
          },
        })),
      ];
    }
    
    if (searchParams.q_organization_domains_list && searchParams.q_organization_domains_list.length > 0) {
      if (!where.OR) where.OR = [];
      where.OR = [
        ...where.OR,
        ...searchParams.q_organization_domains_list.map((domain: string) => ({
          organizationDomain: {
            contains: domain,
            mode: 'insensitive',
          },
        })),
      ];
    }
    
    if (searchParams.q_keywords) {
      if (!where.OR) where.OR = [];
      where.OR = [
        ...where.OR,
        {
          firstName: {
            contains: searchParams.q_keywords,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: searchParams.q_keywords,
            mode: 'insensitive',
          },
        },
        {
          title: {
            contains: searchParams.q_keywords,
            mode: 'insensitive',
          },
        },
        {
          company: {
            contains: searchParams.q_keywords,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Query the database
    const leads = await prismadb.apolloLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
    
    return leads;
  } catch (error) {
    console.error('Error finding matching leads in DB:', error);
    return [];
  }
} 