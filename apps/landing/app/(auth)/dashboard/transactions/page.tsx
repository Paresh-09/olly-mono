// app/(auth)/dashboard/team-transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/ui/pagination";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { AlertCircle, Users, Lock, ArrowLeft, Receipt, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import Link from "next/link";

// Import shared types
import {
  CreditTransaction,
  CreditTransactionRaw,
  PaginationData,
  TransactionType,
} from "@/types/transaction";
import { CreditTransactionTable } from "../_components/credit-transaction-table";

// Extended interface for team transactions
interface TeamCreditTransactionRaw extends CreditTransactionRaw {
  username?: string;
  email?: string;
  platform?: string;
  action?: string;
  licenseKey?: {
    id: string;
    key: string;
  };
  subLicense?: {
    id: string;
    key: string;
    assignedEmail?: string;
    assignedUser?: {
      email: string;
      name?: string;
    };
  };
}

interface TeamCreditTransaction extends CreditTransaction {
  username?: string;
  email?: string;
  platform?: string;
  action?: string;
  licenseKey?: {
    id: string;
    key: string;
  };
  subLicense?: {
    id: string;
    key: string;
    assignedEmail?: string;
    assignedUser?: {
      email: string;
      name?: string;
    };
  };
}

interface MainLicenseKey {
  id: string;
  key: string;
  subLicenses: Array<{
    id: string;
    key: string;
    assignedEmail?: string;
    assignedUser?: {
      email: string;
      name?: string;
    };
  }>;
}

export default function TeamTransactionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current parameters or set defaults
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 50);
  const type = (searchParams.get("type") as TransactionType | "ALL") || "ALL";
  const search = searchParams.get("search") || "";
  const platform = searchParams.get("platform") || "ALL";
  const action = searchParams.get("action") || "ALL";
  const mainLicenseId = searchParams.get("mainLicenseId") || "ALL";
  const subLicenseId = searchParams.get("subLicenseId") || "ALL";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDirection = searchParams.get("sortDirection") || "desc";
  const view = searchParams.get("view") || "team"; // "individual" or "team"

  const [transactions, setTransactions] = useState<TeamCreditTransaction[]>([]);
  const [mainLicenseKeys, setMainLicenseKeys] = useState<MainLicenseKey[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [isTeamAccessDenied, setIsTeamAccessDenied] = useState(false);
  const [isTeamAccessChecked, setIsTeamAccessChecked] = useState(false);

  // Check team access permission on initial load
  useEffect(() => {
    async function checkTeamAccess() {
      if (isTeamAccessChecked) return;

      try {
        const response = await fetch('/api/credit-transactions/team?page=1&limit=1&view=team');
        if (response.status === 403) {
          setIsTeamAccessDenied(true);
          // If we're currently on team view, switch to individual
          if (view === "team") {
            updateParams({
              view: "individual",
              page: "1",
              mainLicenseId: "ALL",
              subLicenseId: "ALL",
              platform: "ALL",
              action: "ALL",
            });
          }
        }
      } catch (error) {
        console.log("Team access check failed:", error);
      } finally {
        setIsTeamAccessChecked(true);
      }
    }

    checkTeamAccess();
  }, []);

  useEffect(() => {
    async function fetchTeamTransactions() {
      // Don't fetch if we haven't checked team access yet
      if (!isTeamAccessChecked) return;

      setIsLoading(true);
      setError(null);
      setRawResponse(null);

      try {
        // Build query string from current parameters
        const paramObject: Record<string, string> = {
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortDirection,
          view, // Add view parameter to distinguish team vs individual calls
        };

        // Only add non-default filters
        if (type !== "ALL") {
          paramObject.type = type;
        }

        if (search) {
          paramObject.search = search;
        }

        if (platform !== "ALL") {
          paramObject.platform = platform;
        }

        if (action !== "ALL") {
          paramObject.action = action;
        }

        if (mainLicenseId !== "ALL") {
          paramObject.mainLicenseId = mainLicenseId;
        }

        if (subLicenseId !== "ALL") {
          paramObject.subLicenseId = subLicenseId;
        }

        const queryParams = new URLSearchParams(paramObject);

        // Use different endpoint for team transactions
        const apiUrl =
          view === "team"
            ? `/api/credit-transactions/team?${queryParams.toString()}`
            : `/api/credit-transactions?${queryParams.toString()}`;


        const response = await fetch(apiUrl);

        // Store the raw text response for debugging
        const rawText = await response.text();
        setRawResponse(rawText);

        if (!response.ok) {
          // Handle 403 specifically for team view
          if (response.status === 403 && view === "team") {
            setIsTeamAccessDenied(true);
            return;
          }

          try {
            const errorData = JSON.parse(rawText);
            throw new Error(errorData.error || "Failed to fetch transactions");
          } catch (parseError) {
            throw new Error(
              `Server error: ${response.status} ${response.statusText}`,
            );
          }
        }

        // Try parsing the response
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          throw new Error(
            `Invalid JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          );
        }


        // Format dates from strings to Date objects for the table component
        const formattedTransactions = (data.transactions || []).map(
          (transaction: TeamCreditTransactionRaw) => ({
            ...transaction,
            createdAt: new Date(transaction.createdAt),
          }),
        );

        setTransactions(formattedTransactions);
        setPagination(data.pagination || null);

        // Set main license keys if provided (for team view)
        if (data.mainLicenseKeys) {
          setMainLicenseKeys(data.mainLicenseKeys);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamTransactions();
  }, [
    page,
    limit,
    type,
    search,
    platform,
    action,
    mainLicenseId,
    subLicenseId,
    sortBy,
    sortDirection,
    view,
    isTeamAccessChecked, // Add dependency to ensure team access is checked first
  ]);

  // Update URL parameters when filters change
  const updateParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    router.push(`?${newParams.toString()}`);
  };

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  // Handle view change
  const handleViewChange = (newView: string) => {
    // Prevent switching to team view if access is denied
    if (newView === "team" && isTeamAccessDenied) {
      return;
    }

    updateParams({
      view: newView,
      page: "1", // Reset to first page when changing views
      mainLicenseId: "ALL", // Reset filters when switching views
      subLicenseId: "ALL",
      platform: "ALL",
      action: "ALL",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                href="/dashboard"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Link>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0C9488] rounded-xl flex items-center justify-center shadow-lg shadow-[#0C9488]/25">
                <Receipt className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Transaction History
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {view === "team" ? "Team activity and credit usage" : "Your personal transaction history"}
                </p>
              </div>
            </div>
            {isTeamAccessDenied && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <Link href="/plans">
                  <button className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 shadow-lg shadow-[#0C9488]/25 text-sm font-medium w-full sm:w-auto">
                    Upgrade to Team
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading transactions: {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl shadow-gray-200/50">
          <div className="p-6">
            {/* Tabs Section */}
            <Tabs value={view} onValueChange={handleViewChange} className="w-full">
              <div className="mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-12 rounded-xl max-w-md">
                  <TabsTrigger
                    value="individual"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-[#0C9488] data-[state=active]:shadow-sm rounded-lg transition-all"
                  >
                    <Activity className="h-4 w-4" />
                    <span>My Activity</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="team"
                    className={`flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-[#0C9488] data-[state=active]:shadow-sm rounded-lg transition-all ${isTeamAccessDenied ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    disabled={isTeamAccessDenied}
                  >
                    {isTeamAccessDenied ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                    <span>Team Activity</span>
                  </TabsTrigger>
                </TabsList>

                {/* Team Access Denied Banner */}
                {isTeamAccessDenied && view === "individual" && (
                  <div className="mt-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Lock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-amber-800 mb-1">
                            Team Transactions Locked
                          </h3>
                          <p className="text-sm text-amber-700 mb-3">
                            Upgrade to a team plan to view team member transactions and activity across your organization.
                          </p>
                          <Link href="/plans">
                            <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
                              View Team Plans
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <TabsContent value="individual" className="mt-0">
                <CreditTransactionTable
                  transactions={transactions}
                  isLoading={isLoading}
                  mainLicenseKeys={mainLicenseKeys}
                  isTeamView={false}
                />
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <CreditTransactionTable
                  transactions={transactions}
                  isLoading={isLoading}
                  mainLicenseKeys={mainLicenseKeys}
                  isTeamView={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg shadow-gray-200/25 p-4">
              <Pagination>
                <PaginationContent>
                  {pagination.hasPreviousPage && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page - 1);
                        }}
                        className="hover:bg-[#0C9488]/10 hover:text-[#0C9488]"
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                    (_, idx) => {
                      let pageNum: number;

                      // Show pages around current page
                      if (pagination.totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (page <= 3) {
                        pageNum = idx + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + idx;
                      } else {
                        pageNum = page - 2 + idx;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            isActive={pageNum === page}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pageNum);
                            }}
                            className={
                              pageNum === page
                                ? "bg-[#0C9488] text-white hover:bg-[#0a7d73]"
                                : "hover:bg-[#0C9488]/10 hover:text-[#0C9488]"
                            }
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    },
                  )}

                  {pagination.totalPages > 5 && page < pagination.totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pagination.totalPages);
                          }}
                          className="hover:bg-[#0C9488]/10 hover:text-[#0C9488]"
                        >
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  {pagination.hasNextPage && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page + 1);
                        }}
                        className="hover:bg-[#0C9488]/10 hover:text-[#0C9488]"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}