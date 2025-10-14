import { PrismaClient } from "@repo/db";


const prisma = new PrismaClient();

async function main() {
  console.log("Starting prompt seeding...");

  // First, let's create a sample user if none exists
  const existingUser = await prisma.user.findFirst();
  
  let userId: string;
  
  if (!existingUser) {
    console.log("Creating sample user...");
    const sampleUser = await prisma.user.create({
      data: {
        email: "admin@olly.social",
        username: "admin",
        isSupport: true,
        signInMethod: "EMAIL",
      },
    });
    userId = sampleUser.id;
    console.log("Sample user created with ID:", userId);
  } else {
    userId = existingUser.id;
    console.log("Using existing user with ID:", userId);
  }

  // Clear existing prompts to avoid duplicates
  console.log("Clearing existing prompts...");
  await prisma.userUpvote.deleteMany();
  await prisma.unlockedPrompt.deleteMany();
  await prisma.prompt.deleteMany();

  // Create sample prompts
  console.log("Creating sample prompts...");
  
  const prompts = await Promise.all([
    prisma.prompt.create({
      data: {
        text: "Write a professional LinkedIn post about {{topic}} that engages your network and showcases thought leadership. Include relevant hashtags and a call-to-action.",
        category: "LinkedIn",
        title: "Professional LinkedIn Post",
        upvotes: 12,
        userId: userId,
        contributor: "Olly Team",
        isPremium: false,
      },
    }),
    prisma.prompt.create({
      data: {
        text: "Create an engaging Twitter thread about {{topic}}. Start with a hook, break down key points across multiple tweets, and end with a summary or question to encourage engagement.",
        category: "Twitter",
        title: "Twitter Thread Generator",
        upvotes: 8,
        userId: userId,
        contributor: "Olly Team",
        isPremium: false,
      },
    }),
    prisma.prompt.create({
      data: {
        text: "Generate a compelling Instagram caption for {{topic}}. Make it engaging, authentic, and include relevant emojis and hashtags to maximize reach.",
        category: "Instagram",
        title: "Instagram Caption Creator",
        upvotes: 15,
        userId: userId,
        contributor: "Social Media Expert",
        isPremium: false,
      },
    }),
    prisma.prompt.create({
      data: {
        text: "Write a detailed blog post outline about {{topic}}. Include an engaging introduction, 5-7 main sections with subpoints, and a compelling conclusion with actionable takeaways.",
        category: "Content",
        title: "Blog Post Outline",
        upvotes: 6,
        userId: userId,
        contributor: "Content Creator",
        isPremium: true,
        creditCost: 5,
      },
    }),
    prisma.prompt.create({
      data: {
        text: "Create a professional email template for {{topic}}. Ensure it's clear, concise, and includes a proper subject line, greeting, body, and call-to-action.",
        category: "Email",
        title: "Professional Email Template",
        upvotes: 9,
        userId: userId,
        contributor: "Business Writer",
        isPremium: false,
      },
    }),
    prisma.prompt.create({
      data: {
        text: "Generate a comprehensive social media strategy for {{topic}}. Include platform-specific content ideas, posting schedules, engagement tactics, and performance metrics.",
        category: "Strategy",
        title: "Social Media Strategy",
        upvotes: 4,
        userId: userId,
        contributor: "Marketing Strategist",
        isPremium: true,
        creditCost: 10,
      },
    }),
    prisma.prompt.create({
      data: {
        text: "Write a persuasive product description for {{topic}}. Highlight key features, benefits, and use compelling language that drives conversions.",
        category: "Marketing",
        title: "Product Description Writer",
        upvotes: 11,
        userId: userId,
        contributor: "Copywriter Pro",
        isPremium: false,
      },
    }),
    prisma.prompt.create({
      data: {
        text: "Create a comprehensive content calendar for {{topic}}. Include diverse content types, optimal posting times, seasonal considerations, and engagement strategies.",
        category: "Planning",
        title: "Content Calendar Creator",
        upvotes: 7,
        userId: userId,
        contributor: "Content Planner",
        isPremium: true,
        creditCost: 8,
      },
    })
  ]);

  console.log(`Created ${prompts.length} prompts successfully!`);
  
  // Log the created prompts
  prompts.forEach((prompt, index) => {
    console.log(`${index + 1}. ${prompt.title} (${prompt.category}) - ${prompt.upvotes} upvotes${prompt.isPremium ? ' - PREMIUM' : ''}`);
  });

  console.log("Prompt seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });