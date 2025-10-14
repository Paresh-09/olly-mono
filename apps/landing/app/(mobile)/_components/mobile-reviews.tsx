// app/components/olly-reviews.tsx
import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface ReviewProps {
  body: string;
  name: string;
  handle?: string;
  className?: string;
}

const StarRating = () => {
  return (
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i}
          size={18}
          className="fill-yellow-400 text-yellow-400"
        />
      ))}
    </div>
  );
};

const Review = ({ body, name, handle, className = "" }: ReviewProps) => {
  return (
    <div className={`w-full md:w-1/2 lg:w-1/3 p-4 ${className}`}>
      <div className="h-full p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
        <StarRating />
        <p className="text-gray-600 font-cal mb-4 text-lg leading-relaxed">
          {body}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#16825E] to-[#127A57] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-cal text-gray-900 font-medium">{name}</p>
            {handle && (
              <p className="text-gray-500 text-sm">{handle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileReviews = () => {
  const reviews = [
    {
      body: "Best Deal and on Great price: I recently tried out Olly, and I must say I was pleasantly surprised by the experience. Olly offers some of the best features at great prices, which are truly great. I found exactly what I was looking for at a fantastic price, and I absolutely loved it. Overall, a great tool.",
      name: "AppSumo User",
      handle: "@106812663271318157415"
    },
    {
      body: "Congratulations on the launch. Just got myself a lifetime subscription. Its helping me summarise the post better for now, whereas i am keeping my own views.",
      name: "Aman Sharma",
      handle: "@amanintech"
    },
    {
      body: "Congratulations on the launch! This tool could be a gamechanger for any SMM agency or any business looking to boost their engagement with users/audience online without having to allocate limited time and resources to it.",
      name: "Roberto Perez",
      handle: "@rockyperezz"
    },
    {
      body: "Love the pay what you use business model, as a user. Not sure how scalable that will turn out to be from a business perspective ... but that's not my problem I guess! Great work team, hope you make it to the top",
      name: "Florian Myter",
      handle: "@florian_myter"
    },
    {
      body: "Best for LinkedIn: Right from the first comment that Olly crafted, I knew I would be using it for all of my socials. I especially love how it writes on LinkedIn.",
      name: "AppSumo User",
      handle: "@jazzyb9090"
    },
    {
      body: "Congratulations, @goyashy! The virality score feature caught my eye. I envision this tool as a valuable resource to enhance the quality of written posts, making it essential for content creators.",
      name: "Chirag",
      handle: "@chiragshelar"
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-cal text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            What People Are Saying
          </h2>
          <p className="text-xl text-emerald-600 font-medium">
            Loved by 1000+ users
          </p>
        </div>
        
        <div className="flex flex-wrap -m-4">
          {reviews.map((review, index) => (
            <Review
              key={index}
              body={review.body}
              name={review.name}
              handle={review.handle}
              className={index >= 4 ? "hidden md:block" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MobileReviews;