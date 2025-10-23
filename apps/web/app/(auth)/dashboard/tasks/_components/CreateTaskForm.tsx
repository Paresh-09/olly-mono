"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@repo/ui/hooks/use-toast"; import { cn } from "@repo/ui/lib/utils";

import { Button } from "@repo/ui/components/ui/button";
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
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Calendar } from "@repo/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";

// Updated schema to match backend expectations
const taskFormSchema = z.object({
  platform: z.enum(["LINKEDIN", "TWITTER", "REDDIT", "INSTAGRAM", "FACEBOOK"]),
  taskType: z.enum(["REMINDER", "POST_SCHEDULE", "COMMENT_SCHEDULE", "CUSTOM"]),
  description: z.string().min(1, "Description is required"),
  context: z.string().optional(),
  scheduleDate: z.date(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const defaultValues: Partial<TaskFormValues> = {
  description: "",
  context: "",
  scheduleDate: new Date(),
};

export function CreateTaskForm({
  userId,
  licenseKey
}: {
  userId: string;
  licenseKey: string;
}) {
  const { toast } = useToast();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: TaskFormValues) => {
    // Prepare the date with time set to midnight
    const selectedDate = new Date(data.scheduleDate);
    selectedDate.setHours(0, 0, 0, 0);

    const rawFormData = {
      userId,
      platform: data.platform,
      taskType: data.taskType,
      description: data.description,
      context: data.context || "",
      scheduleDate: selectedDate.toISOString(),
      status: "SCHEDULED",
      licenseKey: licenseKey
    };

    try {
      const response = await fetch("/api/extension/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${licenseKey}`
        },
        body: JSON.stringify(rawFormData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Task has been scheduled successfully.",
        });

        // Reset the form after successful submission
        form.reset();
      } else {
        throw new Error(result.error || "Failed to create task");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="container max-w-2xl mx-auto px-2">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Schedule New Task</CardTitle>
            <CardDescription className="text-gray-500">
              Create and schedule automated tasks for your social media platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                            <SelectItem value="TWITTER">Twitter</SelectItem>
                            <SelectItem value="REDDIT">Reddit</SelectItem>
                            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                            <SelectItem value="FACEBOOK">Facebook</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Choose your target platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taskType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Task Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select a task type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="REMINDER">Reminder</SelectItem>
                            <SelectItem value="POST_SCHEDULE">Post Schedule</SelectItem>
                            <SelectItem value="COMMENT_SCHEDULE">Comment Schedule</SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Select the type of action
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter task description..."
                          className="min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Provide detailed instructions for the task
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Context (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional context..."
                          className="min-h-16 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Add any relevant context for AI processing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduleDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium">Schedule Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full md:w-[240px] pl-3 text-left font-normal h-10",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-xs">
                        Choose the execution date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="w-full md:w-auto"
                  >
                    Reset
                  </Button>
                  <Button type="submit" className="w-full md:w-auto">
                    Schedule Task
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateTaskForm;