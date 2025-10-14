import { PricingProvider } from "../web/providers/pricingContext";
import { Header } from "./_components/navbar-1";
import dynamic from 'next/dynamic';

// Dynamically import non-critical components to improve initial load
const DynamicPreFooter = dynamic(() => import('./_components/pre-footer').then((mod) => ({ default: mod.PreFooter })), {
  loading: () => <div className="h-32 bg-transparent" />, // Reserve space during loading
});

const DynamicFooter = dynamic(() => import('./_components/footer').then((mod) => ({ default: mod.Footer })), {
  loading: () => <div className="h-24 bg-transparent" />, // Reserve space during loading
});

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {


  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Optimized fixed background with better performance */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          contain: 'layout style paint',
          willChange: 'auto' // Only enable when needed
        }}
      >
        {/* Primary gradient overlay - static for better performance */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">

          {/* Top gradient orb - optimized animation */}
          <div className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div
              className="gradient-orb gradient-orb-1 relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#50c4aa] to-[#9089fc] opacity-20 dark:opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d'
              }}
            />
          </div>

          {/* Middle gradient orb - optimized animation */}
          <div className="absolute inset-x-0 top-[25%] transform-gpu overflow-hidden blur-3xl">
            <div
              className="gradient-orb gradient-orb-2 relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#9089fc] to-[#50c4aa] opacity-10 dark:opacity-5 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d'
              }}
            />
          </div>

          {/* Bottom gradient orb - optimized animation */}
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
            <div
              className="gradient-orb gradient-orb-3 relative left-[calc(50%-3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#50c4aa] to-[#9089fc] opacity-20 dark:opacity-10 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d'
              }}
            />
          </div>
        </div>
      </div>

      {/* Header with reserved space to prevent CLS */}
      <div className="h-16 md:h-20 relative z-50">
        <Header />
      </div>

      <PricingProvider>
        <main className="flex-grow isolate relative z-40">
          {children}
        </main>
      </PricingProvider>

      {/* Use dynamic imports for footer components */}
      <DynamicPreFooter />
      <DynamicFooter />
    </div>
  );
}

export default MarketingLayout;
