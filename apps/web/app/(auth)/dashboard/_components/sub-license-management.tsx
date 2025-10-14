"use client";
import React, { useState, useEffect, useActionState } from "react";
import {
  assignSubLicense,
  removeSubLicenseAssignment,
  getSubLicenses,
  regenerateSubLicense,
  deleteSubLicenseGoal,
} from "@/lib/actions/subLicenseActions";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { toast } from "@repo/ui/hooks/use-toast";
import {
  Loader2,
  UserPlus,
  RefreshCw,
  Trash2,
  Info,
  Users,
  Copy,
  Target,
  Coins,
  CheckCircle,
  Calendar,
  Clock,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { format, differenceInDays } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui/components/ui/select";

interface SubLicense {
  id: string;
  key: string;
  status: string;
  assignedEmail: string | null;
  activationCount: number;
}

interface SubLicenseGoal {
  id: string;
  platform: string;
  goal: string;
  daysToAchieve: number;
  target?: number | null;
  progress?: number;
  status?: string;
  achievedAt?: Date | null;
  createdAt: string;
  updatedAt: string;
}

interface SubLicenseManagementProps {
  userId: string;
  licenseId: string;
  licenseKey: string;
}

export function SubLicenseManagement({
  userId,
  licenseId,
  licenseKey,
}: SubLicenseManagementProps) {
  const [subLicenses, setSubLicenses] = useState<SubLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [goals, setGoals] = useState<SubLicenseGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubLicense, setSelectedSubLicense] =
    useState<SubLicense | null>(null);
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<SubLicenseGoal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Form states
  const [goalPlatform, setGoalPlatform] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [daysToAchieve, setDaysToAchieve] = useState("");
  const [target, setTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add useEffect to fetch goals when a sub-license is selected
  useEffect(() => {
    const fetchGoals = async () => {
      if (!selectedSubLicense) {
        setGoals([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/sub-license-goals?subLicenseId=${selectedSubLicense.id}`,
        );
        const data = await response.json();
        if (data.success) {
          setGoals(JSON.parse(data.success));
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
        toast({
          title: "Error",
          description: "Failed to fetch goals",
          variant: "destructive",
        });
      }
    };

    fetchGoals();
  }, [selectedSubLicense]);

  const [assignState, assignSubLicenseAction] = useActionState(
    assignSubLicense,
    null,
  );
  const [removeState, removeSubLicenseAssignmentAction] = useActionState(
    removeSubLicenseAssignment,
    null,
  );
  const [regenerateState, regenerateSubLicenseAction] = useActionState(
    regenerateSubLicense,
    null,
  );

  const filteredLicenses = subLicenses.filter((license) => {
    if (activeTab === "assigned") return license.assignedEmail;
    if (activeTab === "unassigned") return !license.assignedEmail;
    return true;
  });

  const stats = {
    total: subLicenses.length,
    assigned: subLicenses.filter((l) => l.assignedEmail).length,
    unassigned: subLicenses.filter((l) => !l.assignedEmail).length,
  };

  useEffect(() => {
    const fetchSubLicenses = async () => {
      setLoading(true);
      const result = await getSubLicenses(licenseId);
      if (result.success) {
        setSubLicenses(JSON.parse(result.success));
      } else if (result.error) {
        // Check if it's an authorization error
        if (result.error.includes("Unauthorized")) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to manage team members for this license. Only license owners can manage team members.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    };
    fetchSubLicenses();
  }, [licenseId, assignState, removeState, regenerateState]);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Success", description: "License key copied to clipboard" });
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubLicense) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("subLicenseId", selectedSubLicense.id);
    formData.append("platform", goalPlatform);
    formData.append("goal", goalDescription);
    formData.append("daysToAchieve", daysToAchieve);
    formData.append("target", target);

    try {
      const response = await fetch("/api/sub-license-goals", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Goal added successfully",
          variant: "default",
        });
        // Refresh goals
        const fetchGoals = async () => {
          if (!selectedSubLicense) return;
          try {
            const response = await fetch(
              `/api/sub-license-goals?subLicenseId=${selectedSubLicense.id}`,
            );
            const data = await response.json();
            if (data.success) {
              setGoals(JSON.parse(data.success));
            }
          } catch (error) {
            console.error("Error fetching goals:", error);
          }
        };
        fetchGoals();
        // Reset form
        setGoalPlatform("");
        setGoalDescription("");
        setDaysToAchieve("");
        setTarget("");
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add goal",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsComplete = async (goalId: string) => {
    try {
      setUpdatingGoalId(goalId);
      const response = await fetch("/api/sub-license-goals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalId,
          status: "achieved",
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Goal marked as completed!",
        });
        // Refresh goals
        const fetchGoals = async () => {
          if (!selectedSubLicense) return;
          try {
            const response = await fetch(
              `/api/sub-license-goals?subLicenseId=${selectedSubLicense.id}`,
            );
            const data = await response.json();
            if (data.success) {
              setGoals(JSON.parse(data.success));
            }
          } catch (error) {
            console.error("Error fetching goals:", error);
          }
        };
        fetchGoals();
      } else {
        throw new Error("Failed to update goal");
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const handleEditGoal = (goal: SubLicenseGoal) => {
    setEditingGoal(goal);
    setGoalPlatform(goal.platform);
    setGoalDescription(goal.goal);
    setDaysToAchieve(goal.daysToAchieve.toString());
    setTarget(goal.target?.toString() || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;

    try {
      const response = await fetch("/api/sub-license-goals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalId: editingGoal.id,
          goal: goalDescription,
          platform: goalPlatform,
          daysToAchieve: parseInt(daysToAchieve),
          target: target ? parseInt(target) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Goal updated successfully",
        });
        // Refresh goals
        const fetchGoals = async () => {
          if (!selectedSubLicense) return;
          try {
            const response = await fetch(
              `/api/sub-license-goals?subLicenseId=${selectedSubLicense.id}`,
            );
            const data = await response.json();
            if (data.success) {
              setGoals(JSON.parse(data.success));
            }
          } catch (error) {
            console.error("Error fetching goals:", error);
          }
        };
        fetchGoals();
        // Reset form
        setGoalPlatform("");
        setGoalDescription("");
        setDaysToAchieve("");
        setTarget("");
        setEditingGoal(null);
        setIsEditDialogOpen(false);
      } else {
        throw new Error("Failed to update goal");
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setDeletingGoalId(goalId);
      const result = await deleteSubLicenseGoal(goalId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Goal deleted successfully",
        });
        // Refresh goals
        const fetchGoals = async () => {
          if (!selectedSubLicense) return;
          try {
            const response = await fetch(
              `/api/sub-license-goals?subLicenseId=${selectedSubLicense.id}`,
            );
            const data = await response.json();
            if (data.success) {
              setGoals(JSON.parse(data.success));
            }
          } catch (error) {
            console.error("Error fetching goals:", error);
          }
        };
        fetchGoals();
      } else {
        throw new Error(result.error || "Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    } finally {
      setDeletingGoalId(null);
    }
  };

  const calculateRemainingDays = (goal: SubLicenseGoal) => {
    const createdAt = new Date(goal.createdAt);
    const deadline = new Date(
      createdAt.getTime() + goal.daysToAchieve * 24 * 60 * 60 * 1000,
    );
    const remainingDays = differenceInDays(deadline, new Date());
    return remainingDays;
  };

  const getGoalStatus = (remainingDays: number) => {
    if (remainingDays < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (remainingDays <= 3) {
      return <Badge variant="destructive">Due Soon</Badge>;
    } else {
      return <Badge variant="default">{remainingDays} days left</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (subLicenses.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Team Licenses</h2>
        <p className="text-muted-foreground mb-6">Start collaborating with your team</p>
        <Alert className="mb-6 bg-blue-50 border-blue-200 max-w-md mx-auto">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            Upgrade to a team plan to manage multiple licenses and give access
            to your team members.
          </AlertDescription>
        </Alert>
        <Link href="/plans" passHref>
          <Button variant="default" size="lg" className="w-full sm:w-auto">
            Upgrade to Team Plan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Team Licenses</h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {licenseKey}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleCopyKey(licenseKey)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy License Key</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {stats.total > 0 && (
          <Badge variant="outline" className="text-sm bg-gray-50">
            {stats.assigned}/{stats.total} Assigned
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="all" className="text-sm">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="assigned" className="text-sm">
            Assigned ({stats.assigned})
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="text-sm">
            Available ({stats.unassigned})
          </TabsTrigger>
          <TabsTrigger value="goals" className="text-sm">
            Goals
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "goals" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold">License Goals</h3>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              <Select
                onValueChange={(value) => {
                  const selected = subLicenses.find(
                    (license) => license.id === value,
                  );
                  setSelectedSubLicense(selected || null);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Select a Sub-License" />
                </SelectTrigger>
                <SelectContent>
                  {subLicenses.map((subLicense) => (
                    <SelectItem key={subLicense.id} value={subLicense.id}>
                      {subLicense.key.substring(0, 8)}... -{" "}
                      {subLicense.assignedEmail || "Unassigned"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  if (!selectedSubLicense) {
                    toast({
                      title: "Select a License",
                      description: "Please select a sub-license first",
                      variant: "destructive",
                    });
                    return;
                  }
                  setIsDialogOpen(true);
                }}
              >
                <Target className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-[#0C9488]" />
                  <span>Add New Goal</span>
                </DialogTitle>
                <DialogDescription>
                  Set a specific goal to track your progress and stay motivated.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Goal Description</label>
                  <Input
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="e.g., 50 comments in 50 days"
                    required
                    className="h-11 bg-white border-gray-200 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Target Comments</label>
                  <Input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g., 50 (for 50 comments)"
                    min="1"
                    className="h-11 bg-white border-gray-200 rounded-xl"
                  />
                  <p className="text-xs text-gray-500">Set a specific number to track progress towards your goal</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Days to Achieve</label>
                  <Input
                    type="number"
                    value={daysToAchieve}
                    onChange={(e) => setDaysToAchieve(e.target.value)}
                    placeholder="e.g., 30 (for 30 days)"
                    min="1"
                    max="365"
                    required
                    className="h-11 bg-white border-gray-200 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Platform</label>
                  <Select
                    value={goalPlatform}
                    onValueChange={setGoalPlatform}
                    required
                  >
                    <SelectTrigger className="w-full h-11 bg-white border-gray-200 rounded-xl">
                      <SelectValue placeholder="Choose your platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="reddit">Reddit</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 bg-[#0C9488] hover:bg-[#0a7d73] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding Goal...
                      </>
                    ) : (
                      "Add Goal"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="rounded-md border">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0">
                  <TableRow>
                    <TableHead>Sub-license</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.length > 0 ? (
                    goals.map((goal) => {
                      const remainingDays = calculateRemainingDays(goal);
                      return (
                        <TableRow key={goal.id}>
                          <TableCell className="font-medium">
                            {selectedSubLicense?.assignedEmail}
                          </TableCell>
                          <TableCell>{goal.platform}</TableCell>
                          <TableCell>{goal.goal}</TableCell>
                          <TableCell>
                            {format(new Date(goal.createdAt), "MMM d, yyyy")}{" "}
                            -{" "}
                            {format(
                              new Date(
                                new Date(goal.createdAt).getTime() +
                                goal.daysToAchieve * 24 * 60 * 60 * 1000,
                              ),
                              "MMM d, yyyy",
                            )}
                          </TableCell>
                          <TableCell>
                            {getGoalStatus(remainingDays)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {goal.status !== "achieved" && (
                                <>
                                  <button
                                    onClick={() => handleEditGoal(goal)}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit goal"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleMarkAsComplete(goal.id)}
                                    disabled={updatingGoalId === goal.id}
                                    className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                    title={updatingGoalId === goal.id ? "Marking complete..." : "Mark as complete"}
                                  >
                                    {updatingGoalId === goal.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                disabled={deletingGoalId === goal.id}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title={deletingGoalId === goal.id ? "Deleting..." : "Delete goal"}
                              >
                                {deletingGoalId === goal.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No goals found for this license
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      )}

      {activeTab !== "goals" && (
        <div className="rounded-md border">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0">
                <TableRow>
                  <TableHead className="w-[30%]">License Key</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[25%]">Assigned To</TableHead>
                  <TableHead className="w-[15%]">Actions</TableHead>
                  <TableHead className="text-right w-[15%]">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((subLicense) => (
                  <TableRow
                    key={subLicense.id}
                    className="group hover:bg-gray-50"
                  >
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {subLicense.key.substring(0, 12)}...
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleCopyKey(subLicense.key)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy License Key</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subLicense.status === "Active"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          subLicense.status === "Active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                        }
                      >
                        {subLicense.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subLicense.assignedEmail ? (
                        <span className="truncate max-w-[150px] block">
                          {subLicense.assignedEmail}
                        </span>
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {subLicense.assignedEmail ? (
                        <Link href={`/orgs`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm w-full"
                          >
                            <Coins className="mr-2 h-4 w-4 text-yellow-500" />
                            Send Credits
                          </Button>
                        </Link>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setActionLoading(subLicense.id);
                            const formData = new FormData(e.currentTarget);
                            formData.append("subLicenseId", subLicense.id);
                            assignSubLicenseAction(formData);
                          }}
                          className="flex items-center gap-2"
                        >
                          <div className="relative w-32 md:w-48">
                            <Input
                              type="email"
                              name="email"
                              placeholder="Enter email"
                              required
                              disabled={actionLoading === subLicense.id}
                              className={`text-sm h-9 ${actionLoading === subLicense.id
                                  ? "opacity-50"
                                  : ""
                                }`}
                            />
                            {actionLoading === subLicense.id && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              </div>
                            )}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="submit"
                                  size="sm"
                                  className="h-9"
                                  disabled={actionLoading === subLicense.id}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {actionLoading === subLicense.id
                                  ? "Inviting..."
                                  : "Assign License"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </form>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {subLicense.assignedEmail && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                  onClick={() => {
                                    const formData = new FormData();
                                    formData.append(
                                      "subLicenseId",
                                      subLicense.id,
                                    );
                                    removeSubLicenseAssignmentAction(
                                      formData,
                                    );
                                  }}
                                  disabled={actionLoading === subLicense.id}
                                >
                                  {actionLoading === subLicense.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Revoke License</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  const formData = new FormData();
                                  formData.append(
                                    "subLicenseId",
                                    subLicense.id,
                                  );
                                  regenerateSubLicenseAction(formData);
                                }}
                                disabled={actionLoading === subLicense.id}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Regenerate Key</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t">
        <span className="text-sm text-muted-foreground">Need more licenses?</span>
        <Link href="/plans" passHref>
          <Button
            variant="default"
            size="sm"
            className="text-sm w-full sm:w-auto"
          >
            Upgrade Plan →
          </Button>
        </Link>
      </div>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Pencil className="w-5 h-5 text-blue-600" />
              <span>Edit Goal</span>
            </DialogTitle>
            <DialogDescription>
              Update the goal for {selectedSubLicense?.assignedEmail || "this sub-license"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateGoal} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-platform" className="text-sm font-medium">
                Platform
              </label>
              <Input
                id="edit-platform"
                type="text"
                placeholder="e.g., LinkedIn, Twitter"
                value={goalPlatform}
                onChange={(e) => setGoalPlatform(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Goal Description
              </label>
              <Input
                id="edit-description"
                type="text"
                placeholder="e.g., Publish 10 posts"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-target" className="text-sm font-medium">
                Target Number (Optional)
              </label>
              <Input
                id="edit-target"
                type="number"
                min="1"
                placeholder="e.g., 500 (for 500 followers)"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Set a specific number to track progress towards your goal
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-days" className="text-sm font-medium">
                Days to Achieve
              </label>
              <Input
                id="edit-days"
                type="number"
                min="1"
                placeholder="Number of days"
                value={daysToAchieve}
                onChange={(e) => setDaysToAchieve(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingGoal(null);
                  setGoalPlatform("");
                  setGoalDescription("");
                  setDaysToAchieve("");
                  setTarget("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Goal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}