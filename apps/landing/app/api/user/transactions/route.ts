import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

// GET /api/user/transactions
export async function GET(request: NextRequest) {
  try {
    const {user} = await validateRequest();
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    
    // Fetch the user's credit transactions
    const transactions = await prismadb.creditTransaction.findMany({
      where: {
        userCredit: {
          userId
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    
    return NextResponse.json({ transactions });
    
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
} 