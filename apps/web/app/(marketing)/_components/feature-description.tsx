import Image from "next/image";
import React from "react";

interface FeatureProps {
  featureName: string;
  featureDescription: string;
  imageLink: string;
  formatImage: 'left' | 'right';
}

const Feature: React.FC<FeatureProps> = ({ featureName, featureDescription, imageLink, formatImage }) => {
  const isImageLeft = formatImage === 'left';

  return (
    <div className="flex flex-col items-center justify-center my-4 m-5">
      <div className={`flex flex-col md:flex-row m-3 w-full items-center ${isImageLeft ? 'md:flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <Image src={imageLink} height={500} width={500} alt={featureName} className="m-2" />
        </div>
        <div className="mx-4 text-gray-600 overflow-hidden">
        <h3 className="text-2xl font-semibold mb-2 text-center">{featureName}</h3>
          <p className="max-w-xs md:max-w-md text-center md:text-left text-s">{featureDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default Feature;
