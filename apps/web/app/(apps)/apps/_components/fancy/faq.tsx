"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";

interface CommentGeneratorFAQProps {
  platformName: string;
}

const CommentGeneratorFAQ: React.FC<CommentGeneratorFAQProps> = ({ platformName }) => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">What is the {platformName} Comment Generator?</h3>
            <p>
              The {platformName} Comment Generator is an online tool that allows you to create custom comments for {platformName}. You can choose the commenting style, writing style, and comment length to generate a tailored comment based on the provided post content.
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">How do I use the {platformName} Comment Generator?</h3>
            <ol className="list-decimal pl-6">
              <li className="mb-2">Enter the post content in the &apos;Post Content&apos; textarea.</li>
              <li className="mb-2">Choose the commenting style from the &apos;Commenting Style&apos; dropdown.</li>
              <li className="mb-2">Select the writing style from the &apos;Writing Style&apos; dropdown.</li>
              <li className="mb-2">Choose the desired comment length from the &apos;Comment Length&apos; dropdown.</li>
              <li>Click the &apos;Generate Comment&apos; button to generate a comment based on your selections.</li>
            </ol>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Can I use the generated comments on my {platformName} posts?</h3>
            <p>
              Yes, you can use the generated comments on your {platformName} posts. However, please ensure that the comments are relevant, appropriate, and align with {platformName}&apos;s guidelines and policies.
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Are there any limitations on the comment length?</h3>
            <p>
              The {platformName} Comment Generator provides three options for comment length: short, medium, and long. The actual length of the generated comment may vary based on the selected length option and the provided post content.
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Can I customize the generated comments further?</h3>
            <p>
              Currently, the {platformName} Comment Generator allows you to customize the comment by selecting the commenting style, writing style, and comment length. Additional customization options may be added in future updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentGeneratorFAQ;