"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
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
import { Label } from "@repo/ui/components/ui/label";
import {
  Loader2,
  Download,
  Plus,
  RefreshCw,
  Search,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@repo/ui/components/ui/badge";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

interface SubLicense {
  id: string;
  key: string;
  status: string;
}

interface RedeemCode {
  id: string;
  code: string;
  status: string;
  claimedAt?: string;
  claimedBy?: string;
  metadata?: string;
  licenseKey: {
    key: string;
    isActive: boolean;
    tier?: number;
    metadata?: string;
    subLicenses?: SubLicense[];
  };
}

interface RedeemCodeBatch {
  id: string;
  name: string;
  campaign: string;
  quantity: number;
  validity: string;
  createdAt: string;
  createdBy: string;
  tier?: string;
  credits?: number;
  metadata?: string;
  _count: {
    codes: number;
  };
}

export default function RedeemCodeManagement() {
  const [activeTab, setActiveTab] = useState("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batches, setBatches] = useState<RedeemCodeBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<RedeemCodeBatch | null>(
    null,
  );
  const [batchCodes, setBatchCodes] = useState<RedeemCode[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [error, setError] = useState("");
  const [isExpiring, setIsExpiring] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState<string | null>(null);
  const [showSublicenses, setShowSublicenses] = useState<string | null>(null);

  // Form state for generating new codes
  const [quantity, setQuantity] = useState(10);
  const [campaign, setCampaign] = useState(
    `Promo-${new Date().toISOString().split("T")[0]}`,
  );
  const [name, setName] = useState(
    `Promotion ${new Date().toISOString().split("T")[0]}`,
  );
  const [validityDays, setValidityDays] = useState(30);
  const [tier, setTier] = useState("T1");
  const [credits, setCredits] = useState(100); // Default credits
  const [generatedCodes, setGeneratedCodes] = useState<
    {
      code: string;
      licenseKey: string;
      tier?: string;
      credits?: number;
      sublicenses?: SubLicense[];
    }[]
  >([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Default credits for tier selection (for convenience)
  const getDefaultCreditsForTier = (selectedTier: string) => {
    switch (selectedTier) {
      case "T1":
        return 100;
      case "T2":
        return 500;
      case "T3":
        return 1000;
      case "T4":
        return 1500;
      case "T5":
        return 2000;
      default:
        return 100;
    }
  };

  // Get number of sublicenses for a tier
  const getSubLicenseCount = (tierStr: string) => {
    switch (tierStr) {
      case "T1":
        return 0;
      case "T2":
        return 4;
      case "T3":
        return 9;
      case "T4":
        return 14;
      case "T5":
        return 19;
      default:
        return 0;
    }
  };

  // Handle tier change
  const handleTierChange = (newTier: string) => {
    setTier(newTier);
    // Optionally update default credits when tier changes
    setCredits(getDefaultCreditsForTier(newTier));
  };

  // Load batches on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/create-redeem-codes");
      if (!response.ok) {
        throw new Error("Failed to fetch redeem code batches");
      }
      const data = await response.json();
      setBatches(data.batches || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError("Error loading redeem code batches");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBatchCodes = async (batchId: string) => {
    setIsLoadingCodes(true);
    setError("");
    try {
      const response = await fetch(
        `/api/create-redeem-codes?batchId=${batchId}&page=${page}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch batch codes");
      }
      const data = await response.json();
      setBatchCodes(data.batch.codes || []);
      setTotalPages(data.pagination?.pages || 1);
      setSelectedBatch(data.batch);
    } catch (err) {
      setError("Error loading batch codes");
      console.error(err);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");
    setGeneratedCodes([]);

    try {
      const response = await fetch("/api/create-redeem-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity,
          campaign,
          name,
          validityDays,
          tier,
          credits, // Include credits in the request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate redeem codes");
      }

      const data = await response.json();
      setGeneratedCodes(data.codes || []);
      toast.success(
        `Successfully generated ${data.codes.length} redeem codes (Tier: ${tier}, Credits: ${credits})`,
      );

      // Refresh the batches list
      fetchBatches();
    } catch (err: any) {
      setError(
        err.message || "An error occurred while generating redeem codes",
      );
      toast.error(err.message || "Failed to generate redeem codes");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCodesAsCsv = () => {
    if (!generatedCodes.length) return;

    // Determine CSV content based on whether sublicenses are present
    const hasSublicenses = generatedCodes.some(
      (code) => code.sublicenses && code.sublicenses.length > 0,
    );

    let csvContent;

    if (hasSublicenses) {
      // Create a flattened CSV with both primary licenses and sublicenses
      const rows = [];
      rows.push("Code,License Key,License Type,Tier,Credits");

      generatedCodes.forEach((code) => {
        // Add the main license key
        rows.push(
          `${code.code},${code.licenseKey},Main,${code.tier || "T1"},${code.credits || 0}`,
        );

        // Add sublicenses if present
        if (code.sublicenses && code.sublicenses.length > 0) {
          code.sublicenses.forEach((sub) => {
            rows.push(`N/A,${sub.key},Sub,${code.tier || "T1"},N/A`);
          });
        }
      });

      csvContent = rows.join("\n");
    } else {
      // Simple CSV with just the redemption codes and license keys
      csvContent = [
        "Code,License Key,Tier,Credits",
        ...generatedCodes.map(
          (code) =>
            `${code.code},${code.licenseKey},${code.tier || "T1"},${code.credits || 0}`,
        ),
      ].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${name.replace(/\s+/g, "_")}_codes_${tier}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "CLAIMED":
        return <Badge className="bg-blue-500">Claimed</Badge>;
      case "EXPIRED":
        return <Badge className="bg-red-500">Expired</Badge>;
      case "INACTIVE":
        return <Badge className="bg-yellow-500">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string | number | undefined) => {
    if (!tier) return <Badge className="bg-blue-500">T1</Badge>;

    const tierStr = typeof tier === "number" ? `T${tier}` : tier;

    switch (tierStr) {
      case "T1":
        return <Badge className="bg-blue-500">T1</Badge>;
      case "T2":
        return <Badge className="bg-purple-500">T2</Badge>;
      case "T3":
        return <Badge className="bg-indigo-500">T3</Badge>;
      case "T4":
        return <Badge className="bg-pink-500">T4</Badge>;
      case "T5":
        return <Badge className="bg-orange-500">T5</Badge>;
      default:
        return <Badge className="bg-blue-500">{tierStr}</Badge>;
    }
  };

  const handleExpireCodes = async () => {
    setIsExpiring(true);
    setError("");

    try {
      const response = await fetch("/api/admin/expire-redeem-codes", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to expire redeem codes");
      }

      const data = await response.json();
      toast.success(data.message);

      // Refresh the batches list
      fetchBatches();
    } catch (err: any) {
      setError(err.message || "An error occurred while expiring redeem codes");
      toast.error(err.message || "Failed to expire redeem codes");
    } finally {
      setIsExpiring(false);
    }
  };

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the batch "${batchName}"? This will delete all associated redeem codes and cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeletingBatch(batchId);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/delete-redeem-batch?batchId=${batchId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete batch");
      }

      const data = await response.json();
      toast.success(data.message);

      // Refresh the batches list
      fetchBatches();

      // If the deleted batch was selected, clear the selection
      if (selectedBatch && selectedBatch.id === batchId) {
        setSelectedBatch(null);
        setBatchCodes([]);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the batch");
      toast.error(err.message || "Failed to delete batch");
    } finally {
      setIsDeletingBatch(null);
    }
  };

  const toggleSublicenses = (licenseKeyId: string) => {
    if (showSublicenses === licenseKeyId) {
      setShowSublicenses(null);
    } else {
      setShowSublicenses(licenseKeyId);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Codes</TabsTrigger>
          <TabsTrigger value="manage">Manage Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Redeem Codes</CardTitle>
              <CardDescription>
                Create a new batch of redeem codes for promotional purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleGenerateCodes} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Batch Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter batch name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign">Campaign</Label>
                    <Input
                      id="campaign"
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="1000"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validityDays">Validity (days)</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      min="1"
                      value={validityDays}
                      onChange={(e) =>
                        setValidityDays(parseInt(e.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="tier">Tier</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>T1: 1 license key (0 sublicenses)</p>
                            <p>T2: 1 license key + 4 sublicenses</p>
                            <p>T3: 1 license key + 9 sublicenses</p>
                            <p>T4: 1 license key + 14 sublicenses</p>
                            <p>T5: 1 license key + 19 sublicenses</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select value={tier} onValueChange={handleTierChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="T1">T1 (1 user)</SelectItem>
                        <SelectItem value="T2">T2 (5 users)</SelectItem>
                        <SelectItem value="T3">T3 (10 users)</SelectItem>
                        <SelectItem value="T4">T4 (15 users)</SelectItem>
                        <SelectItem value="T5">T5 (20 users)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Credits input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="credits">Credits to Award</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Number of credits to award when redeeming this code
                          </p>
                          <p>Suggested values:</p>
                          <p>T1: 100 credits</p>
                          <p>T2: 500 credits</p>
                          <p>T3: 1000 credits</p>
                          <p>T4: 1500 credits</p>
                          <p>T5: 2000 credits</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="credits"
                    type="number"
                    min="0"
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="bg-muted p-4 rounded-md mt-2">
                  <p className="text-sm font-medium mb-2">Summary:</p>
                  <p className="text-sm text-muted-foreground">
                    You will generate {quantity} redeem codes with {tier} tier.
                    Each code will include 1 main license key
                    {getSubLicenseCount(tier) > 0 &&
                      ` and ${getSubLicenseCount(tier)} sublicenses`}
                    . Total licenses:{" "}
                    {quantity * (getSubLicenseCount(tier) + 1)}. Each redemption
                    will award <strong>{credits} credits</strong> to the user.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Redeem Codes
                    </>
                  )}
                </Button>
              </form>

              {generatedCodes.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      Generated Codes ({tier})
                    </h3>
                    <Button variant="outline" onClick={downloadCodesAsCsv}>
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </Button>
                  </div>

                  <div className="border rounded-md max-h-60 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Redeem Code</TableHead>
                          <TableHead>License Key</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Sublicenses</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedCodes.map((code) => (
                          <TableRow key={code.code}>
                            <TableCell className="font-mono">
                              {code.code}
                            </TableCell>
                            <TableCell className="font-mono">
                              {code.licenseKey}
                            </TableCell>
                            <TableCell>
                              {getTierBadge(code.tier || "T1")}
                            </TableCell>
                            <TableCell>{code.credits || 0}</TableCell>
                            <TableCell>
                              {code.sublicenses &&
                              code.sublicenses.length > 0 ? (
                                <div className="flex items-center">
                                  <span>{code.sublicenses.length}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleSublicenses(code.licenseKey)
                                    }
                                    className="ml-2 h-6 px-2"
                                  >
                                    {showSublicenses === code.licenseKey
                                      ? "Hide"
                                      : "Show"}
                                  </Button>
                                </div>
                              ) : (
                                "None"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Display sublicenses if expanded */}
                  {showSublicenses &&
                    generatedCodes.find((c) => c.licenseKey === showSublicenses)
                      ?.sublicenses && (
                      <div className="mt-4 border rounded-md p-3 bg-muted/30">
                        <h4 className="text-sm font-medium mb-2">
                          Sublicenses for {showSublicenses}
                        </h4>
                        <div className="max-h-40 overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Sublicense Key</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {generatedCodes
                                .find((c) => c.licenseKey === showSublicenses)
                                ?.sublicenses?.map((sub) => (
                                  <TableRow key={sub.id}>
                                    <TableCell className="font-mono">
                                      {sub.key}
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(sub.status)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manage Redeem Code Batches</CardTitle>
                  <CardDescription>
                    View and manage existing redeem code batches
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleExpireCodes}
                    disabled={isExpiring || isLoading}
                  >
                    {isExpiring ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <AlertCircle className="mr-2 h-4 w-4" />
                    )}
                    Expire Old Codes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={fetchBatches}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No redeem code batches found
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Campaign</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Validity</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batches.map((batch) => (
                          <TableRow key={batch.id}>
                            <TableCell>{batch.name}</TableCell>
                            <TableCell>{batch.campaign}</TableCell>
                            <TableCell>
                              {getTierBadge(batch.tier || "T1")}
                            </TableCell>
                            <TableCell>{batch.credits || 0}</TableCell>
                            <TableCell>{batch._count.codes}</TableCell>
                            <TableCell>
                              {new Date(batch.validity).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(batch.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fetchBatchCodes(batch.id)}
                                >
                                  View Codes
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteBatch(batch.id, batch.name)
                                  }
                                  disabled={isDeletingBatch === batch.id}
                                >
                                  {isDeletingBatch === batch.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Delete"
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="py-2 px-3 text-sm">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Display selected batch codes */}
              {selectedBatch && (
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Codes for Batch: {selectedBatch.name}{" "}
                      {selectedBatch.tier && `(${selectedBatch.tier})`}
                      {selectedBatch.credits
                        ? ` | ${selectedBatch.credits} credits`
                        : ""}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBatch(null)}
                    >
                      Close
                    </Button>
                  </div>

                  {isLoadingCodes ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : batchCodes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No codes found in this batch
                    </div>
                  ) : (
                    <div className="border rounded-md max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Redeem Code</TableHead>
                            <TableHead>License Key</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Sublicenses</TableHead>
                            <TableHead>Claimed At</TableHead>
                            <TableHead>Claimed By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batchCodes.map((code) => {
                            // Extract credits from metadata
                            let codeCredits = selectedBatch.credits || 0;
                            try {
                              if (code.metadata) {
                                const metadata = JSON.parse(code.metadata);
                                codeCredits = metadata.credits || codeCredits;
                              } else if (code.licenseKey.metadata) {
                                const licenseMetadata = JSON.parse(
                                  code.licenseKey.metadata,
                                );
                                codeCredits =
                                  licenseMetadata.credits || codeCredits;
                              }
                            } catch (e) {
                              console.error("Error parsing metadata:", e);
                            }

                            return (
                              <TableRow key={code.id}>
                                <TableCell className="font-mono">
                                  {code.code}
                                </TableCell>
                                <TableCell className="font-mono">
                                  {code.licenseKey.key}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(code.status)}
                                </TableCell>
                                <TableCell>
                                  {getTierBadge(code.licenseKey.tier || 1)}
                                </TableCell>
                                <TableCell>{codeCredits}</TableCell>
                                <TableCell>
                                  {code.licenseKey.subLicenses &&
                                  code.licenseKey.subLicenses.length > 0 ? (
                                    <div className="flex items-center">
                                      <span>
                                        {code.licenseKey.subLicenses.length}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          toggleSublicenses(code.id)
                                        }
                                        className="ml-2 h-6 px-2"
                                      >
                                        {showSublicenses === code.id
                                          ? "Hide"
                                          : "Show"}
                                      </Button>
                                    </div>
                                  ) : (
                                    "None"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {code.claimedAt
                                    ? new Date(code.claimedAt).toLocaleString()
                                    : "-"}
                                </TableCell>
                                <TableCell>{code.claimedBy || "-"}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Display sublicenses if expanded */}
                  {showSublicenses &&
                    batchCodes.find((c) => c.id === showSublicenses)?.licenseKey
                      .subLicenses && (
                      <div className="mt-4 border rounded-md p-3 bg-muted/30">
                        <h4 className="text-sm font-medium mb-2">
                          Sublicenses
                        </h4>
                        <div className="max-h-40 overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Sublicense Key</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {batchCodes
                                ?.find((c) => c.id === showSublicenses)
                                ?.licenseKey?.subLicenses?.map((sub) => (
                                  <TableRow key={sub.id}>
                                    <TableCell className="font-mono">
                                      {sub.key}
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(sub.status)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                  {/* Pagination for batch codes */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage((p) => {
                            const newPage = Math.max(1, p - 1);
                            fetchBatchCodes(selectedBatch.id);
                            return newPage;
                          });
                        }}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="py-2 px-3 text-sm">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage((p) => {
                            const newPage = Math.min(totalPages, p + 1);
                            fetchBatchCodes(selectedBatch.id);
                            return newPage;
                          });
                        }}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import { Button } from '@repo/ui/components/ui/button';
// import { Input } from '@repo/ui/components/ui/input';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/components/ui/table';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';
// import { Label } from '@repo/ui/components/ui/label';
// import { Loader2, Download, Plus, RefreshCw, Search, AlertCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { format } from 'date-fns';
// import { Badge } from '@repo/ui/components/ui/badge';
// import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';

// interface RedeemCode {
//   id: string;
//   code: string;
//   status: string;
//   claimedAt?: string;
//   claimedBy?: string;
//   licenseKey: {
//     key: string;
//     isActive: boolean;
//   };
// }

// interface RedeemCodeBatch {
//   id: string;
//   name: string;
//   campaign: string;
//   quantity: number;
//   validity: string;
//   createdAt: string;
//   createdBy: string;
//   _count: {
//     codes: number;
//   };
// }

// export default function RedeemCodeManagement() {
//   const [activeTab, setActiveTab] = useState('generate');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [batches, setBatches] = useState<RedeemCodeBatch[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<RedeemCodeBatch | null>(null);
//   const [batchCodes, setBatchCodes] = useState<RedeemCode[]>([]);
//   const [isLoadingCodes, setIsLoadingCodes] = useState(false);
//   const [error, setError] = useState('');
//   const [isExpiring, setIsExpiring] = useState(false);
//   const [isDeletingBatch, setIsDeletingBatch] = useState<string | null>(null);

//   // Form state for generating new codes
//   const [quantity, setQuantity] = useState(10);
//   const [campaign, setCampaign] = useState(`Promo-${new Date().toISOString().split('T')[0]}`);
//   const [name, setName] = useState(`Promotion ${new Date().toISOString().split('T')[0]}`);
//   const [validityDays, setValidityDays] = useState(30);
//   const [generatedCodes, setGeneratedCodes] = useState<{code: string, licenseKey: string}[]>([]);

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // Load batches on component mount
//   useEffect(() => {
//     fetchBatches();
//   }, []);

//   const fetchBatches = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const response = await fetch('/api/create-redeem-codes');
//       if (!response.ok) {
//         throw new Error('Failed to fetch redeem code batches');
//       }
//       const data = await response.json();
//       setBatches(data.batches || []);
//       setTotalPages(data.pagination?.pages || 1);
//     } catch (err) {
//       setError('Error loading redeem code batches');
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchBatchCodes = async (batchId: string) => {
//     setIsLoadingCodes(true);
//     setError('');
//     try {
//       const response = await fetch(`/api/create-redeem-codes?batchId=${batchId}&page=${page}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch batch codes');
//       }
//       const data = await response.json();
//       setBatchCodes(data.batch.codes || []);
//       setTotalPages(data.pagination?.pages || 1);
//       setSelectedBatch(data.batch);
//     } catch (err) {
//       setError('Error loading batch codes');
//       console.error(err);
//     } finally {
//       setIsLoadingCodes(false);
//     }
//   };

//   const handleGenerateCodes = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsGenerating(true);
//     setError('');
//     setGeneratedCodes([]);

//     try {
//       const response = await fetch('/api/create-redeem-codes', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           quantity,
//           campaign,
//           name,
//           validityDays,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to generate redeem codes');
//       }

//       const data = await response.json();
//       setGeneratedCodes(data.codes || []);
//       toast.success(`Successfully generated ${data.codes.length} redeem codes`);

//       // Refresh the batches list
//       fetchBatches();
//     } catch (err: any) {
//       setError(err.message || 'An error occurred while generating redeem codes');
//       toast.error(err.message || 'Failed to generate redeem codes');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const downloadCodesAsCsv = () => {
//     if (!generatedCodes.length) return;

//     const csvContent = [
//       'Code,License Key',
//       ...generatedCodes.map(code => `${code.code},${code.licenseKey}`)
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.setAttribute('href', url);
//     link.setAttribute('download', `${name.replace(/\s+/g, '_')}_codes.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'ACTIVE':
//         return <Badge className="bg-green-500">Active</Badge>;
//       case 'CLAIMED':
//         return <Badge className="bg-blue-500">Claimed</Badge>;
//       case 'EXPIRED':
//         return <Badge className="bg-red-500">Expired</Badge>;
//       default:
//         return <Badge className="bg-gray-500">{status}</Badge>;
//     }
//   };

//   const handleExpireCodes = async () => {
//     setIsExpiring(true);
//     setError('');

//     try {
//       const response = await fetch('/api/admin/expire-redeem-codes', {
//         method: 'POST',
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to expire redeem codes');
//       }

//       const data = await response.json();
//       toast.success(data.message);

//       // Refresh the batches list
//       fetchBatches();
//     } catch (err: any) {
//       setError(err.message || 'An error occurred while expiring redeem codes');
//       toast.error(err.message || 'Failed to expire redeem codes');
//     } finally {
//       setIsExpiring(false);
//     }
//   };

//   const handleDeleteBatch = async (batchId: string, batchName: string) => {
//     if (!confirm(`Are you sure you want to delete the batch "${batchName}"? This will delete all associated redeem codes and cannot be undone.`)) {
//       return;
//     }

//     setIsDeletingBatch(batchId);
//     setError('');

//     try {
//       const response = await fetch(`/api/admin/delete-redeem-batch?batchId=${batchId}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to delete batch');
//       }

//       const data = await response.json();
//       toast.success(data.message);

//       // Refresh the batches list
//       fetchBatches();

//       // If the deleted batch was selected, clear the selection
//       if (selectedBatch && selectedBatch.id === batchId) {
//         setSelectedBatch(null);
//         setBatchCodes([]);
//       }
//     } catch (err: any) {
//       setError(err.message || 'An error occurred while deleting the batch');
//       toast.error(err.message || 'Failed to delete batch');
//     } finally {
//       setIsDeletingBatch(null);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="generate">Generate Codes</TabsTrigger>
//           <TabsTrigger value="manage">Manage Batches</TabsTrigger>
//         </TabsList>

//         <TabsContent value="generate" className="mt-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Generate Redeem Codes</CardTitle>
//               <CardDescription>
//                 Create a new batch of redeem codes for promotional purposes
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {error && (
//                 <Alert variant="destructive" className="mb-4">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               <form onSubmit={handleGenerateCodes} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="name">Batch Name</Label>
//                     <Input
//                       id="name"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       placeholder="Enter batch name"
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="campaign">Campaign</Label>
//                     <Input
//                       id="campaign"
//                       value={campaign}
//                       onChange={(e) => setCampaign(e.target.value)}
//                       placeholder="Enter campaign name"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="quantity">Quantity</Label>
//                     <Input
//                       id="quantity"
//                       type="number"
//                       min="1"
//                       max="1000"
//                       value={quantity}
//                       onChange={(e) => setQuantity(parseInt(e.target.value))}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="validityDays">Validity (days)</Label>
//                     <Input
//                       id="validityDays"
//                       type="number"
//                       min="1"
//                       value={validityDays}
//                       onChange={(e) => setValidityDays(parseInt(e.target.value))}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <Button type="submit" disabled={isGenerating} className="w-full">
//                   {isGenerating ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Generating...
//                     </>
//                   ) : (
//                     <>
//                       <Plus className="mr-2 h-4 w-4" />
//                       Generate Redeem Codes
//                     </>
//                   )}
//                 </Button>
//               </form>

//               {generatedCodes.length > 0 && (
//                 <div className="mt-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-medium">Generated Codes</h3>
//                     <Button variant="outline" onClick={downloadCodesAsCsv}>
//                       <Download className="mr-2 h-4 w-4" />
//                       Download CSV
//                     </Button>
//                   </div>

//                   <div className="border rounded-md max-h-60 overflow-auto">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Redeem Code</TableHead>
//                           <TableHead>License Key</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {generatedCodes.map((code) => (
//                           <TableRow key={code.code}>
//                             <TableCell className="font-mono">{code.code}</TableCell>
//                             <TableCell className="font-mono">{code.licenseKey}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="manage" className="mt-6">
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <div>
//                   <CardTitle>Manage Redeem Code Batches</CardTitle>
//                   <CardDescription>
//                     View and manage existing redeem code batches
//                   </CardDescription>
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button
//                     variant="outline"
//                     onClick={handleExpireCodes}
//                     disabled={isExpiring || isLoading}
//                   >
//                     {isExpiring ? (
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     ) : (
//                       <AlertCircle className="mr-2 h-4 w-4" />
//                     )}
//                     Expire Old Codes
//                   </Button>
//                   <Button variant="outline" onClick={fetchBatches} disabled={isLoading}>
//                     <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
//                     Refresh
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               {error && (
//                 <Alert variant="destructive" className="mb-4">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               {isLoading ? (
//                 <div className="flex justify-center items-center py-8">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                 </div>
//               ) : batches.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   No redeem code batches found
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   <div className="border rounded-md">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Name</TableHead>
//                           <TableHead>Campaign</TableHead>
//                           <TableHead>Quantity</TableHead>
//                           <TableHead>Validity</TableHead>
//                           <TableHead>Created</TableHead>
//                           <TableHead>Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {batches.map((batch) => (
//                           <TableRow key={batch.id}>
//                             <TableCell>{batch.name}</TableCell>
//                             <TableCell>{batch.campaign}</TableCell>
//                             <TableCell>{batch._count.codes}</TableCell>
//                             <TableCell>{new Date(batch.validity).toLocaleDateString()}</TableCell>
//                             <TableCell>{new Date(batch.createdAt).toLocaleDateString()}</TableCell>
//                             <TableCell>
//                               <div className="flex space-x-2">
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   onClick={() => fetchBatchCodes(batch.id)}
//                                 >
//                                   View Codes
//                                 </Button>
//                                 <Button
//                                   variant="destructive"
//                                   size="sm"
//                                   onClick={() => handleDeleteBatch(batch.id, batch.name)}
//                                   disabled={isDeletingBatch === batch.id}
//                                 >
//                                   {isDeletingBatch === batch.id ? (
//                                     <Loader2 className="h-4 w-4 animate-spin" />
//                                   ) : (
//                                     'Delete'
//                                   )}
//                                 </Button>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>

//                   {/* Pagination controls */}
//                   {totalPages > 1 && (
//                     <div className="flex justify-center space-x-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setPage(p => Math.max(1, p - 1))}
//                         disabled={page === 1}
//                       >
//                         Previous
//                       </Button>
//                       <span className="py-2 px-3 text-sm">
//                         Page {page} of {totalPages}
//                       </span>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                         disabled={page === totalPages}
//                       >
//                         Next
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Display selected batch codes */}
//               {selectedBatch && (
//                 <div className="mt-8 space-y-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-lg font-medium">
//                       Codes for Batch: {selectedBatch.name}
//                     </h3>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setSelectedBatch(null)}
//                     >
//                       Close
//                     </Button>
//                   </div>

//                   {isLoadingCodes ? (
//                     <div className="flex justify-center items-center py-8">
//                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                     </div>
//                   ) : batchCodes.length === 0 ? (
//                     <div className="text-center py-8 text-muted-foreground">
//                       No codes found in this batch
//                     </div>
//                   ) : (
//                     <div className="border rounded-md max-h-96 overflow-auto">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>Redeem Code</TableHead>
//                             <TableHead>License Key</TableHead>
//                             <TableHead>Status</TableHead>
//                             <TableHead>Claimed At</TableHead>
//                             <TableHead>Claimed By</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {batchCodes.map((code) => (
//                             <TableRow key={code.id}>
//                               <TableCell className="font-mono">{code.code}</TableCell>
//                               <TableCell className="font-mono">{code.licenseKey.key}</TableCell>
//                               <TableCell>{getStatusBadge(code.status)}</TableCell>
//                               <TableCell>
//                                 {code.claimedAt ? new Date(code.claimedAt).toLocaleString() : '-'}
//                               </TableCell>
//                               <TableCell>{code.claimedBy || '-'}</TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </div>
//                   )}

//                   {/* Pagination for batch codes */}
//                   {totalPages > 1 && (
//                     <div className="flex justify-center space-x-2 mt-4">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           setPage(p => {
//                             const newPage = Math.max(1, p - 1);
//                             fetchBatchCodes(selectedBatch.id);
//                             return newPage;
//                           });
//                         }}
//                         disabled={page === 1}
//                       >
//                         Previous
//                       </Button>
//                       <span className="py-2 px-3 text-sm">
//                         Page {page} of {totalPages}
//                       </span>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           setPage(p => {
//                             const newPage = Math.min(totalPages, p + 1);
//                             fetchBatchCodes(selectedBatch.id);
//                             return newPage;
//                           });
//                         }}
//                         disabled={page === totalPages}
//                       >
//                         Next
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
