import Image from "next/image";

interface Logo {
  src: string;
  alt: string;
}

export default function StaticLogoCloud() {
  const logos: Logo[] = [
    { src: "/images/brand-logos/appsumo.png", alt: "AppSumo" },
    { src: "/images/brand-logos/benefits-logo.png", alt: "Benefits" },
    { src: "/images/brand-logos/google-logo.png", alt: "Google" },
    { src: "/images/brand-logos/level-365.png", alt: "Level 365" },
    { src: "/images/brand-logos/ms-logo.png", alt: "Microsoft" },
    { src: "/images/brand-logos/msn-logo.png", alt: "MSN" },
    { src: "/images/brand-logos/secret-alchemist-logo-india.png", alt: "Secret Alchemist" },
    { src: "/images/brand-logos/snapy-ai-logo.png", alt: "Snapy AI" },
    { src: "/images/brand-logos/viprata.png", alt: "Viprata" },
    { src: "/images/brand-logos/lab316.png", alt: "Lab 316" },
    { src: "/images/brand-logos/time-keepers.png", alt: "TimeKeepers Logo" },
    { src: "/images/brand-logos/matax.png", alt: "Matax Logo" },
    { src: "/images/brand-logos/r-royale.png", alt: "Rummathon Royale Logo" },
    { src: "/images/brand-logos/explainxai.png", alt: "Explainx AI Logo" },
    { src: "/testimonial/briton.png", alt: "Briton media Logo" },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-lg font-semibold text-gray-600 mb-8">
          Trusted by 100,000+ users across 120+ countries
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
          {logos.map((logo, index) => (
            <div key={index} className="flex-shrink-0">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={60}
                className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}