import { useState } from "react";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { useToast } from "@repo/ui/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Badge } from "@repo/ui/components/ui/badge";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  isSales: boolean;
  isSupport: boolean;
  isBetaTester: boolean;
  credits: number;
  activeLicenses: number;
  totalLicenses: number;
  role?: string;
  createdAt: string;
  licenses?: License[];
}

interface License {
  id: string;
  key: string;
  isActive: boolean;
  vendor: string;
  tier: number;
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  subLicenses: number;
  installations: number;
  activatedAt: string | null;
  deActivatedAt: string | null;
  createdAt: string;
  settings?: any;
  customKnowledge?: any;
  usageTracking?: boolean;
}

interface TransferOptions {
  settings: boolean;
  customKnowledge: boolean;
  usageTracking: boolean;
  brandDetails: boolean;
  subLicenses: boolean;
}

export default function UserLicenseManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchLicenseKey, setSearchLicenseKey] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState("");
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [transferOptions, setTransferOptions] = useState<TransferOptions>({
    settings: true,
    customKnowledge: true,
    usageTracking: true,
    brandDetails: true,
    subLicenses: true,
  });
  const { toast } = useToast();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?email=${searchEmail}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchEmail) params.append("email", searchEmail);
      if (searchLicenseKey) params.append("licenseKey", searchLicenseKey);

      const response = await fetch(`/api/admin/licenses?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setLicenses(data.licenses);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch licenses",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch licenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWithLicenses = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/licenses`);
      const data = await response.json();
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, licenses: data.licenses }
            : user
        ));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user licenses",
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    fetchUsers();
    fetchLicenses();
  };

  const handleAddCredits = async () => {
    if (!selectedUser || !creditsToAdd) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: selectedUser.email,
          credits: parseInt(creditsToAdd),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: `Credits updated for ${selectedUser.email}`,
        });
        fetchUsers();
        setSelectedUser(null);
        setCreditsToAdd('');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add credits",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add credits",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!passwordResetUser || !newPassword) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: passwordResetUser.email,
          newPassword
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: `Password reset for ${passwordResetUser.email}`,
        });
        setPasswordResetUser(null);
        setNewPassword('');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      const response = await fetch(`/api/admin/users?email=${deleteUser.email}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${deleteUser.email} deleted successfully`,
        });
        fetchUsers();
        setDeleteUser(null);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleTransferLicense = async () => {
    if (!selectedLicense || !newEmail) return;

    try {
      const response = await fetch("/api/admin/licenses/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKey: selectedLicense.key,
          newEmail,
          transferOptions,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: `License transferred to ${newEmail}`,
        });
        fetchLicenses();
        setSelectedLicense(null);
        setNewEmail("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to transfer license",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to transfer license",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRoles = async (userId: string, roles: { [key: string]: boolean }) => {
    try {
      const response = await fetch('/api/admin/users/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          roles
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: "User roles updated successfully",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update user roles",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      });
    }
  };

  const handleExpandUser = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      await fetchUserWithLicenses(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Search by license key..."
          value={searchLicenseKey}
          onChange={(e) => setSearchLicenseKey(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="licenses">All Licenses</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Active Licenses</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <>
                    <TableRow key={user.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExpandUser(user.id)}
                        >
                          {expandedUser === user.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>{user.credits}</TableCell>
                      <TableCell>
                        <Button 
                          variant="link" 
                          onClick={() => handleExpandUser(user.id)}
                        >
                          {user.activeLicenses}/{user.totalLicenses}
                        </Button>
                      </TableCell>
                      <TableCell>{user.role || '-'}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                Add Credits
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Credits</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">User Email</p>
                                  <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">Current Credits</p>
                                  <p className="text-sm text-gray-500">{selectedUser?.credits}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">Credits to Add</p>
                                  <Input
                                    type="number"
                                    value={creditsToAdd}
                                    onChange={(e) => setCreditsToAdd(e.target.value)}
                                    placeholder="Enter amount..."
                                  />
                                </div>
                                <Button onClick={handleAddCredits} className="w-full">
                                  Add Credits
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPasswordResetUser(user)}
                              >
                                Reset Password
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">User Email</p>
                                  <p className="text-sm text-gray-500">{passwordResetUser?.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">New Password</p>
                                  <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password..."
                                  />
                                </div>
                                <Button onClick={handleResetPassword} className="w-full">
                                  Reset Password
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                Roles
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Manage User Roles</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">User Email</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Admin</label>
                                    <Button
                                      variant={user.isAdmin ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleUpdateRoles(user.id, { isAdmin: !user.isAdmin })}
                                    >
                                      {user.isAdmin ? "Enabled" : "Disabled"}
                                    </Button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Sales</label>
                                    <Button
                                      variant={user.isSales ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleUpdateRoles(user.id, { isSales: !user.isSales })}
                                    >
                                      {user.isSales ? "Enabled" : "Disabled"}
                                    </Button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Support</label>
                                    <Button
                                      variant={user.isSupport ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleUpdateRoles(user.id, { isSupport: !user.isSupport })}
                                    >
                                      {user.isSupport ? "Enabled" : "Disabled"}
                                    </Button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Beta Tester</label>
                                    <Button
                                      variant={user.isBetaTester ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleUpdateRoles(user.id, { isBetaTester: !user.isBetaTester })}
                                    >
                                      {user.isBetaTester ? "Enabled" : "Disabled"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteUser(user)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedUser === user.id && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-slate-50">
                          <div className="p-4">
                            <h3 className="text-sm font-medium mb-2">Active Licenses</h3>
                            {user.licenses && user.licenses.length > 0 ? (
                              <div className="space-y-4">
                                {user.licenses.map((license) => (
                                  <div key={license.id} className="bg-white p-4 rounded-lg border">
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <p className="font-mono text-sm">{license.key}</p>
                                        <div className="flex gap-2 mt-1">
                                          <Badge variant={license.isActive ? "default" : "destructive"}>
                                            {license.isActive ? "Active" : "Inactive"}
                                          </Badge>
                                          <Badge variant="outline">{license.vendor}</Badge>
                                          <Badge variant="outline">Tier {license.tier}</Badge>
                                        </div>
                                      </div>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedLicense(license)}
                                          >
                                            Transfer License
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                          <DialogHeader>
                                            <DialogTitle>Transfer License</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4 py-4">
                                            <div>
                                              <p className="text-sm font-medium mb-2">License Key</p>
                                              <p className="text-sm font-mono">{license.key}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium mb-2">Current User</p>
                                              <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium mb-2">New User Email</p>
                                              <Input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="Enter email..."
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <p className="text-sm font-medium">Transfer Options</p>
                                              <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id="settings"
                                                    checked={transferOptions.settings}
                                                    onCheckedChange={(checked) =>
                                                      setTransferOptions({
                                                        ...transferOptions,
                                                        settings: checked as boolean,
                                                      })
                                                    }
                                                  />
                                                  <label htmlFor="settings" className="text-sm">
                                                    License Settings
                                                  </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id="customKnowledge"
                                                    checked={transferOptions.customKnowledge}
                                                    onCheckedChange={(checked) =>
                                                      setTransferOptions({
                                                        ...transferOptions,
                                                        customKnowledge: checked as boolean,
                                                      })
                                                    }
                                                  />
                                                  <label htmlFor="customKnowledge" className="text-sm">
                                                    Custom Knowledge
                                                  </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id="usageTracking"
                                                    checked={transferOptions.usageTracking}
                                                    onCheckedChange={(checked) =>
                                                      setTransferOptions({
                                                        ...transferOptions,
                                                        usageTracking: checked as boolean,
                                                      })
                                                    }
                                                  />
                                                  <label htmlFor="usageTracking" className="text-sm">
                                                    Usage Tracking Data
                                                  </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id="brandDetails"
                                                    checked={transferOptions.brandDetails}
                                                    onCheckedChange={(checked) =>
                                                      setTransferOptions({
                                                        ...transferOptions,
                                                        brandDetails: checked as boolean,
                                                      })
                                                    }
                                                  />
                                                  <label htmlFor="brandDetails" className="text-sm">
                                                    Brand Details
                                                  </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id="subLicenses"
                                                    checked={transferOptions.subLicenses}
                                                    onCheckedChange={(checked) =>
                                                      setTransferOptions({
                                                        ...transferOptions,
                                                        subLicenses: checked as boolean,
                                                      })
                                                    }
                                                  />
                                                  <label htmlFor="subLicenses" className="text-sm">
                                                    Sub-licenses
                                                  </label>
                                                </div>
                                              </div>
                                            </div>
                                            <Button onClick={handleTransferLicense} className="w-full">
                                              Transfer License
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                      <div>
                                        <p className="text-gray-500">Sub-licenses</p>
                                        <p>{license.subLicenses}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Installations</p>
                                        <p>{license.installations}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Activated</p>
                                        <p>{license.activatedAt ? new Date(license.activatedAt).toLocaleDateString() : 'Not activated'}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No active licenses found</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="licenses">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Sub-licenses</TableHead>
                  <TableHead>Installations</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono">{license.key}</TableCell>
                    <TableCell>
                      <Badge variant={license.isActive ? "default" : "destructive"}>
                        {license.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{license.user?.email || "-"}</TableCell>
                    <TableCell>{license.vendor}</TableCell>
                    <TableCell>{license.tier}</TableCell>
                    <TableCell>{license.subLicenses}</TableCell>
                    <TableCell>{license.installations}</TableCell>
                    <TableCell>
                      {new Date(license.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLicense(license)}
                          >
                            Transfer
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Transfer License</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <p className="text-sm font-medium mb-2">License Key</p>
                              <p className="text-sm font-mono">{selectedLicense?.key}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Current User</p>
                              <p className="text-sm text-gray-500">
                                {selectedLicense?.user?.email || "No user"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">New User Email</p>
                              <Input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter email..."
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Transfer Options</p>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="settings"
                                    checked={transferOptions.settings}
                                    onCheckedChange={(checked) =>
                                      setTransferOptions({
                                        ...transferOptions,
                                        settings: checked as boolean,
                                      })
                                    }
                                  />
                                  <label htmlFor="settings" className="text-sm">
                                    License Settings
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="customKnowledge"
                                    checked={transferOptions.customKnowledge}
                                    onCheckedChange={(checked) =>
                                      setTransferOptions({
                                        ...transferOptions,
                                        customKnowledge: checked as boolean,
                                      })
                                    }
                                  />
                                  <label htmlFor="customKnowledge" className="text-sm">
                                    Custom Knowledge
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="usageTracking"
                                    checked={transferOptions.usageTracking}
                                    onCheckedChange={(checked) =>
                                      setTransferOptions({
                                        ...transferOptions,
                                        usageTracking: checked as boolean,
                                      })
                                    }
                                  />
                                  <label htmlFor="usageTracking" className="text-sm">
                                    Usage Tracking Data
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="brandDetails"
                                    checked={transferOptions.brandDetails}
                                    onCheckedChange={(checked) =>
                                      setTransferOptions({
                                        ...transferOptions,
                                        brandDetails: checked as boolean,
                                      })
                                    }
                                  />
                                  <label htmlFor="brandDetails" className="text-sm">
                                    Brand Details
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="subLicenses"
                                    checked={transferOptions.subLicenses}
                                    onCheckedChange={(checked) =>
                                      setTransferOptions({
                                        ...transferOptions,
                                        subLicenses: checked as boolean,
                                      })
                                    }
                                  />
                                  <label htmlFor="subLicenses" className="text-sm">
                                    Sub-licenses
                                  </label>
                                </div>
                              </div>
                            </div>
                            <Button onClick={handleTransferLicense} className="w-full">
                              Transfer License
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 