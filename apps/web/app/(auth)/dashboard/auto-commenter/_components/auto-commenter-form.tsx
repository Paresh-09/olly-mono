"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
} from "@repo/ui/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Input } from "@repo/ui/components/ui/input";
import { Switch } from "@repo/ui/components/ui/switch";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";import { Badge } from "@repo/ui/components/ui/badge";
import { Loader2, XCircle } from "lucide-react";
import {
  type AutoCommenterFormData,
  autoCommenterSchema,
} from "@/lib/validation";
import { ActionType, CommentPlatform, Hashtag } from "@repo/db";

interface AutoCommenterFormProps {
  platform: CommentPlatform;
  availableCredits: number;
}

export function AutoCommenterForm({ platform, availableCredits }: AutoCommenterFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const hashtagOptions = Object.values(Hashtag);
  const actionOptions = Object.values(ActionType);

  const form = useForm<AutoCommenterFormData>({
    resolver: zodResolver(autoCommenterSchema),
    defaultValues: {
      isEnabled: false,
      timeInterval: 5,
      action: [ActionType.COMMENT],
      hashtags: [],
      platform: platform,
    },
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `/api/auto-commenter/config?platform=${platform}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch configuration");
        }

        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          form.reset({ ...data, platform });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load configuration",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [form, toast, platform]);

  const onSubmit = async (data: AutoCommenterFormData) => {
    try {
      const response = await fetch(`/api/auto-commenter/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save configuration");
      }

      toast({
        title: "Success",
        description: `${platform} configuration saved successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleHashtagSelect = (value: Hashtag) => {
    const currentTags = form.getValues("hashtags");
    if (currentTags.length < 3 && !currentTags.includes(value)) {
      form.setValue("hashtags", [...currentTags, value]);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto py-10">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Enable/Disable Switch */}
            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Auto Interactions
                    </FormLabel>
                    <FormDescription>
                      Automatically interact with {platform.toLowerCase()} posts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time Interval Input */}
              <FormField
                control={form.control}
                name="timeInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Interval (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        max={60}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 5 minutes between actions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions Checkboxes */}
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actions</FormLabel>
                    <FormControl>
                      <div className="space-y-2 border rounded-lg p-4">
                        {actionOptions.map((action) => (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value.includes(action)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, action]
                                  : field.value.filter((a) => a !== action);
                                if (newValue.length > 0) {
                                  field.onChange(newValue);
                                }
                              }}
                            />
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {action.toLowerCase()}
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select at least one action
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hashtags Selection */}
              <FormField
                control={form.control}
                name="hashtags"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Hashtags</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Select
                          onValueChange={handleHashtagSelect}
                          disabled={field.value.length >= 3}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a hashtag" />
                          </SelectTrigger>
                          <SelectContent>
                            {hashtagOptions.map((hashtag) => (
                              <SelectItem
                                key={hashtag}
                                value={hashtag}
                                disabled={field.value.includes(hashtag)}
                              >
                                #{hashtag.toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-2 px-3 py-1"
                            >
                              <span>#{tag.toLowerCase()}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                  const newTags = field.value.filter(
                                    (_, i) => i !== index
                                  );
                                  form.setValue("hashtags", newTags);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        {field.value.length < 3 && (
                          <p className="text-sm text-muted-foreground">
                            {3 - field.value.length} hashtag
                            {3 - field.value.length !== 1 ? "s" : ""} remaining
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
            >
              Save Configuration
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
