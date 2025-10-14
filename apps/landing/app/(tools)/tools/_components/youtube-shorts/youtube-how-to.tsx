"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";

const YouTubeShortsHowToUse = () => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">How to Use YouTube Short Video Sample Comment Generator</h2>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6">
            <li className="mb-2">
              <strong>Enter a username:</strong> Type the desired username in the &apos;Username&apos; input field.
            </li>
            <li className="mb-2">
              <strong>Enter a comment:</strong> Type the comment text in the &apos;Comment&apos; textarea.
            </li>
            <li className="mb-2">
              <strong>Upload a profile image (optional):</strong> Click the &apos;Choose File&apos; button and select an image file to be used as the profile image in the comment.
            </li>
            <li className="mb-2">
              <strong>Preview the comment:</strong> After entering the username, comment, and (optionally) uploading a profile image, you&apos;ll see a preview of the YouTube Shorts comment displayed on the canvas.
            </li>
            <li>
              <strong>Download the comment:</strong> Click the &apos;Download Comment&apos; button to download the comment as a PNG image file.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeShortsHowToUse;