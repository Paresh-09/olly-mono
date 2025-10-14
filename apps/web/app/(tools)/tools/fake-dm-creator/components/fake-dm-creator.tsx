'use client'

import React, { useState, useRef, useEffect } from 'react';


// Add CSS animations
const animationStyles = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

// Inject styles into document head safely
if (typeof document !== 'undefined') {
  try {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = animationStyles;
    styleSheet.id = 'fake-dm-animations';
    
    // Avoid duplicate style injection
    const existingStyle = document.getElementById('fake-dm-animations');
    if (!existingStyle) {
      document.head.appendChild(styleSheet);
    }
  } catch (error) {
    console.warn('Failed to inject animation styles:', error);
  }
}
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaTelegram, 
  FaDiscord, 
  FaSnapchat, 
  FaTwitter, 
  FaFacebookMessenger, 
  FaSlack,
  FaArrowLeft,
  FaPhone,
  FaVideo,
  FaInfoCircle,
  FaSearch,
  FaEllipsisV,
  FaMicrophone,
  FaPaperPlane,
  FaPlus,
  FaHeart,
  FaCamera,
  FaSmile,
  FaCheck,
  FaDownload
} from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import { BsEmojiSmile, BsThreeDotsVertical } from 'react-icons/bs';
import { MdAttachFile } from 'react-icons/md';

const PLATFORMS = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: FaInstagram, 
    color: '#E4405F',
    bgColor: '#000000',
    lightBg: '#262626',
    textColor: '#ffffff'
  },
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    icon: FaWhatsapp, 
    color: '#25D366',
    bgColor: '#0b141a',
    lightBg: '#202c33',
    textColor: '#e9edef'
  },
  { 
    id: 'imessage', 
    name: 'iMessage', 
    icon: IoMdSend, 
    color: '#007AFF',
    bgColor: '#000000',
    lightBg: '#1c1c1e',
    textColor: '#ffffff'
  },
  { 
    id: 'telegram', 
    name: 'Telegram', 
    icon: FaTelegram, 
    color: '#0088CC',
    bgColor: '#17212b',
    lightBg: '#2b5278',
    textColor: '#ffffff'
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: FaDiscord, 
    color: '#5865F2',
    bgColor: '#36393f',
    lightBg: '#2f3136',
    textColor: '#dcddde'
  },
  { 
    id: 'snapchat', 
    name: 'Snapchat', 
    icon: FaSnapchat, 
    color: '#FFFC00',
    bgColor: '#ffffff',
    lightBg: '#f7f7f7',
    textColor: '#000000'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: FaTwitter,
    color: '#1DA1F2',
    bgColor: '#000000',
    lightBg: '#16181C',
    textColor: '#ffffff'
  },
  {
    id: 'facebook messenger',
    name: 'Messenger',  
    icon: FaFacebookMessenger,
    color: '#1877F2',
    bgColor: '#ffffff',
    lightBg: '#f0f2f5',
    textColor: '#000000'
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: FaSlack,
    color: '#4A154B',
    bgColor: '#ffffff',
    lightBg: '#f8f8f8',
    textColor: '#000000'
  }
];

interface Message {
  id: number;
  sender: 'sender' | 'receiver';
  text: string;
  timestamp: string;
  avatar?: string;
}

interface ChatComponentProps {
  messages: Message[];
  senderName: string;
  receiverName: string;
  senderAvatar: string;
  receiverAvatar: string;
}

const InstagramDM = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto bg-black text-white rounded-[28px] overflow-hidden shadow-2xl">
      {/* Status bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-1 text-white">
        <span className="text-sm font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
          <div className="w-1 h-3 bg-white rounded-sm"></div>
          <div className="w-6 h-3 bg-white rounded-sm border border-white"></div>
        </div>
      </div>
    
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <button className="text-white">
          <FaArrowLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <img
            src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=E4405F&color=fff`}
            alt={receiverName}
            className="w-9 h-9 rounded-full border-2 border-pink-500"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-sm">{receiverName}</h3>
          </div>
          <p className="text-xs text-gray-400">YESTERDAY 4:18 PM</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-white">
          <FaPhone className="w-5 h-5" />
        </button>
        <button className="text-white">
          <FaVideo className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 space-y-2">
      {messages.map((msg: Message, index: number) => {
        const showAvatar = msg.sender === 'receiver' && (index === 0 || messages[index - 1].sender !== 'receiver');
        return (
          <div key={msg.id} className={`flex ${msg.sender === 'sender' ? 'justify-end' : 'justify-start'} items-end gap-2 animate-[slideUp_0.3s_ease-out]`}>
            {msg.sender === 'receiver' && showAvatar && (
              <img
                src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=E4405F&color=fff`}
                alt={receiverName}
                className="w-7 h-7 rounded-full self-end animate-[pulse_2s_infinite]"
              />
            )}
            {msg.sender === 'receiver' && !showAvatar && <div className="w-7 self-end"></div>}
            
            <div className={`px-4 py-2 max-w-[75%] transition-all duration-200 hover:scale-105 ${
              msg.sender === 'sender' 
                ? 'bg-gradient-to-r from-[#405de6] to-[#5851db] text-white rounded-[18px] rounded-br-[6px]'
                : 'bg-[#262626] text-white rounded-[18px] rounded-bl-[6px]'
            }`}>
              <p className="text-sm break-words leading-5">{msg.text}</p>
            </div>
            
            {msg.sender === 'sender' && (
              <img
                src={senderAvatar || `https://ui-avatars.com/api/?name=${senderName}&background=405de6&color=fff`}
                alt={senderName}
                className="w-7 h-7 rounded-full self-end animate-[pulse_2s_infinite]"
              />
            )}
          </div>
        );
      })}
      
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start items-end gap-2 animate-[slideUp_0.3s_ease-out]">
          <img
            src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=E4405F&color=fff`}
            alt={receiverName}
            className="w-7 h-7 rounded-full self-end"
          />
          <div className="px-4 py-2 bg-[#262626] text-white rounded-[18px] rounded-bl-[6px]">
            <div className="flex space-x-1 items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.5s_infinite_0ms]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.5s_infinite_150ms]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.5s_infinite_300ms]"></div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Input */}
    <div className="px-4 py-3 bg-black border-t border-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button className="text-white transition-all duration-200 hover:scale-110 active:scale-95">
            <FaCamera className="w-6 h-6" />
          </button>
          <button className="text-white transition-all duration-200 hover:scale-110 active:scale-95">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V9h-3V7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
            </svg>
          </button>
          <button className="text-white transition-all duration-200 hover:scale-110 active:scale-95">
            <FaMicrophone className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 bg-[#262626] rounded-full px-4 py-2 transition-all duration-200 focus-within:bg-[#333333]">
          <input
            type="text"
            placeholder="Message..."
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="text-white transition-all duration-200 hover:scale-110 active:scale-95">
            <BsEmojiSmile className="w-6 h-6" />
          </button>
          <button className="text-pink-500 transition-all duration-200 hover:scale-110 active:scale-95 animate-[pulse_2s_infinite]">
            <FaHeart className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

const WhatsAppChat = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [showCheckmarks, setShowCheckmarks] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowCheckmarks(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto bg-[#0b141a] text-white rounded-[28px] overflow-hidden shadow-2xl">
    {/* Status bar */}
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-white">
      <span className="text-sm font-medium">9:41</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
        <div className="w-1 h-3 bg-white rounded-sm"></div>
        <div className="w-6 h-3 bg-white rounded-sm border border-white"></div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#202c33]">
      <div className="flex items-center gap-3">
        <button className="text-[#8696a0]">
          <FaArrowLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <img
            src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=25D366&color=fff`}
            alt={receiverName}
            className="w-9 h-9 rounded-full"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#25d366] border-2 border-[#202c33] rounded-full"></div>
        </div>
        <div>
          <h3 className="font-medium text-white text-sm">{receiverName}</h3>
          <p className="text-xs text-[#8696a0]">last seen today at 2:45 PM</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-[#8696a0]">
          <FaSearch className="w-5 h-5" />
        </button>
        <button className="text-[#8696a0]">
          <BsThreeDotsVertical className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 space-y-2" style={{backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"chat-bg\" x=\"0\" y=\"0\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"><circle cx=\"10\" cy=\"10\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.05\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23chat-bg)\"/></svg>')"}}>
      {messages.map((msg: Message, index: number) => (
        <div key={msg.id} className={`flex ${msg.sender === 'sender' ? 'justify-end' : 'justify-start'} animate-[slideUp_0.3s_ease-out] mb-1`} style={{
          animation: `slideUp 0.3s ease-out ${index * 0.1}s both`
        }}>
          <div className={`max-w-[75%] px-3 py-2 rounded-lg relative transition-all duration-200 hover:shadow-lg ${
            msg.sender === 'sender' 
              ? 'bg-[#005c4b] text-white hover:bg-[#00695c]' 
              : 'bg-[#202c33] text-white hover:bg-[#2a3942]'
          }`} style={{
            borderRadius: msg.sender === 'sender' ? '7.5px 7.5px 2px 7.5px' : '7.5px 7.5px 7.5px 2px'
          }}>
            <p className="text-sm break-words leading-5 mb-1">{msg.text}</p>
            <div className="flex items-center justify-end gap-1">
              <span className="text-xs text-[#8696a0] leading-3">{msg.timestamp}</span>
              {msg.sender === 'sender' && (
                <svg className={`w-4 h-4 text-[#53bdeb] transition-all duration-500 flex-shrink-0 ${showCheckmarks ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} fill="currentColor" viewBox="0 0 16 15">
                  <path d="m15.01 3.316-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l3.61 3.497c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.064-.512z"/>
                </svg>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Input */}
    <div className="px-3 py-2 bg-[#0b141a]">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-[#2a3942] rounded-full px-3 py-2 transition-all duration-200 focus-within:bg-[#3a4952]">
          <button className="text-[#8696a0] mr-3 transition-all duration-200 hover:text-[#25d366] hover:scale-110">
            <BsEmojiSmile className="w-6 h-6" />
          </button>
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 bg-transparent text-white placeholder-[#8696a0] outline-none text-sm"
          />
          <button className="text-[#8696a0] ml-3 transition-all duration-200 hover:text-[#25d366] hover:scale-110">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.586 10.461l-10.05-10.075c-.566-.566-1.485-.566-2.05 0l-2.12 2.12 2.827 2.827c.604-.216 1.293-.062 1.767.433a1.85 1.85 0 0 1 .433 1.767l2.721 2.721c.605-.216 1.293-.062 1.767.432.566.566.566 1.484 0 2.05-.566.566-1.484.566-2.05 0a1.85 1.85 0 0 1-.432-1.767L10.5 7.545V16.91c.139.069.271.156.391.276.566.566.566 1.484 0 2.05-.566.566-1.484.566-2.05 0-.566-.566-.566-1.484 0-2.05.119-.119.251-.206.391-.276V7.455a1.831 1.831 0 0 1-.391-.276c-.566-.566-.566-1.484 0-2.05L6.982 3.27l-4.301 4.301c-.566.566-.566 1.484 0 2.05l10.05 10.075c.566.566 1.485.566 2.05 0l10.05-10.075c.566-.566.566-1.484 0-2.05z"/>
            </svg>
          </button>
          <button className="text-[#8696a0] ml-2 transition-all duration-200 hover:text-[#25d366] hover:scale-110">
            <FaCamera className="w-5 h-5" />
          </button>
        </div>
        <button className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#00c976] active:scale-95 animate-[pulse_2s_infinite]">
          <FaMicrophone className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  </div>
);
};

const IMessageChat = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [showDelivered, setShowDelivered] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowDelivered(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
  <div className="w-full max-w-sm mx-auto bg-white text-black rounded-[28px] overflow-hidden shadow-2xl" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
    {/* Status bar */}
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-black">
      <span className="text-sm font-medium">9:41</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2 bg-black rounded-sm opacity-60"></div>
        <div className="w-1 h-3 bg-black rounded-sm"></div>
        <div className="w-6 h-3 bg-black rounded-sm border border-black"></div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button className="text-[#007aff]">
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg">
            👨
          </div>
          <div>
            <h3 className="font-semibold text-black text-sm">{receiverName}</h3>
            <p className="text-xs text-gray-500">{'>'}</p>
          </div>
        </div>
      </div>
      <button className="text-[#007aff]">
        <FaVideo className="w-5 h-5" />
      </button>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 space-y-3 bg-white">
      <div className="text-center text-gray-400 text-xs">Delivered</div>
      <div className="text-center text-gray-400 text-xs">Today 3:25 PM</div>
      
      {messages.map((msg: Message, index: number) => (
        <div key={msg.id} className={`flex ${msg.sender === 'sender' ? 'justify-end' : 'justify-start'} animate-[slideUp_0.3s_ease-out] mb-2`} style={{
          animationDelay: `${index * 0.15}s`,
          animationFillMode: 'both'
        }}>
          <div className={`max-w-[75%] px-4 py-3 rounded-[18px] transition-all duration-200 hover:scale-105 ${
            msg.sender === 'sender' 
              ? 'bg-[#007aff] text-white hover:bg-[#0051d3]' 
              : 'bg-[#e5e5ea] text-black hover:bg-[#d1d1d6]'
          }`}>
            <p className="text-[15px] break-words leading-5">{msg.text}</p>
          </div>
        </div>
      ))}
      
      <div className={`text-right text-xs text-gray-400 mt-4 transition-all duration-500 ${showDelivered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>Delivered Quietly</div>
      <div className="text-center text-gray-400 text-xs flex items-center justify-center gap-1 mt-2">
        🔇 {receiverName} has notifications silenced
      </div>
      <div className="text-center mt-2">
        <button className="text-[#007aff] text-xs">Notify Anyway</button>
      </div>
    </div>

    {/* Input */}
    <div className="p-3 border-t bg-gray-50">
      <div className="flex items-center bg-white rounded-full border border-gray-300 p-2">
        <button className="text-gray-400 mx-2 transition-all duration-200 hover:text-[#007aff] hover:scale-110">
          <FaCamera className="w-5 h-5" />
        </button>
        <div className="flex-1 px-2">
          <input 
            type="text"
            placeholder="iMessage"
            className="w-full bg-transparent text-black placeholder-gray-400 outline-none text-sm"
          />
        </div>
        <button className="text-gray-400 mx-2 transition-all duration-200 hover:text-[#007aff] hover:scale-110 animate-[pulse_2s_infinite]">
          <FaMicrophone className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-center mt-2 space-x-3">
        <div className="w-7 h-7 bg-green-500 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"></div>
        <div className="w-7 h-7 bg-blue-500 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"></div>
        <div className="w-7 h-7 bg-black rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"></div>
        <div className="w-7 h-7 bg-red-500 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"></div>
        <div className="w-7 h-7 bg-yellow-500 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"></div>
        <div className="w-7 h-7 bg-purple-500 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"></div>
        <div className="w-7 h-7 bg-pink-500 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"></div>
      </div>
    </div>
  </div>
  );
};

const TelegramChat = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [messageAnimations, setMessageAnimations] = useState<{ [key: number]: boolean }>({});
  
  useEffect(() => {
    messages.forEach((msg: Message, index: number) => {
      setTimeout(() => {
        setMessageAnimations(prev => ({ ...prev, [msg.id]: true }));
      }, index * 200);
    });
  }, [messages]);

  return (
  <div className="w-full max-w-sm mx-auto bg-[#dddbd1] text-black rounded-[28px] overflow-hidden shadow-2xl">
    {/* Status bar */}
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-black">
      <span className="text-sm font-medium">12:30</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2 bg-black rounded-sm opacity-60"></div>
        <div className="w-1 h-3 bg-black rounded-sm"></div>
        <div className="w-6 h-3 bg-black rounded-sm border border-black"></div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#517da2] text-white">
      <div className="flex items-center gap-3">
        <button className="text-white">
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
          👥
        </div>
        <div>
          <h3 className="font-medium text-white text-sm">Friends chat</h3>
          <p className="text-xs text-blue-100">7 members</p>
        </div>
      </div>
      <button className="text-white">
        <BsThreeDotsVertical className="w-5 h-5" />
      </button>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 space-y-3 bg-[#dddbd1]">
      {/* System message */}
      <div className="text-center">
        <div className="bg-[#517da2] text-white px-3 py-1 rounded-full text-xs inline-block">
          March 10
        </div>
      </div>

      {messages.map((msg: Message, index: number) => {
        const isAnimated = messageAnimations[msg.id];
        if (msg.sender === 'sender') {
          return (
            <div key={msg.id} className={`flex justify-end transition-all duration-300 mb-3 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-[#517da2] text-white rounded-lg px-3 py-2 max-w-[75%] shadow-sm transition-all duration-200 hover:bg-[#486b8a] hover:scale-105">
                <p className="text-sm break-words leading-5 mb-1">{msg.text}</p>
                <div className="text-right text-xs text-blue-100 leading-3">{msg.timestamp} ✓</div>
              </div>
            </div>
          );
        } else {
          return (
            <div key={msg.id} className={`flex items-start gap-2 transition-all duration-300 mb-3 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <img
                src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=e91e63&color=fff`}
                alt={receiverName}
                className="w-8 h-8 rounded-full flex-shrink-0 self-start animate-[pulse_2s_infinite]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#e91e63] leading-4">{receiverName}</span>
                  <span className="text-xs text-gray-500 leading-3">{msg.timestamp}</span>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:scale-105">
                  <p className="text-sm text-black break-words leading-5">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        }
      })}
    </div>

    {/* Input */}
    <div className="px-4 py-3 bg-[#dddbd1] border-t border-gray-300">
      <div className="flex items-center gap-2">
        <button className="text-gray-600 transition-all duration-200 hover:text-[#517da2] hover:scale-110">
          <BsEmojiSmile className="w-6 h-6" />
        </button>
        <div className="flex-1 bg-white rounded-full px-4 py-2 border border-gray-300">
          <input
            type="text"
            placeholder="Message"
            className="w-full bg-transparent text-black placeholder-gray-500 outline-none text-sm"
          />
        </div>
        <button className="text-[#517da2] transition-all duration-200 hover:scale-110 active:scale-95 animate-[pulse_2s_infinite]">
          <FaPlus className="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
  );
};

const DiscordChat = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
  <div className="w-full max-w-sm mx-auto bg-[#36393f] text-white rounded-[28px] overflow-hidden shadow-2xl">
    {/* Status bar */}
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-white">
      <span className="text-sm font-medium">9:41</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
        <div className="w-1 h-3 bg-white rounded-sm"></div>
        <div className="w-6 h-3 bg-white rounded-sm border border-white"></div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#313338]">
      <div className="flex items-center gap-3">
        <button className="text-white">
          <FaArrowLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <img
            src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=313338&color=fff`}
            alt={receiverName}
            className="w-10 h-10 rounded-full"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#313338] rounded-full"></div>
        </div>
        <div>
          <h3 className="font-medium text-white text-base">{receiverName}</h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-[#b5bac1]">Online</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-white">
          <FaPhone className="w-5 h-5" />
        </button>
        <button className="text-white">
          <FaVideo className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg: Message, index: number) => {
        const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;
        return (
          <div key={msg.id} className="flex gap-3 animate-[slideUp_0.3s_ease-out] mb-4" style={{
            animationDelay: `${index * 0.1}s`,
            animationFillMode: 'both'
          }}>
            <div className="flex-shrink-0">
              {showAvatar ? (
                <img
                  src={msg.sender === 'sender' 
                    ? (senderAvatar || `https://ui-avatars.com/api/?name=${senderName}&background=5865F2&color=fff`)
                    : (receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=5865F2&color=fff`)
                  }
                  alt={msg.sender === 'sender' ? senderName : receiverName}
                  className="w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 animate-[pulse_2s_infinite]"
                />
              ) : (
                <div className="w-10 h-5 flex items-center justify-start">
                  <span className="text-xs text-[#72767d] leading-3">{msg.timestamp}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {showAvatar && (
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-white leading-4">
                    {msg.sender === 'sender' ? senderName : receiverName}
                  </span>
                  <span className="text-xs text-[#72767d] leading-3">{msg.timestamp}</span>
                </div>
              )}
              <p className="text-sm text-[#dcddde] break-words leading-5 transition-all duration-200 hover:text-white">{msg.text}</p>
            </div>
          </div>
        );
      })}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-3 animate-[slideUp_0.3s_ease-out]">
          <img
            src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=5865F2&color=fff`}
            alt={receiverName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-white">{receiverName}</span>
              <span className="text-xs text-[#72767d]">is typing...</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#dcddde] rounded-full animate-[bounce_1.5s_infinite_0ms]"></div>
              <div className="w-2 h-2 bg-[#dcddde] rounded-full animate-[bounce_1.5s_infinite_150ms]"></div>
              <div className="w-2 h-2 bg-[#dcddde] rounded-full animate-[bounce_1.5s_infinite_300ms]"></div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Input */}
    <div className="p-4 bg-[#36393f]">
      <div className="flex items-center gap-3 bg-[#40444b] rounded-lg px-4 py-3">
        <button className="text-[#b9bbbe] transition-all duration-200 hover:text-[#5865F2] hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8.5 16L12 13.5 15.5 16 12 18.5 8.5 16z"/>
          </svg>
        </button>
        <input
          type="text"
          placeholder={`Message #${receiverName}`}
          className="flex-1 bg-transparent text-white placeholder-[#72767d] outline-none text-sm"
        />
        <button className="text-[#b9bbbe] transition-all duration-200 hover:text-[#5865F2] hover:scale-110 animate-[pulse_2s_infinite]">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
  );
};

const SnapchatChat = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [snapEffects, setSnapEffects] = useState<{ [key: number]: boolean }>({});
  
  useEffect(() => {
    messages.forEach((msg: Message, index: number) => {
      setTimeout(() => {
        setSnapEffects(prev => ({ ...prev, [msg.id]: true }));
      }, index * 300);
    });
  }, [messages]);

  return (
  <div className="w-full max-w-sm mx-auto bg-black text-white rounded-[28px] overflow-hidden shadow-2xl">
    {/* Status bar */}
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-white">
      <span className="text-sm font-medium">9:41</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
        <div className="w-1 h-3 bg-white rounded-sm"></div>
        <div className="w-6 h-3 bg-white rounded-sm border border-white"></div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800">
      <div className="flex items-center gap-3">
        <button className="text-white">
          <FaArrowLeft className="w-6 h-6" />
        </button>
        <img
          src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=00bfff&color=fff`}
          alt={receiverName}
          className="w-12 h-12 rounded-full border-4 border-[#00bfff]"
        />
        <div>
          <h3 className="font-bold text-white text-lg">{receiverName}</h3>
          <p className="text-xs text-gray-400">Pimpri, India • 12h</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
        </button>
        <button className="text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-black to-[#1a1a1a]">
      {messages.map((msg: Message, index: number) => {
        const showAvatar = msg.sender === 'receiver' && (index === 0 || messages[index - 1].sender !== 'receiver');
        const hasEffect = snapEffects[msg.id];
        return (
          <div key={msg.id} className={`flex ${msg.sender === 'sender' ? 'justify-end' : 'justify-start'} items-end gap-2 transition-all duration-500 ${hasEffect ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            {msg.sender === 'receiver' && showAvatar && (
              <img
                src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=FFFC00&color=000`}
                alt={receiverName}
                className="w-8 h-8 rounded-full border-2 border-[#fffc00] animate-[pulse_2s_infinite]"
              />
            )}
            {msg.sender === 'receiver' && !showAvatar && <div className="w-8"></div>}
            
            <div className="relative group">
              <div className={`px-4 py-2 text-sm max-w-[250px] transition-all duration-200 hover:scale-105 ${
                msg.sender === 'sender' 
                  ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] text-white rounded-[20px] rounded-br-[5px] hover:from-[#ff5252] hover:to-[#ff3838]' 
                  : 'bg-[#333333] text-white rounded-[20px] rounded-bl-[5px] border border-gray-600 hover:bg-[#404040]'
              }`}>
                <p className="break-words">{msg.text}</p>
              </div>
              
              {/* Snapchat-style timestamp on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black bg-opacity-80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                {msg.timestamp}
              </div>
            </div>
            
            {msg.sender === 'sender' && (
              <img
                src={senderAvatar || `https://ui-avatars.com/api/?name=${senderName}&background=ff6b6b&color=fff`}
                alt={senderName}
                className="w-8 h-8 rounded-full border-2 border-[#ff6b6b] animate-[pulse_2s_infinite]"
              />
            )}
          </div>
        );
      })}
    </div>

    {/* Input */}
    <div className="p-4 bg-black">
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center bg-[#333333] rounded-full px-4 py-3 border border-gray-600">
          <button className="text-[#fffc00] mr-3 transition-all duration-200 hover:scale-110 hover:rotate-12">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8.5 16L12 13.5 15.5 16 12 18.5 8.5 16z"/>
            </svg>
          </button>
          <input
            type="text"
            placeholder="Send a chat"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
          />
          <button className="text-[#fffc00] ml-3 transition-all duration-200 hover:scale-110 animate-[pulse_2s_infinite]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            </svg>
          </button>
        </div>
        <button className="w-12 h-12 bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 hover:from-[#ff5252] hover:to-[#ff3838]">
          <FaPaperPlane className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  </div>
  );
};

const TwitterDMChat = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [tweetEffects, setTweetEffects] = useState<{ [key: number]: boolean }>({});
  
  useEffect(() => {
    messages.forEach((msg: Message, index: number) => {
      setTimeout(() => {
        setTweetEffects(prev => ({ ...prev, [msg.id]: true }));
      }, index * 200);
    });
  }, [messages]);

  return (
  <div className="w-full max-w-sm mx-auto bg-black text-white rounded-[28px] overflow-hidden shadow-2xl">
    {/* Status bar */}
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-white">
      <span className="text-sm font-medium">9:41</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
        <div className="w-1 h-3 bg-white rounded-sm"></div>
        <div className="w-6 h-3 bg-white rounded-sm border border-white"></div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-black">
      <div className="flex items-center gap-3">
        <button className="text-white">
          <FaArrowLeft className="w-6 h-6" />
        </button>
        <img
          src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=1da1f2&color=fff`}
          alt={receiverName}
          className="w-10 h-10 rounded-full"
        />
        <h3 className="font-medium text-white text-lg">{receiverName}</h3>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-white">
          <FaCamera className="w-6 h-6" />
        </button>
        <button className="text-white">
          <FaPhone className="w-6 h-6" />
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 bg-black">
      {/* Date separator */}
      <div className="text-center mb-6">
        <span className="text-gray-500 text-sm font-medium">Today</span>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {messages.map((msg: Message, index: number) => {
          const hasEffect = tweetEffects[msg.id];
          return (
            <div key={msg.id} className={`flex ${msg.sender === 'sender' ? 'justify-end' : 'justify-start'} transition-all duration-300 ${hasEffect ? 'opacity-100 translate-x-0' : msg.sender === 'sender' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8'}`}>
              <div className="max-w-[80%]">
                <div className={`px-4 py-2 text-sm transition-all duration-200 hover:scale-105 ${
                  msg.sender === 'sender' 
                    ? 'bg-[#1d9bf0] text-white rounded-[18px] rounded-br-[4px] hover:bg-[#1a8cd8]' 
                    : 'bg-[#16181c] text-white rounded-[18px] rounded-bl-[4px] border border-gray-700 hover:bg-[#1e202a]'
                }`}>
                  <p className="break-words">{msg.text}</p>
                </div>
                
                {/* Timestamp and status */}
                <div className={`flex items-center mt-1 gap-1 ${msg.sender === 'sender' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  {msg.sender === 'sender' && (
                    <span className="text-xs text-gray-500">• Sent</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Input */}
    <div className="p-4 bg-black">
      <div className="flex items-center gap-3 bg-[#16181c] rounded-full px-4 py-3 border border-gray-700">
        <button className="text-gray-400 transition-all duration-200 hover:text-[#1d9bf0] hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V9h-3V7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
          </svg>
        </button>
        <button className="text-gray-400 transition-all duration-200 hover:text-[#1d9bf0] hover:scale-110">
          <span className="text-lg font-bold">GIF</span>
        </button>
        <input
          type="text"
          placeholder=""
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm py-1"
        />
        <button className="w-8 h-8 bg-[#1d9bf0] rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#1a8cd8] hover:scale-110 active:scale-95 animate-[pulse_2s_infinite]">
          <FaPaperPlane className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  </div>
  );
};

const FacebookMessengerChat = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [messengerEffects, setMessengerEffects] = useState<{ [key: number]: boolean }>({});
  
  useEffect(() => {
    messages.forEach((msg: Message, index: number) => {
      setTimeout(() => {
        setMessengerEffects(prev => ({ ...prev, [msg.id]: true }));
      }, index * 150);
    });
  }, [messages]);

  return (
  <div className="w-full max-w-sm mx-auto bg-white text-black rounded-[28px] overflow-hidden shadow-2xl border-4 border-[#1877F2]">
    {/* Status bar */}
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-black">
      <span className="text-sm font-medium">9:41</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2 bg-black rounded-sm opacity-60"></div>
        <div className="w-1 h-3 bg-black rounded-sm"></div>
        <div className="w-6 h-3 bg-black rounded-sm border border-black"></div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#1877F2] text-white">
      <div className="flex items-center gap-3">
        <button className="text-white">
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <img
          src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=1877F2&color=fff`}
          alt={receiverName}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <h3 className="font-medium text-white text-sm">{receiverName}</h3>
          <p className="text-xs text-blue-100">Active now</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-white">
          <FaPhone className="w-5 h-5" />
        </button>
        <button className="text-white">
          <FaVideo className="w-5 h-5" />
        </button>
        <button className="text-white">
          <FaInfoCircle className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 space-y-2 bg-white">
      
      {messages.map((msg: Message, index: number) => {
        const showAvatar = msg.sender === 'receiver' && (index === 0 || messages[index - 1].sender !== 'receiver');
        const hasEffect = messengerEffects[msg.id];
        return (
          <div key={msg.id} className={`flex ${msg.sender === 'sender' ? 'justify-end' : 'justify-start'} items-end gap-1 transition-all duration-400 ${hasEffect ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            {msg.sender === 'receiver' && showAvatar && (
              <img
                src={receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=1877F2&color=fff`}
                alt={receiverName}
                className="w-7 h-7 rounded-full animate-[pulse_2s_infinite]"
              />
            )}
            {msg.sender === 'receiver' && !showAvatar && <div className="w-7"></div>}
            
            <div className={`max-w-[75%] px-3 py-2 text-sm transition-all duration-200 hover:scale-105 ${
              msg.sender === 'sender' 
                ? 'bg-[#1877F2] text-white rounded-[18px] rounded-br-[4px] hover:bg-[#166fe5]' 
                : 'bg-[#e4e6ea] text-black rounded-[18px] rounded-bl-[4px] hover:bg-[#d9dbde]'
            }`}>
              <p className="break-words">{msg.text}</p>
            </div>
          </div>
        );
      })}
    </div>

    {/* Input */}
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#166fe5] hover:scale-110 active:scale-95">
            <FaPlus className="w-4 h-4 text-white" />
          </button>
          <button className="text-[#1877F2] transition-all duration-200 hover:scale-110">
            <FaCamera className="w-6 h-6" />
          </button>
          <button className="text-[#1877F2] transition-all duration-200 hover:scale-110">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V9h-3V7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
            </svg>
          </button>
          <button className="text-[#1877F2] transition-all duration-200 hover:scale-110 animate-[pulse_2s_infinite]">
            <FaMicrophone className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Aa"
            className="w-full bg-transparent text-black placeholder-gray-500 outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[#1877F2] transition-all duration-200 hover:scale-110">
            <BsEmojiSmile className="w-6 h-6" />
          </button>
          <button className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#166fe5] hover:scale-110 active:scale-95 animate-[pulse_2s_infinite]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

const SlackChat = ({ messages, senderName, receiverName, senderAvatar, receiverAvatar }: ChatComponentProps) => {
  const [slackAnimations, setSlackAnimations] = useState<{ [key: number]: boolean }>({});
  
  useEffect(() => {
    messages.forEach((msg: Message, index: number) => {
      setTimeout(() => {
        setSlackAnimations(prev => ({ ...prev, [msg.id]: true }));
      }, index * 100);
    });
  }, [messages]);

  return (
  <div className="w-full max-w-sm mx-auto bg-white text-black rounded-[28px] overflow-hidden shadow-2xl">
    {/* Status bar */}
    <div className="flex justify-between items-center px-6 pt-3 pb-1 text-black">
      <span className="text-sm font-medium">3:48 PM</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-2 bg-black rounded-sm opacity-60"></div>
        <div className="w-1 h-3 bg-black rounded-sm"></div>
        <div className="w-6 h-3 bg-black rounded-sm border border-black"></div>
      </div>
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">#</span>
        </div>
        <h3 className="font-medium text-[#1d1c1d] text-base">culture</h3>
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-600">
          <FaSearch className="w-5 h-5" />
        </button>
        <button className="text-gray-600">
          <BsThreeDotsVertical className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Messages */}
    <div className="h-[600px] overflow-y-auto px-4 py-4 space-y-4 bg-white">
      {messages.map((msg: Message, index: number) => {
        const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;
        const isAnimated = slackAnimations[msg.id];
        return (
          <div key={msg.id} className={`flex gap-3 transition-all duration-300 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="flex-shrink-0">
              {showAvatar ? (
                <img
                  src={msg.sender === 'sender' 
                    ? (senderAvatar || `https://ui-avatars.com/api/?name=${senderName}&background=4A154B&color=fff`)
                    : (receiverAvatar || `https://ui-avatars.com/api/?name=${receiverName}&background=4A154B&color=fff`)
                  }
                  alt={msg.sender === 'sender' ? senderName : receiverName}
                  className="w-9 h-9 rounded-lg transition-all duration-200 hover:scale-110 animate-[pulse_2s_infinite]"
                />
              ) : (
                <div className="w-9 h-5 flex items-center justify-center">
                  <span className="text-xs text-[#616061]">{msg.timestamp}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {showAvatar && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[#1d1c1d]">
                    {msg.sender === 'sender' ? senderName : receiverName}
                  </span>
                  <span className="text-xs text-[#616061]">{msg.timestamp}</span>
                </div>
              )}
              <p className="text-sm text-[#1d1c1d] break-words leading-relaxed transition-all duration-200 hover:bg-gray-50 rounded px-1 py-0.5">{msg.text}</p>
            </div>
          </div>
        );
      })}
    </div>

    {/* Input */}
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2">
        <button className="text-gray-600 transition-all duration-200 hover:text-[#4A154B] hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8.5 16L12 13.5 15.5 16 12 18.5 8.5 16z"/>
          </svg>
        </button>
        <button className="text-gray-600 transition-all duration-200 hover:text-[#4A154B] hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V9h-3V7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
          </svg>
        </button>
        <button className="text-gray-600 transition-all duration-200 hover:text-[#4A154B] hover:scale-110">
          <span className="text-xs font-bold">B</span>
        </button>
        <input
          type="text"
          placeholder="Message #culture"
          className="flex-1 bg-transparent text-[#1d1c1d] placeholder-[#616061] outline-none text-sm"
        />
        <button className="text-[#007a5a] transition-all duration-200 hover:text-[#005a42] hover:scale-110 animate-[pulse_2s_infinite]">
          <span className="text-xs">Send</span>
        </button>
      </div>
    </div>
  </div>
  );
};

export const FakeDmCreator: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [senderName, setSenderName] = useState('Maurice');
  const [senderAvatar, setSenderAvatar] = useState('');
  const [receiverName, setReceiverName] = useState('Roy');
  const [receiverAvatar, setReceiverAvatar] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'sender',
      text: 'Hey! How are you doing?',
      timestamp: '2:45 PM'
    },
    {
      id: 2,
      sender: 'receiver',
      text: 'Good! Just working on some projects',
      timestamp: '2:46 PM'
    },
    {
      id: 3,
      sender: 'sender',
      text: 'Nice! I built this tool to create fake conversations for any platform',
      timestamp: '2:47 PM'
    }
  ]);
  const [input, setInput] = useState('');
  const [nextSender, setNextSender] = useState<'sender' | 'receiver'>('sender');
  const [isDownloading, setIsDownloading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleAddMessage = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || trimmedInput.length > 1000) {
      if (trimmedInput.length > 1000) {
        alert('Message is too long. Please keep it under 1000 characters.');
      }
      return;
    }
    
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: nextSender,
        text: trimmedInput,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      },
    ]);
    setInput('');
    setNextSender(nextSender === 'sender' ? 'receiver' : 'sender');
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddMessage();
    }
  };

  const handleDownload = async () => {
    if (!chatRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Get the chat element
      const chatElement = chatRef.current;
      

      
      
      // Ensure the element is visible and properly rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(chatElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging for debugging
        width: chatElement.offsetWidth,
        height: chatElement.offsetHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false, // Disable for better compatibility
        imageTimeout: 15000,
        removeContainer: true,
        ignoreElements: (element) => {
          // Only ignore download buttons outside the chat area
          const isDownloadButton = element.tagName === 'BUTTON' && 
            element.textContent?.includes('Download') &&
            !chatElement.contains(element);
          return Boolean(isDownloadButton);
        },
        onclone: (clonedDoc, element) => {
          // Add styles to ensure proper rendering
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            [data-chat-ref] * {
              animation: none !important;
              transition: none !important;
              transform: none !important;
              opacity: 1 !important;
              visibility: visible !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // Ensure the cloned element is visible
          const clonedChatElement = element;
          if (clonedChatElement) {
            clonedChatElement.style.position = 'static';
            clonedChatElement.style.transform = 'none';
            clonedChatElement.style.opacity = '1';
            clonedChatElement.style.visibility = 'visible';
          }
        }
      });
      
     
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has no content - element may not be visible');
      }
      
      const link = document.createElement('a');
      link.download = `${selectedPlatform}-conversation-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      alert(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPlatformChat = () => {
    const props = { messages, senderName, receiverName, senderAvatar, receiverAvatar };
    
    switch (selectedPlatform) {
      case 'instagram':
        return <InstagramDM {...props} />;
      case 'whatsapp':
        return <WhatsAppChat {...props} />;
      case 'imessage':
        return <IMessageChat {...props} />;
      case 'telegram':
        return <TelegramChat {...props} />;
      case 'discord':
        return <DiscordChat {...props} />;
      case 'snapchat':
        return <SnapchatChat {...props} />;
      case 'twitter':
        return <TwitterDMChat {...props} />;
      case 'facebook messenger':
        return <FacebookMessengerChat {...props} />;
      case 'slack':
        return <SlackChat {...props} />;
      default:
        return <InstagramDM {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Olly Fake DM Creater</h1>
          <p className="text-gray-600">Create realistic fake DM conversations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Platform Selector */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Select Platform</h3>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  {(() => {
                    const selectedPlat = PLATFORMS.find(p => p.id === selectedPlatform);
                    const IconComponent = selectedPlat?.icon;
                    return IconComponent ? <IconComponent className="w-5 h-5" style={{ color: selectedPlat.color }} /> : null;
                  })()}
                </div>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users Setup */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Configure Users</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Sender Column */}
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       Sender
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value.slice(0, 50))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Sender name"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                    <input
                      type="url"
                      value={senderAvatar}
                      onChange={(e) => setSenderAvatar(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional photo URL"
                    />
                  </div>
                </div>

                {/* Receiver Column */}
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Receiver
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value.slice(0, 50))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Receiver name"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                    <input
                      type="url"
                      value={receiverAvatar}
                      onChange={(e) => setReceiverAvatar(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional photo URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Add Messages</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={nextSender}
                    onChange={(e) => setNextSender(e.target.value as 'sender' | 'receiver')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sender">{'>'} Sender</option>
                    <option value="receiver">{'<'} Receiver</option>
                  </select>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value.slice(0, 1000))}
                      onKeyDown={handleKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={1000}
                    />
                    <div className="absolute -bottom-5 right-0 text-xs text-gray-400">
                      {input.length}/1000
                    </div>
                  </div>
                  <button
                    onClick={handleAddMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Messages ({messages.length})</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <span className={`font-medium text-xs px-2 py-1 rounded ${
                        msg.sender === 'sender' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {msg.sender === 'sender' ? `> ${senderName}` : `< ${receiverName}`}
                      </span>
                      <p className="text-sm text-gray-700 mt-1 truncate">{msg.text}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">How to add messages:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Select sender ({'>'}) or receiver ({'<'}) from the dropdown</li>
                      <li>• Type your message in the text field</li>
                      <li>• Click "Add" or press Enter to add the message</li>
                      <li>• Use the delete button (🗑️) to remove messages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Mobile Preview */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="font-semibold text-gray-900">Mobile Preview</h3>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload className="w-4 h-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>
            </div>
            
            <div ref={chatRef} data-chat-ref="true" className="min-h-[400px] w-full">
              {renderPlatformChat()}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Use the download button to save your fake conversation as an image!
              </p>
              <p className="text-xs text-gray-500">
                High-quality PNG export with 2x scaling
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};