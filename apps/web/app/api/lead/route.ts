import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Apollo API endpoint for people search
const APOLLO_API_URL = 'https://api.apollo.io/api/v1/mixed_people/search';
// Credit cost for each lead search
const LEAD_SEARCH_CREDIT_COST = 2;

// Schema for validating search parameters
const apolloSearchSchema = z.object({
  linkedinUrl: z.string().url().optional(),
  person_titles: z.array(z.string()).optional(),
  person_locations: z.array(z.string()).optional(),
  person_seniorities: z.array(z.string()).optional(),
  organization_locations: z.array(z.string()).optional(),
  q_organization_domains_list: z.array(z.string()).optional(),
  contact_email_status: z.array(z.string()).optional(),
  organization_num_employees_ranges: z.array(z.string()).optional(),
  q_keywords: z.string().optional(),
}).refine(data => {
  // Either linkedinUrl or at least one other search parameter must be provided
  return !!data.linkedinUrl || 
    (data.person_titles && data.person_titles.length > 0) ||
    (data.person_locations && data.person_locations.length > 0) ||
    (data.person_seniorities && data.person_seniorities.length > 0) ||
    (data.organization_locations && data.organization_locations.length > 0) ||
    (data.q_organization_domains_list && data.q_organization_domains_list.length > 0) ||
    (data.contact_email_status && data.contact_email_status.length > 0) ||
    (data.organization_num_employees_ranges && data.organization_num_employees_ranges.length > 0) ||
    !!data.q_keywords;
}, {
  message: "Either a LinkedIn URL or at least one search parameter must be provided"
});

// Function to search for a person by LinkedIn URL
async function searchPersonByLinkedIn(apiKey: string, linkedinUrl: string) {
  if (!linkedinUrl) {
    throw new Error('LinkedIn URL is required');
  }
  
  try {
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        linkedin_url: linkedinUrl,
        page: 1,
        per_page: 1 // We only need one result since we're searching by LinkedIn URL
      }),
    });

    if (!response.ok) {
      throw new Error(`Apollo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if we have any people in the response
    if (!data.people || data.people.length === 0) {
      throw new Error('No person found for this LinkedIn URL');
    }
    
    // Return the first person found
    return { person: data.people[0] };
  } catch (error) {
    console.error('Error searching person:', error);
    throw error;
  }
}

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
    const validatedData = apolloSearchSchema.parse(body);
    
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
    
    // If LinkedIn URL is provided, check if we already have this lead in our database
    if (validatedData.linkedinUrl) {
      const existingLead = await prismadb.apolloLead.findFirst({
        where: {
          linkedinUrl: {
            equals: validatedData.linkedinUrl,
            mode: 'insensitive',
          },
        },
      });
      
      if (existingLead) {
        return NextResponse.json({
          lead: existingLead,
          fromCache: true,
        });
      }
      
      // Lead not found in database, call Apollo API to fetch details
      const apiKey = process.env.APOLLO_API_KEY;
      
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Apollo API key not configured' },
          { status: 500 }
        );
      }
      
      const apolloResponse = await searchPersonByLinkedIn(apiKey, validatedData.linkedinUrl);
      
      if (!apolloResponse.person) {
        return NextResponse.json(
          { error: 'No person found for this LinkedIn URL' },
          { status: 404 }
        );
      }
      
      const person = apolloResponse.person;
      
      // Create lead in database and deduct credits in a transaction
      const [newLead, updatedUserCredit, transaction] = await prismadb.$transaction([
        // Create the lead
        prismadb.apolloLead.create({
          data: {
            linkedinUrl: validatedData.linkedinUrl,
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
        }),
        
        // Deduct credits
        prismadb.userCredit.update({
          where: { userId: user.id },
          data: { balance: { decrement: LEAD_SEARCH_CREDIT_COST } },
        }),
        
        // Record the transaction
        prismadb.creditTransaction.create({
          data: {
            userCreditId: userCredit.id,
            amount: -LEAD_SEARCH_CREDIT_COST,
            type: 'SPENT',
            description: `Apollo lead search for ${person.first_name} ${person.last_name}`,
          },
        }),
      ]);
      
      return NextResponse.json({
        lead: newLead,
        fromCache: false,
        creditsUsed: LEAD_SEARCH_CREDIT_COST,
        remainingCredits: updatedUserCredit.balance
      });
    } else {
      // Advanced search with parameters
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
          'x-api-key': apiKey
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
    }
  } catch (error) {
    console.error('Error in lead search:', error);
    
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

// GET endpoint to retrieve leads for the current user with pagination
export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Build the where clause
    const where: Prisma.ApolloLeadWhereInput = {
      userId: user.id,
    };
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { seniority: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { organizationDomain: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get total count for pagination
    const total = await prismadb.apolloLead.count({ where });
    
    // Get leads with pagination
    const leads = await prismadb.apolloLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
