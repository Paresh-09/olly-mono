
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaginatedHistoryTable } from "../_components/paginated-history-table";

export default async function AutoCommenterPage() {
  const session = await validateRequest();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Auto-Commenter History</h1>
      <PaginatedHistoryTable userId={session.user.id} />
    </div>
  );
}
