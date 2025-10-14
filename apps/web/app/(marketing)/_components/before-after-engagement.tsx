import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';

// Types
interface Emotion {
  emoji: string;
  label: string;
}

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow';
  x: number;
  y: number;
}

// Constants
const EMOTIONS: Emotion[] = [
  { emoji: '😔', label: 'sad' },
  { emoji: '😤', label: 'frustrated' },
  { emoji: '😫', label: 'tired' },
  { emoji: '😩', label: 'exhausted' },
  { emoji: '🤔', label: 'confused' },
] as const;

const HAPPY_EMOTIONS: Emotion[] = [
  { emoji: '🥰', label: 'loving' },
  { emoji: '😊', label: 'happy' },
  { emoji: '🤩', label: 'excited' },
  { emoji: '😎', label: 'cool' },
] as const;

// Animation variants
const notificationAnimationVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: [0, 1, 0],
    scale: [0, 1, 0.8],
    transition: { duration: 1.2, ease: "easeOut" }
  },
};

const emojiAnimationVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: 0.3
    }
  }
};

// Component for notification icons
const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (type) {
    case 'like':
      return <Heart {...iconProps} className="text-red-500" />;
    case 'comment':
      return <MessageCircle {...iconProps} className="text-blue-500" />;
    case 'follow':
      return <UserPlus {...iconProps} className="text-green-500" />;
  }
};

const BeforeAfterEngagement: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState(0);
  const [currentHappyEmotion, setCurrentHappyEmotion] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const createRandomNotification = (): Notification => ({
      id: Date.now(),
      type: ['like', 'comment', 'follow'][Math.floor(Math.random() * 3)] as Notification['type'],
      x: Math.random() * 80 - 40,  // -40 to 40
      y: Math.random() * -80 - 20, // -100 to -20
    });

    const notificationInterval = setInterval(() => {
      setNotifications(prev => [createRandomNotification(), ...prev.slice(0, 15)]);
    }, 600);

    const emotionInterval = setInterval(() => {
      setCurrentEmotion(prev => (prev + 1) % EMOTIONS.length);
      setCurrentHappyEmotion(prev => (prev + 1) % HAPPY_EMOTIONS.length);
    }, 4000);

    return () => {
      clearInterval(notificationInterval);
      clearInterval(emotionInterval);
    };
  }, [isVisible]);

  return (
    <div className="w-full py-12">
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center justify-center px-4">
          <div className="flex items-center justify-center space-x-16">
            {/* Manual Mode */}
            <motion.div 
              className="flex flex-col items-center"
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
            >
              <div className="relative rounded-full p-3 w-14 h-14 flex items-center justify-center bg-gray-50">
                <motion.span 
                  key={currentEmotion}
                  variants={emojiAnimationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-2xl"
                >
                  {EMOTIONS[currentEmotion].emoji}
                </motion.span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-200 rounded-full" />
                <div className="absolute -top-1 -right-1 text-[10px] text-gray-500">2</div>
              </div>
              <div className="text-sm font-medium text-gray-500 mt-2">Manual</div>
            </motion.div>

            {/* Transition Arrow */}
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="relative h-[2px] w-24 bg-gradient-to-r from-gray-200 to-[#33dfa0]"
              >
                <div className="absolute -right-2 -top-[4px] w-0 h-0 
                  border-t-[4px] border-t-transparent
                  border-l-[8px] border-l-[#33dfa0]
                  border-b-[4px] border-b-transparent" />
              </motion.div>
            </div>

            {/* Olly Mode */}
            <motion.div 
              className="flex flex-col items-center"
              onViewportEnter={() => setIsVisible(true)}
            >
              <div className="relative">
                <div className="relative bg-gray-50 rounded-full p-3 w-14 h-14 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isVisible && Math.random() > 0.8 ? (
                      <motion.span 
                        key={currentHappyEmotion}
                        variants={emojiAnimationVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-2xl"
                      >
                        {HAPPY_EMOTIONS[currentHappyEmotion].emoji}
                      </motion.span>
                    ) : (
                      <Image
                        src="/icon-2.png"
                        alt="Olly Icon"
                        width={32}
                        height={32}
                        className="opacity-90"
                        priority
                      />
                    )}
                  </AnimatePresence>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#33dfa0] rounded-full animate-ping opacity-75" />
                  <div className="absolute -top-1 -right-1 text-[10px] font-medium text-[#33dfa0]">99+</div>
                </div>

                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      variants={notificationAnimationVariants}
                      initial="initial"
                      animate={{
                        ...notificationAnimationVariants.animate,
                        x: notification.x,
                        y: notification.y
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <NotificationIcon type={notification.type} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="text-sm font-medium text-[#33dfa0] mt-2">Olly</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterEngagement;