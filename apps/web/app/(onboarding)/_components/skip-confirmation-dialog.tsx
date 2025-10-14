import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Rocket, AlertCircle } from "lucide-react";

interface SkipConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SkipConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
}: SkipConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="border border-blue-100 max-w-md">
        <AlertDialogHeader className="gap-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
            <Rocket className="h-6 w-6 text-blue-600" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-center">
            Almost there!
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-center">
            <p className="text-base font-medium text-gray-800">
              Completing the setup will only take a minute and ensures everything works correctly.
            </p>
            <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-md border border-amber-100 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <p className="text-amber-800 text-left">
                Users who skip setup typically take 3x longer to get started later
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:gap-2">
          <AlertDialogAction asChild>
            <Button 
              variant="default" 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-none"
              onClick={onClose}
            >
              Continue Setup
            </Button>
          </AlertDialogAction>
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              onClick={onConfirm}
              className="w-full text-gray-600 hover:bg-gray-50"
            >
              Skip and go to dashboard
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 