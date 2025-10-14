import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TacoRatingProps {
  rating: number;
  reviewUrl: string;
}

const TacoRating: React.FC<TacoRatingProps> = ({ rating, reviewUrl }) => {
  const [hover, setHover] = useState(0);

  return (
    <Link href={reviewUrl} target="_blank" rel="noopener noreferrer">
      <div className="bg-amber-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 mt-2">
        <div className="flex flex-col items-center cursor-pointer transition-opacity duration-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">Show some Love? ❤️</h3>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <div 
                key={star} 
                className="w-10 h-10 mx-1"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <div className={`transition-all duration-200 ${star <= (hover || rating) ? '' : 'grayscale opacity-50'}`}>
                  <Image
                    src="/tacos-appsumo-black.png"
                    alt={`Taco ${star}`}
                    width={40}
                    height={40}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TacoRating;