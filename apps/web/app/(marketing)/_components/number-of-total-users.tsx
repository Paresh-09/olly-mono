import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Star } from "lucide-react";

interface Maker {
  id: number;
  name: string;
  avatar: string;
}

interface MakerRatingProps {
  rating: number;
}

const categories = [
  "300+ Creators",
  "43+ Agencies",
  "125+ Founders",
  "92+ SMMs",
  "600+ Humans"
];

const makers: Maker[] = [
  { id: 1, name: "User 1", avatar: "/appsumo-users/1.webp" },
  { id: 2, name: "User 2", avatar: "/appsumo-users/6.png" },
  { id: 3, name: "User 3", avatar: "/appsumo-users/3.webp" },
  { id: 4, name: "User 4", avatar: "/appsumo-users/4.webp" },
  { id: 5, name: "User 5", avatar: "/appsumo-users/5.webp" },
];

const MakerRating: React.FC<MakerRatingProps> = ({ rating }) => {
  const [currentCategory, setCurrentCategory] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategory((prev) => (prev + 1) % categories.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm max-w-md">
      <div className="flex -space-x-3">
        {makers.map((maker) => (
          <Avatar 
            key={maker.id} 
            className="w-10 h-10 border-2 border-white ring-1 ring-gray-200 shadow-sm"
          >
            <AvatarImage src={maker.avatar} alt={maker.name} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">{maker.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill={i < rating ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-start text-gray-500 transition-all duration-300 ease-in-out">
          {categories[currentCategory]}
        </p>
        {/* <p className="text-lg font-bold text-gray-800">Growing Faster.</p> */}
      </div>
    </div>
  );
};

export default MakerRating;
