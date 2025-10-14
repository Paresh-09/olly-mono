import { NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SUMMARY_CREDIT_COST = process.env.SUMMARY_CREDIT_COST
  ? parseInt(process.env.SUMMARY_CREDIT_COST, 10)
  : 5;

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { licenseKey, documentText, formData } = body;

    if (!licenseKey) {
      return NextResponse.json(
        { error: "License key is required" },
        { status: 400 },
      );
    }

    // Attempt to find license or sublicense
    let license = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
      include: { customKnowledge: true },
    });

    if (!license) {
      const subLicense = await prismadb.subLicense.findUnique({
        where: { key: licenseKey },
        include: {
          mainLicenseKey: {
            include: { customKnowledge: true },
          },
        },
      });

      if (!subLicense || !subLicense.mainLicenseKey) {
        return NextResponse.json(
          { error: "License key not found" },
          { status: 404 },
        );
      }

      license = subLicense.mainLicenseKey;
    }

    let userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id },
    });

    if (!userCredit) {
      userCredit = await prismadb.userCredit.create({
        data: {
          userId: user.id,
          balance: 10,
        },
      });
    }

    if (userCredit.balance < SUMMARY_CREDIT_COST) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          currentBalance: userCredit.balance,
          requiredCredits: SUMMARY_CREDIT_COST,
          remainingCredits: userCredit.balance,
        },
        { status: 403 },
      );
    }

    if (
      !documentText &&
      (!formData || Object.keys(formData).every((key) => !formData[key]))
    ) {
      return NextResponse.json(
        {
          error:
            "Either document text or form data is required to generate a summary",
        },
        { status: 400 },
      );
    }

    // Update or create custom knowledge
    if (formData && Object.keys(formData).some((key) => formData[key])) {
      if (!license.customKnowledge) {
        const newCustomKnowledge =
          await prismadb.licenseKeyCustomKnowledge.create({
            data: {
              licenseKeyId: license.id,
              ...formData,
            },
          });
        license.customKnowledge = newCustomKnowledge;
      } else {
        const updatedCustomKnowledge =
          await prismadb.licenseKeyCustomKnowledge.update({
            where: {
              id: license.customKnowledge.id,
            },
            data: formData,
          });
        license.customKnowledge = updatedCustomKnowledge;
      }
    }

    const prompt = generateSummaryPrompt(license.customKnowledge, documentText);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert brand strategist who creates concise, insightful brand summaries.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const content =
      response.choices[0].message.content || "Could not generate a summary.";

    await prismadb.userCredit.update({
      where: { userId: user.id },
      data: { balance: userCredit.balance - SUMMARY_CREDIT_COST },
    });

    let summary;
    if (license.customKnowledge?.id) {
      summary = await prismadb.licenseKeyKnowledgeSummary.create({
        data: {
          summary: content,
          licenseKeyCustomKnowledgeId: license.customKnowledge.id,
        },
      });
    } else {
      const customKnowledge = await prismadb.licenseKeyCustomKnowledge.create({
        data: {
          licenseKeyId: license.id,
        },
      });

      summary = await prismadb.licenseKeyKnowledgeSummary.create({
        data: {
          summary: content,
          licenseKeyCustomKnowledgeId: customKnowledge.id,
        },
      });
    }

    return NextResponse.json({
      ...summary,
      remainingCredits: userCredit.balance - SUMMARY_CREDIT_COST,
    });
  } catch (error) {
    console.error("Error generating custom knowledge summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}

// -------------------------
// Helper Functions
// -------------------------

function generateSummaryPrompt(customKnowledge: any, documentText?: string) {
  let prompt = "";
  const isPersonalBrand = customKnowledge?.isPersonalBrand === true;

  prompt += isPersonalBrand
    ? "Generate a concise personal brand summary based on the following information about this individual:\n\n"
    : "Generate a concise brand summary based on the following information:\n\n";

  if (customKnowledge) {
    prompt += isPersonalBrand
      ? "## Personal Profile Information\n"
      : "## Brand Profile Information\n";

    if (isPersonalBrand) {
      if (customKnowledge.brandName)
        prompt += `Name: ${customKnowledge.brandName}\n`;
      if (customKnowledge.personalBackground)
        prompt += `Background: ${customKnowledge.personalBackground}\n`;
      if (customKnowledge.professionalBackground)
        prompt += `Professional Experience: ${customKnowledge.professionalBackground}\n`;
      if (customKnowledge.expertise)
        prompt += `Expertise: ${customKnowledge.expertise}\n`;
      if (customKnowledge.industry)
        prompt += `Industry: ${customKnowledge.industry}\n`;
      if (customKnowledge.brandPersonality)
        prompt += `Personality: ${customKnowledge.brandPersonality}\n`;
      if (customKnowledge.targetAudience)
        prompt += `Target Audience: ${customKnowledge.targetAudience}\n`;
      if (customKnowledge.productServices)
        prompt += `Services/Skills: ${customKnowledge.productServices}\n`;
      if (customKnowledge.uniqueSellingPoints)
        prompt += `Unique Strengths: ${customKnowledge.uniqueSellingPoints}\n`;
      if (customKnowledge.brandVoice)
        prompt += `Tone of Voice: ${customKnowledge.brandVoice}\n`;
      if (customKnowledge.missionStatement)
        prompt += `Personal Mission: ${customKnowledge.missionStatement}\n`;
    } else {
      if (customKnowledge.brandName)
        prompt += `Brand Name: ${customKnowledge.brandName}\n`;
      if (customKnowledge.industry)
        prompt += `Industry: ${customKnowledge.industry}\n`;
      if (customKnowledge.brandPersonality)
        prompt += `Brand Personality: ${customKnowledge.brandPersonality}\n`;
      if (customKnowledge.targetAudience)
        prompt += `Target Audience: ${customKnowledge.targetAudience}\n`;
      if (customKnowledge.productServices)
        prompt += `Products/Services: ${customKnowledge.productServices}\n`;
      if (customKnowledge.uniqueSellingPoints)
        prompt += `Unique Selling Points: ${customKnowledge.uniqueSellingPoints}\n`;
      if (customKnowledge.brandVoice)
        prompt += `Brand Voice: ${customKnowledge.brandVoice}\n`;
      if (customKnowledge.missionStatement)
        prompt += `Mission Statement: ${customKnowledge.missionStatement}\n`;
    }
  }

  if (documentText) {
    prompt += "\n## Additional Document Content\n";
    prompt += documentText;
    prompt +=
      "\n\nPlease incorporate relevant information from both the profile and the document content, prioritizing the profile information where available.";
  }

  prompt += isPersonalBrand
    ? "\n\nCreate a comprehensive yet concise summary that captures this individual's authentic voice, personal brand, values, and expertise. The summary should sound personal and reflect their unique identity and professional perspective."
    : "\n\nCreate a comprehensive yet concise summary that captures the essence of this brand's voice, values, and positioning in the marketplace.";

  return prompt;
}
