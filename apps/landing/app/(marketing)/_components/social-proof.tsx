import { ChromeIcon, Star, User } from 'lucide-react';
import React from 'react';

const SocialProof = () => {
  return (
    <div className='flex flex-row items-center'>
        <p>100+ <span className="inline-block"><ChromeIcon /></span></p>
        <p>13 <span className="inline-block"><User /></span></p>
        <p>5 <span className="inline-block"><Star /></span></p>
    </div>
  );
}

export default SocialProof;
