interface FeatureData {
    featureName: string;
    featureDescription: string;
    imageLink: string;
    formatImage: 'left' | 'right';
  }

const featuresData: FeatureData[] = [
    {
      featureName: "Say Hi to Olly 👋",
      featureDescription: "Olly is your personal AI assistant that helps you optimize your presence on social media platforms like LinkedIn, Twitter, Reddit, and Facebook. With Olly, you get personalized interactions, time-saving commenting, and insights into what makes content viral. It's designed to grow your following by strategically enhancing engagement and providing content ideas that resonate with your audience.",
      imageLink: "/1.png",
      formatImage: "right",
    },
    {
        featureName: "Generate Comments 📝",
        featureDescription: "Olly helps you generate comments that are relevant to the post you're engaging with. It uses AI to analyze the post and generate comments that are likely to resonate with the audience. You can also customize the comment to make it more personal.",
        imageLink: "/2.png",
        formatImage: "left",
    },
    {
        featureName: "Check Virality 🔥",
        featureDescription: "Olly assesses the virality of the post you're engaging with. It uses AI to analyze the post and generate a virality score that indicates how likely the post is to go viral. You can use this score to determine whether you should engage with the post.",
        imageLink: "/3.png",
        formatImage: "right",
    },
    {
        featureName: "Generate Similar Posts 📊",
        featureDescription: "Olly helps you generate similar posts to the one you're engaging with. It uses AI to analyze the post and generate similar posts that are likely to resonate with the audience. You can use these posts as inspiration for your own content.",
        imageLink: "/4.png",
        formatImage: "left",
    },
    {
        featureName: "Customise Your Style 📝",
        featureDescription: "Olly allows you to customize your commenting style. You can choose from a variety of styles, including professional, casual, and humorous. You can also customize the comment to make it more personal",
        imageLink: "/5.png",
        formatImage: "right",
    },
    {
        featureName: "Pay Only for What You Use 💰",
        featureDescription: "With Olly, you only pay for what you use, directly to your own OpenAI Account.",
        imageLink: "/6.png",
        formatImage: "left",
    },
    {
        featureName: "Make Olly your Second Brain 🧠",
        featureDescription: "Olly is designed to help you grow your following by strategically enhancing engagement and providing content ideas that resonate with your audience. It's like having a second brain that helps you optimize your social media presence.",
        imageLink: "/7.png",
        formatImage: "right",
    }

  ];

  
  export default featuresData;
  