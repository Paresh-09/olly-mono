// app/dashboard/weekly-report/page.tsx
"use client";

import { useState } from "react";

export default function WeeklyReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendWeeklyReport = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/weekly-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Weekly report sent successfully!");
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to send report"}`);
      }
    } catch (error) {
      setMessage("❌ Error: Failed to send report");
      console.error("Error sending weekly report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Weekly Usage Report
          </h1>

          <p className="text-gray-600 mb-8">
            Send a weekly usage report to aryan@explainx.ai
          </p>

          <button
            onClick={sendWeeklyReport}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              "Send Weekly Report"
            )}
          </button>

          {message && (
            <div className="mt-4 p-3 rounded-md bg-gray-100">
              <p className="text-sm text-gray-700">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
