"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/ui/card";
import { History } from "lucide-react";
import { TransferLog } from "@/types/orgs";

interface TransferHistoryTableProps {
  transferLogs: TransferLog[];
}

const TransferHistoryTable: React.FC<TransferHistoryTableProps> = ({
  transferLogs,
}) => {
  return (
    // <Card>
    //   <CardHeader>
    //     <CardTitle className="flex items-center gap-2">
    //       <History className="h-5 w-5" />
    //       Credit Transfer History
    //     </CardTitle>
    //   </CardHeader>
    //   <CardContent>
    //     <div className="overflow-x-auto">
    //       <table className="w-full">
    //         <thead>
    //           <tr className="border-b">
    //             <th className="text-left p-4">Date</th>
    //             <th className="text-left p-4">From</th>
    //             <th className="text-left p-4">To</th>
    //             <th className="text-right p-4">Amount</th>
    //             <th className="text-left p-4">Transferred By</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {transferLogs.map((log) => (
    //             <tr key={log.id} className="hover:bg-gray-50 border-b">
    //               <td className="p-4 font-medium">
    //                 {new Date(log.createdAt).toLocaleString()}
    //               </td>
    //               <td className="p-4">{log.fromUserEmail}</td>
    //               <td className="p-4">{log.toUserEmail}</td>
    //               <td className="p-4 text-right font-medium text-blue-600">
    //                 {log.amount}
    //               </td>
    //               <td className="p-4">{log.transferredByEmail}</td>
    //             </tr>
    //           ))}
    //         </tbody>
    //       </table>
    //     </div>
    //   </CardContent>
    // </Card>
    //
    <>Logs will be here</>
  );
};

export default TransferHistoryTable;
