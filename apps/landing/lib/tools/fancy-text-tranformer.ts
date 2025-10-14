// src/lib/text-transformer.ts
/**
 * Text Transformer Module
 * A modular approach to Unicode text transformations with TypeScript
 */

// Interfaces for type safety
interface UnicodeRange {
    start: number;
    end: number;
  }
  
  interface UnicodeBlock {
    uppercase?: UnicodeRange;
    lowercase?: UnicodeRange;
    digits?: UnicodeRange;
  }
  
  interface CharacterMap {
    [key: string]: string;
  }
  
  interface SpecialMapping {
    uppercase?: CharacterMap;
    lowercase?: CharacterMap;
    digits?: CharacterMap;
    symbols?: CharacterMap;
  }
  
  export interface StyleResult {
    key: string;
    name: string;
    text: string;
  }
  
  // Unicode blocks for different text styles
  const unicodeBlocks: Record<string, UnicodeBlock> = {
    serifBold: {
      uppercase: { start: 0x1D400, end: 0x1D419 },
      lowercase: { start: 0x1D41A, end: 0x1D433 },
      digits: { start: 0x1D7CE, end: 0x1D7D7 }
    },
    serif: {
      uppercase: { start: 0x1D434, end: 0x1D44D },
      lowercase: { start: 0x1D44E, end: 0x1D467 }
    },
    sansSerif: {
      uppercase: { start: 0x1D5A0, end: 0x1D5B9 },
      lowercase: { start: 0x1D5BA, end: 0x1D5D3 }
    },
    sansSerifBold: {
      uppercase: { start: 0x1D5D4, end: 0x1D5ED },
      lowercase: { start: 0x1D5EE, end: 0x1D607 },
      digits: { start: 0x1D7EC, end: 0x1D7F5 }
    },
    italic: {
      uppercase: { start: 0x1D434, end: 0x1D44D },
      lowercase: { start: 0x1D44E, end: 0x1D467 }
    },
    script: {
      uppercase: { start: 0x1D49C, end: 0x1D4B5 },
      lowercase: { start: 0x1D4B6, end: 0x1D4CF }
    },
    boldScript: {
      uppercase: { start: 0x1D4D0, end: 0x1D4E9 },
      lowercase: { start: 0x1D4EA, end: 0x1D503 }
    },
    fraktur: {
      uppercase: { start: 0x1D504, end: 0x1D51C },
      lowercase: { start: 0x1D51E, end: 0x1D537 }
    },
    monospace: {
      uppercase: { start: 0x1D670, end: 0x1D689 },
      lowercase: { start: 0x1D68A, end: 0x1D6A3 },
      digits: { start: 0x1D7F6, end: 0x1D7FF }
    },
    doubleStruck: {
      uppercase: { start: 0x1D538, end: 0x1D551 },
      lowercase: { start: 0x1D552, end: 0x1D56B },
      digits: { start: 0x1D7D8, end: 0x1D7E1 }
    }
  };
  
  // Helper function to create a mapping for fullwidth characters
  function createFullwidthMap(start: number, end: number, offset: number): CharacterMap {
    const map: CharacterMap = {};
    for (let i = start; i <= end; i++) {
      map[String.fromCharCode(i)] = String.fromCharCode(i - start + offset);
    }
    return map;
  }
  
  // Special character mappings for styles that don't follow the standard Unicode block pattern
  const specialMappings: Record<string, SpecialMapping> = {
    circled: {
      uppercase: {
        'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ',
        'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ',
        'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ',
        'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ'
      },
      lowercase: {
        'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ',
        'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ',
        'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ',
        'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ'
      },
      digits: {
        '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', 
        '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨'
      }
    },
    vaporwave: {
      uppercase: createFullwidthMap('A'.charCodeAt(0), 'Z'.charCodeAt(0), 0xFF21),
      lowercase: createFullwidthMap('a'.charCodeAt(0), 'z'.charCodeAt(0), 0xFF41),
      digits: createFullwidthMap('0'.charCodeAt(0), '9'.charCodeAt(0), 0xFF10),
      symbols: {
        ' ': '　', '!': '！', '?': '？', '.': '．', ',': '，', ':': '：', ';': '；',
        '(': '（', ')': '）', '[': '［', ']': '］', '{': '｛', '}': '｝', 
        '+': '＋', '-': '－', '*': '＊', '/': '／', '\\': '＼', '_': '＿'
      }
    },
    smallCaps: {
      lowercase: {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ',
        'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
        'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
        'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
      }
    },
    bubbles: {
      uppercase: {
        'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ',
        'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ',
        'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ',
        'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ'
      },
      lowercase: {
        'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ',
        'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ',
        'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ',
        'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ'
      }
    }
  };
  
  /**
   * Transform text to a specific Unicode style
   * @param text - Input text to transform
   * @param style - Style name (e.g., 'serifBold', 'script', etc.)
   * @returns Transformed text
   */
  export function transformText(text: string, style: string): string {
    // Check if the style exists
    const isUnicodeBlock = style in unicodeBlocks;
    const isSpecialMapping = style in specialMappings;
    
    if (!isUnicodeBlock && !isSpecialMapping) {
      console.warn(`Style "${style}" not found, returning original text`);
      return text;
    }
    
    // Transform each character
    return Array.from(text).map(char => {
      const code = char.charCodeAt(0);
      
      // Handle Unicode block transformations
      if (isUnicodeBlock) {
        const block = unicodeBlocks[style];
        
        // Transform uppercase letters (A-Z)
        if (code >= 65 && code <= 90 && block.uppercase) {
          return String.fromCodePoint(block.uppercase.start + (code - 65));
        }
        
        // Transform lowercase letters (a-z)
        if (code >= 97 && code <= 122 && block.lowercase) {
          return String.fromCodePoint(block.lowercase.start + (code - 97));
        }
        
        // Transform digits (0-9)
        if (code >= 48 && code <= 57 && block.digits) {
          return String.fromCodePoint(block.digits.start + (code - 48));
        }
      }
      
      // Handle special mappings
      if (isSpecialMapping) {
        const mappings = specialMappings[style];
        
        // Check uppercase letters
        if (code >= 65 && code <= 90 && mappings.uppercase) {
          return mappings.uppercase[char] || char;
        }
        
        // Check lowercase letters
        if (code >= 97 && code <= 122 && mappings.lowercase) {
          return mappings.lowercase[char] || char;
        }
        
        // Check digits
        if (code >= 48 && code <= 57 && mappings.digits) {
          return mappings.digits[char] || char;
        }
        
        // Check symbols
        if (mappings.symbols && mappings.symbols[char]) {
          return mappings.symbols[char];
        }
      }
      
      // Return original character if no transformation is available
      return char;
    }).join('');
  }
  
  /**
   * Get all available style names
   * @returns Array of style names
   */
  export function getAvailableStyles(): string[] {
    return [...Object.keys(unicodeBlocks), ...Object.keys(specialMappings)];
  }
  
  /**
   * Get a descriptive name for a style
   * @param style - Style key
   * @returns Human-readable style name
   */
  export function getStyleDisplayName(style: string): string {
    const styleNames: Record<string, string> = {
      serifBold: 'Serif Bold',
      serif: 'Serif',
      sansSerif: 'Sans-Serif',
      sansSerifBold: 'Sans-Serif Bold',
      italic: 'Italic',
      script: 'Script',
      boldScript: 'Bold Script',
      fraktur: 'Fraktur/Gothic',
      monospace: 'Monospace',
      doubleStruck: 'Double-Struck',
      circled: 'Circled',
      vaporwave: 'Vaporwave',
      smallCaps: 'Small Caps',
      bubbles: 'Bubbles'
    };
    
    return styleNames[style] || style;
  }
  
  /**
   * Transform text to all available styles
   * @param text - Input text to transform
   * @returns Array of objects with style names and transformed text
   */
  export function transformToAllStyles(text: string): StyleResult[] {
    const styles = getAvailableStyles();
    const results: StyleResult[] = [];
    
    for (const style of styles) {
      results.push({
        key: style,
        name: getStyleDisplayName(style),
        text: transformText(text, style)
      });
    }
    
    return results;
  }
  
  // Define a type for favorite items
  export interface FavoriteStyle {
    key: string;
    name: string;
    text: string;
  }