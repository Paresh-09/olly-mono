import Image from 'next/image';
import Link from 'next/link';

// Create wrapper components for animations that will be client-side
import { AnimatedHeroText } from './client-animations';
import { FloatingElements } from './floating-elements';



// Static grid background - no client-side rendering needed
const GridBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <pattern
                        id="grid"
                        width="2"
                        height="2"
                        patternUnits="userSpaceOnUse"
                    >
                        <rect
                            width="2"
                            height="2"
                            fill="none"
                            stroke="rgb(229, 231, 235)"
                            strokeWidth="0.1"
                            opacity="0.2"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
};

const HeroSection = () => {
    return (
        <main className="w-full h-screen overflow-hidden font-cal relative">
            <section className="w-full h-screen overflow-hidden md:overflow-visible flex flex-col items-center justify-center relative">

                {/* Static Grid Background */}
                <GridBackground />

                {/* Client-side floating elements - lazy loaded */}
                <FloatingElements />

                {/* Main Content - Server-side rendered for optimal LCP */}
                <div className="flex flex-col justify-center items-center w-[320px] sm:w-[400px] md:w-[600px] lg:w-[900px] z-50 pointer-events-auto relative">

                    {/* Static hero text for immediate LCP - animations added via client component */}
                    <div className="text-4xl sm:text-4xl md:text-5xl lg:text-8xl text-center w-full justify-center items-center flex-col flex leading-tight tracking-wider font-bold space-y-1 md:space-y-4 text-gray-800">

                        {/* Static text for immediate render */}
                        <span className="block whitespace-nowrap">
                            Skyrocket your
                        </span>

                        {/* Client-side animated text */}
                        <AnimatedHeroText />
                    </div>

                    <div className="flex flex-col items-center justify-center mt-10 space-y-6 text-center max-w-xl z-20">
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                            World's #1 AI Agent for Commenting, Post Generation, Summaries, Viral Scores & more.
                        </p>

                        <div className="hover:scale-105 transition-transform duration-200">
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center rounded-full text-base md:text-lg lg:text-xl tracking-tight transition-colors duration-150 bg-teal-600 text-white hover:bg-teal-700 px-8 py-4 shadow-sm"
                            >
                                Get Started for Free
                                <span aria-hidden="true" className="ml-2">&rarr;</span>
                            </Link>
                        </div>

                        <span className="text-gray-500 font-normal">
                            No credit card required, unlimited time on free plan
                        </span>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default HeroSection;
