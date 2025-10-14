import React from "react";
import Feature from './feature-description';
import featuresData from './feature-data';

const Heroes: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-4xl font-bold mb-4 text-center my-8">Features</h2>
      {featuresData.map((feature, index) => (
        <Feature key={index} {...feature} />
      ))}
    </div>
  );
};

export default Heroes;
