"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui/card';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Slider } from '@repo/ui/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Badge } from "@repo/ui/components/ui/badge";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { saveAs } from 'file-saver';

interface NicheScore {
  niche: string;
  score: number;
  description: string;
  keyStrengths: string[];
  potentialChallenges: string[];
  contentIdeas: string[];
  monetizationStrategies: string[];
}

interface SkillData {
  subject: string;
  value: number;
  recommendations: string[];
}

interface MarketAnalysis {
  trendAlignment: number;
  competitionLevel: number;
  growthPotential: number;
  analysis: string;
}

interface NicheResponse {
  recommendedNiches: NicheScore[];
  skillsAssessment: SkillData[];
  marketAnalysis: MarketAnalysis;
  nextSteps: string[];
}

const CONTENT_FORMATS = [
  "Written Content",
  "Video Content",
  "Audio Content",
  "Visual Content",
  "Live Streaming",
  "Social Media",
  "Educational Content",
  "Entertainment"
];

const EXPERTISE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Expert",
  "Industry Leader"
];

const AUDIENCE_TYPES = [
  "Professionals",
  "Students",
  "Hobbyists",
  "Entrepreneurs",
  "Creators",
  "Tech Enthusiasts",
  "Lifestyle Seekers",
  "General Public"
];

const BUSINESS_MODELS = [
  "One-to-Many (Courses/Products)",
  "One-to-One (Coaching/Consulting)",
  "Hybrid",
  "Membership/Community",
  "Advertising/Sponsorship",
  "Affiliate Marketing",
  "Digital Products",
  "Services"
];

const PERSONALITY_TYPES = [
  "The Entertainer 🎭",
  "The Teacher 📚",
  "The Problem Solver 🔧",
  "The Storyteller 📖",
  "The Trendsetter 🌟",
  "The Analyst 📊",
  "The Motivator 💪",
  "The Artist 🎨"
];

const CONTENT_STYLES = [
  "Casual & Fun 😊",
  "Professional & Polished 👔",
  "Edgy & Bold 🔥",
  "Calm & Zen 🧘‍♂️",
  "Quirky & Unique 🦄",
  "Smart & Analytical 🤓",
  "Inspiring & Motivational ✨",
  "Raw & Authentic 💯"
];

const DREAM_SCENARIOS = [
  "Building a Million-Dollar Course Empire 💰",
  "Becoming a Renowned Industry Expert 🏆",
  "Creating a Thriving Community 👥",
  "Making Complex Topics Simple 🎯",
  "Inspiring Others to Change Their Lives 🌈",
  "Building a Personal Brand Empire 👑",
  "Becoming a Thought Leader 💭",
  "Creating Viral Content Daily 🚀"
];

const SUPERPOWER_CHOICES = [
  "Time Manipulation ⌛",
  "Mind Reading 🧠",
  "Instant Skill Mastery 🎯",
  "Perfect Communication 🗣️",
  "Trend Prediction 📈",
  "Infinite Creativity 🎨",
  "Universal Appeal 🌍",
  "Problem Solving 🔧"
];

const CURRENT_ROLES = [
  "Founder/Entrepreneur 👔",
  "Developer/Engineer 💻",
  "Designer 🎨",
  "Marketing Professional 📈",
  "Product Manager 🎯",
  "Sales Professional 💼",
  "Educator/Teacher 📚",
  "Creative Professional 🎭",
  "Healthcare Professional 🏥",
  "Finance Professional 💰",
  "Consultant 🤝",
  "Student 📖",
  "Content Creator 🎥",
  "Other 🌟"
];

const EXPERTISE_TOPICS = {
  "Technology": [
    "Web Development",
    "Mobile Development",
    "AI/Machine Learning",
    "Blockchain/Crypto",
    "Cloud Computing",
    "DevOps",
    "Cybersecurity",
    "Data Science",
    "UI/UX Design",
    "Software Architecture"
  ],
  "Business": [
    "Startups",
    "Marketing",
    "Sales",
    "Product Management",
    "Entrepreneurship",
    "Finance",
    "Business Strategy",
    "E-commerce",
    "Leadership",
    "Remote Work"
  ],
  "Creative": [
    "Graphic Design",
    "Video Production",
    "Photography",
    "Animation",
    "Music",
    "Writing",
    "Digital Art",
    "3D Modeling",
    "Game Design",
    "Fashion"
  ],
  "Personal Development": [
    "Productivity",
    "Mental Health",
    "Career Growth",
    "Leadership",
    "Public Speaking",
    "Time Management",
    "Personal Finance",
    "Mindfulness",
    "Networking",
    "Goal Setting"
  ],
  "Education": [
    "Online Learning",
    "Teaching Methods",
    "Course Creation",
    "Educational Technology",
    "Language Learning",
    "Test Preparation",
    "Academic Writing",
    "Research Methods",
    "Student Success",
    "Adult Education"
  ],
  "Lifestyle": [
    "Health & Fitness",
    "Travel",
    "Food & Cooking",
    "Home & Living",
    "Fashion & Style",
    "Relationships",
    "Parenting",
    "Pet Care",
    "Sustainable Living",
    "Hobbies"
  ]
};

const CONTENT_GOALS = [
  "Build Personal Brand 👤",
  "Generate Leads 🎯",
  "Share Knowledge 📚",
  "Build Community 👥",
  "Drive Sales 💰",
  "Establish Authority 👑",
  "Entertain Audience 🎭",
  "Help Others 🤝",
  "Document Journey 📝",
  "Create Portfolio 🎨"
];

const TARGET_PLATFORMS = [
  "YouTube 🎥",
  "LinkedIn 💼",
  "Twitter/X 🐦",
  "Instagram 📸",
  "TikTok 🎵",
  "Blog/Website 💻",
  "Podcast 🎙️",
  "Newsletter 📧",
  "GitHub 🐙",
  "Medium ✍️"
];

const CONTENT_TYPES = [
  "How-to Tutorials 📝",
  "Behind the Scenes 🎬",
  "Case Studies 📊",
  "Product Reviews 🔍",
  "Industry News 📰",
  "Tips & Tricks 💡",
  "Day in the Life 📅",
  "Project Breakdowns 🛠️",
  "Expert Interviews 🎤",
  "Live Coding/Demo 👨‍💻",
  "Q&A Sessions ❓",
  "Success Stories 🌟"
];

const NicheFinder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Current Roles & Experience
    currentRoles: [] as string[],
    yearsOfExperience: "",
    expertiseTopics: {} as Record<string, string[]>,

    // Content Goals & Platforms
    contentGoals: [] as string[],
    targetPlatforms: [] as string[],
    preferredContentTypes: [] as string[],

    // Creator Profile
    personalityType: "",
    superpower: "",
    contentStyle: "",
    dreamScenario: "",

    // Preferences & Comfort
    cameraComfort: 50,
    researchPassion: 50,
    trendFocus: 50,
    schedule: "casual",
    moneyFocus: "passion",
    techLevel: "basic"
  });

  const [showResults, setShowResults] = useState(false);
  const [apiResponse, setApiResponse] = useState<NicheResponse | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tools/niche-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze niche');
      }

      const data = await response.json();
      setApiResponse(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!apiResponse) return;

    const report = {
      profile: formData,
      analysis: apiResponse,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    saveAs(blob, 'content-creator-niche-analysis.json');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Tell Us About Your Current Roles! 👋</h3>
            <div className="space-y-6">
              <div>
                <p className="text-center text-muted-foreground mb-4">Select all roles that apply to you:</p>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-4">
                    {CURRENT_ROLES.map(role => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.currentRoles.includes(role)}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              currentRoles: checked
                                ? [...formData.currentRoles, role]
                                : formData.currentRoles.filter(r => r !== role)
                            });
                          }}
                        />
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {role}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <p className="text-center text-muted-foreground mb-4">Years of professional experience:</p>
                <Select
                  value={formData.yearsOfExperience}
                  onValueChange={(value) => setFormData({ ...formData, yearsOfExperience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">Less than 1 year 🌱</SelectItem>
                    <SelectItem value="1-3">1-3 years 🌿</SelectItem>
                    <SelectItem value="3-5">3-5 years 🌳</SelectItem>
                    <SelectItem value="5-10">5-10 years 🎯</SelectItem>
                    <SelectItem value="10+">10+ years 🏆</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Your Areas of Expertise 🎯</h3>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-6">
                {Object.entries(EXPERTISE_TOPICS).map(([category, topics]) => (
                  <div key={category} className="space-y-4">
                    <h4 className="font-semibold">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {topics.map(topic => (
                        <div key={topic} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.expertiseTopics[category]?.includes(topic) || false}
                            onCheckedChange={(checked) => {
                              const currentTopics = formData.expertiseTopics[category] || [];
                              setFormData({
                                ...formData,
                                expertiseTopics: {
                                  ...formData.expertiseTopics,
                                  [category]: checked
                                    ? [...currentTopics, topic]
                                    : currentTopics.filter(t => t !== topic)
                                }
                              });
                            }}
                          />
                          <label className="text-sm font-medium leading-none">
                            {topic}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Content Goals & Platforms 🎯</h3>
            <div className="space-y-8">
              <div>
                <p className="text-center text-muted-foreground mb-4">What are your main content creation goals?</p>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {CONTENT_GOALS.map(goal => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.contentGoals.includes(goal)}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              contentGoals: checked
                                ? [...formData.contentGoals, goal]
                                : formData.contentGoals.filter(g => g !== goal)
                            });
                          }}
                        />
                        <label className="text-sm font-medium leading-none">
                          {goal}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <p className="text-center text-muted-foreground mb-4">Which platforms interest you?</p>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {TARGET_PLATFORMS.map(platform => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.targetPlatforms.includes(platform)}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              targetPlatforms: checked
                                ? [...formData.targetPlatforms, platform]
                                : formData.targetPlatforms.filter(p => p !== platform)
                            });
                          }}
                        />
                        <label className="text-sm font-medium leading-none">
                          {platform}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <p className="text-center text-muted-foreground mb-4">What types of content would you like to create?</p>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {CONTENT_TYPES.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.preferredContentTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              preferredContentTypes: checked
                                ? [...formData.preferredContentTypes, type]
                                : formData.preferredContentTypes.filter(t => t !== type)
                            });
                          }}
                        />
                        <label className="text-sm font-medium leading-none">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Let's Start with Your Creator Personality! 🎭</h3>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">Choose the personality type that best matches your vibe:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERSONALITY_TYPES.map(type => (
                  <Button
                    key={type}
                    variant={formData.personalityType === type ? "default" : "outline"}
                    className="h-auto py-4 px-6 text-lg"
                    onClick={() => setFormData({ ...formData, personalityType: type })}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">If You Had a Content Superpower... ⚡</h3>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">Which of these would help you create the most amazing content?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUPERPOWER_CHOICES.map(power => (
                  <Button
                    key={power}
                    variant={formData.superpower === power ? "default" : "outline"}
                    className="h-auto py-4 px-6 text-lg"
                    onClick={() => setFormData({ ...formData, superpower: power })}
                  >
                    {power}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Your Content Style & Vibe 🎨</h3>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">Pick the style that feels most natural to you:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONTENT_STYLES.map(style => (
                  <Button
                    key={style}
                    variant={formData.contentStyle === style ? "default" : "outline"}
                    className="h-auto py-4 px-6 text-lg"
                    onClick={() => setFormData({ ...formData, contentStyle: style })}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Dream Big! 🌟</h3>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">What's your ultimate content creator dream?</p>
              <div className="grid grid-cols-1 gap-4">
                {DREAM_SCENARIOS.map(scenario => (
                  <Button
                    key={scenario}
                    variant={formData.dreamScenario === scenario ? "default" : "outline"}
                    className="h-auto py-4 px-6 text-lg"
                    onClick={() => setFormData({ ...formData, dreamScenario: scenario })}
                  >
                    {scenario}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Quick Fire Round! ⚡</h3>
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="font-medium text-center">How much do you love being on camera? 🎥</p>
                <Slider
                  value={[formData.cameraComfort]}
                  onValueChange={([value]) => setFormData({ ...formData, cameraComfort: value })}
                  min={0}
                  max={100}
                  step={10}
                  className="py-4"
                />
                <p className="text-center text-sm text-muted-foreground">
                  {formData.cameraComfort < 30 ? "Rather stay behind the scenes 🙈" :
                    formData.cameraComfort < 60 ? "I can handle it when needed 😊" :
                      formData.cameraComfort < 90 ? "Pretty comfortable! 🎭" :
                        "Born to be on screen! 🌟"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-center">How much do you enjoy research? 📚</p>
                <Slider
                  value={[formData.researchPassion]}
                  onValueChange={([value]) => setFormData({ ...formData, researchPassion: value })}
                  min={0}
                  max={100}
                  step={10}
                  className="py-4"
                />
                <p className="text-center text-sm text-muted-foreground">
                  {formData.researchPassion < 30 ? "I prefer winging it 🦋" :
                    formData.researchPassion < 60 ? "I do my homework 📝" :
                      formData.researchPassion < 90 ? "Love diving deep! 🤓" :
                        "Research is my jam! 🔬"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-center">How important is trending content to you? 📈</p>
                <Slider
                  value={[formData.trendFocus]}
                  onValueChange={([value]) => setFormData({ ...formData, trendFocus: value })}
                  min={0}
                  max={100}
                  step={10}
                  className="py-4"
                />
                <p className="text-center text-sm text-muted-foreground">
                  {formData.trendFocus < 30 ? "I make my own trends 😎" :
                    formData.trendFocus < 60 ? "I keep an eye on trends 👀" :
                      formData.trendFocus < 90 ? "Trends are important! 🚀" :
                        "Always chasing the next big thing! 🔥"}
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 9:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Final Touches! 🎨</h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="font-medium text-center">What's your ideal content creation schedule?</p>
                <Select
                  value={formData.schedule}
                  onValueChange={(value) => setFormData({ ...formData, schedule: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Whenever inspiration strikes 🦋</SelectItem>
                    <SelectItem value="partTime">Part-time creator 🌙</SelectItem>
                    <SelectItem value="fullTime">Full-time creator 🌟</SelectItem>
                    <SelectItem value="machine">Content machine 🤖</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <p className="font-medium text-center">Your monetization priority:</p>
                <Select
                  value={formData.moneyFocus}
                  onValueChange={(value) => setFormData({ ...formData, moneyFocus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passion">Passion first, money second 💝</SelectItem>
                    <SelectItem value="balance">Healthy balance 🎭</SelectItem>
                    <SelectItem value="business">Serious business 💼</SelectItem>
                    <SelectItem value="empire">Building an empire 👑</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <p className="font-medium text-center">Your tech comfort level:</p>
                <Select
                  value={formData.techLevel}
                  onValueChange={(value) => setFormData({ ...formData, techLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your tech level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Keep it simple 🌱</SelectItem>
                    <SelectItem value="comfortable">Comfortable with basics 📱</SelectItem>
                    <SelectItem value="advanced">Tech-savvy 💻</SelectItem>
                    <SelectItem value="expert">Tech wizard 🧙‍♂️</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  const renderResults = () => {
    if (!apiResponse) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">🎉 Your Content Creator Destiny! 🎉</h3>
          <Button onClick={handleDownloadReport} variant="outline">
            Download Report 📥
          </Button>
        </div>

        {/* Current Profile Summary */}
        <Card className="p-6">
          <h4 className="text-xl font-semibold mb-4">Your Creator Profile 👤</h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Current Roles:</h5>
              <div className="flex flex-wrap gap-2">
                {formData.currentRoles.map(role => (
                  <Badge key={role} variant="secondary">{role}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-2">Expertise Areas:</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.expertiseTopics).map(([category, topics]) => (
                  topics.map(topic => (
                    <Badge key={`${category}-${topic}`} variant="outline">
                      {topic}
                    </Badge>
                  ))
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Top Niche Match */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-lg">
          <Card className="p-6">
            <h4 className="text-xl font-semibold text-center mb-4">Your Perfect Niche Match! 💫</h4>
            {apiResponse.recommendedNiches[0] && (
              <>
                <h5 className="text-2xl font-bold text-center mb-2">{apiResponse.recommendedNiches[0].niche}</h5>
                <p className="text-center mb-4">{apiResponse.recommendedNiches[0].description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h6 className="font-semibold mb-2">Your Superpowers 💪</h6>
                    <ul className="space-y-2">
                      {apiResponse.recommendedNiches[0].keyStrengths.map((strength, i) => (
                        <li key={i} className="flex items-center">
                          <span className="mr-2">✨</span> {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold mb-2">Content Ideas 💡</h6>
                    <ul className="space-y-2">
                      {apiResponse.recommendedNiches[0].contentIdeas.map((idea, i) => (
                        <li key={i} className="flex items-center">
                          <span className="mr-2">🎯</span> {idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Alternative Niches */}
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-center">Other Awesome Possibilities! 🌈</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiResponse.recommendedNiches.slice(1).map((niche, index) => (
              <Card key={index} className="p-4">
                <h5 className="text-lg font-semibold">{niche.niche}</h5>
                <p className="text-sm text-muted-foreground mb-2">{niche.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Match Score:</span>
                  <span className="text-lg font-bold">{niche.score}% ⭐</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <h4 className="text-xl font-semibold mb-4 text-center">Your Creator Journey Starts Here! 🚀</h4>
          <ul className="space-y-4">
            {apiResponse.nextSteps.map((step, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2 text-2xl">{
                  index === 0 ? "🎯" :
                    index === 1 ? "💪" :
                      index === 2 ? "🌟" :
                        "✨"
                }</span>
                {step}
              </li>
            ))}
          </ul>
        </Card>

        {/* Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <h6 className="font-semibold">Growth Potential</h6>
            <p className="text-3xl font-bold mt-2">
              {apiResponse.marketAnalysis.growthPotential}% 📈
            </p>
          </Card>
          <Card className="p-4 text-center">
            <h6 className="font-semibold">Trend Match</h6>
            <p className="text-3xl font-bold mt-2">
              {apiResponse.marketAnalysis.trendAlignment}% 🎯
            </p>
          </Card>
          <Card className="p-4 text-center">
            <h6 className="font-semibold">Competition Level</h6>
            <p className="text-3xl font-bold mt-2">
              {apiResponse.marketAnalysis.competitionLevel}% 🥊
            </p>
          </Card>
        </div>

        {/* Add Platform Strategy */}
        <Card className="p-6">
          <h4 className="text-xl font-semibold mb-4">Platform Strategy 🎯</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">Recommended Platforms:</h5>
              <div className="flex flex-wrap gap-2">
                {formData.targetPlatforms.map(platform => (
                  <Badge key={platform} variant="secondary">{platform}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-2">Content Mix:</h5>
              <div className="flex flex-wrap gap-2">
                {formData.preferredContentTypes.map(type => (
                  <Badge key={type} variant="outline">{type}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Add Content Calendar */}
        <Card className="p-6">
          <h4 className="text-xl font-semibold mb-4">Content Calendar Strategy 📅</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h6 className="font-medium">Weekly Content Mix</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { type: 'Educational', count: 2 },
                    { type: 'Entertainment', count: 1 },
                    { type: 'Behind Scenes', count: 1 },
                    { type: 'Tips', count: 2 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <h6 className="font-medium">Time Allocation</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Content Creation', value: 40 },
                        { name: 'Research', value: 20 },
                        { name: 'Engagement', value: 20 },
                        { name: 'Analytics', value: 20 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <h6 className="font-medium">Growth Metrics</h6>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={[
                      { month: 'M1', growth: 20 },
                      { month: 'M2', growth: 40 },
                      { month: 'M3', growth: 70 },
                      { month: 'M4', growth: 100 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="growth" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Find Your Content Creator Niche</CardTitle>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <div className="space-y-6">
            {renderStep()}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 9 ? (
                <Button
                  onClick={() => setCurrentStep(prev => Math.min(9, prev + 1))}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze My Niche'
                  )}
                </Button>
              )}
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(step => (
                <div
                  key={step}
                  className={`h-2 w-2 rounded-full ${step === currentStep ? 'bg-primary' : 'bg-secondary'
                    }`}
                />
              ))}
            </div>
          </div>
        ) : (
          renderResults()
        )}
      </CardContent>
    </Card>
  );
};

export default NicheFinder;