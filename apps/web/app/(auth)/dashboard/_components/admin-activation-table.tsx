"use client"

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Button } from "@repo/ui/components/ui/button";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

interface Activation {
  licenseKey: string;
  email: string;
  activationCount: number;
}

interface ActivationsResponse {
  activations: Activation[];
  total: number;
}

const LicenseActivationsTable: React.FC = () => {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivations();
  }, [currentPage]);

  const fetchActivations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/activation?page=${currentPage}&limit=${itemsPerPage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activations');
      }
      const data: ActivationsResponse = await response.json();
      setActivations(data.activations);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching activations:', error);
      setError('Failed to load activations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Key</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Activations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activations.map((activation) => (
            <TableRow key={activation.licenseKey}>
              <TableCell>{activation.licenseKey}</TableCell>
              <TableCell>{activation.email}</TableCell>
              <TableCell>{activation.activationCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default LicenseActivationsTable;