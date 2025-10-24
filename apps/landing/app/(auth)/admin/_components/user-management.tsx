import { useState } from 'react';
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
import { useToast } from "@repo/ui/hooks/use-toast";import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@repo/ui/components/ui/alert-dialog";

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
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState('');
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={fetchUsers} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name || '-'}</TableCell>
                <TableCell>{user.credits}</TableCell>
                <TableCell>{user.activeLicenses}/{user.totalLicenses}</TableCell>
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

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteUser(user)}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {deleteUser?.email}? This action cannot be undone.
                            All associated data including credits, licenses, and settings will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteUser(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 