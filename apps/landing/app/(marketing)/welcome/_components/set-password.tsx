// In /components/SetPasswordForm.tsx

'use client'

import { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { ActionResult, Form } from "@/lib/form";
import { initiateSetPassword } from "@/lib/actions";
import { useToast } from "@repo/ui/hooks/use-toast";import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SetPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (prevState: any, formData: FormData): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await initiateSetPassword(prevState, formData);
      if (result.success) {
        setSuccess(result.success);
        toast({
          title: "Success",
          description: result.success,
        });
        return { success: result.success };
      } else if (result.error) {
        setError(result.error);
        return { error: result.error };
      }
      setError("An unexpected error occurred");
      return { error: "An unexpected error occurred" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Password</CardTitle>
        <CardDescription>Enter your email to set a password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <Form action={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Your email" />
            </div>
          </div>
          <Button 
            className={`w-full mt-6 relative ${isLoading ? 'text-transparent hover:text-transparent' : ''}`} 
            type="submit" 
            disabled={isLoading}
          >
            <span className={isLoading ? 'invisible' : 'visible'}>Send Password Setup Instructions</span>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </Button>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}