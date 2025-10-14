import { Button } from "@repo/ui/components/ui/button"

const Pricing = () => {
  return (
    <div className="w-full max-w-5xl mx-auto py-12 md:py-24 lg:py-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 dark:bg-gray-900">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Lifetime Access</h3>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium dark:bg-gray-800">
                Most Popular
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Get full access to all features forever.</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold">$299</span>
              <span className="text-gray-500 dark:text-gray-400">One-time payment</span>
            </div>
            <Button className="w-full">Get Lifetime Access</Button>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>Unlimited projects</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>Unlimited collaborators</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>Priority support</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 dark:bg-gray-900">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Free Forever</h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Get started for free, forever.</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-500 dark:text-gray-400">Forever</span>
            </div>
            <Button className="w-full" variant="outline">
              Start for Free
            </Button>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>1 project</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>1 collaborator</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>Basic analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <span>Community support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export default Pricing