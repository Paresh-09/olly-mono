"use client";
import React from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import Image from "next/image";
import { Play, Upload, Download } from "lucide-react";

const InstagramCommentGuide = () => {
  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">How to Use Instagram Comment Generator</h1>
          <p className="text-gray-600 text-lg">Follow these simple steps to create amazing Instagram comments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 Card */}
          <div className="group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <div className="w-full h-64 relative overflow-hidden">
                  <Image
                    src="/tools/how-to/insta-comment-gen/1.png"
                    fill
                    alt="Enter Details"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Enter Details</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Personalize your Instagram comment by entering a username and writing a comment. Customize the text to match your brand voice and engagement style.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <div className="w-full h-64 relative overflow-hidden">
                  <Image
                    src="/tools/how-to/insta-comment-gen/2.png"
                    fill
                    alt="Upload & Preview"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Upload & Preview</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Upload a profile image to make the comment look authentic. Instantly preview the comment with our Free Instagram Comment Generator, just like it would appear on Instagram.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 Card */}
          <div className="group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <div className="w-full h-64 relative overflow-hidden">
                  <Image
                    src="/tools/how-to/insta-comment-gen/3.png"
                    fill
                    alt="Download"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-sm">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Download</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Once you're happy with the look, click "Download Generated Comment" to save your design as a PNG image. Ideal for mockups, reels, or social media previews.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Tips Section */}
        <div className="mt-16">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Pro Tips for Best Results</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">💡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Use Authentic Usernames</h4>
                    <p className="text-gray-600 text-sm">Choose realistic usernames that match your target audience for more authentic-looking comments.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">🎨</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Customize Colors</h4>
                    <p className="text-gray-600 text-sm">Experiment with different background colors to match your brand or post aesthetic.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">📱</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Perfect for Reels</h4>
                    <p className="text-gray-600 text-sm">These comment stickers work perfectly in Instagram Reels to show engagement and social proof.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Bulk Generation</h4>
                    <p className="text-gray-600 text-sm">Use the bulk mode to create multiple comments at once for comprehensive social proof.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstagramCommentGuide;