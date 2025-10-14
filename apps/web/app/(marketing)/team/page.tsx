"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";

const TeamPage = () => {
  // Team data
  const teamMembers = [
    {
      name: "Yash",
      roles: ["Founder", "Product Manager", "Product Designer"],
      bio: "Leading product vision and strategy to help people build meaningful connections online.",
      imageUrl: "/placeholder-avatar.png",
    },
    {
      name: "Geeta",
      roles: ["Co-Founder", "Product Marketing"],
      bio: "Driving our marketing strategy and ensuring our product meets real customer needs.",
      imageUrl: "/placeholder-avatar.png",
    },
    {
      name: "Aryan",
      roles: ["Lead Engineer"],
      bio: "Architecting our platform and leading technical implementation.",
      imageUrl: "/placeholder-avatar.png",
    },
    {
      name: "Paresh",
      roles: ["Engineer"],
      bio: "Building reliable and scalable features that power our platform.",
      imageUrl: "/placeholder-avatar.png",
    },
    {
      name: "Rahul",
      roles: ["Engineer"],
      bio: "Developing innovative solutions to complex technical challenges.",
      imageUrl: "/placeholder-avatar.png",
    },
    {
      name: "Shri",
      roles: ["Data Analyst", "Sales Operations"],
      bio: "Turning data into insights and optimizing our sales processes.",
      imageUrl: "/placeholder-avatar.png",
    },
    {
      name: "Pratham",
      roles: ["Customer Success"],
      bio: "Ensuring our customers get maximum value and have an amazing experience.",
      imageUrl: "/placeholder-avatar.png",
    },
  ];

  return (
    <div className="container px-4 md:px-6 max-w-5xl mx-auto py-12 space-y-16">
      {/* Hero Section */}
      <div className="space-y-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Meet Our Team
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're a passionate team working to transform how people connect and engage online.
        </p>
      </div>

      {/* Team Values Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Customer Obsession</h3>
              <p className="text-muted-foreground">
                We start with the customer and work backwards, creating products and experiences that solve real problems.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Innovation</h3>
              <p className="text-muted-foreground">
                We push boundaries and challenge the status quo to create groundbreaking solutions.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Transparency</h3>
              <p className="text-muted-foreground">
                We communicate openly and honestly, both with our team and our customers.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Growth Mindset</h3>
              <p className="text-muted-foreground">
                We embrace challenges, learn from feedback, and continuously improve.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold border-b pb-3">Our Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="bg-card rounded-xl p-6 hover:shadow-md transition-shadow border border-border"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={member.imageUrl} alt={member.name} />
                  <AvatarFallback className="text-4xl">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-3">
                  {member.roles.join(" & ")}
                </p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join the Team Section */}
      <div className="bg-muted rounded-3xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          We're always looking for talented individuals who are passionate about building the future of online engagement.
        </p>
        <Link href="/contact">
          <Button size="lg" className="group">
            Get in Touch
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TeamPage; 