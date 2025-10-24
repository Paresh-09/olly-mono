"use client";

import { useState, useEffect } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { toast } from '@repo/ui/hooks/use-toast'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { Calendar } from '@repo/ui/components/ui/calendar'
import { format, addDays, differenceInWeeks, differenceInDays, isToday, isBefore, isAfter } from 'date-fns'
import { CalendarIcon, CheckCircle2, CircleEllipsis, CalendarDays } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check';
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/components/ui/accordion'

// Constants
const LOCAL_STORAGE_KEY = 'pregnancy_tracker_data';
const DEFAULT_LMP_DATE = new Date('2025-01-19');

// Pregnancy milestones
const MILESTONES = [
  { week: 4, title: "Implantation", description: "Your baby is now a blastocyst, implanting in your uterine lining." },
  { week: 8, title: "Embryonic Period", description: "All essential organs begin to develop. Baby is now the size of a raspberry." },
  { week: 12, title: "End of First Trimester", description: "Risk of miscarriage drops. Baby is now the size of a lime." },
  { week: 16, title: "Gender Reveal", description: "You may be able to find out the gender. Baby is the size of an avocado." },
  { week: 20, title: "Halfway Point", description: "You're halfway through! Baby is the size of a banana." },
  { week: 24, title: "Viability", description: "Baby has a chance of survival if born now. Size of a corn cob." },
  { week: 28, title: "Third Trimester Begins", description: "Baby is growing rapidly and is the size of an eggplant." },
  { week: 32, title: "Lung Development", description: "Baby's lungs are developing rapidly. Size of a cabbage." },
  { week: 36, title: "Full Term Approaching", description: "Baby is almost full term. Size of a honeydew melon." },
  { week: 40, title: "Due Date", description: "Your baby is ready to meet you! Size of a watermelon." }
];

// Common pregnancy symptoms by trimester
const SYMPTOMS = {
  first: [
    { name: "Morning Sickness", description: "Nausea and vomiting, often in the morning but can occur anytime", weeks: "6-12" },
    { name: "Fatigue", description: "Feeling more tired than usual due to hormonal changes", weeks: "4-12" },
    { name: "Breast Tenderness", description: "Swollen, sensitive breasts as your body prepares for milk production", weeks: "4-12" },
    { name: "Frequent Urination", description: "Increased need to urinate as your uterus expands", weeks: "4-12" },
    { name: "Food Aversions/Cravings", description: "Changes in taste preferences and sense of smell", weeks: "4-12" },
    { name: "Mood Swings", description: "Emotional changes due to hormonal fluctuations", weeks: "4-12" }
  ],
  second: [
    { name: "Baby Movement", description: "First flutters and kicks from your baby", weeks: "16-25" },
    { name: "Reduced Nausea", description: "Morning sickness usually subsides", weeks: "13-27" },
    { name: "Increased Energy", description: "Many women feel more energetic during this trimester", weeks: "13-27" },
    { name: "Visible Baby Bump", description: "Your pregnancy becomes more noticeable", weeks: "16-20" },
    { name: "Backaches", description: "Lower back pain as your posture adjusts to pregnancy", weeks: "18-27" },
    { name: "Skin Changes", description: "Darkening of skin around nipples and face (melasma)", weeks: "13-27" }
  ],
  third: [
    { name: "Braxton Hicks", description: "Practice contractions that help prepare for labor", weeks: "28-40" },
    { name: "Shortness of Breath", description: "As baby grows and presses against your diaphragm", weeks: "28-40" },
    { name: "Swelling", description: "Edema in feet, ankles, and hands", weeks: "28-40" },
    { name: "Trouble Sleeping", description: "Difficulty finding comfortable sleeping positions", weeks: "30-40" },
    { name: "Heartburn", description: "Increased acid reflux as baby presses on your stomach", weeks: "28-40" },
    { name: "Stronger Baby Movements", description: "More defined kicks, punches and rolls", weeks: "28-36" },
    { name: "Nesting Instinct", description: "Sudden urge to prepare home for baby's arrival", weeks: "36-40" }
  ]
};

// Baby size comparisons by week
const BABY_SIZE = {
  4: "Poppy Seed",
  5: "Sesame Seed",
  6: "Lentil",
  7: "Blueberry",
  8: "Raspberry",
  9: "Cherry",
  10: "Strawberry",
  11: "Lime",
  12: "Plum",
  13: "Peach",
  14: "Lemon",
  15: "Apple",
  16: "Avocado",
  17: "Pear",
  18: "Bell Pepper",
  19: "Tomato",
  20: "Banana",
  21: "Carrot",
  22: "Spaghetti Squash",
  23: "Large Mango",
  24: "Corn",
  25: "Cauliflower",
  26: "Lettuce",
  27: "Rutabaga",
  28: "Eggplant",
  29: "Butternut Squash",
  30: "Cabbage",
  31: "Coconut",
  32: "Jicama",
  33: "Pineapple",
  34: "Cantaloupe",
  35: "Honeydew Melon",
  36: "Romaine Lettuce",
  37: "Swiss Chard",
  38: "Winter Melon",
  39: "Watermelon",
  40: "Small Pumpkin"
};

// Detailed appointment schedule
const APPOINTMENTS = [
  { week: 8, name: "First Prenatal Visit", description: "Initial appointment to confirm pregnancy and establish baseline health" },
  { week: 12, name: "NT Scan", description: "Nuchal translucency scan to screen for chromosomal abnormalities" },
  { week: 16, name: "Quad Screen", description: "Blood test to screen for birth defects and chromosomal abnormalities" },
  { week: 20, name: "Anatomy Scan", description: "Detailed ultrasound to check baby's development and often determine gender" },
  { week: 24, name: "Glucose Challenge Test", description: "Screening for gestational diabetes" },
  { week: 28, name: "Tdap Vaccine", description: "Vaccination to protect baby from whooping cough" },
  { week: 28, name: "Rhogam Shot", description: "For Rh-negative mothers to prevent complications" },
  { week: 32, name: "Growth Scan", description: "Ultrasound to check baby's growth and position" },
  { week: 36, name: "Group B Strep Test", description: "Screening for bacteria that can affect baby during delivery" },
  { week: 38, name: "Weekly Check-ups", description: "Begin weekly appointments until delivery" },
  { week: 40, name: "Due Date", description: "Your estimated delivery date" },
  { week: 41, name: "Post-term Monitoring", description: "Additional monitoring if baby hasn't arrived by due date" }
];

// Important dates calculator
const calculateImportantDates = (lmpDate: Date) => {
  // EDD (Estimated Due Date) = LMP + 280 days (40 weeks)
  const dueDate = addDays(lmpDate, 280);

  // First trimester: Weeks 1-12
  const firstTrimesterEnd = addDays(lmpDate, 84);

  // Second trimester: Weeks 13-27
  const secondTrimesterEnd = addDays(lmpDate, 189);

  // Third trimester: Weeks 28-40
  const thirdTrimesterEnd = dueDate;

  // Anatomy scan typically around week 20
  const anatomyScanDate = addDays(lmpDate, 140);

  // Glucose test typically around week 24-28
  const glucoseTestDate = addDays(lmpDate, 182);

  // Calculate all appointment dates
  const appointmentDates = APPOINTMENTS.map(appointment => ({
    ...appointment,
    date: addDays(lmpDate, appointment.week * 7)
  }));

  return {
    dueDate,
    firstTrimesterEnd,
    secondTrimesterEnd,
    thirdTrimesterEnd,
    anatomyScanDate,
    glucoseTestDate,
    appointmentDates
  };
};

// Create a custom hook for managing the LMP date with localStorage
function useLmpDate() {
  const [lmpDate, setLmpDateState] = useState<Date>(DEFAULT_LMP_DATE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.lmpDate) {
          const parsedDate = new Date(parsedData.lmpDate);
          // Validate the date
          if (!isNaN(parsedDate.getTime())) {
            setLmpDateState(parsedDate);
          }
        }
      }
    } catch (error) {
      console.error("Error loading LMP date from localStorage:", error);
    }
  }, []);

  // Custom setter that updates localStorage
  const setLmpDate = (date: Date) => {
    try {
      // Update state
      setLmpDateState(date);

      // Update localStorage immediately
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ lmpDate: date.toISOString() })
      );
    } catch (error) {
      console.error("Error saving LMP date to localStorage:", error);
    }
  };

  return [lmpDate, setLmpDate] as const;
}

export const PregnancyTracker = () => {
  const [lmpDate, setLmpDate] = useLmpDate();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'pregnancy-tracker',
    dailyLimit: 5
  });

  // Calculate current pregnancy week and day
  const calculateProgress = (date: Date) => {
    const today = new Date();
    const weeks = differenceInWeeks(today, date);
    const days = differenceInDays(today, date) % 7;

    return { weeks, days };
  };

  const { weeks, days } = calculateProgress(lmpDate);
  const importantDates = calculateImportantDates(lmpDate);
  const currentSize = BABY_SIZE[Math.min(Math.max(weeks, 4), 40) as keyof typeof BABY_SIZE] || "Not visible yet";

  // Determine current trimester
  const currentTrimester = weeks < 0 ? "pre-pregnancy" :
    weeks < 13 ? "first" :
      weeks < 28 ? "second" :
        weeks <= 40 ? "third" : "post-term";

  // Calculate pregnancy progress percentage
  const progressPercentage = Math.min(Math.max(Math.round((weeks / 40) * 100), 0), 100);

  // Function to handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setLmpDate(date);
    }
  };

  // Handler for saving the date (with usage limit check)
  const handleSaveDate = () => {
    if (!checkUsageLimit()) {
      return;
    }

    try {
      // The date is already saved in localStorage via our custom hook
      // Just increment usage and show toast
      if (!isAuthenticated) {
        incrementUsage();
      }

      toast({
        title: "Date Saved",
        description: "Your LMP date has been saved successfully."
      });

      // API call for authenticated users would go here

      setDatePickerOpen(false);
    } catch (error) {
      console.error("Error in handleSaveDate:", error);
      toast({
        title: "Error",
        description: "Failed to save your date",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-sm border-muted">
      <div className="p-6">
        {!isAuthenticated && (
          <Alert className="mb-6">
            <AlertDescription>
              You have {remainingUses} free uses remaining today. Sign in for unlimited access and to save your pregnancy data.
            </AlertDescription>
          </Alert>
        )}

        {/* Date Selector - Always Visible at Top */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center p-4 bg-muted/20 rounded-lg">
          <div>
            <h3 className="text-lg font-medium mb-1">Last Menstrual Period (LMP)</h3>
            <p className="text-sm text-muted-foreground mb-2">This is used to calculate all pregnancy dates</p>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 justify-between min-w-[240px] border-2 border-primary/20 hover:border-primary/40 transition-all"
                >
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="font-medium">{format(lmpDate, 'MMMM d, yyyy')}</span>
                  <span className="sr-only">Change date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Select LMP Date</h4>
                  <p className="text-sm text-muted-foreground">
                    First day of your last period
                  </p>
                </div>
                <Calendar
                  mode="single"
                  selected={lmpDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Button
                    onClick={handleSaveDate}
                    className="w-full"
                    disabled={!isAuthenticated && remainingUses <= 0}
                  >
                    Save Date
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Conception</span>
            <span className="text-sm font-medium">Due Date</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">Week 0</span>
            <span className="text-xs text-muted-foreground">
              {progressPercentage}% complete
            </span>
            <span className="text-xs text-muted-foreground">Week 40</span>
          </div>
        </div>

        <Tabs defaultValue="overview" onValueChange={(value) => setCurrentTab(value)}>
          <TabsList className="mb-6 w-full grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="dates">Appointments</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Your Pregnancy Progress</h3>
              <p className="text-3xl font-bold text-pink-600 mb-2">
                {weeks >= 0 && weeks <= 42 ? `${weeks} weeks, ${days} days` :
                  weeks < 0 ? "Planning for pregnancy" : "Baby is due!"}
              </p>
              <Badge variant={weeks >= 0 && weeks <= 42 ? "default" : "outline"} className="mb-2">
                {weeks < 0 ? "Pre-pregnancy" :
                  weeks < 13 ? "First Trimester" :
                    weeks < 28 ? "Second Trimester" :
                      weeks <= 40 ? "Third Trimester" : "Post-term"}
              </Badge>
              <p className="mt-2">
                {weeks >= 4 && weeks <= 40 ?
                  <span className="flex flex-col items-center">
                    <span className="text-lg font-medium">Baby is the size of a</span>
                    <span className="text-xl font-bold mt-1">{currentSize}</span>
                  </span> :
                  weeks > 40 ? "Baby is full term!" : "Baby size will appear in week 4"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 border">
                <h3 className="font-semibold mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                  Due Date
                </h3>
                <p className="text-lg font-medium">{format(importantDates.dueDate, 'MMMM d, yyyy')}</p>
                <p className="text-sm text-muted-foreground">
                  {differenceInDays(importantDates.dueDate, new Date())} days from today
                </p>
              </Card>

              <Card className="p-4 border">
                <h3 className="font-semibold mb-2">Next Appointment</h3>
                {importantDates.appointmentDates
                  .filter(appt => isAfter(appt.date, new Date()) || isToday(appt.date))
                  .sort((a, b) => a.week - b.week)
                  .slice(0, 1)
                  .map((appointment, i) => (
                    <div key={i}>
                      <p className="text-lg font-medium">{appointment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(appointment.date, 'MMMM d, yyyy')} (Week {appointment.week})
                      </p>
                    </div>
                  ))}
              </Card>
            </div>

            <Card className="p-4 border">
              <h3 className="font-semibold mb-3">Next Milestone</h3>
              {weeks >= 0 && weeks < 40 ?
                MILESTONES.filter(m => m.week > weeks)
                  .sort((a, b) => a.week - b.week)
                  .slice(0, 1)
                  .map((milestone, i) => (
                    <div key={i}>
                      <p className="font-medium text-lg">{milestone.title} (Week {milestone.week})</p>
                      <p className="text-muted-foreground mb-1">{milestone.description}</p>
                      <Badge variant="outline" className="mt-1">
                        {milestone.week - weeks} {milestone.week - weeks === 1 ? 'week' : 'weeks'} from now
                      </Badge>
                    </div>
                  )) :
                <p>No upcoming milestones</p>
              }
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Pregnancy Timeline</h3>
            <div className="space-y-4">
              {MILESTONES.map((milestone, i) => (
                <div
                  key={i}
                  className={`
                    relative pl-6 py-3 rounded-lg
                    ${weeks >= milestone.week ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50 border-l-4 border-gray-200'}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium flex items-center">
                      <span className="text-lg">Week {milestone.week}: {milestone.title}</span>
                      {weeks >= milestone.week &&
                        <CheckCircle2 className="ml-2 h-5 w-5 text-green-500" />
                      }
                      {weeks < milestone.week && weeks + 2 >= milestone.week &&
                        <CircleEllipsis className="ml-2 h-5 w-5 text-amber-500" />
                      }
                    </h4>
                    <Badge variant={weeks >= milestone.week ? "default" : "outline"} className="ml-auto">
                      {format(addDays(lmpDate, milestone.week * 7), 'MMM d')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dates" className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Recommended Appointments</h3>
            <div className="space-y-3">
              <div className="divide-y">
                {importantDates.appointmentDates.map((appointment, idx) => (
                  <div key={idx} className={`
                    py-3 px-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between
                    ${isToday(appointment.date) ? 'bg-blue-50 border-l-4 border-blue-500' :
                      isBefore(appointment.date, new Date()) ? 'bg-gray-50 border-l-4 border-green-500' :
                        'bg-white border border-gray-200'}
                  `}>
                    <div className="mb-2 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{appointment.name}</span>
                        {isBefore(appointment.date, new Date()) &&
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        }
                        {isToday(appointment.date) &&
                          <Badge variant="default" className="ml-2">Today</Badge>
                        }
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.description}</p>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-sm font-medium">
                        Week {appointment.week}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(appointment.date, 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Common Pregnancy Symptoms</h3>

            <Accordion type="single" collapsible defaultValue={currentTrimester !== "pre-pregnancy" ? currentTrimester : undefined}>
              <AccordionItem value="first">
                <AccordionTrigger className="text-lg">
                  First Trimester (Weeks 1-12)
                  {currentTrimester === "first" && <Badge className="ml-2">Current</Badge>}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 mt-2">
                    {SYMPTOMS.first.map((symptom, i) => (
                      <Card key={i} className="p-3 border">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">{symptom.name}</h4>
                          <Badge variant="outline" className="ml-2">Weeks {symptom.weeks}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{symptom.description}</p>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="second">
                <AccordionTrigger className="text-lg">
                  Second Trimester (Weeks 13-27)
                  {currentTrimester === "second" && <Badge className="ml-2">Current</Badge>}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 mt-2">
                    {SYMPTOMS.second.map((symptom, i) => (
                      <Card key={i} className="p-3 border">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">{symptom.name}</h4>
                          <Badge variant="outline" className="ml-2">Weeks {symptom.weeks}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{symptom.description}</p>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="third">
                <AccordionTrigger className="text-lg">
                  Third Trimester (Weeks 28-40)
                  {currentTrimester === "third" && <Badge className="ml-2">Current</Badge>}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 mt-2">
                    {SYMPTOMS.third.map((symptom, i) => (
                      <Card key={i} className="p-3 border">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">{symptom.name}</h4>
                          <Badge variant="outline" className="ml-2">Weeks {symptom.weeks}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{symptom.description}</p>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  );
}; 