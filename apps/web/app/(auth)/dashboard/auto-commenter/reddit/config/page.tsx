import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AutoCommenterWrapper } from "../../_components/auto-commenter-wrapper";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { CommentPlatform } from "@repo/db";

export const metadata: Metadata = {
  title: "Reddit Auto Commenter Configuration",
  description: "Configure your Reddit auto commenting settings",
};

export default async function RedditConfigPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  if (!user.isBetaTester) {
    redirect("/dashboard");
  }

  const oAuthUser = await prismadb.user.findUnique({
    where: { id: user.id },
    include: {
      oauthTokens: {
        where: {
          platform: CommentPlatform.REDDIT,
        },
      },
      credit: true,
    },
  });

  // Check if user has valid Reddit OAuth token
  const redditToken = oAuthUser?.oauthTokens?.[0];
  if (
    !oAuthUser ||
    !redditToken ||
    !redditToken.accessToken ||
    !redditToken.isValid
  ) {
    return redirect("/dashboard/auto-commenter");
  }

  const availableCredits = oAuthUser.credit?.balance || 0;

  return (
    <div className="container mx-auto py-8 flex flex-col gap-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
        Reddit Auto Commenter
      </h1>
      <AutoCommenterWrapper
        availableCredits={availableCredits}
        platform="REDDIT"
      />
    </div>
  );
}
