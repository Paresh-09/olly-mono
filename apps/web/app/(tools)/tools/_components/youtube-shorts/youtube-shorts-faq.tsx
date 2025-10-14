"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
const YoutubeFAQ = () => {
  return (
    <div className="container mx-auto p-4">
      {" "}
      <Card>
        {" "}
        <CardHeader>
          {" "}
          <h2 className="text-2xl font-bold">
            Frequently Asked Questions
          </h2>{" "}
        </CardHeader>{" "}
        <CardContent>
          {" "}
          <div className="mb-6">
            {" "}
            <h3 className="text-lg font-bold mb-2">
              What is the YouTube Shorts Comment Generator?
            </h3>{" "}
            <p>
              {" "}
              The YouTube Shorts Comment Generator is a powerful online tool
              that allows you to create custom YouTube Shorts comments with a
              profile image and a simulated comment box. You can enter your
              desired username, comment text, and optionally upload a profile
              image, and the generator will render a realistic-looking YouTube
              Shorts comment on a canvas.{" "}
            </p>{" "}
          </div>{" "}
          <div className="mb-6">
            {" "}
            <h3 className="text-lg font-bold mb-2">
              How do I use the YouTube Shorts Comment Generator?
            </h3>{" "}
            <ol className="list-decimal pl-6">
              {" "}
              <li className="mb-2">
                Enter a username in the &apos;Username&apos; input field.
              </li>{" "}
              <li className="mb-2">
                Type your comment in the &apos;Comment&apos; textarea.
              </li>{" "}
              <li className="mb-2">
                Optionally, upload a profile image by clicking the &apos;Choose
                File&apos; button.
              </li>{" "}
              <li className="mb-2">
                Preview the generated comment on the canvas.
              </li>{" "}
              <li>
                Click the &apos;Download Comment&apos; button to download the
                comment as a PNG image file.
              </li>{" "}
            </ol>{" "}
          </div>{" "}
          <div className="mb-6">
            {" "}
            <h3 className="text-lg font-bold mb-2">
              Can I use the generated comments in my YouTube Shorts videos?
            </h3>{" "}
            <p>
              {" "}
              Absolutely! The YouTube Shorts Comment Generator is designed to
              create visually appealing comments that can seamlessly integrate
              into your YouTube Shorts videos. You can use the downloaded PNG
              image files and overlay them onto your videos, creating a more
              engaging and interactive experience for your audience.{" "}
            </p>{" "}
          </div>{" "}
          <div className="mb-6">
            {" "}
            <h3 className="text-lg font-bold mb-2">
              Are there any limitations on the comment text or username length?
            </h3>{" "}
            <p>
              {" "}
              Yes, there are some limitations to ensure the generated comments
              maintain a clean and readable appearance. The username is
              truncated if it exceeds 30 characters, and the comment text is
              automatically wrapped if it exceeds the width of the comment box.{" "}
            </p>{" "}
          </div>{" "}
          <div className="mb-6">
            {" "}
            <h3 className="text-lg font-bold mb-2">
              Can I use the generated comments for commercial purposes?
            </h3>{" "}
            <p>
              {" "}
              The YouTube Shorts Comment Generator is designed for personal and
              non-commercial use. If you plan to use the generated comments for
              commercial purposes, such as marketing campaigns or sponsored
              content, please consult with our terms of service and seek proper
              permissions or licenses.{" "}
            </p>{" "}
          </div>{" "}
          <div className="mb-6">
            {" "}
            <h3 className="text-lg font-bold mb-2">
              Are there any future updates or improvements planned for the
              YouTube Shorts Comment Generator?
            </h3>{" "}
            <p>
              {" "}
              Yes, we are continuously working on improving and expanding the
              capabilities of the YouTube Shorts Comment Generator. Some planned
              updates include animated comments, comment threads, custom font
              and style options, and multi-language support. Stay tuned for more
              exciting features in the future!{" "}
            </p>{" "}
          </div>{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
};
export default YoutubeFAQ;
