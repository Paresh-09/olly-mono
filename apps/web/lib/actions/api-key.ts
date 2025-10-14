import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { ActionResult } from "@/lib/form";
import { generateApiKey } from "@/lib/utils";

export async function getUserApiKeys(): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const apiKeys = await prismadb.apiKey.findMany({
      where: {
        users: {
          some: {
            userId: user.id
          }
        }
      },
      select: {
        id: true,
        key: true,
        isActive: true,
      }
    });

    return { success: JSON.stringify(apiKeys) };
  } catch (error) {
    console.error("Error fetching user API keys:", error);
    return { error: "Failed to fetch API keys" };
  }
}

export async function generateNewApiKey(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const newApiKey = generateApiKey();
    const createdApiKey = await prismadb.apiKey.create({
      data: {
        key: newApiKey,
        users: {
          create: {
            userId: user.id
          }
        }
      }
    });

    return { success: JSON.stringify(createdApiKey) };
  } catch (error) {
    console.error("Error generating new API key:", error);
    return { error: "Failed to generate new API key" };
  }
}

export async function toggleApiKeyStatus(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const apiKeyId = formData.get('apiKeyId') as string;
  if (!apiKeyId) {
    return { error: "API Key ID is required" };
  }

  try {
    const apiKey = await prismadb.apiKey.findUnique({
      where: { id: apiKeyId },
      include: { users: true }
    });

    if (!apiKey || !apiKey.users.some(u => u.userId === user.id)) {
      return { error: "Unauthorized to modify this API key" };
    }

    const updatedApiKey = await prismadb.apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: !apiKey.isActive }
    });

    return { success: JSON.stringify(updatedApiKey) };
  } catch (error) {
    console.error("Error toggling API key status:", error);
    return { error: "Failed to toggle API key status" };
  }
}