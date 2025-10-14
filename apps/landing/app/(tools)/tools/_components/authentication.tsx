import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Form } from "@/lib/form";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { useToast } from "@repo/ui/hooks/use-toast";import { Loader2 } from "lucide-react";
import { signup, login } from "@/lib/actions";
import { ActionResult } from "@/lib/form";
import GoogleOAuthButton from "@/app/(auth)/_components/google-oauth-button";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  askQuestion?: boolean;
}

type TabType = "login" | "signup";

const AuthPopup: React.FC<AuthPopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
  askQuestion = false,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add function to validate and format email
  const validateAndFormatEmail = (email: string) => {
    // Convert email to lowercase
    return email.toLowerCase();
  };

  // Add function to validate and format username
  const validateAndFormatUsername = (username: string) => {
    // Convert username to lowercase
    return username.toLowerCase();
  };

  const handleLogin = async (
    prevState: any,
    formData: FormData,
  ): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);

    // Get and format the email
    const emailInput = formData.get("email") as string;
    const formattedEmail = validateAndFormatEmail(emailInput);

    // Replace the email in formData with the lowercase version
    const updatedFormData = new FormData();
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      if (key === "email") {
        updatedFormData.append(key, formattedEmail);
      } else {
        updatedFormData.append(key, value);
      }
    });

    try {
      const result = await login(prevState, updatedFormData);
      if (result.success) {
        toast({
          title: "Success!",
          description: "You're now logged in.",
        });
        onSuccess();
        onClose();
        return { success: result.success };
      } else {
        setError(result.error || "An unexpected error occurred");
        return { error: result.error };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (
    prevState: any,
    formData: FormData,
  ): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);

    // Get and format the email
    const emailInput = formData.get("email") as string;
    const formattedEmail = validateAndFormatEmail(emailInput);

    // Get and format the username
    const usernameInput = formData.get("username") as string;
    const formattedUsername = usernameInput ? validateAndFormatUsername(usernameInput) : null;

    // Replace the email and username in formData with the lowercase versions
    const updatedFormData = new FormData();
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      if (key === "email") {
        updatedFormData.append(key, formattedEmail);
      } else if (key === "username" && formattedUsername) {
        updatedFormData.append(key, formattedUsername);
      } else {
        updatedFormData.append(key, value);
      }
    });

    try {
      const result = await signup(prevState, updatedFormData);
      if (result.success) {
        toast({
          title: "Account created!",
          description: "Welcome to our platform.",
        });
        onSuccess();
        onClose();
        return { success: result.success };
      } else {
        setError(result.error || "An unexpected error occurred");
        return { error: result.error };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {askQuestion && (
          <div className="mb-6">
            <DialogTitle className="text-center text-lg font-semibold mb-2">
              View Your Profile Audit
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              Sign up or log in to see your complete profile audit report and
              track your progress.
            </p>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="login">
            <Form action={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </Form>
          </TabsContent>

          <TabsContent value="signup">
            <Form action={handleSignup}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </Form>
          </TabsContent>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-4">
              <GoogleOAuthButton />
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPopup;

