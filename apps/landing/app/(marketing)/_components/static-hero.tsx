import Image from 'next/image';
import Link from "next/link";
import { ArrowRight, Instagram, Facebook, Twitter, Youtube, Linkedin } from './shared-icons';

const mockImages = [
    {
        url: "/assets/pexels-photo-1055691.webp",
        title: "Charcoal Beauty Products",
        author: "Beauty Brand"
    },
    {
        url: "/assets/pexels-photo-7525192.webp",
        title: "Influencer Portrait",
        author: "Shanice Crystal"
    },
    {
        url: "/assets/pexels-photo-8154666.webp",
        title: "Campaign Dashboard",
        author: "Marketing Tools"
    },
    {
        url: "/assets/pexels-photo-13727993.webp",
        title: "Social Media Content",
        author: "Content Creator"
    },
    {
        url: "/assets/free-photo-of-african-man-posing-in-denim-outfit.webp",
        title: "Fashion Portrait",
        author: "Style Blog"
    }
];

// Static version of hero for server-side rendering - no animations
export default function StaticHeroSection() {
    return (
        <main className="w-full h-screen overflow-hidden font-cal relative z-50">
            <section className="w-full h-screen overflow-hidden md:overflow-visible flex flex-col items-center justify-center relative z-50">

                {/* Grid Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div
                        className="absolute inset-0 opacity-25"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: '75px 75px',
                            maskImage: 'linear-gradient(0deg, white, rgba(255,255,255,0.6))'
                        }}
                    />
                </div>

                {/* Static Social Media Icons - No animations */}
                <div className="absolute top-0 left-0 w-full h-full z-50">
                    <div className="absolute top-[18%] left-[20%] p-3 bg-white rounded-full shadow-lg">
                        <Instagram className="w-6 h-6 text-pink-500" />
                    </div>
                    <div className="absolute top-[15%] right-[30%] p-3 bg-white rounded-full shadow-lg">
                        <Facebook className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="absolute top-[35%] right-[15%] p-2.5 bg-white rounded-full shadow-lg">
                        <Twitter className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="absolute bottom-[25%] left-[18%] p-3 bg-white rounded-full shadow-lg">
                        <Youtube className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="absolute bottom-[20%] right-[25%] p-2.5 bg-white rounded-full shadow-lg">
                        <Linkedin className="w-5 h-5 text-blue-700" />
                    </div>
                </div>

                {/* Static Mock Images - No animations */}
                <div className="absolute top-0 left-0 w-full h-full z-50">
                    <div className="absolute top-[25%] left-[5%] w-32 h-24 -rotate-[3deg] shadow-2xl rounded-xl overflow-hidden">
                        <Image
                            src={mockImages[0]!.url}
                            alt={mockImages[0]!.title}
                            width={128}
                            height={96}
                            className="object-cover w-full h-full"
                            sizes="128px"
                            priority={false}
                        />
                    </div>
                    <div className="absolute top-[6%] left-[11%] w-60 h-48 -rotate-12 shadow-2xl rounded-xl overflow-hidden">
                        <Image
                            src={mockImages[1]!.url}
                            alt={mockImages[1]!.title}
                            width={240}
                            height={192}
                            className="object-cover w-full h-full"
                            sizes="240px"
                            priority={true}
                        />
                    </div>
                    <div className="absolute top-[80%] left-[8%] w-64 h-64 -rotate-[4deg] shadow-2xl rounded-xl overflow-hidden">
                        <Image
                            src={mockImages[2]!.url}
                            alt={mockImages[2]!.title}
                            width={256}
                            height={256}
                            className="object-cover w-full h-full"
                            sizes="256px"
                            priority={false}
                        />
                    </div>
                    <div className="absolute top-[2%] left-[83%] w-64 h-56 rotate-[6deg] shadow-2xl rounded-xl overflow-hidden">
                        <Image
                            src={mockImages[3]!.url}
                            alt={mockImages[3]!.title}
                            width={256}
                            height={224}
                            className="object-cover w-full h-full"
                            sizes="256px"
                            priority={false}
                        />
                    </div>
                    <div className="absolute top-[68%] left-[83%] w-80 h-80 rotate-[19deg] shadow-2xl rounded-xl overflow-hidden">
                        <Image
                            src={mockImages[4]!.url}
                            alt={mockImages[4]!.title}
                            width={320}
                            height={320}
                            className="object-cover w-full h-full"
                            sizes="320px"
                            priority={false}
                        />
                    </div>
                </div>

                {/* Main Content - Static */}
                <div className="flex flex-col justify-center items-center w-[250px] sm:w-[400px] md:w-[600px] lg:w-[900px] z-50 pointer-events-auto relative">
                    <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-8xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight tracking-wider font-bold space-y-1 md:space-y-4 text-gray-800">
                        <span style={{
                            textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white'
                        }}>
                            AI Agent for Social Media
                        </span>
                        <div className='flex gap-2'>
                            <span className="flex whitespace-pre">
                                Get <span className="text-teal-600 py-0 pb-2 md:pb-4">Leads</span>
                            </span>
                            <span className='ml-2'>in days.</span>
                        </div>
                    </h1>

                    <div className="flex flex-col items-center justify-center mt-10 space-y-6 text-center max-w-xl z-20">
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl font-medium">
                            World's #1 AI Agent for Commenting, Post Generation, Summaries, Viral Scores & more.
                        </p>

                        <div>
                            <Link
                                href="https://chromewebstore.google.com/detail/olly-ai-agent-for-social/jepljmfdfapaafljejdehcannjbpnmip"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-full text-base md:text-lg lg:text-xl tracking-tight transition-colors duration-150 bg-teal-600 text-white hover:bg-teal-700 px-8 py-4 shadow-sm"
                            >
                                Get Started For Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                        <span className='text-gray-500 font-normal'>
                            No credit card required, unlimited time on free plan
                        </span>
                    </div>
                </div>
            </section>
        </main>
    );
}