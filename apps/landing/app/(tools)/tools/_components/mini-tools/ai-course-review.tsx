"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Label } from "@repo/ui/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Loader2,
  Copy,
  Download,
  RefreshCw,
  Book,
  Star,
  UserPlus,
  Gauge,
} from "lucide-react";
import { useToast } from "@repo/ui/hooks/use-toast";import { Separator } from "@repo/ui/components/ui/separator";
import { Checkbox } from "@repo/ui/components/ui/checkbox";

// Define types for our options
type CourseLevel = {
  value: string;
  label: string;
};

type ReviewTone = {
  value: string;
  label: string;
};

type ReviewLength = {
  value: string;
  label: string;
};

export function AICourseReviewsGenerator() {
  const { toast } = useToast();
  const [courseName, setCourseName] = useState<string>("");
  const [courseSubject, setCourseSubject] = useState<string>("");
  const [instructorName, setInstructorName] = useState<string>("");
  const [courseLevel, setCourseLevel] = useState<string>("intermediate");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [reviewTone, setReviewTone] = useState<string>("balanced");
  const [reviewLength, setReviewLength] = useState<string>("medium");
  const [rating, setRating] = useState<number>(4); // out of 5
  const [includePros, setIncludePros] = useState<boolean>(true);
  const [includeCons, setIncludeCons] = useState<boolean>(true);
  const [includeComparison, setIncludeComparison] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [review, setReview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("edit");

  const courseLevels: CourseLevel[] = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "all-levels", label: "All Levels" },
  ];

  const reviewTones: ReviewTone[] = [
    { value: "positive", label: "Positive" },
    { value: "balanced", label: "Balanced" },
    { value: "critical", label: "Critical" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "objective", label: "Objective" },
  ];

  const reviewLengths: ReviewLength[] = [
    { value: "short", label: "Short (300-400 words)" },
    { value: "medium", label: "Medium (500-700 words)" },
    { value: "long", label: "Long (800-1000 words)" },
  ];

  const generateReview = async (): Promise<void> => {
    if (!courseName) {
      toast({
        title: "Missing information",
        description: "Please enter a course name to generate a review.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call our API endpoint
      const response = await fetch("/api/tools/ai-course-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseName,
          courseSubject,
          instructorName,
          courseLevel,
          additionalInfo,
          reviewTone,
          reviewLength,
          rating,
          includePros,
          includeCons,
          includeComparison,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate course review");
      }

      setReview(data.review);
      setActiveTab("preview");

      toast({
        title: "Review generated",
        description: "Your course review has been created successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(review);
    toast({
      title: "Copied to clipboard",
      description: "The review content has been copied to the clipboard.",
    });
  };

  const downloadReview = (): void => {
    const element = document.createElement("a");
    const file = new Blob([review], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${courseName
      .replace(/\s+/g, "-")
      .toLowerCase()}-review.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetForm = (): void => {
    setCourseName("");
    setCourseSubject("");
    setInstructorName("");
    setCourseLevel("intermediate");
    setAdditionalInfo("");
    setReviewTone("balanced");
    setReviewLength("medium");
    setRating(4);
    setIncludePros(true);
    setIncludeCons(true);
    setIncludeComparison(false);
    setReview("");
    setError(null);
    setActiveTab("edit");
  };

  // Function to get level label text
  const getLevelLabel = (): string => {
    const found = courseLevels.find((opt) => opt.value === courseLevel);
    return found ? found.label : "Not specified";
  };

  // Function to get tone label text
  const getToneLabel = (): string => {
    const found = reviewTones.find((opt) => opt.value === reviewTone);
    return found ? found.label : "Not specified";
  };

  // Function to get length label text
  const getLengthLabel = (): string => {
    const found = reviewLengths.find((opt) => opt.value === reviewLength);
    return found ? found.label : "Not specified";
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="edit" className="text-base py-3">
            <Book className="h-4 w-4 mr-2" /> Course Information
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="text-base py-3"
            disabled={!review && !loading}
          >
            <Copy className="h-4 w-4 mr-2" /> Generated Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-0">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Book className="mr-2 h-5 w-5 text-primary" />
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="courseName" className="text-base">
                      Course Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="courseName"
                      placeholder="e.g., Complete Web Development Bootcamp"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="courseSubject" className="text-base">
                        Course Subject
                      </Label>
                      <Input
                        id="courseSubject"
                        placeholder="e.g., Web Development, Machine Learning"
                        value={courseSubject}
                        onChange={(e) => setCourseSubject(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructorName" className="text-base">
                        Instructor Name
                      </Label>
                      <Input
                        id="instructorName"
                        placeholder="e.g., John Smith"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <UserPlus className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="courseLevel" className="text-base">
                          Course Level
                        </Label>
                      </div>
                      <Select
                        value={courseLevel}
                        onValueChange={setCourseLevel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course level" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center mb-1.5">
                        <Star className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="rating" className="text-base">
                          Rating
                        </Label>
                      </div>
                      <div className="flex space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                rating >= star
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo" className="text-base">
                      Course Details
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Key topics covered, course features, teaching style, etc."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-base font-medium mb-3">
                      Review Options
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <div className="flex items-center mb-1.5">
                          <Gauge className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          <Label htmlFor="reviewTone" className="text-base">
                            Review Tone
                          </Label>
                        </div>
                        <Select
                          value={reviewTone}
                          onValueChange={setReviewTone}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select review tone" />
                          </SelectTrigger>
                          <SelectContent>
                            {reviewTones.map((tone) => (
                              <SelectItem key={tone.value} value={tone.value}>
                                {tone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center mb-1.5">
                          <Gauge className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          <Label htmlFor="reviewLength" className="text-base">
                            Review Length
                          </Label>
                        </div>
                        <Select
                          value={reviewLength}
                          onValueChange={setReviewLength}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select review length" />
                          </SelectTrigger>
                          <SelectContent>
                            {reviewLengths.map((length) => (
                              <SelectItem
                                key={length.value}
                                value={length.value}
                              >
                                {length.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Review Sections</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includePros"
                        checked={includePros}
                        onCheckedChange={(checked) =>
                          setIncludePros(checked as boolean)
                        }
                      />
                      <Label htmlFor="includePros" className="cursor-pointer">
                        Include Pros
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeCons"
                        checked={includeCons}
                        onCheckedChange={(checked) =>
                          setIncludeCons(checked as boolean)
                        }
                      />
                      <Label htmlFor="includeCons" className="cursor-pointer">
                        Include Cons
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeComparison"
                        checked={includeComparison}
                        onCheckedChange={(checked) =>
                          setIncludeComparison(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="includeComparison"
                        className="cursor-pointer"
                      >
                        Include Comparison to Similar Courses
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Form
                </Button>
                <Button
                  onClick={generateReview}
                  disabled={loading}
                  className="px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Review"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-3 md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Course Name
                    </h4>
                    <p className="font-medium">
                      {courseName || "Not specified"}
                    </p>
                  </div>
                  <Separator />
                  {instructorName && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Instructor
                        </h4>
                        <p>{instructorName}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Course Level
                    </h4>
                    <p>{getLevelLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Rating
                    </h4>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            rating >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Review Style
                    </h4>
                    <p>
                      {getToneLabel()} tone, {getLengthLabel()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <Book className="mr-2 h-5 w-5 text-primary" />
                Course Review
              </CardTitle>

              {review && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadReview}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("edit")}
                  >
                    Edit Parameters
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Generating your review...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take up to 30 seconds
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[500px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating review</p>
                    <p className="text-sm">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setActiveTab("edit")}
                    >
                      Return to Editor
                    </Button>
                  </div>
                ) : review ? (
                  <div className="p-6 prose prose-sm max-w-none">
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-black  text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {review}
                    </pre>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[500px] flex items-center justify-center p-6">
                    <div>
                      <Book className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        No Review Generated Yet
                      </p>
                      <p className="text-sm max-w-md mx-auto">
                        Fill in the course information and click "Generate
                        Review" to create your detailed course review.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {review && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <h4 className="font-medium">Review Summary</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {courseName ? courseName : "Untitled Course"} •{" "}
                        {getLevelLabel()} • {rating}/5 Stars
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("edit")}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Edit & Regenerate
                      </Button>
                      <Button size="sm" onClick={downloadReview}>
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
