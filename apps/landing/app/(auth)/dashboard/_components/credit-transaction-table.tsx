// app/(auth)/dashboard/_components/team-credit-transaction-table.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  ArrowDownUp,
  Calendar,
  ChevronDown,
  CreditCard,
  Filter,
  Search,
  Info,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Gift,
  ShoppingCart,
  CreditCard as PlanCard,
  Trash2,
  Settings,
  MessageSquare,
  Download,
  Users,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

// Import shared types
import {
  CreditTransaction,
  TransactionType,
  typeColors,
} from "@/types/transaction";

// Extended interface for team transactions
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

interface TeamCreditTransactionTableProps {
  transactions: TeamCreditTransaction[];
  isLoading?: boolean;
  mainLicenseKeys?: Array<{
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
  }>;
  isTeamView?: boolean;
}

// Platform options for filtering
const PLATFORM_OPTIONS = [
  "ALL",
  "LINKEDIN",
  "INSTAGRAM",
  "FACEBOOK",
  "TWITTER",
  "REDDIT",
  "YOUTUBE",
  "TIKTOK",
] as const;

// Action options for filtering
const ACTION_OPTIONS = [
  "ALL",
  "COMMENT",
  "LIKE",
  "AUTO_COMMENT",
  "SHARE",
  "FOLLOW",
  "UNFOLLOW",
  "POST",
  "STORY",
] as const;

// Enhanced type icons mapping
const typeIcons = {
  EARNED: <ArrowUpRight className="h-4 w-4" />,
  SPENT: <ArrowDownRight className="h-4 w-4" />,
  REFUNDED: <RefreshCw className="h-4 w-4" />,
  GIFTED: <Gift className="h-4 w-4" />,
  PURCHASED: <ShoppingCart className="h-4 w-4" />,
  PLAN_CREDITS: <PlanCard className="h-4 w-4" />,
  PLAN_CREDITS_REMOVED: <Trash2 className="h-4 w-4" />,
  PLAN_CREDITS_ADJUSTED: <Settings className="h-4 w-4" />,
  AUTO_COMMENTING: <MessageSquare className="h-4 w-4" />,
};

export function CreditTransactionTable({
  transactions = [],
  isLoading = false,
  mainLicenseKeys = [],
  isTeamView = false,
}: TeamCreditTransactionTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [mainLicenseFilter, setMainLicenseFilter] = useState<string>("ALL");
  const [subLicenseFilter, setSubLicenseFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<
    "createdAt" | "amount" | "username"
  >("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Summary statistics
  const stats = useMemo(() => {
    if (transactions.length === 0) return { earned: 0, spent: 0, balance: 0 };

    const earned = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const spent = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      earned,
      spent,
      balance: earned + spent,
    };
  }, [transactions]);

  // Get available sublicenses based on selected main license
  const availableSubLicenses = useMemo(() => {
    if (mainLicenseFilter === "ALL") {
      return mainLicenseKeys.flatMap((license) => license.subLicenses);
    }
    const selectedMainLicense = mainLicenseKeys.find(
      (license) => license.id === mainLicenseFilter,
    );
    return selectedMainLicense?.subLicenses || [];
  }, [mainLicenseFilter, mainLicenseKeys]);

  // Filter transactions by search and filters
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesSearch =
          search === "" ||
          transaction.description
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          transaction.id.toLowerCase().includes(search.toLowerCase()) ||
          transaction.username?.toLowerCase().includes(search.toLowerCase()) ||
          transaction.email?.toLowerCase().includes(search.toLowerCase());

        const matchesTypeFilter =
          filter === "ALL" || transaction.type === filter;

        const matchesPlatformFilter =
          platformFilter === "ALL" ||
          transaction.platform?.toUpperCase() === platformFilter;

        const matchesActionFilter =
          actionFilter === "ALL" ||
          transaction.action?.toUpperCase() === actionFilter;

        const matchesMainLicenseFilter =
          mainLicenseFilter === "ALL" ||
          transaction.licenseKey?.id === mainLicenseFilter;

        const matchesSubLicenseFilter =
          subLicenseFilter === "ALL" ||
          transaction.subLicense?.id === subLicenseFilter;

        return (
          matchesSearch &&
          matchesTypeFilter &&
          matchesPlatformFilter &&
          matchesActionFilter &&
          matchesMainLicenseFilter &&
          matchesSubLicenseFilter
        );
      })
      .sort((a, b) => {
        if (sortField === "createdAt") {
          return sortDirection === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortField === "amount") {
          return sortDirection === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount;
        } else if (sortField === "username") {
          const aUsername = a.username || a.email || "";
          const bUsername = b.username || b.email || "";
          return sortDirection === "asc"
            ? aUsername.localeCompare(bUsername)
            : bUsername.localeCompare(aUsername);
        }
        return 0;
      });
  }, [
    transactions,
    search,
    filter,
    platformFilter,
    actionFilter,
    mainLicenseFilter,
    subLicenseFilter,
    sortField,
    sortDirection,
  ]);

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Toggle sort direction
  const toggleSort = (field: "createdAt" | "amount" | "username") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Export data function
  const exportData = () => {
    const csvContent = [
      // CSV headers
      [
        "Date",
        "Username",
        "Email",
        "Action",
        "Platform",
        "Type",
        "Amount",
        "Description",
        "License Key",
        "Sub License Key",
      ].join(","),
      // CSV data rows
      ...filteredTransactions.map((transaction) =>
        [
          formatDate(transaction.createdAt),
          transaction.username || "",
          transaction.email || "",
          transaction.action || "",
          transaction.platform || "",
          transaction.type.replace(/_/g, " "),
          transaction.amount,
          `"${transaction.description || ""}"`,
          transaction.licenseKey?.key || "",
          transaction.subLicense?.key || "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilter("ALL");
    setPlatformFilter("ALL");
    setActionFilter("ALL");
    setMainLicenseFilter("ALL");
    setSubLicenseFilter("ALL");
    setSearch("");
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {isTeamView ? (
                <Users className="h-6 w-6 text-primary" />
              ) : (
                <CreditCard className="h-6 w-6 text-primary" />
              )}
              {isTeamView ? "Team Credit Activity" : "Credit Transactions"}
            </CardTitle>
            <CardDescription className="mt-1 text-gray-500">
              {isTeamView
                ? "Monitor and track your team's credit activity"
                : "Manage and track your credit activity"}
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium text-sm flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />+{stats.earned}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total Credits Earned</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-medium text-sm flex items-center gap-1">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    {stats.spent}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total Credits Spent</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-sm flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" />
                    {stats.balance}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current Balance</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isTeamView && (
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, emails..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Transaction Type Filter */}
          <Select
            value={filter}
            onValueChange={(value) =>
              setFilter(value as TransactionType | "ALL")
            }
          >
            <SelectTrigger className="border rounded-lg">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Transaction Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Transaction Types</SelectLabel>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="EARNED">Earned</SelectItem>
                <SelectItem value="SPENT">Spent</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="GIFTED">Gifted</SelectItem>
                <SelectItem value="PURCHASED">Purchased</SelectItem>
                <SelectItem value="PLAN_CREDITS">Plan Credits</SelectItem>
                <SelectItem value="PLAN_CREDITS_REMOVED">
                  Plan Credits Removed
                </SelectItem>
                <SelectItem value="PLAN_CREDITS_ADJUSTED">
                  Plan Credits Adjusted
                </SelectItem>
                <SelectItem value="AUTO_COMMENTING">Auto Commenting</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Platform Filter */}
          <Select
            value={platformFilter}
            onValueChange={(value) => setPlatformFilter(value)}
          >
            <SelectTrigger className="border rounded-lg">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Platform" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Platforms</SelectLabel>
                {PLATFORM_OPTIONS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform === "ALL" ? "All Platforms" : platform}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Action Filter */}
          <Select
            value={actionFilter}
            onValueChange={(value) => setActionFilter(value)}
          >
            <SelectTrigger className="border rounded-lg">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Action" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Actions</SelectLabel>
                {ACTION_OPTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === "ALL"
                      ? "All Actions"
                      : action.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Team-specific filters - only show in team view */}
        {isTeamView && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
            {/* Sub License Filter */}
            <Select
              value={subLicenseFilter}
              onValueChange={(value) => setSubLicenseFilter(value)}
            >
              <SelectTrigger className="border rounded-lg">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Team Member" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Team Members</SelectLabel>
                  <SelectItem value="ALL">All Team Members</SelectItem>
                  {availableSubLicenses.map((subLicense) => (
                    <SelectItem key={subLicense.id} value={subLicense.id}>
                      {subLicense.assignedUser?.email ||
                        subLicense.assignedEmail ||
                        subLicense.key}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters Button */}
        {(filter !== "ALL" ||
          platformFilter !== "ALL" ||
          actionFilter !== "ALL" ||
          mainLicenseFilter !== "ALL" ||
          subLicenseFilter !== "ALL" ||
          search) && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    Date
                    {sortField === "createdAt" && (
                      <ArrowDownUp
                        className={`ml-1 h-3 w-3 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>

                {isTeamView && (
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSort("username")}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      Username
                      {sortField === "username" && (
                        <ArrowDownUp
                          className={`ml-1 h-3 w-3 transition-transform ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                )}

                {isTeamView && <TableHead>Action</TableHead>}

                {isTeamView && <TableHead>Platform</TableHead>}

                <TableHead>Type</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSort("amount")}
                >
                  <div className="flex items-center">
                    Amount
                    {sortField === "amount" && (
                      <ArrowDownUp
                        className={`ml-1 h-3 w-3 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-full">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={isTeamView ? 7 : 4}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                      <p>Loading transactions...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isTeamView ? 7 : 4}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      <p>No transactions found</p>
                      {search ||
                      filter !== "ALL" ||
                      platformFilter !== "ALL" ||
                      actionFilter !== "ALL" ||
                      mainLicenseFilter !== "ALL" ||
                      subLicenseFilter !== "ALL" ? (
                        <p className="text-sm mt-1">
                          Try adjusting your filters
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-700">
                      <div className="flex flex-col">
                        <span>
                          {formatDate(transaction.createdAt).split(",")[0]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(transaction.createdAt).split(",")[1]}
                        </span>
                      </div>
                    </TableCell>

                    {isTeamView && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {transaction.username ||
                              transaction.subLicense?.assignedUser?.name ||
                              "Unknown User"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {transaction.email ||
                              transaction.subLicense?.assignedUser?.email ||
                              transaction.subLicense?.assignedEmail ||
                              "No email"}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    {isTeamView && (
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {transaction.action || "N/A"}
                        </Badge>
                      </TableCell>
                    )}

                    {isTeamView && (
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.platform || "N/A"}
                        </Badge>
                      </TableCell>
                    )}

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${typeColors[transaction.type]} border-0 flex items-center gap-1 px-2.5 py-1`}
                      >
                        {typeIcons[transaction.type]}
                        <span>{transaction.type.replace(/_/g, " ")}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          transaction.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        } flex items-center`}
                      >
                        {transaction.amount >= 0 ? "+" : ""}
                        {transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex items-center gap-2">
                        <div className="truncate">
                          {transaction.description || "-"}
                        </div>
                        {transaction.description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{transaction.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t p-4 bg-gray-50 text-sm text-gray-500">
        <div>
          {filteredTransactions.length > 0 && (
            <span>
              Showing {filteredTransactions.length} transaction
              {filteredTransactions.length === 1 ? "" : "s"}
              {isTeamView && " across all team members"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {(filter !== "ALL" ||
            search ||
            platformFilter !== "ALL" ||
            actionFilter !== "ALL" ||
            mainLicenseFilter !== "ALL" ||
            subLicenseFilter !== "ALL") && (
            <button
              className="text-primary hover:underline flex items-center gap-1"
              onClick={clearAllFilters}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
// // app/(auth)/dashboard/_components/credit-transaction-tbale.tsx
// "use client";

// import { useState, useMemo } from "react";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@repo/ui/components/ui/table";

// import { Input } from "@repo/ui/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@repo/ui/components/ui/select";
// import { Badge } from "@repo/ui/components/ui/badge";
// import {
//   ArrowDownUp,
//   Calendar,
//   ChevronDown,
//   CreditCard,
//   Filter,
//   Search,
//   Info,
//   AlertCircle,
//   ArrowUpRight,
//   ArrowDownRight,
//   RefreshCw,
//   Gift,
//   ShoppingCart,
//   CreditCard as PlanCard,
//   Trash2,
//   Settings,
//   MessageSquare,
// } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@repo/ui/components/ui/card";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@repo/ui/components/ui/tooltip";

// // Import shared types
// import {
//   CreditTransaction,
//   TransactionType,
//   typeColors,
// } from "@/types/transaction";

// interface CreditTransactionTableProps {
//   transactions: CreditTransaction[];
//   isLoading?: boolean;
// }

// // Enhanced type icons mapping
// const typeIcons = {
//   EARNED: <ArrowUpRight className="h-4 w-4" />,
//   SPENT: <ArrowDownRight className="h-4 w-4" />,
//   REFUNDED: <RefreshCw className="h-4 w-4" />,
//   GIFTED: <Gift className="h-4 w-4" />,
//   PURCHASED: <ShoppingCart className="h-4 w-4" />,
//   PLAN_CREDITS: <PlanCard className="h-4 w-4" />,
//   PLAN_CREDITS_REMOVED: <Trash2 className="h-4 w-4" />,
//   PLAN_CREDITS_ADJUSTED: <Settings className="h-4 w-4" />,
//   AUTO_COMMENTING: <MessageSquare className="h-4 w-4" />,
// };

// export function CreditTransactionTable({
//   transactions = [],
//   isLoading = false,
// }: CreditTransactionTableProps) {
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");
//   const [sortField, setSortField] = useState<"createdAt" | "amount">(
//     "createdAt",
//   );
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

//   // Summary statistics
//   const stats = useMemo(() => {
//     if (transactions.length === 0) return { earned: 0, spent: 0, balance: 0 };

//     const earned = transactions
//       .filter((t) => t.amount > 0)
//       .reduce((sum, t) => sum + t.amount, 0);

//     const spent = transactions
//       .filter((t) => t.amount < 0)
//       .reduce((sum, t) => sum + t.amount, 0);

//     return {
//       earned,
//       spent,
//       balance: earned + spent,
//     };
//   }, [transactions]);

//   // Filter transactions by search and type
//   const filteredTransactions = useMemo(() => {
//     return transactions
//       .filter((transaction) => {
//         const matchesSearch =
//           search === "" ||
//           transaction.description
//             ?.toLowerCase()
//             .includes(search.toLowerCase()) ||
//           transaction.id.toLowerCase().includes(search.toLowerCase());

//         const matchesFilter = filter === "ALL" || transaction.type === filter;

//         return matchesSearch && matchesFilter;
//       })
//       .sort((a, b) => {
//         if (sortField === "createdAt") {
//           return sortDirection === "asc"
//             ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//             : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//         } else {
//           return sortDirection === "asc"
//             ? a.amount - b.amount
//             : b.amount - a.amount;
//         }
//       });
//   }, [transactions, search, filter, sortField, sortDirection]);

//   // Format date to readable string
//   const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     }).format(new Date(date));
//   };

//   // Toggle sort direction
//   const toggleSort = (field: "createdAt" | "amount") => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortDirection("desc");
//     }
//   };

//   return (
//     <Card className="shadow-lg">
//       <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="text-2xl font-bold flex items-center gap-2">
//               <CreditCard className="h-6 w-6 text-primary" />
//               Credit Transactions
//             </CardTitle>
//             <CardDescription className="mt-1 text-gray-500">
//               Manage and track your credit activity
//             </CardDescription>
//           </div>
//           <div className="flex gap-2">
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium text-sm flex items-center gap-1">
//                     <ArrowUpRight className="h-3.5 w-3.5" />+{stats.earned}
//                   </div>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Total Credits Earned</p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>

//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <div className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-medium text-sm flex items-center gap-1">
//                     <ArrowDownRight className="h-3.5 w-3.5" />
//                     {stats.spent}
//                   </div>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Total Credits Spent</p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>

//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-sm flex items-center gap-1">
//                     <Info className="h-3.5 w-3.5" />
//                     {stats.balance}
//                   </div>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Current Balance</p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="p-6">
//         <div className="flex items-center justify-between mb-4">
//           <div className="relative w-64">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search transactions..."
//               className="pl-10 pr-4 py-2 border rounded-lg w-full"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <Select
//               value={filter}
//               onValueChange={(value) =>
//                 setFilter(value as TransactionType | "ALL")
//               }
//             >
//               <SelectTrigger className="w-48 border rounded-lg">
//                 <div className="flex items-center">
//                   <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
//                   <SelectValue placeholder="Filter by type" />
//                 </div>
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   <SelectLabel>Transaction Types</SelectLabel>
//                   <SelectItem value="ALL">All Transactions</SelectItem>
//                   <SelectItem value="EARNED">Earned</SelectItem>
//                   <SelectItem value="SPENT">Spent</SelectItem>
//                   <SelectItem value="REFUNDED">Refunded</SelectItem>
//                   <SelectItem value="GIFTED">Gifted</SelectItem>
//                   <SelectItem value="PURCHASED">Purchased</SelectItem>
//                   <SelectItem value="PLAN_CREDITS">Plan Credits</SelectItem>
//                   <SelectItem value="PLAN_CREDITS_REMOVED">
//                     Plan Credits Removed
//                   </SelectItem>
//                   <SelectItem value="PLAN_CREDITS_ADJUSTED">
//                     Plan Credits Adjusted
//                   </SelectItem>
//                   <SelectItem value="AUTO_COMMENTING">
//                     Auto Commenting
//                   </SelectItem>
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         <div className="rounded-lg overflow-hidden border border-gray-200">
//           <Table>
//             <TableHeader className="bg-gray-50">
//               <TableRow>
//                 <TableHead
//                   className="cursor-pointer hover:bg-gray-100 transition-colors"
//                   onClick={() => toggleSort("createdAt")}
//                 >
//                   <div className="flex items-center">
//                     <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
//                     Date
//                     {sortField === "createdAt" && (
//                       <ArrowDownUp
//                         className={`ml-1 h-3 w-3 transition-transform ${
//                           sortDirection === "desc" ? "rotate-180" : ""
//                         }`}
//                       />
//                     )}
//                   </div>
//                 </TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead
//                   className="cursor-pointer hover:bg-gray-100 transition-colors"
//                   onClick={() => toggleSort("amount")}
//                 >
//                   <div className="flex items-center">
//                     Amount
//                     {sortField === "amount" && (
//                       <ArrowDownUp
//                         className={`ml-1 h-3 w-3 transition-transform ${
//                           sortDirection === "desc" ? "rotate-180" : ""
//                         }`}
//                       />
//                     )}
//                   </div>
//                 </TableHead>
//                 <TableHead className="w-full">Description</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {isLoading ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-12">
//                     <div className="flex flex-col items-center justify-center text-gray-500">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
//                       <p>Loading transactions...</p>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : filteredTransactions.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-12">
//                     <div className="flex flex-col items-center justify-center text-gray-500">
//                       <AlertCircle className="h-8 w-8 mb-2" />
//                       <p>No transactions found</p>
//                       {search || filter !== "ALL" ? (
//                         <p className="text-sm mt-1">
//                           Try adjusting your filters
//                         </p>
//                       ) : null}
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredTransactions.map((transaction) => (
//                   <TableRow
//                     key={transaction.id}
//                     className="group hover:bg-gray-50 transition-colors"
//                   >
//                     <TableCell className="font-medium text-gray-700">
//                       <div className="flex flex-col">
//                         <span>
//                           {formatDate(transaction.createdAt).split(",")[0]}
//                         </span>
//                         <span className="text-xs text-gray-500">
//                           {formatDate(transaction.createdAt).split(",")[1]}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <Badge
//                         variant="outline"
//                         className={`${typeColors[transaction.type]} border-0 flex items-center gap-1 px-2.5 py-1`}
//                       >
//                         {typeIcons[transaction.type]}
//                         <span>{transaction.type.replace(/_/g, " ")}</span>
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <span
//                         className={`font-medium ${
//                           transaction.amount >= 0
//                             ? "text-green-600"
//                             : "text-red-600"
//                         } flex items-center`}
//                       >
//                         {transaction.amount >= 0 ? "+" : ""}
//                         {transaction.amount}
//                       </span>
//                     </TableCell>
//                     <TableCell className="max-w-md">
//                       <div className="flex items-center gap-2">
//                         <div className="truncate">
//                           {transaction.description || "-"}
//                         </div>
//                         {transaction.description && (
//                           <TooltipProvider>
//                             <Tooltip>
//                               <TooltipTrigger asChild>
//                                 <Info className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
//                               </TooltipTrigger>
//                               <TooltipContent>
//                                 <p>{transaction.description}</p>
//                               </TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>
//                         )}
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>

//       <CardFooter className="flex justify-between items-center border-t p-4 bg-gray-50 text-sm text-gray-500">
//         <div>
//           {filteredTransactions.length > 0 && (
//             <span>
//               Showing {filteredTransactions.length} transaction
//               {filteredTransactions.length === 1 ? "" : "s"}
//             </span>
//           )}
//         </div>
//         <div>
//           {filter !== "ALL" || search ? (
//             <button
//               className="text-primary hover:underline flex items-center gap-1"
//               onClick={() => {
//                 setFilter("ALL");
//                 setSearch("");
//               }}
//             >
//               <RefreshCw className="h-3.5 w-3.5" />
//               Clear filters
//             </button>
//           ) : null}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
