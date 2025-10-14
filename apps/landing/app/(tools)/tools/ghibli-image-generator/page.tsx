import { NextPage } from "next";
import { Metadata } from "next";
import Head from "next/head";
import { GhibliImageGenerator } from "../_components/ghibli-generator/ghibli-generator";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { toolDetails } from "@/data/tool-details";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Ghibli-Style Image Generator - Create Magical Studio Ghibli Art",
  description:
    "Create beautiful Studio Ghibli-inspired artwork with AI. Generate enchanting images with the iconic Ghibli art style, magical elements, and scenic landscapes.",
  openGraph: {
    title: "Ghibli-Style Image Generator | Create Magical Studio Ghibli Art",
    description:
      "Create beautiful Studio Ghibli-inspired artwork with AI. Generate enchanting images with the iconic Ghibli art style, magical elements, and scenic landscapes.",
    images: [
      {
        url: "/images/og/ghibli-image-generator.png",
        width: 1200,
        height: 630,
        alt: "Ghibli Image Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghibli-Style Image Generator | Create Magical Studio Ghibli Art",
    description:
      "Create beautiful Studio Ghibli-inspired artwork with AI. Generate enchanting images with the iconic Ghibli art style, magical elements, and scenic landscapes.",
    images: ["/images/og/ghibli-image-generator.png"],
  },
};

const GhibliImageGeneratorPage: NextPage = () => {
  const toolDetail = toolDetails["ghibli-image-generator"];

  return (
    <>
      <ToolPageLayout
        title={toolDetail.name}
        description={toolDetail.shortDescription}
      >
        <Head>
          <title>
            Ghibli-Style Image Generator - Create Magical Studio Ghibli Art
          </title>
          <meta
            name="description"
            content="Create beautiful Studio Ghibli-inspired artwork with AI. Generate enchanting images with the iconic Ghibli art style, magical elements, and scenic landscapes."
          />
        </Head>

        <div className="container py-12 mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-center mb-4">
            Ghibli-Style Image Generator
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            Create beautiful artwork in the iconic Studio Ghibli style. Generate
            enchanting scenes with magical elements and the distinctive Ghibli
            aesthetic.
          </p>

          <GhibliImageGenerator />

          <div className="mt-16 mx-auto">
            <h2 className="text-2xl font-semibold mt-12 mb-4">
              Prompt Suggestions
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3 text-sm text-gray-700">
                <li>
                  "A cozy cottage in a forest clearing with fireflies at dusk,
                  Studio Ghibli style"
                </li>
                <li>
                  "A flying castle among fluffy clouds with birds soaring around
                  it, Ghibli art style"
                </li>
                <li>
                  "A quiet countryside train station with spirits waiting for
                  the next train, Ghibli style"
                </li>
                <li>
                  "A magical bathhouse by the sea at night with lanterns
                  glowing, Ghibli style"
                </li>
                <li>
                  "A girl and a large forest spirit walking through a field of
                  flowers, Ghibli style"
                </li>
                <li>
                  "A cat café in a small town with magical cat creatures serving
                  tea, Ghibli style"
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <ToolContentSections toolDetail={toolDetail} />
           <ToolReviewsSection 
                  productSlug="ghibli-image-generator"
                  title="Customer Reviews"
                />
        </div>
      </ToolPageLayout>
    </>
  );
};

export default GhibliImageGeneratorPage;
