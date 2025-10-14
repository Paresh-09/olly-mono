import {
  PrismaClient,
  PlanName,
  OrganizationRole,
  SignInMethod,
  TransactionType,
  CommentPlatform,
  CommentStatus,
  ActionType,
} from "@repo/db";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Helper function to generate dates for the last 5 days including today
function getLastFiveDays(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 4; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // Set time to a random hour between 9 AM and 6 PM for realistic data
    date.setHours(
      9 + Math.floor(Math.random() * 9),
      Math.floor(Math.random() * 60),
      0,
      0,
    );
    dates.push(date);
  }
  return dates;
}

// Helper function to generate random usage data
function generateUsageData(
  licenseKeys: any[],
  sublicenses: any[],
  users: any[],
  dates: Date[],
) {
  const usageData: any = [];
  const actions = [
    "COMMENT_GENERATED",
    "CODE_REVIEWED",
    "SUMMARY_CREATED",
    "SUGGESTION_MADE",
  ];
  const platforms = ["GITHUB", "GITLAB", "BITBUCKET", "VSCODE", "JETBRAINS"];
  const events = [
    "PR_COMMENT",
    "COMMIT_REVIEW",
    "ISSUE_COMMENT",
    "CODE_SUGGESTION",
  ];

  // Generate usage for each date
  dates.forEach((date, dayIndex) => {
    // Generate 5-15 usage entries per day
    const entriesPerDay = 5 + Math.floor(Math.random() * 10);

    for (let i = 0; i < entriesPerDay; i++) {
      // Randomly assign to license key or sublicense
      const useSubLicense = Math.random() > 0.4;

      if (useSubLicense && sublicenses.length > 0) {
        const sublicense =
          sublicenses[Math.floor(Math.random() * sublicenses.length)];
        usageData.push({
          subLicenseId: sublicense.id,
          userId:
            sublicense.assignedUserId ||
            users[Math.floor(Math.random() * users.length)].id,
          action: actions[Math.floor(Math.random() * actions.length)],
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          event: events[Math.floor(Math.random() * events.length)],
          createdAt: new Date(
            date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
          ), // Random time within the day
        });
      } else {
        const licenseKey =
          licenseKeys[Math.floor(Math.random() * licenseKeys.length)];
        usageData.push({
          licenseKeyId: licenseKey.id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          action: actions[Math.floor(Math.random() * actions.length)],
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          event: events[Math.floor(Math.random() * events.length)],
          createdAt: new Date(
            date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
          ), // Random time within the day
        });
      }
    }
  });

  return usageData;
}

// Helper function to generate credit transactions for team testing
function generateCreditTransactions(users: any[], dates: Date[]) {
  const transactionTypes: TransactionType[] = [
    "EARNED",
    "SPENT",
    "GIFTED",
    "PURCHASED",
    "AUTO_COMMENTING",
  ];
  const platforms = [
    "LINKEDIN",
    "INSTAGRAM",
    "FACEBOOK",
    "TWITTER",
    "REDDIT",
    "YOUTUBE",
  ];
  const actions = [
    "COMMENT",
    "LIKE",
    "AUTO_COMMENT",
    "SHARE",
    "FOLLOW",
    "POST",
  ];

  const transactions: any[] = [];

  users.forEach((user, userIndex) => {
    dates.forEach((date) => {
      // Generate 2-8 transactions per user per day
      const transactionsPerDay = 2 + Math.floor(Math.random() * 6);

      for (let i = 0; i < transactionsPerDay; i++) {
        const transactionType =
          transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const platform =
          platforms[Math.floor(Math.random() * platforms.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];

        // Generate amount based on transaction type
        let amount = 0;
        let description = "";

        switch (transactionType) {
          case "EARNED":
            amount = Math.floor(Math.random() * 20) + 5; // 5-25 credits
            description = `Earned credits for ${action.toLowerCase()} on ${platform}`;
            break;
          case "SPENT":
            amount = -(Math.floor(Math.random() * 15) + 1); // -1 to -15 credits
            description = `Spent credits for ${action.toLowerCase()} on ${platform}`;
            break;
          case "AUTO_COMMENTING":
            amount = -(Math.floor(Math.random() * 5) + 1); // -1 to -5 credits
            description = `Auto comment posted on ${platform}`;
            break;
          case "GIFTED":
            amount = Math.floor(Math.random() * 50) + 10; // 10-60 credits
            description = `Gifted credits - Welcome bonus`;
            break;
          case "PURCHASED":
            amount = Math.floor(Math.random() * 100) + 50; // 50-150 credits
            description = `Purchased credit pack`;
            break;
        }

        transactions.push({
          userId: user.id,
          amount,
          type: transactionType,
          description,
          createdAt: new Date(
            date.getTime() + Math.random() * 24 * 60 * 60 * 1000,
          ),
        });
      }
    });
  });

  return transactions;
}

// Helper function to generate auto-commenter history for testing
function generateAutoCommenterHistory(
  configs: any[],
  users: any[],
  dates: Date[]
) {
  const history: any[] = [];
  const platforms = [CommentPlatform.LINKEDIN, CommentPlatform.REDDIT];
  const actions = [ActionType.COMMENT, ActionType.LIKE, ActionType.UPVOTE];
  const statuses = [CommentStatus.POSTED, CommentStatus.FAILED, CommentStatus.PENDING];
  
  const samplePosts = [
    {
      content: "Great insights on AI development trends in 2024. The future looks bright for machine learning applications.",
      author: "John Tech",
      hashtags: ["#AI", "#MachineLearning", "#Tech2024"]
    },
    {
      content: "Amazing product launch! Congratulations to the team on this innovative solution.",
      author: "Sarah Innovation",
      hashtags: ["#ProductLaunch", "#Innovation", "#Startup"]
    },
    {
      content: "Excellent analysis of the current market conditions and future predictions.",
      author: "Mike Analytics",
      hashtags: ["#MarketAnalysis", "#Business", "#Strategy"]
    },
    {
      content: "Inspiring leadership lesson from this week's company all-hands meeting.",
      author: "Lisa Leader",
      hashtags: ["#Leadership", "#TeamWork", "#Growth"]
    },
    {
      content: "Breakthrough research in renewable energy solutions could change everything.",
      author: "Dr. Green Energy",
      hashtags: ["#RenewableEnergy", "#Sustainability", "#Research"]
    }
  ];

  const sampleComments = [
    "Great point! I completely agree with your analysis on this topic.",
    "Thanks for sharing this valuable insight. Very helpful for our team.",
    "Excellent work! Looking forward to seeing more content like this.",
    "This is exactly what I was looking for. Appreciate the detailed explanation.",
    "Interesting perspective! Would love to hear more about your experience with this.",
    "Fantastic insights! This will definitely help with our upcoming project.",
    "Well articulated thoughts. The data you shared is very compelling.",
    "Amazing results! Congratulations on achieving such great milestones."
  ];

  configs.forEach((config) => {
    dates.forEach((date, dayIndex) => {
      // Generate 3-12 comments per config per day
      const commentsPerDay = 3 + Math.floor(Math.random() * 9);
      
      for (let i = 0; i < commentsPerDay; i++) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const post = samplePosts[Math.floor(Math.random() * samplePosts.length)];
        const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        // Create realistic post URLs
        const postId = `post_${Math.random().toString(36).substr(2, 9)}`;
        let postUrl = "";
        if (platform === CommentPlatform.LINKEDIN) {
          postUrl = `https://linkedin.com/posts/${postId}`;
        } else if (platform === CommentPlatform.REDDIT) {
          postUrl = `https://reddit.com/r/technology/comments/${postId}`;
        }

        // Realistic timing within the day
        const commentTime = new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        
        history.push({
          configId: config.id,
          userId: config.userId,
          postId: postId,
          platform: platform,
          postUrl: postUrl,
          postContent: post.content,
          authorName: post.author,
          commentContent: comment,
          status: status,
          action: action,
          postedAt: status === CommentStatus.POSTED ? commentTime : null,
          createdAt: commentTime,
          errorMessage: status === CommentStatus.FAILED ? "Rate limit exceeded" : null,
        });
      }
    });
  });

  return history;
}

async function main() {
  // Clean up existing data in the correct order
  await prisma.$transaction([
    prisma.apiKeyUsageTracking.deleteMany(),
    prisma.usageTracking.deleteMany(),
    prisma.installation.deleteMany(),
    prisma.licenseKeyKnowledgeSummary.deleteMany(),
    prisma.licenseKeyCustomKnowledge.deleteMany(),
    prisma.knowledgeSummary.deleteMany(),
    prisma.apiKeyCustomKnowledge.deleteMany(),
    prisma.userApiKey.deleteMany(),
    prisma.userLicenseKey.deleteMany(),
    prisma.autoCommenterHistory.deleteMany(),
    prisma.autoCommenterConfig.deleteMany(),
    prisma.assignedLicense.deleteMany(),
    prisma.ownedLicense.deleteMany(),
    prisma.organizationInvite.deleteMany(),
    prisma.organizationUser.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.organizationPlan.deleteMany(),
    prisma.licenseKeySettings.deleteMany(),
    prisma.subLicenseGoal.deleteMany(),
    prisma.subLicense.deleteMany(),
    prisma.licenseKey.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.creditTransaction.deleteMany(),
    prisma.userCredit.deleteMany(),
    prisma.userUpvote.deleteMany(),
    prisma.prompt.deleteMany(),
    prisma.emailVerificationToken.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.onboardingFeedback.deleteMany(),
    prisma.onboardingProgress.deleteMany(),
    prisma.onboarding.deleteMany(),
    prisma.elfGameAttempt.deleteMany(),
    prisma.emails.deleteMany(),
    prisma.oAuthToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create organization plans
  const plans = await Promise.all([
    prisma.organizationPlan.create({
      data: {
        name: PlanName.T0,
        maxAdditionalKeys: 0,
      },
    }),
    prisma.organizationPlan.create({
      data: {
        name: PlanName.T1,
        maxAdditionalKeys: 5,
      },
    }),
    prisma.organizationPlan.create({
      data: {
        name: PlanName.T2,
        maxAdditionalKeys: 10,
      },
    }),
  ]);

  // Create users (team owner and team members)
  const hashedPassword = await hash("password123", 10);
  const users = await Promise.all([
    // Team Owner (Main License Holder)
    prisma.user.create({
      data: {
        email: "teamowner@example.com",
        password: hashedPassword,
        name: "Team Owner",
        isAdmin: true,
        isBetaTester: true,
        username: "team_owner",
        signInMethod: SignInMethod.EMAIL,
        isPaidUser: true,
        isEmailVerified: true,
      },
    }),
    // Team Member 1
    prisma.user.create({
      data: {
        email: "alice@example.com",
        password: hashedPassword,
        name: "Alice Johnson",
        isBetaTester: true,
        username: "alice_j",
        signInMethod: SignInMethod.EMAIL,
        isEmailVerified: true,
      },
    }),
    // Team Member 2
    prisma.user.create({
      data: {
        email: "bob@example.com",
        password: hashedPassword,
        name: "Bob Smith",
        isBetaTester: false,
        username: "bob_smith",
        signInMethod: SignInMethod.EMAIL,
        isEmailVerified: true,
      },
    }),
    // Team Member 3
    prisma.user.create({
      data: {
        email: "carol@example.com",
        password: hashedPassword,
        name: "Carol Davis",
        isBetaTester: false,
        username: "carol_d",
        signInMethod: SignInMethod.EMAIL,
        isEmailVerified: true,
      },
    }),
    // Team Member 4
    prisma.user.create({
      data: {
        email: "david@example.com",
        password: hashedPassword,
        name: "David Wilson",
        isBetaTester: false,
        username: "david_w",
        signInMethod: SignInMethod.EMAIL,
        isEmailVerified: true,
      },
    }),
    // Individual User (for comparison)
    prisma.user.create({
      data: {
        email: "individual@example.com",
        password: hashedPassword,
        name: "Individual User",
        isBetaTester: true,
        username: "individual_user",
        signInMethod: SignInMethod.EMAIL,
        isEmailVerified: true,
      },
    }),
  ]);

  const [teamOwner, alice, bob, carol, david, individual] = users;

  // Create main license keys
  const licenseKeys = await Promise.all([
    // Team Owner's Main License
    prisma.licenseKey.create({
      data: {
        key: "TEAM-MAIN-LICENSE-001",
        isActive: true,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        vendor: "DIRECT",
        isMainKey: true,
        users: {
          create: {
            userId: teamOwner.id,
          },
        },
        settings: {
          create: {
            userName: "Team Owner",
            model: "gpt-4",
            replyTone: "Professional",
            replyLength: "Medium",
          },
        },
      },
    }),
    // Individual User's License
    prisma.licenseKey.create({
      data: {
        key: "INDIVIDUAL-LICENSE-001",
        isActive: true,
        vendor: "APPSUMO",
        isMainKey: true,
        users: {
          create: {
            userId: individual.id,
          },
        },
      },
    }),
    // Additional main license for testing
    prisma.licenseKey.create({
      data: {
        key: "TEAM-MAIN-LICENSE-002",
        isActive: true,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        vendor: "DIRECT",
        isMainKey: true,
        users: {
          create: {
            userId: teamOwner.id,
          },
        },
        settings: {
          create: {
            userName: "Team Owner",
            model: "gpt-3.5",
            replyTone: "Casual",
            replyLength: "Short",
          },
        },
      },
    }),
  ]);

  const [mainLicense1, individualLicense, mainLicense2] = licenseKeys;

  // Create sublicenses and assign to team members
  const sublicenses = await Promise.all([
    // Alice's sublicense under main license 1
    prisma.subLicense.create({
      data: {
        key: "SUB-ALICE-001",
        status: "ACTIVE",
        originalLicenseKey: mainLicense1.key,
        mainLicenseKeyId: mainLicense1.id,
        vendor: "DIRECT",
        assignedUserId: alice.id,
        assignedEmail: alice.email,
      },
    }),
    // Bob's sublicense under main license 1
    prisma.subLicense.create({
      data: {
        key: "SUB-BOB-001",
        status: "ACTIVE",
        originalLicenseKey: mainLicense1.key,
        mainLicenseKeyId: mainLicense1.id,
        vendor: "DIRECT",
        assignedUserId: bob.id,
        assignedEmail: bob.email,
      },
    }),
    // Carol's sublicense under main license 1
    prisma.subLicense.create({
      data: {
        key: "SUB-CAROL-001",
        status: "ACTIVE",
        originalLicenseKey: mainLicense1.key,
        mainLicenseKeyId: mainLicense1.id,
        vendor: "DIRECT",
        assignedUserId: carol.id,
        assignedEmail: carol.email,
      },
    }),
    // David's sublicense under main license 2
    prisma.subLicense.create({
      data: {
        key: "SUB-DAVID-001",
        status: "ACTIVE",
        originalLicenseKey: mainLicense2.key,
        mainLicenseKeyId: mainLicense2.id,
        vendor: "DIRECT",
        assignedUserId: david.id,
        assignedEmail: david.email,
      },
    }),
    // Unassigned sublicense for testing
    prisma.subLicense.create({
      data: {
        key: "SUB-UNASSIGNED-001",
        status: "ACTIVE",
        originalLicenseKey: mainLicense1.key,
        mainLicenseKeyId: mainLicense1.id,
        vendor: "DIRECT",
        assignedEmail: "unassigned@example.com",
      },
    }),
  ]);

  // Create organizations
  const organizations = await Promise.all([
    prisma.organization.create({
      data: {
        name: "Team Organization",
        isPremium: true,
        planId: plans[2].id, // T2 plan
        mainLicenseKeyId: mainLicense1.id,
        users: {
          create: [
            {
              userId: teamOwner.id,
              role: OrganizationRole.OWNER,
            },
            {
              userId: alice.id,
              role: OrganizationRole.MEMBER,
            },
            {
              userId: bob.id,
              role: OrganizationRole.MEMBER,
            },
          ],
        },
      },
    }),
    prisma.organization.create({
      data: {
        name: "Individual Organization",
        planId: plans[0].id, // T0 plan
        users: {
          create: {
            userId: individual.id,
            role: OrganizationRole.OWNER,
          },
        },
      },
    }),
  ]);

  // Create user credits for all users
  const allUsers = [teamOwner, alice, bob, carol, david, individual];
  const userCredits = await Promise.all(
    allUsers.map((user, index) =>
      prisma.userCredit.create({
        data: {
          userId: user.id,
          balance: 50 + index * 25, // Different starting balances
        },
      }),
    ),
  );

  // Generate credit transactions for team testing
  console.log(
    "Generating credit transactions for team functionality testing...",
  );
  const dates = getLastFiveDays();
  const creditTransactions = generateCreditTransactions(allUsers, dates);

  // Create credit transactions
  console.log(`Creating ${creditTransactions.length} credit transactions...`);
  await Promise.all(
    creditTransactions.map(async (transaction) => {
      await prisma.creditTransaction.create({
        data: {
          userCreditId: userCredits.find(
            (uc) => uc.userId === transaction.userId,
          )!.id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
      });
    }),
  );

  // Update user credit balances based on transactions
  for (const userCredit of userCredits) {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userCreditId: userCredit.id },
    });

    const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

    await prisma.userCredit.update({
      where: { id: userCredit.id },
      data: { balance: Math.max(0, totalBalance) }, // Ensure balance doesn't go negative
    });
  }

  // Create prompts
  await Promise.all([
    prisma.prompt.create({
      data: {
        text: "Write a professional LinkedIn post about {{topic}}",
        category: "LinkedIn",
        title: "Professional LinkedIn Post",
        upvotes: 5,
        userId: teamOwner.id,
      },
    }),
    prisma.prompt.create({
      data: {
        text: "Create an engaging Twitter thread about {{topic}}",
        category: "Twitter",
        title: "Twitter Thread Generator",
        upvotes: 3,
        userId: alice.id,
      },
    }),
  ]);

  // Create installations
  await Promise.all([
    prisma.installation.create({
      data: {
        status: "INSTALLED",
        userId: teamOwner.id,
        licenseKeyId: mainLicense1.id,
      },
    }),
    prisma.installation.create({
      data: {
        status: "INSTALLED",
        userId: alice.id,
        licenseKeyId: mainLicense1.id,
      },
    }),
    prisma.installation.create({
      data: {
        status: "INSTALLED",
        userId: bob.id,
        licenseKeyId: mainLicense1.id,
      },
    }),
    prisma.installation.create({
      data: {
        status: "INSTALLED",
        userId: individual.id,
        licenseKeyId: individualLicense.id,
      },
    }),
  ]);

  // Generate usage tracking data
  console.log("Generating analytics data for the last 5 days...");
  const usageData = generateUsageData(
    licenseKeys,
    sublicenses,
    allUsers,
    dates,
  );

  // Create usage tracking entries
  console.log(`Creating ${usageData.length} usage tracking entries...`);
  await prisma.usageTracking.createMany({
    data: usageData,
  });

  // Create auto-commenter configs for testing
  console.log("Creating auto-commenter configurations...");
  const autoCommenterConfigs = await Promise.all([
    // Team Owner's LinkedIn Config
    prisma.autoCommenterConfig.create({
      data: {
        userId: teamOwner.id,
        licenseKeyId: mainLicense1.id,
        isEnabled: true,
        timeInterval: 5,
        action: [ActionType.COMMENT, ActionType.LIKE],
        postsPerDay: 8,
        hashtags: ["#AI", "#Technology", "#Business", "#Innovation"],
        useBrandVoice: true,
        platform: CommentPlatform.LINKEDIN,
        enabledPlatforms: [CommentPlatform.LINKEDIN],
        feedLikes: 15,
        feedComments: 8,
        promptMode: "automatic",
      },
    }),
    // Alice's Reddit Config
    prisma.autoCommenterConfig.create({
      data: {
        userId: alice.id,
        subLicenseId: sublicenses[0].id, // Alice's sublicense
        isEnabled: true,
        timeInterval: 3,
        action: [ActionType.COMMENT, ActionType.UPVOTE],
        postsPerDay: 5,
        hashtags: ["#Programming", "#OpenSource", "#TechNews"],
        useBrandVoice: false,
        platform: CommentPlatform.REDDIT,
        enabledPlatforms: [CommentPlatform.REDDIT],
        feedLikes: 10,
        feedComments: 5,
        promptMode: "automatic",
      },
    }),
    // Bob's Multi-platform Config
    prisma.autoCommenterConfig.create({
      data: {
        userId: bob.id,
        subLicenseId: sublicenses[1].id, // Bob's sublicense
        isEnabled: true,
        timeInterval: 7,
        action: [ActionType.COMMENT, ActionType.LIKE, ActionType.UPVOTE],
        postsPerDay: 10,
        hashtags: ["#Marketing", "#SocialMedia", "#Growth"],
        useBrandVoice: true,
        platform: CommentPlatform.LINKEDIN,
        enabledPlatforms: [CommentPlatform.LINKEDIN, CommentPlatform.REDDIT],
        feedLikes: 20,
        feedComments: 10,
        promptMode: "automatic",
      },
    }),
    // Carol's LinkedIn Config (inactive)
    prisma.autoCommenterConfig.create({
      data: {
        userId: carol.id,
        subLicenseId: sublicenses[2].id, // Carol's sublicense
        isEnabled: false,
        timeInterval: 4,
        action: [ActionType.COMMENT],
        postsPerDay: 3,
        hashtags: ["#Leadership", "#Management", "#Strategy"],
        useBrandVoice: true,
        platform: CommentPlatform.LINKEDIN,
        enabledPlatforms: [CommentPlatform.LINKEDIN],
        feedLikes: 5,
        feedComments: 3,
        promptMode: "automatic",
      },
    }),
  ]);

  // Generate auto-commenter history
  console.log("Generating auto-commenter history...");
  const autoCommenterHistory = generateAutoCommenterHistory(
    autoCommenterConfigs,
    [teamOwner, alice, bob, carol],
    dates
  );

  // Create auto-commenter history entries
  console.log(`Creating ${autoCommenterHistory.length} auto-commenter history entries...`);
  await Promise.all(
    autoCommenterHistory.map(async (history) => {
      await prisma.autoCommenterHistory.create({
        data: history,
      });
    })
  );

  console.log("\n🎉 Team functionality seed data created successfully!");
  console.log("\n📊 Summary:");
  console.log(
    `- Date range: ${dates[0].toDateString()} to ${dates[dates.length - 1].toDateString()}`,
  );
  console.log(`- Users created: ${allUsers.length}`);
  console.log(`- Main licenses: ${licenseKeys.length}`);
  console.log(`- Sublicenses: ${sublicenses.length}`);
  console.log(`- Credit transactions: ${creditTransactions.length}`);
  console.log(`- Usage tracking entries: ${usageData.length}`);
  console.log(`- Auto-commenter configs: ${autoCommenterConfigs.length}`);
  console.log(`- Auto-commenter history: ${autoCommenterHistory.length}`);
  console.log(`- Organizations: ${organizations.length}`);

  console.log("\n👥 Team Structure:");
  console.log(
    `- Team Owner: ${teamOwner.email} (Main License: ${mainLicense1.key})`,
  );
  console.log(`- Alice: ${alice.email} (Sublicense: SUB-ALICE-001)`);
  console.log(`- Bob: ${bob.email} (Sublicense: SUB-BOB-001)`);
  console.log(`- Carol: ${carol.email} (Sublicense: SUB-CAROL-001)`);
  console.log(
    `- David: ${david.email} (Sublicense: SUB-DAVID-001 under ${mainLicense2.key})`,
  );
  console.log(
    `- Individual: ${individual.email} (Own License: ${individualLicense.key})`,
  );

  console.log("\n🔑 Test Login Credentials:");
  console.log("- Email: teamowner@example.com | Password: password123");
  console.log("- Email: alice@example.com | Password: password123");
  console.log("- Email: individual@example.com | Password: password123");

  console.log("\n✅ You can now test the team functionality!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// import {
//   PrismaClient,
//   PlanName,
//   OrganizationRole,
//   SignInMethod,
// } from "@repo/db";
// import { hash } from "bcryptjs";

// const prisma = new PrismaClient();

// // Helper function to generate dates for the last 5 days including today
// function getLastFiveDays(): Date[] {
//   const dates: Date[] = [];
//   const today = new Date();

//   for (let i = 4; i >= 0; i--) {
//     const date = new Date(today);
//     date.setDate(today.getDate() - i);
//     // Set time to a random hour between 9 AM and 6 PM for realistic data
//     date.setHours(9 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
//     dates.push(date);
//   }

//   return dates;
// }

// // Helper function to generate random usage data
// function generateUsageData(
//   licenseKeys: any[],
//   sublicenses: any[],
//   users: any[],
//   dates: Date[]
// ) {
//   const usageData: any = [];
//   const actions = ['COMMENT_GENERATED', 'CODE_REVIEWED', 'SUMMARY_CREATED', 'SUGGESTION_MADE'];
//   const platforms = ['GITHUB', 'GITLAB', 'BITBUCKET', 'VSCODE', 'JETBRAINS'];
//   const events = ['PR_COMMENT', 'COMMIT_REVIEW', 'ISSUE_COMMENT', 'CODE_SUGGESTION'];

//   // Generate usage for each date
//   dates.forEach((date, dayIndex) => {
//     // Generate 5-15 usage entries per day
//     const entriesPerDay = 5 + Math.floor(Math.random() * 10);

//     for (let i = 0; i < entriesPerDay; i++) {
//       // Randomly assign to license key or sublicense
//       const useSubLicense = Math.random() > 0.4;

//       if (useSubLicense && sublicenses.length > 0) {
//         const sublicense = sublicenses[Math.floor(Math.random() * sublicenses.length)];
//         usageData.push({
//           subLicenseId: sublicense.id,
//           userId: sublicense.assignedUserId || users[Math.floor(Math.random() * users.length)].id,
//           action: actions[Math.floor(Math.random() * actions.length)],
//           platform: platforms[Math.floor(Math.random() * platforms.length)],
//           event: events[Math.floor(Math.random() * events.length)],
//           createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000), // Random time within the day
//         });
//       } else {
//         const licenseKey = licenseKeys[Math.floor(Math.random() * licenseKeys.length)];
//         usageData.push({
//           licenseKeyId: licenseKey.id,
//           userId: users[Math.floor(Math.random() * users.length)].id,
//           action: actions[Math.floor(Math.random() * actions.length)],
//           platform: platforms[Math.floor(Math.random() * platforms.length)],
//           event: events[Math.floor(Math.random() * events.length)],
//           createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000), // Random time within the day
//         });
//       }
//     }
//   });

//   return usageData;
// }

// async function main() {
//   // Clean up existing data in the correct order
//   await prisma.$transaction([
//     prisma.apiKeyUsageTracking.deleteMany(),
//     prisma.usageTracking.deleteMany(),
//     prisma.installation.deleteMany(),
//     prisma.licenseKeyKnowledgeSummary.deleteMany(),
//     prisma.licenseKeyCustomKnowledge.deleteMany(),
//     prisma.knowledgeSummary.deleteMany(),
//     prisma.apiKeyCustomKnowledge.deleteMany(),
//     prisma.userApiKey.deleteMany(),
//     prisma.userLicenseKey.deleteMany(),
//     prisma.autoCommenterHistory.deleteMany(),
//     prisma.autoCommenterConfig.deleteMany(),
//     prisma.assignedLicense.deleteMany(),
//     prisma.ownedLicense.deleteMany(),
//     prisma.organizationInvite.deleteMany(),
//     prisma.organizationUser.deleteMany(),
//     prisma.organization.deleteMany(),
//     prisma.organizationPlan.deleteMany(),
//     prisma.licenseKeySettings.deleteMany(),
//     prisma.subLicenseGoal.deleteMany(),
//     prisma.subLicense.deleteMany(),
//     prisma.licenseKey.deleteMany(),
//     prisma.apiKey.deleteMany(),
//     prisma.creditTransaction.deleteMany(),
//     prisma.userCredit.deleteMany(),
//     prisma.userUpvote.deleteMany(),
//     prisma.prompt.deleteMany(),
//     prisma.emailVerificationToken.deleteMany(),
//     prisma.notification.deleteMany(),
//     prisma.onboardingFeedback.deleteMany(),
//     prisma.onboardingProgress.deleteMany(),
//     prisma.onboarding.deleteMany(),
//     prisma.elfGameAttempt.deleteMany(),
//     prisma.emails.deleteMany(),
//     prisma.oAuthToken.deleteMany(),
//     prisma.session.deleteMany(),
//     prisma.refreshToken.deleteMany(),
//     prisma.passwordResetToken.deleteMany(),
//     prisma.user.deleteMany(),
//   ]);

//   // Create organization plans
//   const plans = await Promise.all([
//     prisma.organizationPlan.create({
//       data: {
//         name: PlanName.T0,
//         maxAdditionalKeys: 0,
//       },
//     }),
//     prisma.organizationPlan.create({
//       data: {
//         name: PlanName.T1,
//         maxAdditionalKeys: 5,
//       },
//     }),
//     prisma.organizationPlan.create({
//       data: {
//         name: PlanName.T2,
//         maxAdditionalKeys: 10,
//       },
//     }),
//   ]);

//   // Create users
//   const hashedPassword = await hash("password123", 10);

//   const users = await Promise.all([
//     prisma.user.create({
//       data: {
//         email: "admin@example.com",
//         password: hashedPassword,
//         name: "Admin User",
//         isAdmin: true,
//         isBetaTester: true,
//         username: "admin",
//         signInMethod: SignInMethod.EMAIL,
//         isPaidUser: true,
//         isEmailVerified: true,
//       },
//     }),
//     prisma.user.create({
//       data: {
//         email: "user@example.com",
//         password: hashedPassword,
//         name: "Regular User",
//         isBetaTester: true,
//         username: "regular_user",
//         signInMethod: SignInMethod.EMAIL,
//         isEmailVerified: true,
//       },
//     }),
//   ]);

//   // Create license keys
//   const licenseKeys = await Promise.all([
//     prisma.licenseKey.create({
//       data: {
//         key: "LICENSE-KEY-1",
//         isActive: true,
//         activatedAt: new Date(),
//         expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
//         vendor: "DIRECT",
//         users: {
//           create: {
//             userId: users[0].id,
//           },
//         },
//         settings: {
//           create: {
//             userName: "Admin User",
//             model: "gpt-4",
//             replyTone: "Professional",
//             replyLength: "Medium",
//           },
//         },
//       },
//     }),
//     prisma.licenseKey.create({
//       data: {
//         key: "LICENSE-KEY-2",
//         isActive: true,
//         vendor: "APPSUMO",
//         users: {
//           create: {
//             userId: users[1].id,
//           },
//         },
//       },
//     }),
//     prisma.licenseKey.create({
//       data: {
//         key: "LICENSE-KEY-4",
//         isActive: true,
//         activatedAt: new Date(),
//         expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
//         vendor: "DIRECT",
//         users: {
//           create: {
//             userId: users[0].id,
//           },
//         },
//         settings: {
//           create: {
//             userName: "Admin User",
//             model: "gpt-3.5",
//             replyTone: "Casual",
//             replyLength: "Short",
//           },
//         },
//       },
//     }),
//   ]);

//   // Create sublicenses for LICENSE-KEY-1
//   const sublicenses = await Promise.all([
//     prisma.subLicense.create({
//       data: {
//         key: "SUB-LICENSE-1",
//         status: "ACTIVE",
//         originalLicenseKey: licenseKeys[0].key,
//         mainLicenseKeyId: licenseKeys[0].id,
//         vendor: "DIRECT",
//       },
//     }),
//     prisma.subLicense.create({
//       data: {
//         key: "SUB-LICENSE-2",
//         status: "ACTIVE",
//         originalLicenseKey: licenseKeys[0].key,
//         mainLicenseKeyId: licenseKeys[0].id,
//         vendor: "DIRECT",
//       },
//     }),
//     prisma.subLicense.create({
//       data: {
//         key: "SUB-LICENSE-3",
//         status: "ACTIVE",
//         originalLicenseKey: licenseKeys[0].key,
//         mainLicenseKeyId: licenseKeys[0].id,
//         vendor: "DIRECT",
//       },
//     }),
//   ]);

//   // Create organizations
//   const organizations = await Promise.all([
//     prisma.organization.create({
//       data: {
//         name: "Test Organization 1",
//         isPremium: true,
//         planId: plans[1].id,
//         mainLicenseKeyId: licenseKeys[0].id,
//         users: {
//           create: {
//             userId: users[0].id,
//             role: OrganizationRole.OWNER,
//           },
//         },
//       },
//     }),
//     prisma.organization.create({
//       data: {
//         name: "Test Organization 2",
//         planId: plans[0].id,
//         users: {
//           create: {
//             userId: users[1].id,
//             role: OrganizationRole.OWNER,
//           },
//         },
//       },
//     }),
//   ]);

//   // Create user credits
//   await Promise.all([
//     prisma.userCredit.create({
//       data: {
//         userId: users[0].id,
//         balance: 100,
//         transactions: {
//           create: {
//             amount: 100,
//             type: "GIFTED",
//             description: "Initial credit balance",
//           },
//         },
//       },
//     }),
//     prisma.userCredit.create({
//       data: {
//         userId: users[1].id,
//         balance: 10,
//         transactions: {
//           create: {
//             amount: 10,
//             type: "GIFTED",
//             description: "Initial credit balance",
//           },
//         },
//       },
//     }),
//   ]);

//   // Create prompts
//   await Promise.all([
//     prisma.prompt.create({
//       data: {
//         text: "Write a professional LinkedIn post about {{topic}}",
//         category: "LinkedIn",
//         title: "Professional LinkedIn Post",
//         upvotes: 5,
//         userId: users[0].id,
//       },
//     }),
//     prisma.prompt.create({
//       data: {
//         text: "Create an engaging Twitter thread about {{topic}}",
//         category: "Twitter",
//         title: "Twitter Thread Generator",
//         upvotes: 3,
//         userId: users[1].id,
//       },
//     }),
//   ]);

//   // Create installations
//   await Promise.all([
//     prisma.installation.create({
//       data: {
//         status: "INSTALLED",
//         userId: users[0].id,
//         licenseKeyId: licenseKeys[0].id,
//       },
//     }),
//     prisma.installation.create({
//       data: {
//         status: "INSTALLED",
//         userId: users[1].id,
//         licenseKeyId: licenseKeys[1].id,
//       },
//     }),
//     prisma.installation.create({
//       data: {
//         status: "INSTALLED",
//         userId: users[0].id,
//         licenseKeyId: licenseKeys[2].id, // LICENSE-KEY-4
//       },
//     }),
//   ]);

//   // Create user2 and assign 2 sublicenses under LICENSE-KEY-1
//   const user2 = await prisma.user.create({
//     data: {
//       email: "user2@example.com",
//       password: hashedPassword,
//       name: "Sublicense User",
//       isBetaTester: false,
//       username: "sub_user",
//       signInMethod: SignInMethod.EMAIL,
//       isEmailVerified: true,
//     },
//   });

//   const additionalSublicenses = await Promise.all([
//     prisma.subLicense.create({
//       data: {
//         key: "SUB-LICENSE-4",
//         status: "ACTIVE",
//         originalLicenseKey: licenseKeys[0].key,
//         mainLicenseKeyId: licenseKeys[0].id,
//         vendor: "DIRECT",
//         assignedUserId: user2.id,
//       },
//     }),
//     prisma.subLicense.create({
//       data: {
//         key: "SUB-LICENSE-5",
//         status: "ACTIVE",
//         originalLicenseKey: licenseKeys[0].key,
//         mainLicenseKeyId: licenseKeys[0].id,
//         vendor: "DIRECT",
//         assignedUserId: user2.id,
//       },
//     }),
//   ]);

//   // Add user2 to users array and combine all sublicenses
//   const allUsers = [...users, user2];
//   const allSublicenses = [...sublicenses, ...additionalSublicenses];

//   // Generate analytics data for the last 5 days
//   console.log("Generating analytics data for the last 5 days...");
//   const dates = getLastFiveDays();
//   const usageData = generateUsageData(licenseKeys, allSublicenses, allUsers, dates);

//   // Create usage tracking entries
//   console.log(`Creating ${usageData.length} usage tracking entries...`);
//   await prisma.usageTracking.createMany({
//     data: usageData,
//   });

//   console.log("Analytics data summary:");
//   console.log(`- Date range: ${dates[0].toDateString()} to ${dates[dates.length - 1].toDateString()}`);
//   console.log(`- Total usage entries: ${usageData.length}`);
//   console.log(`- License keys: ${licenseKeys.length}`);
//   console.log(`- Sublicenses: ${allSublicenses.length}`);
//   console.log(`- Users: ${allUsers.length}`);

//   console.log("Seed data created successfully with analytics!");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
