"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Loader2, MessageCircle, Sparkles, Send, Users, ArrowLeft } from "lucide-react";
import { toast } from "@repo/ui/hooks/use-toast";

const DISCORD_INVITE_LINK = "https://discord.gg/Phg8nwJEek";
const GET_ANSWERS_LINK = "https://chatgpt.com/g/g-LVAKUYjrB-olly-faq"; // Replace with your actual link

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, { message: "Message is required" }),
});

type ContactFormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ContactFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      reset();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later or reach out on Discord.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="border-b border-gray-200  ">
        <div className="  px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3 sm:space-x-4">

            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0C9488] rounded-xl flex items-center justify-center shadow-lg shadow-[#0C9488]/25">
              <MessageCircle className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Contact Us
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                Get in touch with our team
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="  px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Discord Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Join Our Discord</h3>
                  <p className="text-sm text-gray-600">Preferred way to connect</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Get instant help from our community and team. Most questions are answered within minutes!
              </p>
              <button
                onClick={() => window.open(DISCORD_INVITE_LINK, "_blank")}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25"
              >
                <Image
                  src="/images/discord-logo.svg"
                  alt="Discord"
                  width={20}
                  height={20}
                  className="filter brightness-0 invert"
                />
                <span>Join Discord</span>
              </button>
            </div>

            {/* AI Answers Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#0C9488] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Help</h3>
                  <p className="text-sm text-gray-600">Instant answers 24/7</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Get instant answers to 90% of common questions using our AI assistant trained on our knowledge base.
              </p>
              <button
                onClick={() => window.open(GET_ANSWERS_LINK, "_blank")}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg shadow-[#0C9488]/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Instant Answers</span>
              </button>
            </div>


          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/40 shadow-xl shadow-gray-200/50">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Send us a message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible. For faster responses, consider joining our Discord community!
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="Your full name"
                      {...register("name")}
                      disabled={isSubmitting}
                      className="h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C9488] focus:border-transparent"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...register("email")}
                      disabled={isSubmitting}
                      className="h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C9488] focus:border-transparent"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone (Optional)
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...register("phone")}
                      disabled={isSubmitting}
                      className="h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C9488] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="What's this about?"
                      {...register("subject")}
                      disabled={isSubmitting}
                      className="h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C9488] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    placeholder="Tell us how we can help you..."
                    {...register("message")}
                    disabled={isSubmitting}
                    rows={6}
                    className="bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0C9488] focus:border-transparent resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 px-6 bg-gradient-to-r from-[#0C9488] to-[#0a7d73] hover:from-[#0a7d73] hover:to-[#086963] disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg shadow-[#0C9488]/25 disabled:shadow-gray-400/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">💡 Pro tip:</span> For the fastest response, join our Discord community where our team and community members are always ready to help!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}