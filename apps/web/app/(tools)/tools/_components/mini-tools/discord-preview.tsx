// components/tools/DiscordPreview.tsx
const DiscordPreview: React.FC<{ text: string }> = ({ text }) => {
    const renderFormattedText = (text: string) => {
      // Handle multiline code blocks first
      let formattedText = text.replace(/```([^`]*?)```/g, (_, code) => {
        return `<pre class="bg-gray-700 p-2 rounded">${code}</pre>`;
      });
  
      // Apply other formatting
      return formattedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/\|\|(.*?)\|\|/g, '<span class="bg-gray-700 hover:bg-transparent transition-colors">$1</span>')
        .replace(/^> (.*)$/gm, '<div class="border-l-4 border-gray-600 pl-2">$1</div>')
        .replace(/`sup (.*?)`/g, '<span class="text-xs">$1</span>');
    };
  
    return (
      <div 
        dangerouslySetInnerHTML={{ 
          __html: renderFormattedText(text) 
        }} 
        className="discord-preview whitespace-pre-wrap"
      />
    );
  };
  
  export default DiscordPreview;