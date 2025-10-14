// app/api/credit-transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TransactionType } from "@/types/transaction";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
// Create a string enum from TransactionType
const transactionTypeEnum = z.enum([
  "EARNED",
  "SPENT",
  "REFUNDED",
  "GIFTED",
  "PURCHASED",
  "PLAN_CREDITS",
  "PLAN_CREDITS_REMOVED",
  "PLAN_CREDITS_ADJUSTED",
  "AUTO_COMMENTING",
  "ALL", // Include ALL for filtering
]);

// Validation schema for query parameters
const querySchema = z.object({
  limit: z.coerce.number().optional().default(50),
  page: z.coerce.number().optional().default(1),
  type: transactionTypeEnum.nullable().optional().default("ALL"),
  search: z.string().nullable().optional().default(""),
  sortBy: z
    .enum(["createdAt", "amount", "type"])
    .optional()
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);

    // Pre-process the query parameters to handle null values
    const queryParamsObject = {
      limit: searchParams.get("limit") || undefined,
      page: searchParams.get("page") || undefined,
      type: searchParams.get("type") || "ALL",
      search: searchParams.get("search") || "",
      sortBy: searchParams.get("sortBy") || undefined,
      sortDirection: searchParams.get("sortDirection") || undefined,
    };

    const validatedParams = querySchema.safeParse(queryParamsObject);

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validatedParams.error.errors,
        },
        { status: 400 },
      );
    }

    const { limit, page, type, search, sortBy, sortDirection } =
      validatedParams.data;

    // Get user credit record
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!userCredit) {
      return NextResponse.json(
        { error: "User credit record not found" },
        { status: 404 },
      );
    }

    // Build query filters
    const filters = {
      userCreditId: userCredit.id,
      ...(type !== "ALL" && { type: type as Exclude<TransactionType, "ALL"> }),
    };

    // Add search filter if provided
    let finalFilters: any = { ...filters };
    if (search) {
      finalFilters = {
        ...filters,
        OR: [
          { description: { contains: search, mode: "insensitive" } },
          { id: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prismadb.creditTransaction.count({
      where: finalFilters,
    });

    // Get transactions with filters, sorting and pagination
    const transactions = await prismadb.creditTransaction.findMany({
      where: finalFilters,
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip,
      take: limit,
      include: {
        purchase: {
          select: {
            id: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Return properly formatted JSON response
    return NextResponse.json({
      transactions,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Error fetching credit transactions:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
