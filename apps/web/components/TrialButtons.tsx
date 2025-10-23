import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { usePricing } from "@/providers/pricingContext";
import { usePostHog } from "posthog-js/react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

const userTiers = [1, 5, 10, 20];

// Remove the variant IDs from client-side - we'll handle this on the server

const PlanFeature = ({
  children,
  highlight = false,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className="flex items-start space-x-2 text-sm">
    {highlight ? (
      <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
    ) : (
      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
    )}
    <span
      className={
        highlight ? "text-primary font-medium" : "text-muted-foreground"
      }
    >
      {children}
    </span>
  </div>
);

export function TrialButtons({ code }: { code?: string }) {
  const router = useRouter();
  const posthog = usePostHog();
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { buyNowProps } = usePricing();

  // Get feature flag value directly
  const variant = posthog.getFeatureFlag("trial-page-variant");

  const getMonthlyPrice = (users: number): string => {
    switch (users) {
      case 1:
        return buyNowProps.monthlyPrice || "$9.99";
      case 5:
        return buyNowProps.teamMonthlyPrice || "$39";
      case 10:
        return buyNowProps.agencyMonthlyPrice || "$69";
      case 20:
        return buyNowProps.companyMonthlyPrice || "$99";
      default:
        return buyNowProps.monthlyPrice || "$9.99";
    }
  };

  const handleStartFree = () => {
    // Direct navigation to onboarding with params
    const redirectParams = new URLSearchParams();
    redirectParams.set("isExtensionLogin", "true");
    redirectParams.set("isConnected", "true");
    redirectParams.set("step", "1");
    redirectParams.set("isFreePlan", "true");
    if (code) redirectParams.set("code", code);
    router.push(`/onboarding?${redirectParams.toString()}`);
  };

  const handleStartTrial = () => {
    setShowTrialDialog(true);
  };

  const handleTrialSelection = async () => {
    setIsLoading(true);
    try {
      // Get the current URL for redirect
      const currentUrl = window.location.href;
      

      // Send user count instead of variant ID - let server handle the mapping
      const response = await axios.post("/api/checkout/monthly-trial", {
        userCount: selectedUsers,
        redirectUrl: currentUrl,
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
      setShowTrialDialog(false);
    }
  };

  const renderButtons = () => {
    if (variant === "control") {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">7-Day Free Trial</h3>
            <p className="text-sm text-muted-foreground">
              Experience all premium features. Cancel anytime.
            </p>
          </div>
          <Button
            onClick={handleStartTrial}
            variant="default"
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Free Trial"
            )}
          </Button>
          <div className="space-y-4 bg-accent/30 p-4 rounded-lg">
            <p className="text-sm font-medium">Premium features included:</p>
            <div className="space-y-3">
              <PlanFeature highlight>
                AI-powered auto-commenter that matches your tone & style
              </PlanFeature>
              <PlanFeature highlight>
                Custom brand voice training & personalization
              </PlanFeature>
              <PlanFeature>
                Unlimited AI usage with your own API key (BYOK)
              </PlanFeature>
              <PlanFeature>Unlimited comments per day</PlanFeature>
              <PlanFeature>Advanced customization options</PlanFeature>
              <PlanFeature>Priority support</PlanFeature>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              ✨ Cancel anytime during the trial. No obligations.
            </p>
          </div>
        </div>
      );
    } else if (variant === "trial-free") {
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="p-6 border-2 border-primary rounded-lg space-y-4 bg-primary/5">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">7-Day Free Trial</h3>
                <p className="text-sm text-muted-foreground">
                  Try everything Olly has to offer
                </p>
              </div>
              <Button
                onClick={handleStartTrial}
                variant="default"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Start Free Trial"
                )}
              </Button>
              <div className="space-y-3">
                <PlanFeature highlight>
                  Smart auto-commenter with your brand voice
                </PlanFeature>
                <PlanFeature>Unlimited comments & AI usage</PlanFeature>
                <PlanFeature>Advanced customization & training</PlanFeature>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                No credit card required • Cancel anytime
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <div className="p-6 border rounded-lg space-y-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Free Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Get started with core features
                </p>
              </div>
              <Button
                onClick={handleStartFree}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Start for Free
              </Button>
              <div className="space-y-3">
                <PlanFeature>20 AI-powered comments per day</PlanFeature>
                <PlanFeature>Basic customization options</PlanFeature>
                <PlanFeature>Community support</PlanFeature>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                No credit card needed • Always free
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      // Default to control variant
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">7-Day Free Trial</h3>
            <p className="text-sm text-muted-foreground">
              Experience all premium features. Cancel anytime.
            </p>
          </div>
          <Button
            onClick={handleStartTrial}
            variant="default"
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Free Trial"
            )}
          </Button>
          <div className="space-y-4 bg-accent/30 p-4 rounded-lg">
            <p className="text-sm font-medium">Premium features included:</p>
            <div className="space-y-3">
              <PlanFeature highlight>
                AI-powered auto-commenter that matches your tone & style
              </PlanFeature>
              <PlanFeature highlight>
                Custom brand voice training & personalization
              </PlanFeature>
              <PlanFeature>
                Unlimited AI usage with your own API key (BYOK)
              </PlanFeature>
              <PlanFeature>Unlimited comments per day</PlanFeature>
              <PlanFeature>Advanced customization options</PlanFeature>
              <PlanFeature>Priority support</PlanFeature>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              ✨ Cancel anytime during the trial. No obligations.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {renderButtons()}

      <Dialog open={showTrialDialog} onOpenChange={setShowTrialDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="space-y-4">
            <div className="text-center space-y-2">
              <DialogTitle className="text-xl">
                Start Your 7-Day Free Trial
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Experience premium features with no commitments
              </DialogDescription>
            </div>
            <div className="space-y-3 bg-accent/30 p-4 rounded-lg">
              <p className="text-sm font-medium">Premium features included:</p>
              <div className="space-y-2.5">
                <PlanFeature highlight>
                  AI-powered auto-commenter that matches your tone & style
                </PlanFeature>
                <PlanFeature highlight>
                  Custom brand voice training & personalization
                </PlanFeature>
                <PlanFeature>
                  Unlimited AI usage with your own API key
                </PlanFeature>
                <PlanFeature>Priority support & advanced features</PlanFeature>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className="text-sm font-medium">Select number of users:</p>
            <div className="space-y-3">
              {userTiers.map((tier) => (
                <div
                  key={tier}
                  onClick={() => setSelectedUsers(tier)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border ${
                    selectedUsers === tier
                      ? "bg-primary/5 border-primary"
                      : "border-input hover:border-primary/50 hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {tier} {tier === 1 ? "User" : "Users"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getMonthlyPrice(tier)}/month after trial
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full ${
                        selectedUsers === tier ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="space-y-4">
            <Button
              onClick={handleTrialSelection}
              className="w-full bg-gradient-to-r from-primary to-primary/90 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start Free Trial"
              )}
            </Button>
            <div className="flex items-center justify-center gap-x-2 text-muted-foreground">
              <span className="flex items-center text-xs">
                <Check className="h-3.5 w-3.5 mr-1" />
                Cancel anytime
              </span>
              <span className="text-xs">•</span>
              <span className="flex items-center text-xs">
                <Check className="h-3.5 w-3.5 mr-1" />
                No credit card needed
              </span>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
// import { useState } from 'react';
// import { Button } from "@repo/ui/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@repo/ui/components/ui/dialog";
// import { usePricing } from "@/app/web/providers/pricingContext";
// import { usePostHog } from 'posthog-js/react';
// import { Check, Sparkles } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// const userTiers = [1, 5, 10, 20];

// const PlanFeature = ({ children, highlight = false }: { children: React.ReacGtNode, highlight?: boolean }) => (
//   <div className="flex items-start space-x-2 text-sm">
//     {highlight ? (
//       <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
//     ) : (
//       <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
//     )}
//     <span className={highlight ? "text-primary font-medium" : "text-muted-foreground"}>{children}</span>
//   </div>
// );

// export function TrialButtons({ code }: { code?: string }) {
//   const router = useRouter();
//   const posthog = usePostHog();
//   const [showTrialDialog, setShowTrialDialog] = useState(false);
//   const [selectedUsers, setSelectedUsers] = useState(1);
//   const { buyNowProps } = usePricing();

//   // Get feature flag value directly
//   const variant = posthog.getFeatureFlag('trial-page-variant');

//   const getMonthlyPrice = (users: number): string => {
//     switch (users) {
//       case 1: return buyNowProps.monthlyPrice || "$9.99";
//       case 5: return buyNowProps.teamMonthlyPrice || "$39";
//       case 10: return buyNowProps.agencyMonthlyPrice || "$59";
//       case 20: return buyNowProps.companyMonthlyPrice || "$99";
//       default: return buyNowProps.monthlyPrice || "$9.99";
//     }
//   };

//   const getMonthlyUrl = (users: number): string => {
//     switch (users) {
//       case 1: return buyNowProps.monthlyUrl || "#";
//       case 5: return buyNowProps.teamMonthlyUrl || "#";
//       case 10: return buyNowProps.agencyMonthlyUrl || "#";
//       case 20: return buyNowProps.companyMonthlyUrl || "#";
//       default: return buyNowProps.monthlyUrl || "#";
//     }
//   };

//   const handleStartFree = () => {
//     // Direct navigation to onboarding with params
//     const redirectParams = new URLSearchParams();
//     redirectParams.set("isExtensionLogin", "true");
//     redirectParams.set("isConnected", "true");
//     redirectParams.set("step", "1");
//     redirectParams.set("isFreePlan", "true");
//     if (code) redirectParams.set("code", code);
//     router.push(`/onboarding?${redirectParams.toString()}`);
//   };

//   const handleStartTrial = () => {
//     setShowTrialDialog(true);
//   };

//   const handleTrialSelection = () => {
//     const url = getMonthlyUrl(selectedUsers);
//     window.open(url, '_blank');
//     setShowTrialDialog(false);
//   };

//   const renderButtons = () => {
//     if (variant === 'control') {
//       return (
//         <div className="space-y-6">
//           <div className="text-center space-y-2">
//             <h3 className="font-semibold text-lg">7-Day Free Trial</h3>
//             <p className="text-sm text-muted-foreground">Experience all premium features. Cancel anytime.</p>
//           </div>
//           <Button
//             onClick={handleStartTrial}
//             variant="default"
//             size="lg"
//             className="w-full bg-gradient-to-r from-primary to-primary/90"
//           >
//             Start Free Trial
//           </Button>
//           <div className="space-y-4 bg-accent/30 p-4 rounded-lg">
//             <p className="text-sm font-medium">Premium features included:</p>
//             <div className="space-y-3">
//               <PlanFeature highlight>AI-powered auto-commenter that matches your tone & style</PlanFeature>
//               <PlanFeature highlight>Custom brand voice training & personalization</PlanFeature>
//               <PlanFeature>Unlimited AI usage with your own API key (BYOK)</PlanFeature>
//               <PlanFeature>Unlimited comments per day</PlanFeature>
//               <PlanFeature>Advanced customization options</PlanFeature>
//               <PlanFeature>Priority support</PlanFeature>
//             </div>
//             <p className="text-xs text-muted-foreground mt-4">✨ Cancel anytime during the trial. No obligations.</p>
//           </div>
//         </div>
//       );
//     } else if (variant === 'trial-free') {
//       return (
//         <div className="space-y-8">
//           <div className="space-y-4">
//             <div className="p-6 border-2 border-primary rounded-lg space-y-4 bg-primary/5">
//               <div className="text-center space-y-2">
//                 <h3 className="font-semibold text-lg">7-Day Free Trial</h3>
//                 <p className="text-sm text-muted-foreground">Try everything Olly has to offer</p>
//               </div>
//               <Button
//                 onClick={handleStartTrial}
//                 variant="default"
//                 size="lg"
//                 className="w-full bg-gradient-to-r from-primary to-primary/90"
//               >
//                 Start Free Trial
//               </Button>
//               <div className="space-y-3">
//                 <PlanFeature highlight>Smart auto-commenter with your brand voice</PlanFeature>
//                 <PlanFeature>Unlimited comments & AI usage</PlanFeature>
//                 <PlanFeature>Advanced customization & training</PlanFeature>
//               </div>
//               <p className="text-xs text-center text-muted-foreground">No credit card required • Cancel anytime</p>
//             </div>

//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t"></div>
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-background px-2 text-muted-foreground">or</span>
//               </div>
//             </div>

//             <div className="p-6 border rounded-lg space-y-4">
//               <div className="text-center space-y-2">
//                 <h3 className="font-semibold text-lg">Free Plan</h3>
//                 <p className="text-sm text-muted-foreground">Get started with core features</p>
//               </div>
//               <Button
//                 onClick={handleStartFree}
//                 variant="outline"
//                 size="lg"
//                 className="w-full"
//               >
//                 Start for Free
//               </Button>
//               <div className="space-y-3">
//                 <PlanFeature>20 AI-powered comments per day</PlanFeature>
//                 <PlanFeature>Basic customization options</PlanFeature>
//                 <PlanFeature>Community support</PlanFeature>
//               </div>
//               <p className="text-xs text-center text-muted-foreground">No credit card needed • Always free</p>
//             </div>
//           </div>
//         </div>
//       );
//     } else {
//       // Default to control variant
//       return (
//         <div className="space-y-6">
//           <div className="text-center space-y-2">
//             <h3 className="font-semibold text-lg">7-Day Free Trial</h3>
//             <p className="text-sm text-muted-foreground">Experience all premium features. Cancel anytime.</p>
//           </div>
//           <Button
//             onClick={handleStartTrial}
//             variant="default"
//             size="lg"
//             className="w-full bg-gradient-to-r from-primary to-primary/90"
//           >
//             Start Free Trial
//           </Button>
//           <div className="space-y-4 bg-accent/30 p-4 rounded-lg">
//             <p className="text-sm font-medium">Premium features included:</p>
//             <div className="space-y-3">
//               <PlanFeature highlight>AI-powered auto-commenter that matches your tone & style</PlanFeature>
//               <PlanFeature highlight>Custom brand voice training & personalization</PlanFeature>
//               <PlanFeature>Unlimited AI usage with your own API key (BYOK)</PlanFeature>
//               <PlanFeature>Unlimited comments per day</PlanFeature>
//               <PlanFeature>Advanced customization options</PlanFeature>
//               <PlanFeature>Priority support</PlanFeature>
//             </div>
//             <p className="text-xs text-muted-foreground mt-4">✨ Cancel anytime during the trial. No obligations.</p>
//           </div>
//         </div>
//       );
//     }
//   };

//   return (
//     <>
//       {renderButtons()}

//       <Dialog open={showTrialDialog} onOpenChange={setShowTrialDialog}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader className="space-y-4">
//             <div className="text-center space-y-2">
//               <DialogTitle className="text-xl">Start Your 7-Day Free Trial</DialogTitle>
//               <DialogDescription className="text-sm text-muted-foreground">
//                 Experience premium features with no commitments
//               </DialogDescription>
//             </div>
//             <div className="space-y-3 bg-accent/30 p-4 rounded-lg">
//               <p className="text-sm font-medium">Premium features included:</p>
//               <div className="space-y-2.5">
//                 <PlanFeature highlight>AI-powered auto-commenter that matches your tone & style</PlanFeature>
//                 <PlanFeature highlight>Custom brand voice training & personalization</PlanFeature>
//                 <PlanFeature>Unlimited AI usage with your own API key</PlanFeature>
//                 <PlanFeature>Priority support & advanced features</PlanFeature>
//               </div>
//             </div>
//           </DialogHeader>

//           <div className="py-4 space-y-3">
//             <p className="text-sm font-medium">Select number of users:</p>
//             <div className="space-y-3">
//               {userTiers.map((tier) => (
//                 <div
//                   key={tier}
//                   onClick={() => setSelectedUsers(tier)}
//                   className={`p-4 rounded-lg cursor-pointer transition-all border ${
//                     selectedUsers === tier
//                       ? 'bg-primary/5 border-primary'
//                       : 'border-input hover:border-primary/50 hover:bg-accent/50'
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="font-medium">
//                         {tier} {tier === 1 ? 'User' : 'Users'}
//                       </div>
//                       <div className="text-sm text-muted-foreground">
//                         {getMonthlyPrice(tier)}/month after trial
//                       </div>
//                     </div>
//                     <div className={`w-4 h-4 rounded-full ${
//                       selectedUsers === tier ? 'bg-primary' : 'bg-muted'
//                     }`} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <DialogFooter className="space-y-4">
//             <Button
//               onClick={handleTrialSelection}
//               className="w-full bg-gradient-to-r from-primary to-primary/90 h-11"
//             >
//               Start Free Trial
//             </Button>
//             <div className="flex items-center justify-center gap-x-2 text-muted-foreground">
//               <span className="flex items-center text-xs">
//                 <Check className="h-3.5 w-3.5 mr-1" />
//                 Cancel anytime
//               </span>
//               <span className="text-xs">•</span>
//               <span className="flex items-center text-xs">
//                 <Check className="h-3.5 w-3.5 mr-1" />
//                 No credit card needed
//               </span>
//             </div>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
