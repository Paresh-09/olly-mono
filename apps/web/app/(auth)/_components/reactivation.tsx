'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { ActionResult, Form } from "@/lib/form";
import { reactivateAccount, login } from "@/lib/actions";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Loader2 } from 'lucide-react';

interface ReactivateAccountFormProps {
  token: string;
}

export default function ReactivateAccountForm({ token }: ReactivateAccountFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  const handleSubmit = async (prevState: any, formData: FormData): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    setIsTokenInvalid(false);
    try {
      const result = await reactivateAccount(prevState, formData);
      if (result.success) {
        toast({
          title: "Account reactivated successfully",
          description: result.success,
        });
        router.push('/login');
        return { success: result.success };
      } else if (result.error) {
        if (result.error === "Invalid or expired reactivation token") {
          setIsTokenInvalid(true);
        }
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

  const handleRequestNewLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const email = prompt("Please enter your email address to request a new reactivation link:");
      if (!email) {
        setIsLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", "dummy"); // We need to pass a password, but it won't be used

      const result = await login({}, formData);
      if (result.error === "Account is deactivated. A reactivation link has been sent to your email.") {
        toast({
          title: "New reactivation link sent",
          description: "Please check your email for the new reactivation link.",
        });
        router.push('/login');
      } else {
        setError("Failed to send new reactivation link. Please try again or contact support.");
      }
    } catch (error) {
      setError("An error occurred while requesting a new link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reactivate Account</CardTitle>
          <CardDescription>Enter a new password to reactivate your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isTokenInvalid ? (
            <div className="text-center">
              <p className="mb-4">Your reactivation link has expired or is invalid.</p>
              <Button onClick={handleRequestNewLink} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  'Request New Reactivation Link'
                )}
              </Button>
            </div>
          ) : (
            <Form action={handleSubmit}>
              <input type="hidden" name="token" value={token} />
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter new password" />
              </div>
              <div className="flex flex-col space-y-1.5 mt-4">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm new password" />
              </div>
              <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  'Reactivate Account'
                )}
              </Button>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}