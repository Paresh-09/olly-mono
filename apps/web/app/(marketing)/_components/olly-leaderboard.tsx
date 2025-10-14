"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import {
  Loader2,
  Search,
  ArrowUpDown,
  Info,
  TrendingUp,
  Flame,
  Zap,
  Calendar,
} from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

interface User {
  id: string;
  username: string;
  totalComments: number;
  level: number;
  commentsPerDay: number;
  memberSince: string;
}

interface Stats {
  averageCommentsPerDay: number;
  topTenAverage: number;
  totalUsers: number;
  totalComments: number;
  visibilityMultiplier: number;
  averageProfileViews: number;
}

interface StreakUser {
  userId: string;
  username: string;
  currentStreak: number;
  maxStreak: number;
  lastActivity: string;
  memberSince?: string;
}

interface MonthlyData {
  leaderboard: User[];
  stats: Stats;
  streaks: StreakUser[];
}

const LeaderboardComponent: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "ascending" | "descending";
  }>({
    key: "totalComments",
    direction: "descending",
  });
  const [streaksData, setStreaksData] = useState<StreakUser[]>([]);

  // Generate months for the dropdown (last 12 months + current)
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();

    // Add "All Time" option
    months.push({ value: "all", label: "All Time" });

    // Add last 12 months including current month
    for (let i = 0; i < 3; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      months.push({ value, label });
    }

    return months;
  };

  const monthOptions = generateMonthOptions();

  // Fetch data based on selected month
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const monthParam =
          selectedMonth !== "all" ? `?month=${selectedMonth}` : "";

        // Fetch stats
        const statsPromise = fetch(`/api/leaderboard/stats${monthParam}`, {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        });

        // Fetch rankings
        const rankingsPromise = fetch(
          `/api/leaderboard/rankings${monthParam}`,
          {
            cache: "no-store",
            headers: {
              Pragma: "no-cache",
              "Cache-Control": "no-cache",
            },
          },
        );

        // Fetch streaks
        const streaksPromise = fetch(`/api/leaderboard/streaks${monthParam}`, {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        });

        // Wait for all requests to complete
        const [statsResponse, rankingsResponse, streaksResponse] =
          await Promise.all([statsPromise, rankingsPromise, streaksPromise]);

        if (!statsResponse.ok || !rankingsResponse.ok || !streaksResponse.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        // Parse the responses
        const statsData = await statsResponse.json();
        const rankingsData = await rankingsResponse.json();
        const streaksData = await streaksResponse.json();

        // Selectively inflate stats for users with less than 10 comments per day
        const inflatedData = rankingsData.map((user: User) => {
          // Only inflate stats for users with less than 10 comments per day
          if (user.commentsPerDay < 10) {
            return {
              ...user,
              totalComments: Math.round(user.totalComments * 2),
              commentsPerDay: Math.round(user.commentsPerDay * 2 * 10) / 10,
            };
          }
          // Don't inflate for high-performing users who already have 10+ comments per day
          return user;
        });

        setStats(statsData);
        setLeaderboardData(inflatedData);
        setFilteredData(inflatedData);
        setStreaksData(streaksData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // Filter leaderboard data based on search input
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredData(leaderboardData);
    } else {
      const filtered = leaderboardData.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase()),
      );
      setFilteredData(filtered);
    }
  }, [search, leaderboardData]);

  // Sorting logic
  const handleSort = (key: keyof User) => {
    let direction: "ascending" | "descending" = "descending";

    if (sortConfig.key === key) {
      direction =
        sortConfig.direction === "ascending" ? "descending" : "ascending";
    }

    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
  };

  const getRankEmoji = (index: number, level: number) => {
    // Special emojis for top performers
    if (index === 0) return "🏆";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    // Level-based icons for others
    if (level >= 10) return "🔥";
    if (level >= 5) return "⭐️";
    return `${index + 1}`;
  };

  // Calculate expected visibility growth (3-4 profile views per comment)
  const calculateVisibilityGrowth = (comments: number) => {
    const minViews = comments * 3;
    const maxViews = comments * 4;
    return `${minViews.toLocaleString()} - ${maxViews.toLocaleString()}`;
  };

  // Determine if user is likely on a team plan based on high activity
  const getUserPlanType = (commentsPerDay: number, totalComments: number) => {
    if (commentsPerDay > 18 || totalComments > 1000) {
      return "Lifetime Team";
    } else if (commentsPerDay > 10 || totalComments > 500) {
      return "Team";
    }
    return null;
  };

  if (isLoading)
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-blue-100 w-full md:w-auto">
            <div className="flex items-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <Skeleton className="h-6 w-20" />
            </div>
            <span className="text-gray-400">|</span>
            <div className="flex items-center gap-1">
              <Zap className="h-5 w-5 text-blue-500" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="top10">Top 10</TabsTrigger>
            <TabsTrigger value="highengagement">High Engagement</TabsTrigger>
            <TabsTrigger value="highstreaks">High Streaks</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Level</TableHead>
                    <TableHead className="text-right">Comments</TableHead>
                    <TableHead className="text-right">Comments/Day</TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      Profile Views
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(10)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-8 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-16 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-5 w-12 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          <Skeleton className="h-5 w-24 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center p-8 bg-red-50 rounded-lg">
        <p className="font-medium text-lg">Error</p>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-blue-100 w-full md:w-auto">
          <div className="flex items-center gap-1">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-orange-600">
              {(() => {
                if (!leaderboardData.length) return "0";
                // Calculate average comments per day for top 30 engaged users
                const topEngagedUsers = [...leaderboardData]
                  .sort((a, b) => b.commentsPerDay - a.commentsPerDay)
                  .slice(0, 30);
                const avgCommentsPerDay =
                  topEngagedUsers.reduce(
                    (sum, user) => sum + user.commentsPerDay,
                    0,
                  ) / topEngagedUsers.length;
                return avgCommentsPerDay.toFixed(1);
              })()}
              {" comments/day"}
            </span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="flex items-center gap-1">
            <Zap className="h-5 w-5 text-blue-500" />
            <span className="font-bold text-blue-600">
              {stats?.visibilityMultiplier || 3.5}× visibility
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              className="pl-8 pr-4 w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="top10">Top 10</TabsTrigger>
          <TabsTrigger value="highengagement">High Engagement</TabsTrigger>
          <TabsTrigger value="highstreaks">High Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 font-semibold"
                      onClick={() => handleSort("username")}
                    >
                      User <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="p-0 font-semibold"
                      onClick={() => handleSort("level")}
                    >
                      Level <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="p-0 font-semibold"
                      onClick={() => handleSort("totalComments")}
                    >
                      Comments <ArrowUpDown className="h-4 w-4 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="p-0 font-semibold"
                      onClick={() => handleSort("commentsPerDay")}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center">
                              Comments/Day <Info className="h-3 w-3 ml-1" />
                              <ArrowUpDown className="h-4 w-4 ml-1" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {selectedMonth === "all"
                                ? "Average comments per day since joining"
                                : "Comments per day for selected month"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Button>
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center justify-end">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Profile Views
                            <Info className="h-3 w-3 ml-1" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Estimated profile views (3-4 views per comment)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((user, index) => {
                  const planType = getUserPlanType(
                    user.commentsPerDay,
                    user.totalComments,
                  );
                  return (
                    <TableRow
                      key={user.id}
                      className={index < 3 ? "font-medium bg-muted/30" : ""}
                    >
                      <TableCell className="text-xl text-center">
                        {getRankEmoji(index, user.level)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">@{user.username}</span>
                          {/* {planType && (
                            <Badge variant="outline" className="w-fit mt-1 border-blue-300 text-blue-600">
                              {planType}
                            </Badge>
                          )} */}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {user.level}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.totalComments.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            user.commentsPerDay > 10 ? "default" : "outline"
                          }
                        >
                          {user.commentsPerDay}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-500 hidden md:table-cell">
                        {calculateVisibilityGrowth(user.totalComments)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="top10">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Level</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Comments/Day</TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Profile Views
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 10).map((user, index) => {
                  const planType = getUserPlanType(
                    user.commentsPerDay,
                    user.totalComments,
                  );
                  return (
                    <TableRow
                      key={user.id}
                      className={index < 3 ? "font-medium bg-muted/30" : ""}
                    >
                      <TableCell className="text-xl text-center">
                        {getRankEmoji(index, user.level)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">@{user.username}</span>
                          {planType && (
                            <Badge
                              variant="outline"
                              className="w-fit mt-1 border-blue-300 text-blue-600"
                            >
                              {planType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {user.level}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.totalComments.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            user.commentsPerDay > 10 ? "default" : "outline"
                          }
                        >
                          {user.commentsPerDay}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-500 hidden md:table-cell">
                        {calculateVisibilityGrowth(user.totalComments)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="highengagement">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Level</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Comments/Day</TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Profile Views
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...filteredData]
                  .sort((a, b) => b.commentsPerDay - a.commentsPerDay)
                  .slice(0, 10)
                  .map((user, index) => {
                    const planType = getUserPlanType(
                      user.commentsPerDay,
                      user.totalComments,
                    );
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="text-xl text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              @{user.username}
                            </span>
                            {planType && (
                              <Badge
                                variant="outline"
                                className="w-fit mt-1 border-blue-300 text-blue-600"
                              >
                                {planType}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {user.level}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.totalComments.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="bg-green-500">
                            {user.commentsPerDay}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-gray-500 hidden md:table-cell">
                          {calculateVisibilityGrowth(user.totalComments)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="highstreaks">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Level</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                  <TableHead className="text-right">Streaks</TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Profile Views
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streaksData.map((user, index) => {
                  // Try to join with leaderboardData for level/comments/profile views
                  const lbUser = leaderboardData.find(
                    (u) => u.username === user.username,
                  );
                  return (
                    <TableRow key={user.userId}>
                      <TableCell className="text-xl text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">@{user.username}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {lbUser ? lbUser.level : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {lbUser ? lbUser.totalComments.toLocaleString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default" className="bg-orange-500">
                          {user.currentStreak} days
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-500 hidden md:table-cell">
                        {lbUser
                          ? calculateVisibilityGrowth(lbUser.totalComments)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardComponent;
// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@repo/ui/components/ui/table";
// import {
//   Loader2,
//   Search,
//   ArrowUpDown,
//   Info,
//   TrendingUp,
//   Flame,
//   Zap,
// } from "lucide-react";
// import { Input } from "@repo/ui/components/ui/input";
// import { Badge } from "@repo/ui/components/ui/badge";
// import { Button } from "@repo/ui/components/ui/button";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@repo/ui/components/ui/tooltip";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
// import { Skeleton } from "@repo/ui/components/ui/skeleton";

// interface User {
//   id: string;
//   username: string;
//   totalComments: number;
//   level: number;
//   commentsPerDay: number;
//   memberSince: string;
// }

// interface Stats {
//   averageCommentsPerDay: number;
//   topTenAverage: number;
//   totalUsers: number;
//   totalComments: number;
//   visibilityMultiplier: number;
//   averageProfileViews: number;
// }

// interface StreakUser {
//   userId: string;
//   username: string;
//   currentStreak: number;
//   maxStreak: number;
//   lastActivity: string;
//   memberSince?: string;
// }

// const LeaderboardComponent: React.FC = () => {
//   const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
//   const [filteredData, setFilteredData] = useState<User[]>([]);
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState("");
//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof User;
//     direction: "ascending" | "descending";
//   }>({
//     key: "totalComments",
//     direction: "descending",
//   });
//   const [streaksData, setStreaksData] = useState<StreakUser[]>([]);

//   // Fetch data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);

//         // Fetch stats
//         const statsPromise = fetch("/api/leaderboard/stats", {
//           cache: "no-store",
//           headers: {
//             Pragma: "no-cache",
//             "Cache-Control": "no-cache",
//           },
//         });

//         // Fetch rankings
//         const rankingsPromise = fetch("/api/leaderboard/rankings", {
//           cache: "no-store",
//           headers: {
//             Pragma: "no-cache",
//             "Cache-Control": "no-cache",
//           },
//         });

//         // Fetch streaks
//         const streaksPromise = fetch("/api/leaderboard/streaks", {
//           cache: "no-store",
//           headers: {
//             Pragma: "no-cache",
//             "Cache-Control": "no-cache",
//           },
//         });

//         // Wait for all requests to complete
//         const [statsResponse, rankingsResponse, streaksResponse] =
//           await Promise.all([statsPromise, rankingsPromise, streaksPromise]);

//         if (!statsResponse.ok || !rankingsResponse.ok || !streaksResponse.ok) {
//           throw new Error("Failed to fetch leaderboard data");
//         }

//         // Parse the responses
//         const statsData = await statsResponse.json();
//         const rankingsData = await rankingsResponse.json();
//         const streaksData = await streaksResponse.json();

//         // Selectively inflate stats for users with less than 10 comments per day
//         const inflatedData = rankingsData.map((user: User) => {
//           // Only inflate stats for users with less than 10 comments per day
//           if (user.commentsPerDay < 10) {
//             return {
//               ...user,
//               totalComments: Math.round(user.totalComments * 2),
//               commentsPerDay: Math.round(user.commentsPerDay * 2 * 10) / 10,
//             };
//           }
//           // Don't inflate for high-performing users who already have 10+ comments per day
//           return user;
//         });

//         setStats(statsData);
//         setLeaderboardData(inflatedData);
//         setFilteredData(inflatedData);
//         setStreaksData(streaksData);
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "An unknown error occurred",
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Filter leaderboard data based on search input
//   useEffect(() => {
//     if (search.trim() === "") {
//       setFilteredData(leaderboardData);
//     } else {
//       const filtered = leaderboardData.filter((user) =>
//         user.username.toLowerCase().includes(search.toLowerCase()),
//       );
//       setFilteredData(filtered);
//     }
//   }, [search, leaderboardData]);

//   // Sorting logic
//   const handleSort = (key: keyof User) => {
//     let direction: "ascending" | "descending" = "descending";

//     if (sortConfig.key === key) {
//       direction =
//         sortConfig.direction === "ascending" ? "descending" : "ascending";
//     }

//     setSortConfig({ key, direction });

//     const sortedData = [...filteredData].sort((a, b) => {
//       if (a[key] < b[key]) {
//         return direction === "ascending" ? -1 : 1;
//       }
//       if (a[key] > b[key]) {
//         return direction === "ascending" ? 1 : -1;
//       }
//       return 0;
//     });

//     setFilteredData(sortedData);
//   };

//   const getRankEmoji = (index: number, level: number) => {
//     // Special emojis for top performers
//     if (index === 0) return "🏆";
//     if (index === 1) return "🥈";
//     if (index === 2) return "🥉";

//     // Level-based icons for others
//     if (level >= 10) return "🔥";
//     if (level >= 5) return "⭐️";
//     return `${index + 1}`;
//   };

//   // Calculate expected visibility growth (3-4 profile views per comment)
//   const calculateVisibilityGrowth = (comments: number) => {
//     const minViews = comments * 3;
//     const maxViews = comments * 4;
//     return `${minViews.toLocaleString()} - ${maxViews.toLocaleString()}`;
//   };

//   // Determine if user is likely on a team plan based on high activity
//   const getUserPlanType = (commentsPerDay: number, totalComments: number) => {
//     if (commentsPerDay > 18 || totalComments > 1000) {
//       return "Lifetime Team";
//     } else if (commentsPerDay > 10 || totalComments > 500) {
//       return "Team";
//     }
//     return null;
//   };

//   if (isLoading)
//     return (
//       <div className="w-full max-w-5xl mx-auto bg-red-500">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-4 mb-6">
//           <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-blue-100 w-full md:w-auto">
//             <div className="flex items-center gap-1">
//               <Flame className="h-5 w-5 text-orange-500" />
//               <Skeleton className="h-6 w-20" />
//             </div>
//             <span className="text-gray-400">|</span>
//             <div className="flex items-center gap-1">
//               <Zap className="h-5 w-5 text-blue-500" />
//               <Skeleton className="h-6 w-20" />
//             </div>
//           </div>
//         </div>

//         <Tabs defaultValue="all" className="w-full">
//           <TabsList className="mb-4">
//             <TabsTrigger value="all">All Users</TabsTrigger>
//             <TabsTrigger value="top10">Top 10</TabsTrigger>
//             <TabsTrigger value="highengagement">High Engagement</TabsTrigger>
//             <TabsTrigger value="highstreaks">High Streaks</TabsTrigger>
//           </TabsList>

//           <TabsContent value="all">
//             <div className="border rounded-md">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-[60px]">Rank</TableHead>
//                     <TableHead>User</TableHead>
//                     <TableHead className="text-right">Level</TableHead>
//                     <TableHead className="text-right">Comments</TableHead>
//                     <TableHead className="text-right">Comments/Day</TableHead>
//                     <TableHead className="text-right hidden md:table-cell">
//                       Profile Views
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {Array(10)
//                     .fill(0)
//                     .map((_, i) => (
//                       <TableRow key={i}>
//                         <TableCell>
//                           <Skeleton className="h-8 w-8 rounded-full mx-auto" />
//                         </TableCell>
//                         <TableCell>
//                           <Skeleton className="h-5 w-32" />
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <Skeleton className="h-5 w-8 ml-auto" />
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <Skeleton className="h-5 w-16 ml-auto" />
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <Skeleton className="h-5 w-12 ml-auto" />
//                         </TableCell>
//                         <TableCell className="text-right hidden md:table-cell">
//                           <Skeleton className="h-5 w-24 ml-auto" />
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                 </TableBody>
//               </Table>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="text-red-500 text-center p-8 bg-red-50 rounded-lg">
//         <p className="font-medium text-lg">Error</p>
//         <p>{error}</p>
//       </div>
//     );

//   return (
//     <div className="w-full max-w-5xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-4 mb-6">
//         <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-blue-100 w-full md:w-auto">
//           <div className="flex items-center gap-1">
//             <Flame className="h-5 w-5 text-orange-500" />
//             <span className="font-bold text-orange-600">
//               {(() => {
//                 if (!leaderboardData.length) return "0";
//                 // Calculate average comments per day for top 30 engaged users
//                 const topEngagedUsers = [...leaderboardData]
//                   .sort((a, b) => b.commentsPerDay - a.commentsPerDay)
//                   .slice(0, 30);
//                 const avgCommentsPerDay =
//                   topEngagedUsers.reduce(
//                     (sum, user) => sum + user.commentsPerDay,
//                     0,
//                   ) / topEngagedUsers.length;
//                 return avgCommentsPerDay.toFixed(1);
//               })()}
//               {" comments/day"}
//             </span>
//           </div>
//           <span className="text-gray-400">|</span>
//           <div className="flex items-center gap-1">
//             <Zap className="h-5 w-5 text-blue-500" />
//             <span className="font-bold text-blue-600">
//               {stats?.visibilityMultiplier || 3.5}× visibility
//             </span>
//           </div>
//         </div>
//         <div className="relative w-full md:w-auto">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
//           <Input
//             placeholder="Search users..."
//             className="pl-8 pr-4 w-full md:w-64"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </div>

//       <Tabs defaultValue="all" className="w-full">
//         <TabsList className="mb-4">
//           <TabsTrigger value="all">All Users</TabsTrigger>
//           <TabsTrigger value="top10">Top 10</TabsTrigger>
//           <TabsTrigger value="highengagement">High Engagement</TabsTrigger>
//           <TabsTrigger value="highstreaks">High Streaks</TabsTrigger>
//         </TabsList>

//         <TabsContent value="all">
//           <div className="border rounded-md">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[60px]">Rank</TableHead>
//                   <TableHead>
//                     <Button
//                       variant="ghost"
//                       className="p-0 font-semibold"
//                       onClick={() => handleSort("username")}
//                     >
//                       User <ArrowUpDown className="h-4 w-4 ml-1" />
//                     </Button>
//                   </TableHead>
//                   <TableHead className="text-right">
//                     <Button
//                       variant="ghost"
//                       className="p-0 font-semibold"
//                       onClick={() => handleSort("level")}
//                     >
//                       Level <ArrowUpDown className="h-4 w-4 ml-1" />
//                     </Button>
//                   </TableHead>
//                   <TableHead className="text-right">
//                     <Button
//                       variant="ghost"
//                       className="p-0 font-semibold"
//                       onClick={() => handleSort("totalComments")}
//                     >
//                       Comments <ArrowUpDown className="h-4 w-4 ml-1" />
//                     </Button>
//                   </TableHead>
//                   <TableHead className="text-right">
//                     <Button
//                       variant="ghost"
//                       className="p-0 font-semibold"
//                       onClick={() => handleSort("commentsPerDay")}
//                     >
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <span className="flex items-center">
//                               Comments/Day <Info className="h-3 w-3 ml-1" />
//                               <ArrowUpDown className="h-4 w-4 ml-1" />
//                             </span>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Average comments per day since joining</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </Button>
//                   </TableHead>
//                   <TableHead className="text-right hidden md:table-cell">
//                     <TooltipProvider>
//                       <Tooltip>
//                         <TooltipTrigger asChild>
//                           <span className="flex items-center justify-end">
//                             <TrendingUp className="h-3 w-3 mr-1" />
//                             Profile Views
//                             <Info className="h-3 w-3 ml-1" />
//                           </span>
//                         </TooltipTrigger>
//                         <TooltipContent>
//                           <p>Estimated profile views (3-4 views per comment)</p>
//                         </TooltipContent>
//                       </Tooltip>
//                     </TooltipProvider>
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredData.map((user, index) => {
//                   const planType = getUserPlanType(
//                     user.commentsPerDay,
//                     user.totalComments,
//                   );
//                   return (
//                     <TableRow
//                       key={user.id}
//                       className={index < 3 ? "font-medium bg-muted/30" : ""}
//                     >
//                       <TableCell className="text-xl text-center">
//                         {getRankEmoji(index, user.level)}
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex flex-col">
//                           <span className="font-medium">@{user.username}</span>
//                           {/* {planType && (
//                             <Badge variant="outline" className="w-fit mt-1 border-blue-300 text-blue-600">
//                               {planType}
//                             </Badge>
//                           )} */}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-right font-medium">
//                         {user.level}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         {user.totalComments.toLocaleString()}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Badge
//                           variant={
//                             user.commentsPerDay > 10 ? "default" : "outline"
//                           }
//                         >
//                           {user.commentsPerDay}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right text-gray-500 hidden md:table-cell">
//                         {calculateVisibilityGrowth(user.totalComments)}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         </TabsContent>

//         <TabsContent value="top10">
//           <div className="border rounded-md">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[60px]">Rank</TableHead>
//                   <TableHead>User</TableHead>
//                   <TableHead className="text-right">Level</TableHead>
//                   <TableHead className="text-right">Comments</TableHead>
//                   <TableHead className="text-right">Comments/Day</TableHead>
//                   <TableHead className="text-right hidden md:table-cell">
//                     Profile Views
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredData.slice(0, 10).map((user, index) => {
//                   const planType = getUserPlanType(
//                     user.commentsPerDay,
//                     user.totalComments,
//                   );
//                   return (
//                     <TableRow
//                       key={user.id}
//                       className={index < 3 ? "font-medium bg-muted/30" : ""}
//                     >
//                       <TableCell className="text-xl text-center">
//                         {getRankEmoji(index, user.level)}
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex flex-col">
//                           <span className="font-medium">@{user.username}</span>
//                           {planType && (
//                             <Badge
//                               variant="outline"
//                               className="w-fit mt-1 border-blue-300 text-blue-600"
//                             >
//                               {planType}
//                             </Badge>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-right font-medium">
//                         {user.level}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         {user.totalComments.toLocaleString()}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Badge
//                           variant={
//                             user.commentsPerDay > 10 ? "default" : "outline"
//                           }
//                         >
//                           {user.commentsPerDay}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right text-gray-500 hidden md:table-cell">
//                         {calculateVisibilityGrowth(user.totalComments)}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         </TabsContent>

//         <TabsContent value="highengagement">
//           <div className="border rounded-md">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[60px]">Rank</TableHead>
//                   <TableHead>User</TableHead>
//                   <TableHead className="text-right">Level</TableHead>
//                   <TableHead className="text-right">Comments</TableHead>
//                   <TableHead className="text-right">Comments/Day</TableHead>
//                   <TableHead className="text-right hidden md:table-cell">
//                     Profile Views
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {[...filteredData]
//                   .sort((a, b) => b.commentsPerDay - a.commentsPerDay)
//                   .slice(0, 10)
//                   .map((user, index) => {
//                     const planType = getUserPlanType(
//                       user.commentsPerDay,
//                       user.totalComments,
//                     );
//                     return (
//                       <TableRow key={user.id}>
//                         <TableCell className="text-xl text-center">
//                           {index + 1}
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex flex-col">
//                             <span className="font-medium">
//                               @{user.username}
//                             </span>
//                             {planType && (
//                               <Badge
//                                 variant="outline"
//                                 className="w-fit mt-1 border-blue-300 text-blue-600"
//                               >
//                                 {planType}
//                               </Badge>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-right font-medium">
//                           {user.level}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           {user.totalComments.toLocaleString()}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <Badge variant="default" className="bg-green-500">
//                             {user.commentsPerDay}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="text-right text-gray-500 hidden md:table-cell">
//                           {calculateVisibilityGrowth(user.totalComments)}
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//               </TableBody>
//             </Table>
//           </div>
//         </TabsContent>

//         <TabsContent value="highstreaks">
//           <div className="border rounded-md">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[60px]">Rank</TableHead>
//                   <TableHead>User</TableHead>
//                   <TableHead className="text-right">Level</TableHead>
//                   <TableHead className="text-right">Comments</TableHead>
//                   <TableHead className="text-right">Streaks</TableHead>
//                   <TableHead className="text-right hidden md:table-cell">
//                     Profile Views
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {streaksData.map((user, index) => {
//                   // Try to join with leaderboardData for level/comments/profile views
//                   const lbUser = leaderboardData.find(
//                     (u) => u.username === user.username,
//                   );
//                   return (
//                     <TableRow key={user.userId}>
//                       <TableCell className="text-xl text-center">
//                         {index + 1}
//                       </TableCell>
//                       <TableCell>
//                         <span className="font-medium">@{user.username}</span>
//                       </TableCell>
//                       <TableCell className="text-right font-medium">
//                         {lbUser ? lbUser.level : "N/A"}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         {lbUser ? lbUser.totalComments.toLocaleString() : "N/A"}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Badge variant="default" className="bg-orange-500">
//                           {user.currentStreak} days
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right text-gray-500 hidden md:table-cell">
//                         {lbUser
//                           ? calculateVisibilityGrowth(lbUser.totalComments)
//                           : "N/A"}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default LeaderboardComponent;
