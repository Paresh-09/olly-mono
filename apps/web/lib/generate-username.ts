// File: /lib/utils.ts
export function generateUsername(): string {
    const adjectives = ['Happy', 'Sunny', 'Clever', 'Brave', 'Calm', 'Eager', 'Gentle', 'Jolly', 'Kind', 'Lively'];
    const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear', 'Lion', 'Hawk', 'Owl'];
    const randomNumber = Math.floor(Math.random() * 1000);
  
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  }