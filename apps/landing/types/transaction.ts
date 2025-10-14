export type TransactionType =
  | "EARNED"
  | "SPENT"
  | "REFUNDED"
  | "GIFTED"
  | "PURCHASED"
  | "PLAN_CREDITS"
  | "PLAN_CREDITS_REMOVED"
  | "PLAN_CREDITS_ADJUSTED"
  | "AUTO_COMMENTING";

export interface CreditTransaction {
  id: string;
  userCreditId: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  createdAt: Date;
  purchase?: {
    id: string;
    name: string;
  } | null;
}

export interface CreditTransactionRaw {
  id: string;
  userCreditId: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  createdAt: string; // Date as string from API
  purchase?: {
    id: string;
    name: string;
  } | null;
}

export interface PaginationData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Color mapping for transaction types
export const typeColors: Record<TransactionType, string> = {
  EARNED: "bg-green-100 text-green-800",
  SPENT: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
  GIFTED: "bg-purple-100 text-purple-800",
  PURCHASED: "bg-amber-100 text-amber-800",
  PLAN_CREDITS: "bg-indigo-100 text-indigo-800",
  PLAN_CREDITS_REMOVED: "bg-rose-100 text-rose-800",
  PLAN_CREDITS_ADJUSTED: "bg-sky-100 text-sky-800",
  AUTO_COMMENTING: "bg-orange-100 text-orange-800",
};
