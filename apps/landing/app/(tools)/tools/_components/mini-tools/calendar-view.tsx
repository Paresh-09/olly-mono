'use client';

import { format, isSameDay, isToday, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, differenceInMinutes, getHours, getMinutes, isWithinInterval, getMonth, getYear, getDate, getDaysInMonth, isSameMonth } from 'date-fns';
import { Card } from '@repo/ui/components/ui/card';
import { Badge } from '@repo/ui/components/ui/badge';

// Define the color options (shared with main component)
const TIME_BLOCK_COLORS = {
  red: 'bg-red-100 border-red-400 text-red-800',
  blue: 'bg-blue-100 border-blue-400 text-blue-800',
  green: 'bg-green-100 border-green-400 text-green-800',
  yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  purple: 'bg-purple-100 border-purple-400 text-purple-800',
  gray: 'bg-gray-100 border-gray-400 text-gray-800',
};

// Interfaces
interface TimeBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  colorKey: keyof typeof TIME_BLOCK_COLORS;
  projectId?: string;
  isRecurring?: boolean;
  recurringDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  notes?: string;
  completed?: boolean;
}

interface Project {
  id: string;
  name: string;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  colorKey: keyof typeof TIME_BLOCK_COLORS;
  completedHours: number;
}

interface CalendarViewProps {
  timeBlocks: TimeBlock[];
  projects: Project[];
  selectedDate: Date;
  selectedView: 'day' | 'week' | 'month';
  onBlockClick: (block: TimeBlock) => void;
  onTimeSlotClick: (time: Date) => void;
  workHours: { start: number; end: number };
}

export const CalendarView = ({
  timeBlocks,
  projects,
  selectedDate,
  selectedView,
  onBlockClick,
  onTimeSlotClick,
  workHours
}: CalendarViewProps) => {
  // Generate time slots for the day view (hourly)
  const dayTimeSlots = Array.from({ length: (workHours.end - workHours.start) * 4 }, (_, i) => {
    const hour = Math.floor(i / 4) + workHours.start;
    const minutes = (i % 4) * 15;
    const time = new Date(selectedDate);
    time.setHours(hour, minutes, 0, 0);
    return time;
  });

  // Generate days for the week view
  const weekStartDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = eachDayOfInterval({
    start: weekStartDate,
    end: addDays(weekStartDate, 6)
  });

  // Generate days for the month view
  const monthStartDate = startOfMonth(selectedDate);
  const monthEndDate = endOfMonth(selectedDate);
  // Include days from previous/next months to fill calendar grid
  const calendarStartDate = startOfWeek(monthStartDate, { weekStartsOn: 1 });
  const calendarEndDate = endOfWeek(monthEndDate, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({
    start: calendarStartDate,
    end: calendarEndDate
  });

  // Group calendar days into weeks for the month view
  const calendarWeeks: Date[][] = [];
  let week: Date[] = [];
  calendarDays.forEach(day => {
    week.push(day);
    if (week.length === 7) {
      calendarWeeks.push(week);
      week = [];
    }
  });

  // Function to get blocks for a specific day
  const getBlocksForDay = (day: Date) => {
    return timeBlocks.filter(block => {
      // Check if the block occurs on this day
      const isOnThisDay = isSameDay(block.startTime, day);

      // Check if it's a recurring block that occurs on this day of the week
      const isRecurringOnThisDay = block.isRecurring &&
        block.recurringDays?.includes(day.getDay());

      return isOnThisDay || isRecurringOnThisDay;
    });
  };

  // Function to check if a time slot has a block
  const getBlocksForTimeSlot = (time: Date) => {
    return timeBlocks.filter(block => {
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);

      // For recurring blocks, adjust the date to match the current day
      if (block.isRecurring && block.recurringDays?.includes(time.getDay())) {
        blockStart.setFullYear(time.getFullYear(), time.getMonth(), time.getDate());
        blockEnd.setFullYear(time.getFullYear(), time.getMonth(), time.getDate());
      }

      return isWithinInterval(time, { start: blockStart, end: blockEnd });
    });
  };

  // Function to calculate block height based on duration (for day view)
  const getBlockHeight = (block: TimeBlock) => {
    const durationMinutes = differenceInMinutes(block.endTime, block.startTime);
    // Each 15 minutes = 1rem (16px) height
    return `${durationMinutes / 15}rem`;
  };

  // Render day view
  const renderDayView = () => {
    return (
      <div className="space-y-2">
        <div className="text-center py-2 font-medium">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          {isToday(selectedDate) && <Badge className="ml-2">Today</Badge>}
        </div>

        <div className="relative border rounded-lg overflow-y-auto" style={{ height: '600px' }}>
          {/* Time labels */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gray-50 border-r z-10">
            {Array.from({ length: workHours.end - workHours.start + 1 }, (_, i) => {
              const hour = i + workHours.start;
              return (
                <div key={hour} className="h-16 flex items-center justify-center text-sm text-gray-500 border-b">
                  {hour === 0 ? '12am' :
                    hour < 12 ? `${hour}am` :
                      hour === 12 ? '12pm' :
                        `${hour - 12}pm`}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="ml-16 relative">
            {/* Hour markers */}
            {Array.from({ length: workHours.end - workHours.start + 1 }, (_, i) => (
              <div
                key={i}
                className="h-16 border-b flex items-center"
                onClick={() => {
                  const clickTime = new Date(selectedDate);
                  clickTime.setHours(i + workHours.start, 0, 0, 0);
                  onTimeSlotClick(clickTime);
                }}
              >
                <div className="h-full w-full cursor-pointer hover:bg-gray-50"></div>
              </div>
            ))}

            {/* Time blocks */}
            <div className="absolute top-0 left-0 right-0">
              {getBlocksForDay(selectedDate).map(block => {
                const startHour = getHours(block.startTime);
                const startMinute = getMinutes(block.startTime);
                const topPosition = ((startHour - workHours.start) * 60 + startMinute) / 15 * 16;

                const project = block.projectId ?
                  projects.find(p => p.id === block.projectId) : undefined;

                return (
                  <div
                    key={block.id}
                    className={`absolute w-full px-2 rounded border-l-4 ${TIME_BLOCK_COLORS[block.colorKey]} cursor-pointer hover:opacity-90 transition-opacity`}
                    style={{
                      top: `${topPosition}px`,
                      height: getBlockHeight(block),
                      left: '0',
                    }}
                    onClick={() => onBlockClick(block)}
                  >
                    <div className="p-1 overflow-hidden">
                      <div className="font-medium truncate">{block.title}</div>
                      <div className="text-xs flex justify-between">
                        <span>{format(block.startTime, 'h:mm a')} - {format(block.endTime, 'h:mm a')}</span>
                        {project && (
                          <span className="truncate ml-2">{project.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    return (
      <div>
        <div className="grid grid-cols-7 text-center py-2 border-b">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`py-2 ${isToday(day) ? 'bg-blue-50 font-bold' : ''}`}
            >
              <div className="text-sm">{format(day, 'EEE')}</div>
              <div className={isToday(day) ? 'text-blue-600' : ''}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        <div className="border rounded-lg overflow-y-auto mt-4" style={{ height: '600px' }}>
          <div className="grid grid-cols-7 h-full">
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`border-r last:border-r-0 ${isToday(day) ? 'bg-blue-50' : ''}`}
              >
                {/* Time slots */}
                <div className="relative h-full">
                  {Array.from({ length: workHours.end - workHours.start }, (_, hourIndex) => {
                    const hour = hourIndex + workHours.start;
                    return (
                      <div
                        key={hour}
                        className="h-16 border-b last:border-b-0"
                        onClick={() => {
                          const clickTime = new Date(day);
                          clickTime.setHours(hour, 0, 0, 0);
                          onTimeSlotClick(clickTime);
                        }}
                      >
                        {hourIndex === 0 && (
                          <div className="text-xs text-gray-500 pl-1">{format(new Date().setHours(hour), 'ha')}</div>
                        )}
                      </div>
                    );
                  })}

                  {/* Blocks for this day */}
                  <div className="absolute top-0 left-0 right-0">
                    {getBlocksForDay(day).map(block => {
                      const startHour = getHours(block.startTime);
                      const startMinute = getMinutes(block.startTime);
                      const topPosition = ((startHour - workHours.start) * 60 + startMinute) / 15 * 16;

                      return (
                        <div
                          key={`${day.toISOString()}-${block.id}`}
                          className={`absolute w-full px-1 rounded border-l-4 ${TIME_BLOCK_COLORS[block.colorKey]} cursor-pointer hover:opacity-90 transition-opacity mx-1`}
                          style={{
                            top: `${topPosition}px`,
                            height: getBlockHeight(block),
                            left: '0',
                          }}
                          onClick={() => onBlockClick(block)}
                        >
                          <div className="p-1 overflow-hidden">
                            <div className="font-medium truncate text-xs">{block.title}</div>
                            <div className="text-xs">{format(block.startTime, 'h:mm')}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    return (
      <div>
        <div className="text-center py-2 font-medium">
          {format(selectedDate, 'MMMM yyyy')}
        </div>

        <div className="border rounded-lg overflow-hidden mt-4" style={{ minHeight: '600px' }}>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center font-medium bg-gray-50 border-b">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 h-full auto-rows-fr">
            {calendarWeeks.map((week, weekIndex) => (
              week.map((day: Date, dayIndex: number) => {
                const dayBlocks = getBlocksForDay(day);
                const isCurrentMonth = isSameMonth(day, selectedDate);

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`border-r border-b last:border-r-0 p-1 min-h-[100px] 
                      ${isToday(day) ? 'bg-blue-50' : ''} 
                      ${!isCurrentMonth ? 'text-gray-400 bg-gray-50/50' : ''}
                    `}
                    onClick={() => {
                      // When clicking an empty area, create a block at 9 AM for that day
                      const clickTime = new Date(day);
                      clickTime.setHours(9, 0, 0, 0);
                      onTimeSlotClick(clickTime);
                    }}
                  >
                    <div className="font-medium text-right mb-1">
                      {getDate(day)}
                    </div>

                    {/* Day's blocks (up to 3, then +N more) */}
                    <div className="space-y-1">
                      {dayBlocks.slice(0, 3).map(block => (
                        <div
                          key={`month-${day.toISOString()}-${block.id}`}
                          className={`rounded px-1 py-0.5 text-xs truncate border-l-2 ${TIME_BLOCK_COLORS[block.colorKey]} cursor-pointer hover:opacity-90`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBlockClick(block);
                          }}
                        >
                          {format(block.startTime, 'h:mm')} {block.title}
                        </div>
                      ))}

                      {dayBlocks.length > 3 && (
                        <div className="text-xs font-medium text-blue-600">
                          +{dayBlocks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm border-muted overflow-hidden w-full">
      <div className="p-4">
        {selectedView === 'day' ? renderDayView() :
          selectedView === 'week' ? renderWeekView() :
            renderMonthView()}
      </div>
    </Card>
  );
}; 