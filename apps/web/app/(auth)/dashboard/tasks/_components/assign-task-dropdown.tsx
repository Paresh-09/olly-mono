import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignTaskDropdownProps {
  taskId: string;
  currentAssignee?: string;
  onAssign: (userId: string) => void;
}

export function AssignTaskDropdown({ taskId, currentAssignee, onAssign }: AssignTaskDropdownProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/organization/members');
      if (!response.ok) throw new Error('Failed to fetch team members');
      
      const data = await response.json();
      setTeamMembers(data.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Select
      value={currentAssignee || ""}
      onValueChange={onAssign}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Assign to..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
        {teamMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name || member.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 