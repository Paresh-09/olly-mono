"use client";

import { useState } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import AuthPopup from "../authentication"

interface ReportCardGeneratorProps {
  toolType: string;
  placeholder: string;
}

interface ReportCardResult {
  grade: string;
  percentage: number;
  performance: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  comments: string;
}

interface AnalysisResult {
  reportCard?: ReportCardResult;
  creditsRemaining: number;
}

export const ReportCardGeneratorTool: React.FC<ReportCardGeneratorProps> = ({
  toolType,
  placeholder,
}) => {
  const [studentName, setStudentName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [performanceData, setPerformanceData] = useState('')
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const { toast } = useToast()
  const [schoolName, setSchoolName] = useState('')
  const [schoolAddress, setSchoolAddress] = useState('')
  const [principalName, setPrincipalName] = useState('')
  const [teacherName, setTeacherName] = useState('')
  const [customGradeLevel, setCustomGradeLevel] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customTerm, setCustomTerm] = useState('')
  const [manualGrade, setManualGrade] = useState('')
  const [manualPercentage, setManualPercentage] = useState('')
  const [manualPerformance, setManualPerformance] = useState('')
  const [manualStrengths, setManualStrengths] = useState<string[]>([''])
  const [manualImprovements, setManualImprovements] = useState<string[]>([''])
  const [manualRecommendations, setManualRecommendations] = useState<string[]>([''])
  const [manualComments, setManualComments] = useState('')
  const [isAIGenerated, setIsAIGenerated] = useState(true)

  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .report-card-print, .report-card-print * {
        visibility: visible;
      }
      .report-card-print {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 2rem;
      }
      @page {
        size: A4;
        margin: 20mm;
      }
    }
  `

  const addListItem = (list: string[], setList: (list: string[]) => void) => {
    setList([...list, ''])
  }

  const removeListItem = (index: number, list: string[], setList: (list: string[]) => void) => {
    const newList = list.filter((_, i) => i !== index)
    setList(newList.length ? newList : [''])
  }

  const updateListItem = (index: number, value: string, list: string[], setList: (list: string[]) => void) => {
    const newList = [...list]
    newList[index] = value
    setList(newList)
  }

  const generateReportCard = async () => {
    if (!studentName || !gradeLevel || !subject || !term) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (isAIGenerated && !performanceData) {
      toast({
        title: "Error",
        description: "Please provide performance data for AI generation",
        variant: "destructive"
      });
      return;
    }

    if (!isAIGenerated) {
      // Use manually entered data
      const manualResult: AnalysisResult = {
        reportCard: {
          grade: manualGrade,
          percentage: parseFloat(manualPercentage),
          performance: manualPerformance,
          strengths: manualStrengths.filter(s => s.trim()),
          improvements: manualImprovements.filter(s => s.trim()),
          recommendations: manualRecommendations.filter(s => s.trim()),
          comments: manualComments
        },
        creditsRemaining: 999
      }
      setResult(manualResult)
      return
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        studentName,
        gradeLevel,
        subject,
        performanceData,
        term
      }));
      formData.append('toolType', toolType);

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report card. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Student Name</label>
            <Input
              placeholder="Enter student name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Grade Level</label>
            <div className="flex gap-2">
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                      Grade {i + 1}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Grade Level</SelectItem>
                </SelectContent>
              </Select>
              {gradeLevel === 'custom' && (
                <Input
                  placeholder="Enter grade level"
                  value={customGradeLevel}
                  onChange={(e) => {
                    setCustomGradeLevel(e.target.value);
                    setGradeLevel(e.target.value);
                  }}
                  className="flex-1"
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <div className="flex gap-2">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {[
                  'Mathematics',
                  'Science',
                  'English',
                  'History',
                  'Art',
                  'Physical Education',
                  'Biology',
                  'Chemistry',
                  'Physics',
                  'Literature',
                  'Geography',
                  'Music',
                  'Computer Science',
                  'Economics',
                  'Psychology',
                  'Sociology',
                  'custom'
                ].map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub === 'custom' ? 'Custom Subject' : sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {subject === 'custom' && (
              <Input
                placeholder="Enter subject"
                value={customSubject}
                onChange={(e) => {
                  setCustomSubject(e.target.value);
                  setSubject(e.target.value);
                }}
                className="flex-1"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Term</label>
          <div className="flex gap-2">
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {[
                  'First Quarter',
                  'Second Quarter',
                  'Third Quarter',
                  'Fourth Quarter',
                  'First Semester',
                  'Second Semester',
                  'Midterm',
                  'Final',
                  'custom'
                ].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === 'custom' ? 'Custom Term' : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {term === 'custom' && (
              <Input
                placeholder="Enter term"
                value={customTerm}
                onChange={(e) => {
                  setCustomTerm(e.target.value);
                  setTerm(e.target.value);
                }}
                className="flex-1"
              />
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Report Card Details</h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm">Generation Method:</label>
              <Select value={isAIGenerated ? "ai" : "manual"} onValueChange={(value) => setIsAIGenerated(value === "ai")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">AI Generated</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isAIGenerated ? (
            <div>
              <label className="block text-sm font-medium mb-1">Performance Data</label>
              <Textarea
                className="min-h-[100px]"
                placeholder={placeholder}
                value={performanceData}
                onChange={(e) => setPerformanceData(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Grade</label>
                  <Input
                    placeholder="Enter grade (e.g., A+, B, C-)"
                    value={manualGrade}
                    onChange={(e) => setManualGrade(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Percentage</label>
                  <Input
                    type="number"
                    placeholder="Enter percentage (0-100)"
                    value={manualPercentage}
                    onChange={(e) => setManualPercentage(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Performance Summary</label>
                <Textarea
                  placeholder="Enter overall performance summary"
                  value={manualPerformance}
                  onChange={(e) => setManualPerformance(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Areas of Strength</label>
                {manualStrengths.map((strength, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Enter strength"
                      value={strength}
                      onChange={(e) => updateListItem(index, e.target.value, manualStrengths, setManualStrengths)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeListItem(index, manualStrengths, setManualStrengths)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem(manualStrengths, setManualStrengths)}
                  className="mt-2"
                >
                  Add Strength
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Areas for Improvement</label>
                {manualImprovements.map((improvement, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Enter area for improvement"
                      value={improvement}
                      onChange={(e) => updateListItem(index, e.target.value, manualImprovements, setManualImprovements)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeListItem(index, manualImprovements, setManualImprovements)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem(manualImprovements, setManualImprovements)}
                  className="mt-2"
                >
                  Add Improvement
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recommendations</label>
                {manualRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Enter recommendation"
                      value={recommendation}
                      onChange={(e) => updateListItem(index, e.target.value, manualRecommendations, setManualRecommendations)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeListItem(index, manualRecommendations, setManualRecommendations)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addListItem(manualRecommendations, setManualRecommendations)}
                  className="mt-2"
                >
                  Add Recommendation
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teacher Comments</label>
                <Textarea
                  placeholder="Enter teacher comments"
                  value={manualComments}
                  onChange={(e) => setManualComments(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 print:hidden">
          <div>
            <label className="block text-sm font-medium mb-1">School Name</label>
            <Input
              placeholder="Enter school name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">School Address</label>
            <Input
              placeholder="Enter school address"
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Principal's Name</label>
            <Input
              placeholder="Enter principal's name"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teacher's Name</label>
            <Input
              placeholder="Enter teacher's name"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={generateReportCard}
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : isAIGenerated ? 'Generate Report Card' : 'Create Report Card'}
        </Button>

        {result?.reportCard && (
          <>
            <style>{printStyles}</style>
            <div className="mt-6 space-y-6 print:mt-0">
              {/* Print button */}
              <div className="flex justify-end gap-2 print:hidden">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <span>Print Report Card</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                </Button>
              </div>

              <div className="report-card-print">
                {/* School Header */}
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">{schoolName || 'School Name'}</h1>
                    <p className="text-gray-600 mb-2">{schoolAddress || 'School Address'}</p>
                    <div className="w-24 h-1 bg-gray-200 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold mb-2">Student Progress Report</h2>
                    <p className="text-gray-600">Academic Year 2023-2024</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h3 className="font-semibold text-gray-700">Student Information</h3>
                      <div className="mt-2 space-y-1">
                        <p><span className="font-medium">Name:</span> {studentName}</p>
                        <p><span className="font-medium">Grade Level:</span> {gradeLevel}</p>
                        <p><span className="font-medium">Subject:</span> {subject}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Report Details</h3>
                      <div className="mt-2 space-y-1">
                        <p><span className="font-medium">Term:</span> {term}</p>
                        <p><span className="font-medium">Grade:</span> {result.reportCard.grade}</p>
                        <p><span className="font-medium">Percentage:</span> {result.reportCard.percentage}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-lg font-semibold mb-3">Performance Summary</h3>
                  <p className="text-gray-700">{result.reportCard.performance}</p>
                </div>

                {/* Strengths & Areas for Improvement */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-6 bg-white shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 text-green-700">Areas of Strength</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {result.reportCard.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border rounded-lg p-6 bg-white shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 text-amber-700">Areas for Improvement</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {result.reportCard.improvements.map((improvement, index) => (
                        <li key={index} className="text-gray-700">{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-blue-700">Action Plan & Recommendations</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {result.reportCard.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-gray-700">{recommendation}</li>
                    ))}
                  </ul>
                </div>

                {/* Teacher Comments */}
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-lg font-semibold mb-3">Teacher Comments</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {result.reportCard.comments.replace(/{studentName}/g, studentName).replace(/{subject}/g, subject)}
                  </p>
                </div>

                {/* Signature Section */}
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="grid md:grid-cols-3 gap-8 mt-4">
                    <div className="border-t pt-4">
                      <p className="text-center text-gray-600 mb-8">{teacherName || 'Teacher Name'}</p>
                      <p className="text-center text-gray-600">Teacher's Signature</p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-center text-gray-600 mb-8">{principalName || 'Principal Name'}</p>
                      <p className="text-center text-gray-600">Principal's Signature</p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-center text-gray-600 mb-8">Parent/Guardian</p>
                      <p className="text-center text-gray-600">Parent's Signature</p>
                    </div>
                  </div>
                </div>

                {/* School Seal/Logo Placeholder */}
                <div className="text-center mt-8">
                  <div className="w-24 h-24 mx-auto border-2 border-gray-300 rounded-full flex items-center justify-center">
                    <p className="text-gray-400 text-sm">School Seal</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 mt-8">
                  <p className="font-medium">{schoolName || 'School Name'}</p>
                  <p>{schoolAddress || 'School Address'}</p>
                  <p className="mt-2">This report card was generated for educational purposes only.</p>
                  <p>Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthPopup(false);
        }}
      />
    </Card>
  )
} 