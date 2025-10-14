"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Target, Plus, Calendar, Clock, Trash2, Loader2, CheckCircle, Pencil } from "lucide-react";
import { toast } from "@repo/ui/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { format, differenceInDays, subDays } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui/components/ui/select";

interface LicenseGoal {
  id: string;
  goal: string;
  daysToAchieve: number;
  platform: string;
  target?: number | null;
  progress?: number;
  status?: string;
  achievedAt?: Date | null;
  createdAt: string;
}

interface LicenseGoalsProps {
  userId: string;
  licenseId: string;
  licenseKey: string;
}

export function LicenseGoals({
  userId,
  licenseId,
  licenseKey,
}: LicenseGoalsProps) {
  const [goals, setGoals] = useState<LicenseGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<LicenseGoal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");


  // Form states
  const [goalPlatform, setGoalPlatform] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [daysToAchieve, setDaysToAchieve] = useState("");
  const [target, setTarget] = useState("");

  useEffect(() => {
    fetchGoals();
  }, [licenseId]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/license-goals?licenseId=${licenseId}`);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    try {
      const response = await fetch("/api/license-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKeyId: licenseId,
          platform: goalPlatform,
          goal: goalDescription,
          daysToAchieve: parseInt(daysToAchieve),
          target: target ? parseInt(target) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Goal added successfully",
          variant: "default",
        });
        fetchGoals();
        // Reset form
        setGoalPlatform("");
        setGoalDescription("");
        setDaysToAchieve("");
        setTarget("");
        setIsDialogOpen(false);
      } else {
        // Handle error responses
        if (response.status === 409) {
          toast({
            title: "Active Goal Exists",
            description: "You already have an active goal for this platform. Please complete your current goal before creating a new one.",
            variant: "default",
          });
        } else {
          let errorMessage = "Failed to add goal";
          try {
            const errorData = await response.text();
            errorMessage = errorData || errorMessage;
          } catch {
            // If can't parse error, use default message
          }

          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Stop loading regardless of success/failure
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setDeletingGoalId(goalId);
      const response = await fetch(`/api/license-goals?goalId=${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Goal deleted successfully",
        });
        fetchGoals();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error === "Goal not found or you don't have permission to delete it" 
          ? "You cannot delete goals assigned by the license owner."
          : errorData.error || "Failed to delete goal";
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
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

  const handleMarkAsComplete = async (goalId: string) => {
    try {
      setUpdatingGoalId(goalId);
      const response = await fetch("/api/license-goals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalId,
          status: "achieved",
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Goal marked as completed!",
        });
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

  const handleEditGoal = (goal: LicenseGoal) => {
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

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/license-goals", {
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

      if (response.ok) {
        toast({
          title: "Success",
          description: "Goal updated successfully",
        });
        fetchGoals();
        // Reset form
        setGoalPlatform("");
        setGoalDescription("");
        setDaysToAchieve("");
        setTarget("");
        setEditingGoal(null);
        setIsEditDialogOpen(false);
      } else {
        // Handle error responses
        if (response.status === 409) {
          toast({
            title: "Active Goal Exists",
            description: "You already have an active goal for this platform. Please complete your current goal before creating a new one.",
            variant: "default",
          });
        } else {
          let errorMessage = "Failed to update goal";
          try {
            const errorData = await response.text();
            errorMessage = errorData || errorMessage;
          } catch {
            // If can't parse error, use default message
          }

          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRemainingDays = (goal: LicenseGoal) => {
    const createdAt = new Date(goal.createdAt);
    const deadline = new Date(
      createdAt.getTime() + goal.daysToAchieve * 24 * 60 * 60 * 1000,
    );
    const remainingDays = differenceInDays(deadline, new Date());
    return remainingDays;
  };

  const getGoalStatus = (remainingDays: number) => {
    if (remainingDays < 0) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          Overdue
        </Badge>
      );
    } else if (remainingDays <= 3) {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
          Due Soon
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          {remainingDays} days left
        </Badge>
      );
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      linkedin: "bg-blue-100 text-blue-700 border-blue-200",
      twitter: "bg-sky-100 text-sky-700 border-sky-200",
      instagram: "bg-pink-100 text-pink-700 border-pink-200",
      reddit: "bg-orange-100 text-orange-700 border-orange-200",
      facebook: "bg-indigo-100 text-indigo-700 border-indigo-200",
      youtube: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[platform as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status !== "achieved");
  };

  const getCompletedGoals = () => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return goals.filter(goal => 
      goal.status === "achieved" && 
      goal.achievedAt && 
      new Date(goal.achievedAt) >= thirtyDaysAgo
    );
  };

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();

  const renderGoalsList = (goalsList: LicenseGoal[], isCompleted: boolean = false) => {
    if (goalsList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isCompleted ? "No completed goals in the last 30 days" : "No active goals yet"}
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            {isCompleted 
              ? "Complete some goals to see them appear here."
              : "Create your first goal to start tracking your progress and achieving your targets."
            }
          </p>
          {!isCompleted && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 shadow-lg shadow-[#0C9488]/25 font-medium"
            >
              Create Your First Goal
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {goalsList.map((goal) => {
          const remainingDays = calculateRemainingDays(goal);
          const createdAt = new Date(goal.createdAt);
          const deadline = new Date(
            createdAt.getTime() + goal.daysToAchieve * 24 * 60 * 60 * 1000,
          );

          return (
            <div
              key={goal.id}
              className={`p-5 rounded-xl border transition-all duration-200 group ${goal.status === "achieved"
                  ? "bg-gradient-to-r from-green-50/70 to-emerald-50/70 border-green-200/60"
                  : "bg-gradient-to-r from-gray-50/70 to-white/70 border-gray-200/60 hover:shadow-lg hover:shadow-gray-200/50"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`font-semibold transition-colors ${goal.status === "achieved"
                        ? "text-green-800 line-through"
                        : "text-gray-900 group-hover:text-[#0C9488]"
                      }`}>
                      {goal.goal}
                    </h4>
                    {goal.status === "achieved" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className={`${getPlatformColor(goal.platform)} hover:${getPlatformColor(goal.platform)}`}>
                      {goal.platform}
                    </Badge>
                    {goal.status !== "achieved" && getGoalStatus(remainingDays)}
                    {goal.target && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        Target Comments: {goal.target}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {format(createdAt, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Due {format(deadline, "MMM d, yyyy")}</span>
                    </div>
                    {goal.status === "achieved" && goal.achievedAt && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed {format(new Date(goal.achievedAt), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {goal.status !== "achieved" && (
                    <>
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Edit goal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMarkAsComplete(goal.id)}
                        disabled={updatingGoalId === goal.id}
                        className={`p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 ${updatingGoalId === goal.id ? "opacity-50 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"
                          }`}
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
                    className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ${deletingGoalId === goal.id
                        ? "opacity-100 cursor-not-allowed bg-red-50"
                        : "opacity-0 group-hover:opacity-100"
                      }`}
                    title={deletingGoalId === goal.id ? "Deleting..." : "Delete goal"}
                  >
                    {deletingGoalId === goal.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl shadow-gray-200/50">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C9488]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl shadow-gray-200/50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0C9488] rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">License Goals</h2>
              <p className="text-sm text-gray-600">Track your progress and achievements</p>
            </div>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 shadow-lg shadow-[#0C9488]/25 text-sm font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* Content with Tabs */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-12 rounded-xl mb-6">
            <TabsTrigger
              value="active"
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-[#0C9488] data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Active Goals ({activeGoals.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-[#0C9488] data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Completed ({completedGoals.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {renderGoalsList(activeGoals, false)}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <div className="mb-4">
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <strong>Note:</strong> Showing goals completed in the last 30 days
              </p>
            </div>
            {renderGoalsList(completedGoals, true)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Goal Dialog */}
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

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Pencil className="w-5 h-5 text-blue-600" />
              <span>Edit Goal</span>
            </DialogTitle>
            <DialogDescription>
              Update your goal details and track your progress.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateGoal} className="space-y-4">
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
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingGoal(null);
                  // Reset form
                  setGoalPlatform("");
                  setGoalDescription("");
                  setDaysToAchieve("");
                  setTarget("");
                }}
                className="px-6 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Goal...
                  </>
                ) : (
                  "Update Goal"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}