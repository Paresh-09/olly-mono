"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "@repo/ui/hooks/use-toast";

interface LicenseUser {
  id: string;
  email: string;
  name: string;
  licenseKey: string;
  isActive: boolean;
  activatedAt: string | null;
  expiresAt: string | null;
  activationCount: number;
  usageCount: number;
  lastUsed: string | null;
  createdAt: string;
  vendor: string | null;
  tier: number | null;
}


export default function LicenseUsageManagement() {
  const [users, setUsers] = useState<LicenseUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<LicenseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalUsage: 0,
    averageUsage: 0,
  });
  const [usageCategories, setUsageCategories] = useState({
    heavy: [] as LicenseUser[],
    medium: [] as LicenseUser[],
    low: [] as LicenseUser[],
    none: [] as LicenseUser[],
  });

  const [sortBy, setSortBy] = useState<"usage" | "lastUsed">("lastUsed");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/license-usage", {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalStats(data.stats);
        
        // Categorize users by usage
        const avgUsage = data.stats.averageUsage;
        const categories = {
          heavy: data.users.filter((user: LicenseUser) => user.usageCount > avgUsage * 1.5),
          medium: data.users.filter((user: LicenseUser) => 
            user.usageCount <= avgUsage * 1.5 && user.usageCount >= avgUsage * 0.5
          ),
          low: data.users.filter((user: LicenseUser) => 
            user.usageCount < avgUsage * 0.5 && user.usageCount > 0
          ),
          none: data.users.filter((user: LicenseUser) => user.usageCount === 0),
        };
        setUsageCategories(categories);
      }
    } catch (error) {
      console.error("Failed to fetch license usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Start with the appropriate user set based on active tab
    let sorted: LicenseUser[] = [];
    switch (activeTab) {
      case "heavy":
        sorted = [...usageCategories.heavy];
        break;
      case "medium":
        sorted = [...usageCategories.medium];
        break;
      case "low":
        sorted = [...usageCategories.low];
        break;
      case "none":
        sorted = [...usageCategories.none];
        break;
      default:
        sorted = [...users];
    }

    // Sort
    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "usage":
          aValue = a.usageCount;
          bValue = b.usageCount;
          break;
        case "lastUsed":
        default:
          aValue = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          bValue = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          // Put never-used users at the end
          if (!a.lastUsed && !b.lastUsed) return 0;
          if (!a.lastUsed) return 1;
          if (!b.lastUsed) return -1;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(sorted);
  }, [users, sortBy, sortOrder, activeTab, usageCategories]);

  const handleUsageSort = () => {
    if (sortBy === "usage") {
      // Toggle sort order if already sorting by usage
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Switch to usage sorting with descending order (most used first)
      setSortBy("usage");
      setSortOrder("desc");
    }
  };

  const exportData = () => {
    const csvContent = [
      "Email,Name,License Key,Status,Activated At,Expires At,Usage Count,Last Used,Vendor,Tier",
      ...filteredUsers.map((user) =>
        [
          user.email || "",
          user.name || "",
          user.licenseKey,
          user.isActive ? "Active" : "Inactive",
          user.activatedAt || "",
          user.expiresAt || "",
          user.usageCount,
          user.lastUsed || "",
          user.vendor || "",
          user.tier || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `license-usage-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const getStatusBadge = (user: LicenseUser) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      return <Badge variant="outline">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };


  const getCurrentUsers = () => {
    switch (activeTab) {
      case "heavy":
        return usageCategories.heavy;
      case "medium":
        return usageCategories.medium;
      case "low":
        return usageCategories.low;
      case "none":
        return usageCategories.none;
      default:
        return users;
    }
  };

  const renderUsersTable = () => (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Sorted by: <span className="font-medium">
            {sortBy === "usage" ? "Usage Count" : "Last Used"} 
            ({sortOrder === "desc" ? "Highest" : "Lowest"} first)
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            License Users ({filteredUsers.length} of {getCurrentUsers().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>License Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={handleUsageSort}
                      title="Click to sort by usage count"
                    >
                      <div className="flex items-center gap-1">
                        Usage Count
                        {sortBy === "usage" && (
                          <span className="text-xs">
                            {sortOrder === "desc" ? "↓" : "↑"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Activated</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={`${user.id}-${user.licenseKey}-${index}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || "No name"}</div>
                          {user.email ? (
                            <div 
                              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                              onClick={() => {
                                navigator.clipboard.writeText(user.email!);
                                toast({
                                  title: "Email copied!",
                                  description: `${user.email} has been copied to clipboard.`,
                                });
                              }}
                              title="Click to copy email"
                            >
                              {user.email}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">No email</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.licenseKey.substring(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.usageCount}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastUsed
                          ? format(new Date(user.lastUsed), "MMM dd, yyyy")
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {user.activatedAt
                          ? format(new Date(user.activatedAt), "MMM dd, yyyy")
                          : "Not activated"}
                      </TableCell>
                      <TableCell>
                        {user.expiresAt
                          ? format(new Date(user.expiresAt), "MMM dd, yyyy")
                          : "No expiry"}
                      </TableCell>
                      <TableCell>{user.vendor || "N/A"}</TableCell>
                      <TableCell>{user.tier || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found matching the current filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.activeUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalUsage}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage/User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.averageUsage}</div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Categories Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="heavy">
            Heavy Users ({usageCategories.heavy.length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            Medium Users ({usageCategories.medium.length})
          </TabsTrigger>
          <TabsTrigger value="low">
            Low Users ({usageCategories.low.length})
          </TabsTrigger>
          <TabsTrigger value="none">
            No Usage ({usageCategories.none.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderUsersTable()}
        </TabsContent>

        <TabsContent value="heavy" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Users with usage above {Math.round(totalStats.averageUsage * 1.5)} (1.5x average)
            </p>
          </div>
          {renderUsersTable()}
        </TabsContent>

        <TabsContent value="medium" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Users with usage between {Math.round(totalStats.averageUsage * 0.5)} and {Math.round(totalStats.averageUsage * 1.5)} (0.5x - 1.5x average)
            </p>
          </div>
          {renderUsersTable()}
        </TabsContent>

        <TabsContent value="low" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Users with usage below {Math.round(totalStats.averageUsage * 0.5)} but above 0 (less than 0.5x average)
            </p>
          </div>
          {renderUsersTable()}
        </TabsContent>

        <TabsContent value="none" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Users with no recorded usage (0 usage count)
            </p>
          </div>
          {renderUsersTable()}
        </TabsContent>
      </Tabs>
    </div>
  );
}