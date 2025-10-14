'use client';

import { motion, LayoutGroup } from 'framer-motion';
import { TextRotate } from './rotate-text';

export const AnimatedHeroText = () => {
  return (
    <LayoutGroup>
      <div className="flex flex-col md:flex-row md:gap-2 items-center">
        <motion.span
          layout
          className="flex whitespace-pre"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TextRotate
            texts={["Leads", "Sales", "Followers", "Reach"]}
            mainClassName="overflow-hidden text-teal-600 py-0 pb-2 md:pb-4 rounded-xl"
            staggerDuration={0.01}
            staggerFrom="last"
            rotationInterval={1500}
            transition={{
              type: "spring",
              damping: 35,
              stiffness: 500,
              duration: 0.2
            }}
          />
        </motion.span>
        <span className="md:ml-2">in days.</span>
      </div>
    </LayoutGroup>
  );
};
