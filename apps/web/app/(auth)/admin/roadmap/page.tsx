"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Badge } from "@repo/ui/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Loader, Pencil, Plus, Trash, Filter } from "lucide-react";
import { toast } from "@repo/ui/hooks/use-toast";

interface RoadmapItem {
  id: string;
  feature: string;
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED' | 'ALPHA' | 'BETA';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  votes: number;
  implementationDate?: string;
  assignee?: 'YT' | 'GT' | 'AN' | 'PB' | 'PW' | 'YG' | 'SJ' | 'BT';
  expectedDeliveryDate?: string;
}

const STATUS_STYLES = {
  "PENDING": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  "COMPLETED": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  "IN_PROGRESS": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  "PLANNED": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  "ALPHA": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
  "BETA": "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100"
};

const PRIORITY_STYLES = {
  "HIGH": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  "MEDIUM": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  "LOW": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
};

export default function RoadmapAdmin() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RoadmapItem["status"] | "ALL">("IN_PROGRESS");

  const [feature, setFeature] = useState("");
  const [status, setStatus] = useState<RoadmapItem["status"]>("PLANNED");
  const [priority, setPriority] = useState<RoadmapItem["priority"]>("MEDIUM");
  const [description, setDescription] = useState("");
  const [implementationDate, setImplementationDate] = useState("");
  const [assignee, setAssignee] = useState<RoadmapItem["assignee"]>();
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/admin/roadmap');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast({
        title: "Failed to fetch roadmap items",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFeature("");
    setStatus("PLANNED");
    setPriority("MEDIUM");
    setDescription("");
    setImplementationDate("");
    setAssignee(undefined);
    setExpectedDeliveryDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingItem ? 'PATCH' : 'POST';
      const url = '/api/admin/roadmap' + (editingItem ? `?id=${editingItem.id}` : '');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingItem?.id,
          feature,
          status,
          priority,
          description,
          implementationDate: implementationDate || null,
          assignee: assignee || null,
          expectedDeliveryDate: expectedDeliveryDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save roadmap item');
      }

      toast({
        title: editingItem ? "Item updated successfully" : "Item created successfully",
        description: "Please try again later",
        variant: "default",
      });
      fetchItems();
      resetForm();
    } catch (error) {
      toast({
        title: "Failed to save roadmap item",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/admin/roadmap?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete roadmap item');
      }

      toast({
        title: "Item deleted successfully",
        description: "Please try again later",
        variant: "default",
      });
      fetchItems();
    } catch (error) {
      toast({
        title: "Failed to delete roadmap item",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: RoadmapItem) => {
    setEditingItem(item);
    setFeature(item.feature);
    setStatus(item.status);
    setPriority(item.priority);
    setDescription(item.description);
    setImplementationDate(item.implementationDate || '');
    setAssignee(item.assignee);
    setExpectedDeliveryDate(item.expectedDeliveryDate || '');
  };

  const handleStatusUpdate = async (id: string, newStatus: RoadmapItem["status"], newAssignee?: RoadmapItem["assignee"]) => {
    try {
      const response = await fetch(`/api/admin/roadmap`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          assignee: newAssignee || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: "Status updated successfully",
        variant: "default",
      });
      fetchItems();
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roadmap Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Roadmap Item' : 'Add New Roadmap Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Feature Name</label>
                    <Input
                      value={feature}
                      onChange={(e) => setFeature(e.target.value)}
                      placeholder="Enter feature name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select value={status} onValueChange={(value: RoadmapItem["status"]) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Requested</SelectItem>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="ALPHA">Alpha</SelectItem>
                        <SelectItem value="BETA">Beta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <Select value={priority} onValueChange={(value: RoadmapItem["priority"]) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Assignee</label>
                    <Select value={assignee || ""} onValueChange={(value) => setAssignee(value as RoadmapItem["assignee"])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="YT">YT</SelectItem>
                        <SelectItem value="GT">GT</SelectItem>
                        <SelectItem value="AN">AN</SelectItem>
                        <SelectItem value="PB">PB</SelectItem>
                        <SelectItem value="PW">PW</SelectItem>
                        <SelectItem value="YG">YG</SelectItem>
                        <SelectItem value="SJ">SJ</SelectItem>
                        <SelectItem value="BT">BT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
                    <Input
                      type="date"
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Implementation Date</label>
                    <Input
                      type="date"
                      value={implementationDate}
                      onChange={(e) => setImplementationDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter feature description"
                  required
                  className="h-32"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader className="animate-spin h-4 w-4 mr-2" />}
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter & View</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as RoadmapItem["status"] | "ALL")} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PENDING">Requested</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
              <TabsTrigger value="PLANNED">Planned</TabsTrigger>
              <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
              <TabsTrigger value="ALPHA">Alpha</TabsTrigger>
              <TabsTrigger value="BETA">Beta</TabsTrigger>
            </TabsList>
            <TabsContent value={statusFilter} className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Implementation Date</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items
                      .filter(item => statusFilter === "ALL" || item.status === statusFilter)
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.feature}</TableCell>
                          <TableCell>
                            <Select 
                              value={item.status} 
                              onValueChange={(value: RoadmapItem["status"]) => handleStatusUpdate(item.id, value)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue>
                                  <Badge variant="outline" className={STATUS_STYLES[item.status]}>
                                    {item.status.replace('_', ' ')}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Requested</SelectItem>
                                <SelectItem value="PLANNED">Planned</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="ALPHA">Alpha</SelectItem>
                                <SelectItem value="BETA">Beta</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={item.priority} 
                              onValueChange={(value: RoadmapItem["priority"]) => handleStatusUpdate(item.id, item.status)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue>
                                  <Badge variant="outline" className={PRIORITY_STYLES[item.priority]}>
                                    {item.priority}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{item.description}</TableCell>
                          <TableCell>{item.votes}</TableCell>
                          <TableCell>{item.implementationDate || '-'}</TableCell>
                          <TableCell>
                            <Select 
                              value={item.assignee || ""} 
                              onValueChange={(value) => handleStatusUpdate(item.id, item.status, value as RoadmapItem["assignee"])}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue>
                                  {item.assignee || '-'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="YT">YT</SelectItem>
                                <SelectItem value="GT">GT</SelectItem>
                                <SelectItem value="AN">AN</SelectItem>
                                <SelectItem value="PB">PB</SelectItem>
                                <SelectItem value="PW">PW</SelectItem>
                                <SelectItem value="YG">YG</SelectItem>
                                <SelectItem value="SJ">SJ</SelectItem>
                                <SelectItem value="BT">BT</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{item.expectedDeliveryDate || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium mb-1">Feature Name</label>
                                          <Input
                                            value={feature}
                                            onChange={(e) => setFeature(e.target.value)}
                                            placeholder="Enter feature name"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1">Status</label>
                                          <Select value={status} onValueChange={(value: RoadmapItem["status"]) => setStatus(value)}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="PENDING">Requested</SelectItem>
                                              <SelectItem value="PLANNED">Planned</SelectItem>
                                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                              <SelectItem value="COMPLETED">Completed</SelectItem>
                                              <SelectItem value="ALPHA">Alpha</SelectItem>
                                              <SelectItem value="BETA">Beta</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1">Priority</label>
                                          <Select value={priority} onValueChange={(value: RoadmapItem["priority"]) => setPriority(value)}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="HIGH">High</SelectItem>
                                              <SelectItem value="MEDIUM">Medium</SelectItem>
                                              <SelectItem value="LOW">Low</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium mb-1">Assignee</label>
                                          <Select value={assignee || ""} onValueChange={(value) => setAssignee(value as RoadmapItem["assignee"])}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select assignee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="None">None</SelectItem>
                                              <SelectItem value="YT">YT</SelectItem>
                                              <SelectItem value="GT">GT</SelectItem>
                                              <SelectItem value="AN">AN</SelectItem>
                                              <SelectItem value="PB">PB</SelectItem>
                                              <SelectItem value="PW">PW</SelectItem>
                                              <SelectItem value="YG">YG</SelectItem>
                                              <SelectItem value="SJ">SJ</SelectItem>
                                              <SelectItem value="BT">BT</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
                                          <Input
                                            type="date"
                                            value={expectedDeliveryDate}
                                            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1">Implementation Date</label>
                                          <Input
                                            type="date"
                                            value={implementationDate}
                                            onChange={(e) => setImplementationDate(e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Description</label>
                                      <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter feature description"
                                        required
                                        className="h-32"
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                      <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader className="animate-spin h-4 w-4 mr-2" />}
                                        {editingItem ? 'Update Item' : 'Add Item'}
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button
                                onClick={() => handleDelete(item.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 