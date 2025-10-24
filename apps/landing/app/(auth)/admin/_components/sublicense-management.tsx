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
import { useToast } from "@repo/ui/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Badge } from "@repo/ui/components/ui/badge";

interface SubLicense {
  id: string;
  key: string;
  status: string;
  assignedEmail: string | null;
  assignedUser: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  createdAt: string;
  deactivatedAt: string | null;
}

export default function SubLicenseManagement({ mainLicenseKey }: { mainLicenseKey: string }) {
  const [subLicenses, setSubLicenses] = useState<SubLicense[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [assignEmail, setAssignEmail] = useState('');
  const [selectedSubLicense, setSelectedSubLicense] = useState<SubLicense | null>(null);
  const { toast } = useToast();

  const fetchSubLicenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/licenses/sublicenses?mainLicenseKey=${mainLicenseKey}`);
      const data = await response.json();
      if (response.ok) {
        setSubLicenses(data.subLicenses);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch sub-licenses",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sub-licenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubLicenses = async () => {
    try {
      const response = await fetch('/api/admin/licenses/sublicenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainLicenseKey,
          quantity: parseInt(quantity),
          assignedEmail: assignEmail || undefined
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: `Created ${quantity} sub-license(s)`,
        });
        fetchSubLicenses();
        setQuantity('1');
        setAssignEmail('');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create sub-licenses",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sub-licenses",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubLicense = async (action: string) => {
    if (!selectedSubLicense) return;

    try {
      const response = await fetch('/api/admin/licenses/sublicenses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subLicenseKey: selectedSubLicense.key,
          action,
          assignedEmail: assignEmail
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: `Sub-license ${action} successful`,
        });
        fetchSubLicenses();
        setSelectedSubLicense(null);
        setAssignEmail('');
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to ${action} sub-license`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} sub-license`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Create Sub-licenses</h3>
          <div className="flex gap-4">
            <div className="w-24">
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
              />
            </div>
            <div className="flex-1">
              <Input
                type="email"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                placeholder="Assign to email (optional)"
              />
            </div>
            <Button onClick={handleCreateSubLicenses} disabled={loading}>
              Create
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Sub-licenses</h3>
          <Button onClick={fetchSubLicenses} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subLicenses.map((license) => (
              <TableRow key={license.id}>
                <TableCell className="font-mono">{license.key}</TableCell>
                <TableCell>
                  <Badge variant={license.status === "ACTIVE" ? "default" : "destructive"}>
                    {license.status}
                  </Badge>
                </TableCell>
                <TableCell>{license.assignedEmail || '-'}</TableCell>
                <TableCell>{new Date(license.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubLicense(license)}
                        >
                          Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Sub-license</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <p className="text-sm font-medium mb-2">License Key</p>
                            <p className="text-sm font-mono">{selectedSubLicense?.key}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Assign to Email</p>
                            <Input
                              type="email"
                              value={assignEmail}
                              onChange={(e) => setAssignEmail(e.target.value)}
                              placeholder="Enter email..."
                            />
                          </div>
                          <Button 
                            onClick={() => handleUpdateSubLicense('assign')} 
                            className="w-full"
                          >
                            Assign
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSubLicense(license);
                        handleUpdateSubLicense(license.status === "ACTIVE" ? 'deactivate' : 'activate');
                      }}
                    >
                      {license.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>

                    {license.assignedEmail && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubLicense(license);
                          handleUpdateSubLicense('unassign');
                        }}
                      >
                        Unassign
                      </Button>
                    )}
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