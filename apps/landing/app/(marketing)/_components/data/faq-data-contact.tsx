interface FAQData {
    question: string;
    answer: string;
  }
  

const FAQDataMainContact: FAQData[] = [
  
    {
      question: "Does the Auto Commenter support other LLM vendors?",
      answer: "Olly currently does not support other LLM models. It exclusively uses Olly’s own custom-trained AI model. We found that external LLMs often broke the comment flow, so we trained our own model specifically for consistent and engaging comment generation. That said, we’re actively experimenting with additional models for future compatibility.",
    },
    {
      question: "Do I need to buy separate credits with the Lifetime Deal?",
      answer: "Yes. The Lifetime Deal gives you lifetime access to the Olly tool, but AI-generated comments require credits. These credits power the LLM, and you’ll need to purchase more whenever your balance runs out.",
    },
    {
      question: "How many credits are consumed per comment?",
      answer: "Credit usage can vary by model, but with Olly’s default LLM, it takes 1 credit to generate 1 comment. This keeps it simple and predictable.",
    },
    {
      question: "Does Olly support browsers other than Chrome?",
      answer: "Olly is optimized specifically for Google Chrome via a Chrome Extension. Using it on other browsers may cause errors or limited functionality.",
    },
    {
      question: "What should I do if I get a 400 error while using Auto Commenter?",
      answer: "If you're encountering a 400 error while using the Auto Commenter, it's likely due to the image processing feature. To resolve this, simply go to your Olly Extension Settings, navigate to the Olly Config section, and disable the \"Read Post Image\" option. This usually fixes the issue instantly and allows the tool to function smoothly.",
    },
    {
      question: "How do I sign up for Olly?",
      answer: "To sign up for Olly, visit our website at olly.social and follow the sign-up process. You'll need to download the Chrome extension and create an account to get started.",
    },
    {
      question: "What platforms does Olly currently support?",
      answer: "Olly supports a wide range of platforms including Facebook, LinkedIn, Instagram, Reddit, Product Hunt, YouTube, Twitter/X, Threads, Quora, HackerNews, Medium, TikTok, and Skool community.",
    },
    {
      question: "Is Olly free to use?",
      answer: "Yes, Olly offers a free forever plan where you can generate 20 comments per day. We also offer paid plans with additional features and higher usage limits.",
    },
    {
      question: "What AI models are supported by Olly?",
      answer: "Olly supports various AI models including GPT-3.5, GPT-4, GPT-4 Turbo, GPT-4o mini, Claude-3 models by Anthropic, Gemini models by Google, and open-source models like Llama-3 and Gemma 2 through local setups using Ollama. We also support models from Straico and OpenRouter.",
    },
    {
      question: "How does billing work for Olly?",
      answer: "Billing depends on the AI model you use. OpenAI or the relevant vendor (like Anthropic, Google, Straico, or OpenRouter) will bill you directly based on your usage of their models through Olly.",
    },
  ];
  
export default FAQDataMainContact;