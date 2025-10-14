'use client';

import { useState, useRef } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Form } from "@/lib/form";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Loader2, Shuffle, User } from 'lucide-react';
import { updateUsername } from "@/lib/actions";
import { ActionResult } from "@/lib/form";
import { generateUsername } from '@/lib/generate-username';

const icons = [User, Shuffle, Loader2];

interface AddUsernamePopupProps {
  onClose: () => void;
  onUsernameUpdate: (newUsername: string) => void;
}

export default function AddUsernamePopup({ onClose, onUsernameUpdate }: AddUsernamePopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [randomIcon, setRandomIcon] = useState(() => {
    const RandomIcon = icons[Math.floor(Math.random() * icons.length)];
    return <RandomIcon className="h-6 w-6 mr-2" />;
  });

  const handleSubmit = async (prevState: ActionResult, formData: FormData): Promise<ActionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const lowercaseUsername = (formData.get('username') as string).toLowerCase();
      formData.set('username', lowercaseUsername);

      const result = await updateUsername(formData);
      if (result.success) {
        onUsernameUpdate(lowercaseUsername);
        onClose();
      } else if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (error) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateUsername = () => {
    if (inputRef.current) {
      inputRef.current.value = generateUsername().toLowerCase();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            {randomIcon}
            Add Username
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form action={handleSubmit}>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <div className="flex space-x-2">
                <Input 
                  id="username" 
                  name="username" 
                  placeholder="Choose a username" 
                  ref={inputRef}
                  onChange={(e) => e.target.value = e.target.value.toLowerCase()}
                />
                <Button type="button" onClick={handleGenerateUsername} variant="outline">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Use 3-31 characters, lowercase letters, numbers, underscore, or hyphen.
              </p>
            </div>
            <CardFooter className="flex justify-end space-x-2 mt-4 px-0">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </CardFooter>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}