"use client";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@repo/ui/components/ui/input";
import { useDebounce } from "@/components/hooks/use-debounce";

interface SearchInputProps {
  onSearch: (searchTerm: string) => void;
}

export const PromptSearch: React.FC<SearchInputProps> = ({ onSearch }) => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className="relative">
      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full pl-9 bg-muted/50 border-0 focus-visible:ring-0"
        placeholder="Search prompts..."
      />
    </div>
  );
};