import React from "react";
import { AlertCircle } from "lucide-react";

interface InteractionLimitBarProps {
  current: number;
  max: number;
  type: "likes" | "comments";
  available: number;
}

const InteractionLimitBar: React.FC<InteractionLimitBarProps> = ({
  current,
  max,
  type,
  available,
}) => {
  // Calculate percentage
  const percentage = Math.min((current / max) * 100, 100);

  // Determine color based on usage
  const getColor = () => {
    if (percentage <= 33) return "bg-green-500";
    if (percentage <= 66) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium">
          {type === "likes" ? "Likes" : "Comments"}
        </span>
        <span
          className={`${percentage >= 100 ? "text-red-600 font-medium" : "text-gray-500"}`}
        >
          {current} / {max}
        </span>
      </div>

      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <span
          className={
            percentage >= 100
              ? "text-red-600 flex items-center"
              : "text-gray-500"
          }
        >
          {available <= 0 ? (
            <span className="flex items-center text-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Limit reached
            </span>
          ) : (
            <span>
              {available} {type === "likes" ? "likes" : "comments"} available
            </span>
          )}
        </span>
        <span className="text-gray-400">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default InteractionLimitBar;
