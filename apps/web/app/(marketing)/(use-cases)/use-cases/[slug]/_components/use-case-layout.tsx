export default function UseCaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen ">
      <main className="relative">
        {children}
      </main>

      {/* Add a shared bottom navigation for exploring other use cases */}
      <nav className="border-t border-gray-200 ">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600">
              Explore More Use Cases
            </h2>
            <div className="mt-6 flex justify-center space-x-6">
              <a
                href="/use-cases/automate-engagement"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Engagement Automation
              </a>
              <a
                href="/use-cases/content-optimization"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Content Optimization
              </a>
              <a
                href="/use-cases/virality-prediction"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Virality Prediction
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
