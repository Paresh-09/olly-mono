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
}

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchLicenseKey, setSearchLicenseKey] = useState("");
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const { toast } = useToast();

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

  const handleTransferLicense = async () => {
    if (!selectedLicense || !newEmail) return;

    try {
      const response = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKey: selectedLicense.key,
          newEmail,
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
        <Button onClick={fetchLicenses} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

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
              <TableHead>Actions </TableHead>
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
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Transfer License</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <p className="text-sm font-medium mb-2">
                            License Key
                          </p>
                          <p className="text-sm font-mono">
                            {selectedLicense?.key}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Current User
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedLicense?.user?.email || "No user"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">
                            New User Email
                          </p>
                          <Input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter email..."
                          />
                        </div>
                        <Button
                          onClick={handleTransferLicense}
                          className="w-full"
                        >
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
    </div>
  );
}

