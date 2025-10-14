import Image from "next/image";
import React from "react";

interface HowToUseProps {
  featureName: string;
  featureDescription: string;
  imageLink: string;
  formatImage: 'left' | 'right';
}

const HowToUse: React.FC<HowToUseProps> = ({ featureName, featureDescription, imageLink, formatImage }) => {
  const isImageLeft = formatImage === 'left';

  // Function to render feature description with possible URLs
  const renderFeatureDescription = (description: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return description.split(urlRegex).map((part, index) => 
        urlRegex.test(part) ? <a key={index} href={part} className="text-blue-600 break-all">{part}</a> : part
      );
    };
  

  return (
    <div className="flex justify-center items-center bg-white p-4">
      <div className="flex flex-col items-center justify-center my-4 mx-5">

        <div className="w-full my-2">
          <hr className="border-t border-gray-300" />
        </div>

        <div className="text-center mb-6 w-full">
          <h3 className="text-2xl font-semibold my-2">{featureName}</h3>
          <p className="text-sm text-gray-600 break-words">{renderFeatureDescription(featureDescription)}</p>
        </div>

        <div className={`flex ${isImageLeft ? 'flex-row-reverse' : 'flex-row'} items-center justify-center my-3 w-full`}>
          <div className="relative w-full max-w-xs md:max-w-xl max-h-96 overflow-auto">
            <Image src={imageLink} height={500} width={500} alt={featureName} layout="responsive" className="m-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;
