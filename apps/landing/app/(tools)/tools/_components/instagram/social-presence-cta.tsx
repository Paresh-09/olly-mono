import { useRouter } from "next/navigation";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
  ArrowRight,
  MessageSquare,
  Zap,
  Sparkles,
  Star,
  Crown,
} from "lucide-react";

interface SocialPresenceCTAProps {
  title: string;
  subtitle: string;
  description: string;
  icon?: "zap" | "message" | "sparkles" | "star" | "crown";
  gradient?: "blue" | "purple" | "gold";
  ctaText?: string;
  href?: string;
}

const SocialPresenceCTA = ({
  title,
  subtitle,
  description,
  icon = "zap",
  gradient = "blue",
  ctaText = "Get Started",
  href = "/onboarding",
}: SocialPresenceCTAProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  const getGradientClasses = () => {
    switch (gradient) {
      case "purple":
        return "from-purple-50/50 to-pink-50/50 border-purple-200";
      case "gold":
        return "from-amber-50/50 to-yellow-50/50 border-amber-200";
      default:
        return "from-blue-50/50 to-indigo-50/50 border-blue-200";
    }
  };

  const getIcon = () => {
    switch (icon) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "sparkles":
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case "star":
        return <Star className="h-4 w-4 text-amber-500" />;
      case "crown":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      default:
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card
      className={`w-full cursor-pointer transition-all duration-300 mt-6 mb-4 bg-gradient-to-r ${getGradientClasses()} hover:shadow-md relative overflow-hidden border-2`}
      onClick={handleClick}
    >
      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between relative gap-4">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            {getIcon()}
            <p className="text-sm font-medium text-blue-600 truncate">
              {subtitle}
            </p>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm max-w-md line-clamp-2">
            {description}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto sm:ml-4 border-2 hover:bg-blue-50 hover:border-blue-200 transition-colors mt-2 sm:mt-0 whitespace-nowrap"
        >
          {ctaText}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialPresenceCTA;

