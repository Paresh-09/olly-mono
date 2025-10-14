"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";

interface CommentGeneratorIntroductionProps {
  platformName: string;
}

const CommentGeneratorIntroduction: React.FC<CommentGeneratorIntroductionProps> = ({ platformName }) => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">What is {platformName} Comment Generator?</h2>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Welcome to the {platformName} Comment Generator, a versatile tool designed to help you create engaging and tailored comments for {platformName}. Whether you&apos;re a content creator, social media manager, or simply looking to enhance your online presence, this tool simplifies the process of generating comments that resonate with your audience.
          </p>
          <p className="mb-4">
            With the {platformName} Comment Generator, you can easily customize your comments by choosing an appropriate commenting style, specifying the writing style, and determining the comment length. This flexibility allows you to create comments that align with your brand voice, target audience, and the specific platform you&apos;re using.
          </p>
          <h3 className="text-lg font-bold mb-2">Key Features</h3>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">
              <strong>Commenting Styles:</strong> Choose from formal, casual, or humorous commenting styles to match the tone of your post and engage your audience effectively.
            </li>
            <li className="mb-2">
              <strong>Writing Styles:</strong> Select from analytical, personal, or persuasive writing styles to craft comments that resonate with your intended message and purpose.
            </li>
            <li className="mb-2">
              <strong>Comment Length:</strong> Specify the desired length of your comment, with options for short, medium, or long comments, to suit your preferences and {platformName}&apos;s character limits.
            </li>
          </ul>
          <p className="mb-4">
            The {platformName} Comment Generator leverages advanced natural language processing and machine learning techniques to generate coherent, relevant, and engaging comments based on the provided post content and your selected customization options. This tool aims to save you time and effort while helping you create meaningful interactions with your audience on {platformName}.
          </p>
          <p className="mb-4">
            Start using the {platformName} Comment Generator today and elevate your {platformName} presence with tailored, high-quality comments that captivate your audience and foster meaningful engagement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentGeneratorIntroduction;