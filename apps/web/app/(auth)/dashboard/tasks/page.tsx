import { Metadata } from "next";
import { TaskList } from "./_components/task-list";

export const metadata: Metadata = {
  title: "Tasks | Olly",
  description: "Manage your scheduled tasks and reminders",
};

export default async function TasksPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
      </div>
      <div className="flex flex-col gap-4">
        <TaskList />
      </div>
    </div>
  );
} 