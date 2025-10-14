import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

interface DateRangePickerProps {
  date?: DateRange;
  setDate: (date?: DateRange) => void;
}

export default function DateRangePicker({ date, setDate }: DateRangePickerProps) {
  const presets = [
    {
      label: "Today",
      value: "today",
      range: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      label: "Last 7 days",
      value: "7days",
      range: {
        from: addDays(new Date(), -7),
        to: new Date(),
      },
    },
    {
      label: "Last 30 days",
      value: "30days",
      range: {
        from: addDays(new Date(), -30),
        to: new Date(),
      },
    },
    {
      label: "Last 90 days",
      value: "90days",
      range: {
        from: addDays(new Date(), -90),
        to: new Date(),
      },
    },
  ];

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Select
            onValueChange={(value) => {
              const preset = presets.find((preset) => preset.value === value);
              if (preset) {
                setDate(preset.range);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 