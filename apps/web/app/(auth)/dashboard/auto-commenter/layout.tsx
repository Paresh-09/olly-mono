import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Commenter Configuration",
  description: "Configure your auto commenting settings",
};

export default function AutoCommenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 