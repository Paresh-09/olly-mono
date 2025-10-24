"use client"; 
import React from "react"; 
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card"; 

interface CommentGeneratorHowToUseProps {
  platformName: string;
}

const CommentGeneratorHowToUse: React.FC<CommentGeneratorHowToUseProps> = ({ platformName }) => { 
  return ( 
    <div className="container mx-auto p-4"> 
      <Card> 
        <CardHeader> 
          <h2 className="text-2xl font-bold">How to Use {platformName} Comment Generator</h2> 
        </CardHeader> 
        <CardContent> 
          <ol className="list-decimal pl-6"> 
            <li className="mb-2"> 
              <strong>Enter Post Content:</strong> In the &apos;Post Content&apos; textarea, provide the content of the post for which you want to generate a comment. This could be the text, description, or any relevant information related to the post.
            </li> 
            <li className="mb-2"> 
              <strong>Choose Commenting Style:</strong> Select the desired commenting style from the &apos;Commenting Style&apos; dropdown. You can choose from formal, casual, or humorous styles, depending on the tone you want to convey in your comment.
            </li> 
            <li className="mb-2"> 
              <strong>Select Writing Style:</strong> From the &apos;Writing Style&apos; dropdown, choose the writing style that best suits your comment. The available options are analytical, personal, or persuasive. Consider the purpose and intended impact of your comment when making this selection.
            </li>
            <li className="mb-2">
              <strong>Specify Comment Length:</strong> Use the &apos;Comment Length&apos; dropdown to specify the desired length of your generated comment. You can choose from short, medium, or long options, depending on your preference and {platformName}&apos;s character limits.
            </li>
            <li className="mb-2">
              <strong>Generate Comment:</strong> After providing the post content and selecting the desired customization options, click the &apos;Generate Comment&apos; button. The {platformName} Comment Generator will process your input and generate a tailored comment based on your specifications.
            </li>
            <li>
              <strong>Review and Use the Generated Comment:</strong> Once the comment is generated, it will be displayed in the &apos;Generated Comment&apos; section below the form. Review the generated comment to ensure it meets your expectations. You can copy the comment by clicking the &apos;Copy&apos; button and then paste it into your desired {platformName} post.
            </li>
          </ol>
          <p className="mt-4">
            By following these steps, you can easily generate customized comments for your {platformName} posts using the {platformName} Comment Generator. Experiment with different combinations of commenting styles, writing styles, and comment lengths to create comments that effectively engage your audience and align with your brand voice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentGeneratorHowToUse;